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
const { default: mongoose } = require("mongoose");

const getConversationData = (data) => {
  return data?.map((item) => item?.messages).flat();
};

const generateFeedback = async ({
  io,
  socket,
  sessionId,
  selectedParticipants,
  startedBy,
}) => {
  try {
    io.to(sessionId).emit("FEEDBACK_LOADING", "Generating Feedback");

    console.log({ sessionId });
    const session = await Session.findOne({ _id: sessionId });

    const conversation = await Conversation.aggregate([
      {
        $match: {
          sessionId: new mongoose.Types.ObjectId(sessionId),
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $addFields: {
          groupId: { $ifNull: ["$userId", "$aiId"] },
        },
      },
      {
        $group: {
          _id: "$groupId",
          messages: {
            $push: {
              _id: "$_id",
              discussion: "$discussion",
              status: "$status",
              isConclusion: "$isConclusion",
              userId: "$userId",
              aiId: "$aiId",
              feedback: "$feedback",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          groupId: "$_id",
          messages: 1,
        },
      },
    ]);

    const participants = await Participant.findOne({ sessionId });

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

    if (selectedParticipants?.length > 0) {
      session.feedbackSelectedParticipant = {
        participants: selectedParticipants,
        startedBy,
      };
    }

    session.feedbackStatus =
      selectedParticipants?.length > 0 ? "SELECTED_IN_PROGRESS" : "IN_PROGRESS";
    await session.save();

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

    const userAnalysis = [];

    console.log({ ddddd: conversation });

    const pointAnalysis = [];

    // Utility to create a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const isFalsyObject = (obj) => !obj || Object.keys(obj).length === 0;

    const generateFeedbackPromises = async () => {
      const promises = [];

      // Iterate through modifiedConversation
      let count = 0;
      modifiedConversation.forEach((messageItem, index) => {
        console.log({
          messageItem,
          eeee: isFalsyObject(messageItem?.feedback),
        });
        if (isFalsyObject(messageItem?.feedback)) {
          // Create a delayed promise for each message
          const promise = delay(count * 30000).then(async () => {
            try {
              const feedback = await generateAIResponse({
                prompt:
                  generateConversationTemplate(topic, messageItem?.discussion) +
                  `\nFull Discussion: ${JSON.stringify(modifiedConversation)}` +
                  PointAnalysisPrompt +
                  `\nAI Response:`,
                isParse: true,
              });

              console.log({ feedback });

              // Construct feedback data
              const feedbackData = {
                _id: messageItem?._id,
                messageIndex: index,
                feedback,
              };

              // Use setTimeout with 0 to save feedback asynchronously without blocking the loop
              setTimeout(async () => {
                // Update conversation with feedback

                console.log({ updateion: messageItem?._id, feedback });
                if (feedback) {
                  const updatedConversation =
                    await Conversation.findOneAndUpdate(
                      { _id: messageItem?._id },
                      { feedback },
                      { new: true }
                    ).catch((err) => {
                      console.error(
                        `Error saving feedback for message ${messageItem?._id}:`,
                        err
                      );
                    });

                  console.log({ updatedConversation });

                  // Emit feedback update to the client
                  io.to(sessionId).emit("FEEDBACK_CONVERSATION_UPDATE", {
                    isConclusion: updatedConversation?.isConclusion,
                    userId:
                      updatedConversation?.userId || updatedConversation?.aiId,
                  });
                } else {
                  console.log({ updatedConversation: null });
                }
              }, 0);

              return feedbackData;
            } catch (error) {
              console.error(
                `Error in API call for message at index ${index}:`,
                error
              );
              return null; // Avoid breaking the Promise.all
            }
          });

          promises.push(promise);
          count += 1;
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(promises);

      // Filter out any null results from failed API calls
      const validResults = results.filter((result) => result !== null);
      console.log({ validResults, pointAnalysis });

      // Push valid results to pointAnalysis
      pointAnalysis.push(...validResults);

      return pointAnalysis;
    };

    // Call the function
    generateFeedbackPromises()
      .then((result) => console.log("Point Analysis:", result))
      .catch((error) => console.error("Error generating feedback:", error));

    console.log({ pointAnalysis });

    const generateUserAnalysisPromises = async () => {
      const promises = [];
      let count = 0;

      // Helper to check if an object is falsy (null, undefined, or empty object)
      const isFalsyObject = (obj) => !obj || Object.keys(obj).length === 0;

      console.log({ aassss: participants?.participant instanceof Map });

      // Iterate through the 'participant' map
      participants.participant.forEach((item, key) => {
        // Check if feedback is falsy
        if (selectedParticipants?.includes(key)) {
          const isConversed = conversation?.find(
            (_) => _?.groupId?.toString() === item?.userId?.toString()
          );
          console.log({
            isConversed,
            conversation,
            userId: item,
            kkkkkk: !isFalsyObject(isConversed),
          });
          if (isFalsyObject(item?.feedback) && !isFalsyObject(isConversed)) {
            const promise = delay(count * 30000).then(async () => {
              try {
                const feedback = await generateAIResponse({
                  prompt:
                    discussionInstructionPrompt({
                      topic,
                      aiParticipants: aiParticipants?.length,
                      discussionLength,
                      noOfUsers,
                      user: item?.userId,
                    }) +
                    `\nFull Discussion : ${JSON.stringify(
                      modifiedConversation
                    )}\n` +
                    OverAllAnalysisPrompt +
                    `\nAI Response:`,
                  isParse: true,
                });

                console.log({ feedback });

                // Use setTimeout with 0 to save feedback asynchronously without blocking the loop
                setTimeout(async () => {
                  console.log(
                    `Saving user analysis for participant with key: ${key}`
                  );
                  try {
                    // Update the specific participant's feedback in the map
                    const updatedParticipant =
                      await Participant.findOneAndUpdate(
                        {
                          _id: participants._id,
                          [`participant.${key}`]: { $exists: true }, // Ensure the participant key exists
                        },
                        {
                          $set: {
                            [`participant.${key}.feedback`]: feedback,
                          },
                        },
                        { new: true }
                      );

                    console.log({ updatedParticipant });

                    // Emit analysis update to the client
                    io.to(sessionId).emit("FEEDBACK_USER_UPDATE", {
                      userId: item?.userId || item?.aiId,
                      feedback,
                    });
                  } catch (err) {
                    console.error(
                      `Error saving user analysis for participant with key: ${key}`,
                      err
                    );
                  }
                }, 0);

                return {
                  userId: item?.userId,
                  feedback,
                };
              } catch (error) {
                console.error(
                  `Error in API call for participant with key: ${key}`,
                  error
                );
                return null; // Avoid breaking the Promise.all
              }
            });

            promises.push(promise);
            count += 1; // Increment delay counter
          }
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(promises);

      // Filter out any null results from failed API calls
      const validResults = results.filter((result) => result !== null);
      console.log({ validResults });

      // Push valid results to userAnalysis
      userAnalysis.push(...validResults);

      return userAnalysis;
    };

    // Call the function
    generateUserAnalysisPromises()
      .then((result) => console.log("User Analysis:", result))
      .catch((error) =>
        console.error("Error generating user analysis:", error)
      );

    
  } catch (error) {
    console.error("Error generating feedback:", error);
    return;
    // return res.status(500).json({ error: "Internal server error" });
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
