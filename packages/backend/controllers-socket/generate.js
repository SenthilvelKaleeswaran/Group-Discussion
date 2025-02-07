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


const getConversationData = (data) => {
    return data?.map((item) => {
      return {
        [item.name]: item?.discussion,
      };
    });
  };

const generateFeedback = async ({
  io,
  socket,
  groupDisscusionId,
  sessionId,
}) => {
  try {
    const session = await Session.findOne({ sessionId });
    const conversation = await Conversation.find({ sessionId });
    const participants = await Participant.find({ sessionId });
    const groupDiscussion = await GroupDiscussion.findOne({
      _id: groupDisscusionId,
    })

    if (!session) {
      io.to(sessionId).emit("FEEDBACK_ERROR", "Session not found");
      return;
    }

    if (!conversation?.length) {
      io.to(sessionId).emit(
        "FEEDBACK_ERROR",
        "Group discussion contains no conversation"
      );
      return;
    }

    if (session?.status !== "COMPLETED") {
      io.to(sessionId).emit("FEEDBACK_WARNINGS", "Session not completed yet");
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
    const noOfUsers = Array.from(participants?.participant?.values());

    const modifiedConversation = getConversationData(conversation);

    const pointAnalysis = [];
    const userAnalysis = [];

    // Sequential generation of point analysis
    for (const [index, item] of conversation.entries()) {
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
            // conclusionPoints,
            // conclusionBy,
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

module.exports = {
  generateFeedback,
};
