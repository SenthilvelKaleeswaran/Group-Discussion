const { ObjectId } = require("mongoose").Types;

const {
  AIConversationPrompt,
  PerformanceMetricsPrompt,
  generateConversationTemplate,
  AIConclusionPrompt,
  discussionInstructionPrompt,
  OverAllAnalysisPrompt,
  PointAnalysisPrompt,
} = require("../prompts");
const { generateAIResponse } = require("../utils");
const Session = require("../models/session");
const Conversation = require("../models/conversation");
const Participant = require("../models/participant");
const GroupDiscussion = require("../models/group-discussion");
const { updateCurrentConversation } = require("./conversation");
const fs = require("fs");
const path = require("path");
const gTTS = require("gtts");
const mp3Duration = require("mp3-duration");
const { updateSessionQueueStatus } = require("./common");

const getConversationData = (data) => {
  return data?.map((item) => {
    return {
      discussionPoint: item?.discussion,
      userType: item?.userId ? "USER" : "AI",
      id : item?.userId || item?.aiId
    };
  });
};

const generateFeedback = async ({ io, socket, sessionId }) => {
  try {
    io.to(sessionId).emit("FEEDBACK_LOADING", "Generating Feedback");

    const session = await Session.findOne({ _id: sessionId });
    const conversation = await Conversation.find({ sessionId });
    const participants = await Participant.find({ sessionId });

    if (!session) {
      io.to(sessionId).emit("FEEDBACK_NOTIFICATION", {
        message: "Session not found",
        type: "error",
      });
      return;
    }

    if (!conversation?.length) {
      io.to(sessionId).emit("FEEDBACK_NOTIFICATION", {
        message: "Group discussion contains no conversation",
        type: "error",
      });
      return;
    }

    if (session?.status !== "COMPLETED") {
      io.to(sessionId).emit("FEEDBACK_NOTIFICATION", {
        message: "Session not completed yet",
        type: "error",
      });
      return;
    }

    const {
      topic,
      aiParticipants,
      //   conclusionPoints, // bb
      //   conclusionBy, // bb
      // noOfUsers, // bb
    } = session;

    const discussionLength = conversation?.length;
    const noOfUsers = Array.from(participants?.participant?.values())?.length;

    const modifiedConversation = getConversationData(conversation);

    const pointAnalysis = [];
    const userAnalysis = [];

    // Sequential generation of point analysis
    for (const [index, item] of conversation.entries()) {
      if (item?.userId) {
        const feedback = await generateAIResponse({
          prompt:
            generateConversationTemplate(topic, item?.discussion) +
            `\nFull Discussion : ${JSON.stringify(modifiedConversation)}` +
            PointAnalysisPrompt +
            `\nAI Response:`,
          isParse: true,
        });

        pointAnalysis.push({
          feedback,
          index,
        });
      }
    }

    // Sequential generation of user analysis
    for (const item of participants) {
      const { _id, name } = item?.userId;
      const feedback = await generateAIResponse({
        prompt:
          discussionInstructionPrompt({
            topic,
            aiParticipants,
            discussionLength,
            // conclusionPoints,
            // conclusionBy,
            noOfUsers,
            user: item?.userId,
          }) +
          `\nFull Discussion : ${JSON.stringify(modifiedConversation)}\n` +
          OverAllAnalysisPrompt +
          `\nAI Response:`,
        isParse: true,
      });
      userAnalysis.push({
        _id,
        feedback,
      });
    }

    const updateDiscussionFeedback = pointAnalysis.map((analysis) => ({
      updateOne: {
        filter: { sessionId: id },
        update: {
          $set: {
            [`conversation.${analysis.index}.feedback`]: analysis?.feedback,
          },
        },
      },
    }));

    const a = await Promise.all([
      await Conversation.bulkWrite(updateDiscussionFeedback),
      await session.findByIdAndUpdate(
        id,
        { feedback: userAnalysis },
        { new: true }
      ),
    ]);

    // Return feedback response
    return res.status(200).json({ msg: "Success" });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const generateConversation = async ({
  io,
  socket,
  passedSession,
  passedParticipant,
  sessionId,
  aiId,
}) => {
  io.to(sessionId).emit("NOTIFICATION", {
    message: "Generating AI Content",
    type: "loading",
  });

  let session = passedSession || (await Session.findOne({ _id: sessionId }));
  let participant =
    passedParticipant || (await Participant.findOne({ sessionId }));
  const { id, user } = session;

  let messages = await Conversation.find({ sessionId });

  try {
    const {
      topic,
      aiParticipants,
      discussionLength,
      conclusionPoints,
      conclusionBy,
    } = session;

    const messageLength = messages?.length;

    const getStatusValues = () => {
      if (participant?.type === "AI") {
        return [
          discussionLength < messageLength,
          messageLength === discussionLength + conclusionPoints,
        ];
      } else {
        return [
          discussionLength - 1 < messageLength,
          messageLength === discussionLength + conclusionPoints - 1,
        ];
      }
    };

    const [isConclusion, isTerminatable] = getStatusValues();

    const isLastDiscussionPoint = messageLength === discussionLength - 1;

    // if (!isTerminatable)
    //   io.to(sessionId).emit("RANDOM_MEMBER", {
    //     event: "RANDOM_MEMBER",
    //     data: {
    //       isLoading: true,
    //     },
    //   });
    // io.to(sessionId).emit("PERFORMANCE_METRICS", {
    //   event: "PERFORMANCE_METRICS",
    //   data: {
    //     isLoading: participant?.type !== "AI",
    //   },
    // });

    const getRandomMember = () => {
      let randomMember = "";

      console.log({
        isLastDiscussionPoint,
        conclusionBy,
        participant,
        discussionLength,
        messageLength,
        conclusionBy,
      });

      if (
        (isLastDiscussionPoint &&
          conclusionBy === "AI" &&
          participant?.type === "AI") ||
        (discussionLength === messageLength && conclusionBy === "You")
      ) {
        console.log("conclusionB", req?.user);
        randomMember = req?.user || user;
      } else {
        const randomIndex = Math.floor(Math.random() * aiParticipants.length);
        randomMember = aiParticipants[randomIndex];
      }

      return randomMember;
    };

    const updateConversationStatus = async () => {
      const conversation = await Conversation.findOne({
        groupDiscussionId: id,
      });

      if (conversation && conversation.messages.length > 0) {
        const lastIndex = conversation.messages.length - 1;
        const lastMessage = conversation.messages[lastIndex];
        if (lastMessage?.status) {
          const updated = await Conversation.findOneAndUpdate(
            { groupDiscussionId: id },
            {
              $set: {
                [`messages.${lastIndex}.status`]: "SPOKEN",
                [`messages.${lastIndex}.isConclusion`]: isConclusion,
              },
            },
            { new: true }
          );
          return updated;
        }
      }
    };

    // let randomMember = null;

    // if (!isTerminatable) {
    //   randomMember = getRandomMember();

    //   if (randomMember?.userId) {
    //     const updatedConversation = await updateConversationStatus();

    //     console.log({
    //       qqqq: updatedConversation,
    //       llll: updatedConversation?.messages,
    //       length: updatedConversation?.messages?.length,
    //     });

    //     io.to(sessionId).emit("CONVERSATION", {
    //       event: "CONVERSATION",
    //       data: {
    //         conversation: updatedConversation?.messages,
    //         userSpeak: true,
    //       },
    //     });
    //   }

    //   io.to(sessionId).emit("RANDOM_MEMBER", {
    //     event: "RANDOM_MEMBER",
    //     data: {
    //       randomMember: randomMember?.id || randomMember?.userId,
    //       isLoading: false,
    //     },
    //   });

    //   if (randomMember?.userId) return;
    // }

    const updateNewConversation = async (
      metadata = {},
      responseText = "",
      randomMember = {}
    ) => {
      let newMessages = [];
      let userMessageId = "";

      if (participant?.type !== "AI") {
        userMessageId = new ObjectId();
        newMessages.push({
          _id: userMessageId,
          userId: participant?._id,
          name: participant?.name,
          conversation: receivedConversation,
          metadata,
          isConclusion,
        });
      }

      // if (!isTerminatable) {
      //   newMessages.push({
      //     name: randomMember?.name,
      //     conversation: responseText,
      //     isConclusion,
      //     status: "GENERATED",
      //   });
      // }

      const updatedConversation = await Conversation.findOneAndUpdate(
        { groupDiscussionId: id },
        {
          $push: {
            messages: {
              $each: newMessages,
            },
          },
        },
        { new: true, upsert: true }
      );

      console.log({
        updatedConversation: updatedConversation?.messages?.length,
      });

      return { updatedConversation, userMessageId };
    };

    const formattedDiscussion = getConversationData(messages);

    const promptTemplate = generateConversationTemplate(
      topic,
      formattedDiscussion
    );

    const getMetricsResponse = () => {
      return participant?.type !== "AI"
        ? generateAIResponse({
            prompt: `${promptTemplate}${PerformanceMetricsPrompt(
              isConclusion
            )}`,
            isParse: true,
          })
        : Promise.resolve(null);
    };

    // const metricsResponsePromise = getMetricsResponse();

    // if (isTerminatable) {
    //   console.log("i came");

    //   let updatedConversation = [];
    //   if (participant?.type === "AI") {
    //     updatedConversation = await updateConversationStatus();
    //   } else {
    //     const [metricsText] = await Promise.all([metricsResponsePromise]);
    //     updatedConversation = await updateNewConversation(metricsText);
    //   }
    //   await GroupDiscussion.findByIdAndUpdate(id, { status: "COMPLETED" });
    //   console.log({
    //     updatedConversation,
    //     conversation: updatedConversation?.messages,
    //     aaa: updatedConversation?.updatedConversation?.messages,
    //   });
    //     io.to(sessionId).emit("COMPLETED", {
    //       event: "COMPLETED",
    //       data: {
    //         completed: true,
    //         id,
    //         conversation:
    //           updatedConversation?.messages ||
    //           updatedConversation?.updatedConversation?.messages,
    //       },
    //     });
    //   return;

    //   // return res.status(200).json({
    //   //   completed: true,
    //   //   id,
    //   //   conversation: updatedConversation?.messages,
    //   // });
    // }

    // if (
    //   (isLastDiscussionPoint &&
    //     conclusionBy === "AI" &&
    //     participant?.type === "AI") ||
    //   (discussionLength === messageLength && conclusionBy === "You")
    // ) {
    //   const updatedConversation = await updateConversationStatus();

    //     io.to(sessionId).emit("CONVERSATION", {
    //       event: "CONVERSATION",
    //       data: { conversation: updatedConversation?.messages },
    //     });

    //   // return res.status(200).json({
    //   //   randomMember: req?.user?.userId,
    //   //   conversation: updatedConversation?.messages,
    //   // });
    // }

    let conversationPrompt = "";

    if (!isConclusion) {
      conversationPrompt = `${promptTemplate}${AIConversationPrompt}`;
    } else {
      const groupedMessages = messages.reduce(
        (acc, item) => {
          if (item?.isConclusion) acc.conclusionPoints.push(item);
          else acc.conversationArray.push(item);
          return acc;
        },
        { conversationArray: [], conclusionPoints: [] }
      );

      conversationPrompt = AIConclusionPrompt({
        topic,
        discussionLength,
        conversation: getConversationData(groupedMessages.conversationArray),
        conclusionPoints: getConversationData(groupedMessages.conclusionPoints),
        conclusionBy,
      });
    }

    // Step 2: Generate AI Responses
    const aiResponsePromise = generateAIResponse({
      prompt: conversationPrompt,
    });

    const [responseText] = await Promise.all([aiResponsePromise]);

    console.log({ responseText, sessionId });

    if (!responseText) {
      io.to(sessionId).emit("GENERATE_CONVERSATION_ERROR", {
        error: "No valid response text generated.",
      });
    }

    const newConversation = await updateCurrentConversation({
      io,
      socket,
      sessionId,
      participant,
      previousId: aiId,
      status: "GENERATED",
      participantType: "AI",
      isConclusion: false,
      discussion: responseText,
    });

    io.to(sessionId).emit("NOTIFICATION", {
      message: "AI Content generated",
      type: "message",
    });

    // Text-to-speech conversion using gTTS

    return { responseText, newConversation };

    // Push new messages into the conversation
    // const { updatedConversation, userMessageId } = await updateNewConversation(
    //   {},
    //   responseText,
    //   randomMember
    // );

    // io.to(sessionId).emit("GENERATED_TEXT", {
    //   event: "GENERATED_TEXT",
    //   data: {
    //     aiGeneratedText: responseText,
    //     conversation: updatedConversation?.messages,
    //   },
    // });

    // io.to(sessionId).emit("PERFORMANCE_METRICS", {
    //   event: "PERFORMANCE_METRICS",
    //   data: {
    //     isLoading: participant?.type !== "AI",
    //     messageId: userMessageId,
    //   },
    // });

    // if (userMessageId) {
    //   const [metricsText] = await Promise.all([metricsResponsePromise]);

    //   await Conversation.findOneAndUpdate(
    //     { groupDiscussionId: id, "messages._id": userMessageId },
    //     {
    //       $set: {
    //         "messages.$.metadata": metricsText,
    //       },
    //     },
    //     { new: true, upsert: true }
    //   );

    //   setTimeout(() => {
    //     io.to(sessionId).emit("PERFORMANCE_METRICS", {
    //       event: "PERFORMANCE_METRICS",
    //       data: {
    //         isLoading: false,
    //         metadata: metricsText,
    //         messageId: userMessageId,
    //       },
    //     });
    //   }, 4000);
    // }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message || error,
    });
  }
};

module.exports = {
  generateConversation,
  generateFeedback,
};
