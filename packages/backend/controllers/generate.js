const GroupDiscussion = require("../models/group-discussion");
const Conversation = require("../models/conversation");
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

const getConversationData = (data) => {
  return data?.map((item) => {
    return {
      [item.name]: item?.conversation,
    };
  });
};

const generateConversation = async (req, res) => {
  const {
    id,
    participant,
    conversation: receivedConversation,
    isWebSocket,
    ws,
    event,
    sendResponse,
    user,
  } = req.body;

  if (!id) {
    if (isWebSocket)
      sendResponse({
        event: "ERROR",
        data: { error: "Id not found" },
      });
    // return res.status(400).json({ error: "Id not found" });
  }

  try {
    // Step 1: Retrieve Group Discussion
    const groupDiscussion = await GroupDiscussion.findById(id);
    if (!groupDiscussion) {
      if (isWebSocket)
        sendResponse({
          event: "ERROR",
          data: { error: "Group discussion not found" },
        });
      // return res.status(404).json({ error: "Group discussion not found" });
    }

    const {
      topic,
      conversationId: { messages = [] } = {},
      aiParticipants,
      discussionLength,
      conclusionPoints,
      conclusionBy,
    } = groupDiscussion;

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

    console.log({ isConclusion, isTerminatable });

    const isLastDiscussionPoint = messageLength === discussionLength - 1;

    console.log({ isLastDiscussionPoint, www: req.user });

    if (isWebSocket) {
      if (!isTerminatable)
        sendResponse({
          event: "RANDOM_MEMBER",
          data: {
            isLoading: true,
          },
        });
      sendResponse({
        event: "PERFORMANCE_METRICS",
        data: {
          isLoading: participant?.type !== "AI",
        },
      });
    }

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
          return updated
        }
      }
    };

    let randomMember = null;

    if (!isTerminatable) {
      randomMember = getRandomMember();

      if (randomMember?.userId) {
        const updatedConversation = await updateConversationStatus();

        console.log({qqqq :updatedConversation, llll:updatedConversation?.messages ,length : updatedConversation?.messages?.length})

        if (isWebSocket)
          sendResponse({
            event: "CONVERSATION",
            data: {
              conversation: updatedConversation?.messages,
              userSpeak: true,
            },
          });
      }

      if (isWebSocket)
        sendResponse({
          event: "RANDOM_MEMBER",
          data: {
            randomMember: randomMember?.id || randomMember?.userId,
            isLoading: false,
          },
        });

      if (randomMember?.userId) return;
    }

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

      if (!isTerminatable) {
        newMessages.push({
          name: randomMember?.name,
          conversation: responseText,
          isConclusion,
          status: "GENERATED",
        });
      }

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

    const promptTemplate = generateConversationTemplate(
      topic,
      receivedConversation
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

    const metricsResponsePromise = getMetricsResponse();

    if (isTerminatable) {
      console.log("i came");

      let updatedConversation = [];
      if (participant?.type === "AI") {
        updatedConversation = await updateConversationStatus();
      } else {
        const [metricsText] = await Promise.all([metricsResponsePromise]);
        updatedConversation = await updateNewConversation(metricsText);
      }
      await GroupDiscussion.findByIdAndUpdate(id, { status: "COMPLETED" });
      console.log({
        updatedConversation,
        conversation: updatedConversation?.messages,
        aaa: updatedConversation?.updatedConversation?.messages,
      });
      if (isWebSocket)
        sendResponse({
          event: "COMPLETED",
          data: {
            completed: true,
            id,
            conversation:
              updatedConversation?.messages ||
              updatedConversation?.updatedConversation?.messages,
          },
        });
      return;

      // return res.status(200).json({
      //   completed: true,
      //   id,
      //   conversation: updatedConversation?.messages,
      // });
    }

    if (
      (isLastDiscussionPoint &&
        conclusionBy === "AI" &&
        participant?.type === "AI") ||
      (discussionLength === messageLength && conclusionBy === "You")
    ) {
      const updatedConversation = await updateConversationStatus();

      if (isWebSocket)
        sendResponse({
          event: "CONVERSATION",
          data: { conversation: updatedConversation?.messages },
        });

      // return res.status(200).json({
      //   randomMember: req?.user?.userId,
      //   conversation: updatedConversation?.messages,
      // });
    }

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

    console.log({ responseText });

    if (!responseText) {
      if (!isWebSocket)
        sendResponse({
          event: "ERROR",
          data: {
            message: "No valid response text generated.",
          },
        });
      // return res.status(500).json({
      //   error: "No valid response text generated.",
      // });
    }

    // Update last message's status to "SPOKEN"
    await updateConversationStatus();

    // Push new messages into the conversation
    const { updatedConversation, userMessageId } = await updateNewConversation(
      {},
      responseText,
      randomMember
    );

    if (isWebSocket)
      sendResponse({
        event: "GENERATED_TEXT",
        data: {
          aiGeneratedText: responseText,
          conversation: updatedConversation?.messages,
        },
      });

    if (isWebSocket) {
      sendResponse({
        event: "PERFORMANCE_METRICS",
        data: {
          isLoading: participant?.type !== "AI",
          messageId: userMessageId,
        },
      });
    }

    if (userMessageId) {
      const [metricsText] = await Promise.all([metricsResponsePromise]);

      await Conversation.findOneAndUpdate(
        { groupDiscussionId: id, "messages._id": userMessageId },
        {
          $set: {
            "messages.$.metadata": metricsText,
          },
        },
        { new: true, upsert: true }
      );

      setTimeout(() => {
        if (isWebSocket)
          sendResponse({
            event: "PERFORMANCE_METRICS",
            data: {
              isLoading: false,
              metadata: metricsText,
              messageId: userMessageId,
            },
          });
      }, 4000);
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message || error,
    });
  }
};

const generateFeedback = async (req, res) => {
  const { id } = req.body;

  try {
    const groupDiscussion = await GroupDiscussion.findById(id)
      // .populate("conversationId")
      .populate({
        path: "participants",
        select: "userId",
        populate: {
          path: "userId",
          select: "_id name",
        },
      });

    if (!groupDiscussion) {
      return res.status(404).json({ error: "Group discussion not found" });
    }
    console.log({ groupDiscussion });

    const {
      topic,
      conversationId: { messages = [] } = {},
      participants,
      aiParticipants,
      discussionLength,
      conclusionPoints,
      conclusionBy,
      status,
      noOfUsers,
    } = groupDiscussion;

    if (status !== "COMPLETED") {
      return res
        .status(404)
        .json({ error: "Group discussion not completed yet" });
    }

    if (!messages?.length) {
      return res
        .status(404)
        .json({ error: "Group discussion contains no conversation" });
    }

    const modifiedConversation = getConversationData(messages);

    const pointAnalysis = [];
    const userAnalysis = [];

    // Sequential generation of point analysis
    for (const [index, item] of messages.entries()) {
      if (item?.userId) {
        const feedback = await generateAIResponse({
          prompt:
            generateConversationTemplate(topic, item?.conversation) +
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
            conclusionPoints,
            conclusionBy,
            noOfUsers,
            user: name,
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
        filter: { groupDiscussionId: id },
        update: {
          $set: { [`messages.${analysis.index}.feedback`]: analysis?.feedback },
        },
      },
    }));

    const a = await Promise.all([
      await Conversation.bulkWrite(updateDiscussionFeedback),
      await GroupDiscussion.findByIdAndUpdate(
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

module.exports = {
  generateConversation,
  generateFeedback,
};
