const GroupDiscussion = require("../models/group-discussion");
const Participant = require("../models/participant");
const Session = require("../models/session");
const { getRoleData } = require("../shared/getUserRole");

const getActiveSession = async (req, res) => {
  const { id } = req.params;
  const [groupDiscussionId, sessionId] = id.split("-");

  const fetchSessionDetails = async (sessionId) => {
    const participant = await Participant.findOne({ sessionId });
    const roleData = getRoleData(participant, req.user.userId);

    const session = await Session.findById(sessionId).populate({
      path: "aiParticipants",
      select: "_id name avatar gender",
    });

    return res.status(200).json({ ...session.toObject(), ...roleData });
  };

  try {
    const groupDiscussion = await GroupDiscussion.findById(groupDiscussionId);

    if (!groupDiscussion) {
      return res.status(404).json({ msg: "Group Discussion not found" });
    }

    if (groupDiscussion.status === "COMPLETED") {
      return res.status(200).json({ msg: "Group Discussion Completed" });
    }

    if (!sessionId) {
      const { activeSession } = groupDiscussion;

      if (!activeSession?.length) {
        const sessions = await Session.find({ groupDiscussionId });
        return res.status(200).json({ sessions });
      }

      if (activeSession.length > 1) {
        const sessions = await Session.find({ _id: { $in: activeSession } });
        return res.status(200).json({ sessions });
      }

      await fetchSessionDetails(activeSession[0]);
    }

    await fetchSessionDetails(sessionId);
  } catch (error) {
    console.error("Error fetching group discussion:", error);
    res.status(500).json({ msg: "Server Error", error });
  }
};

const createSession = async (req, res) => {
  const {
    aiModelsCount,
    participants = [],
    isTopicAiGenerated,
    groupDiscussionId,
    ...rest
  } = req.body;

  try {
    // Generate AI participants

    let topic = rest?.topic || "";

    // Generate topic by AI
    if (isTopicAiGenerated) {
      topic = await generateAIResponse({ prompt: DiscussionTopicPrompt });
    }

    const newSession = new Session({
      ...rest,
      topic,
      createdBy: req.user.userId,
    });

    await newSession.save();
    const sessionId = newSession?._id;

    await Promise.all([
      new Participant({ _id: sessionId }).save(),
      new SessionLog({
        _id: sessionId,
        events: [
          {
            action: "Group Discussion Created",
            performedBy: req.user.userId,
          },
        ],
      }).save(),
      GroupDiscussion.findByIdAndUpdate(groupDiscussionId, {
        activeSession: [sessionId],
      }),
    ]);

    res.status(201).json({ result: sessionId });
  } catch (error) {
    console.error({ error });
    res.status(500).json({ msg: "Server Error", error });
  }
};

const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ msg: "Session ID is required." });
    }

    const updatedSession = await Session.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedSession) {
      return res.status(404).json({ msg: "Session not found." });
    }

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ msg: "Internal server error." });
  }
};

module.exports = {
  getActiveSession,
  createSession,
  updateSession,
};
