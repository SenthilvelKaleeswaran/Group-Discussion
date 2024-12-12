const GroupDiscussion = require("../models/group-discussion");
const Conversation = require("../models/conversation");
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
const {
  AnalysisPrompt,
  ContentAnalysisPrompt,
  TimingAndPacingPrompt,
  HolisticMetricsPrompt,
  EmotionalIntelligencePrompt,
  DiscussionEngagementPrompt,
  CommunicationSkillsPrompt,
} = require("../prompts");

const getConversationData = (data) => {
  return data?.map((item) => {
    return {
      [item.name]: item?.conversation,
    };
  });
};

const generateConversation = async (req, res) => {
  const { id, participant, conversation: receivedConversation } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Id not found" });
  }

  try {
    // Step 1: Retrieve Group Discussion
    const groupDiscussion = await GroupDiscussion.findById(id).populate(
      "conversationId"
    );
    if (!groupDiscussion) {
      return res.status(404).json({ error: "Group discussion not found" });
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

    const isLastDiscussionPoint = messageLength === discussionLength - 1;

    const updateConversationStatus = async () => {
      const conversation = await Conversation.findOne({
        groupDiscussionId: id,
      });

      if (conversation && conversation.messages.length > 0) {
        const lastIndex = conversation.messages.length - 1;
        const lastMessage = conversation.messages[lastIndex];
        if (lastMessage?.status) {
          return await Conversation.findOneAndUpdate(
            { groupDiscussionId: id },
            {
              $set: {
                [`messages.${lastIndex}.status`]: "SPOKEN",
                [`messages.${lastIndex}.isConclusion`]: isConclusion,
              },
            },
            { new: true }
          );
        }
      }
    };

    const updateNewConversation = async (
      metricsText,
      responseText = "",
      randomMember = {}
    ) => {
      let newMessages = [];

      const metadata = metricsText ? paseJSON(metricsText) : {};

      if (participant?.type !== "AI") {
        newMessages.push({
          _id: participant?._id,
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

      return await Conversation.findOneAndUpdate(
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
      console.log({ updatedConversation: updatedConversation?.messages });
      return res.status(200).json({
        completed: true,
        id,
        conversation: updatedConversation?.messages,
      });
    }

    if (
      (isLastDiscussionPoint &&
        conclusionBy === "AI" &&
        participant?.type === "AI") ||
      (discussionLength === messageLength && conclusionBy === "You")
    ) {
      const updatedConversation = await updateConversationStatus();

      return res.status(200).json({
        randomMember: req?.user?.userId,
        conversation: updatedConversation?.messages,
      });
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

    const [responseText, metricsText] = await Promise.all([
      aiResponsePromise,
      metricsResponsePromise,
    ]);

    if (!responseText) {
      return res.status(500).json({
        error: "No valid response text generated.",
      });
    }

    // Update last message's status to "SPOKEN"
    await updateConversationStatus();

    const randomIndex = Math.floor(Math.random() * aiParticipants.length);
    const randomMember = aiParticipants[randomIndex];

    // Push new messages into the conversation
    const updatedConversation = await updateNewConversation(
      metricsText,
      responseText,
      randomMember
    );

    return res.status(200).json({
      generatedText: responseText,
      randomMember: randomMember?._id,
      conversation: updatedConversation?.messages,
    });
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
      .populate("conversationId")
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
      if (item?._id) {
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
      const user = item?.userId?.name;
      const feedback = await generateAIResponse({
        prompt:
          discussionInstructionPrompt({
            topic,
            aiParticipants,
            discussionLength,
            conclusionPoints,
            conclusionBy,
            noOfUsers,
            user,
          }) +
          `\nFull Discussion : ${JSON.stringify(modifiedConversation)}\n` +
          OverAllAnalysisPrompt +
          `\nAI Response:`,
        isParse: true,
      });
      userAnalysis.push({
        user,
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
    return res.status(200).json({ msg : "Success"});
  } catch (error) {
    console.error("Error generating feedback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  generateConversation,
  generateFeedback,
};
