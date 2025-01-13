const Participant = require("../models/participant");

const getParticipants = async (req, res) => {
  const { groupDiscussionId } = req.params;

  try {
    const participants = await Participant.find({ groupDiscussionId })
    res.json(participants);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const createParticipant = async (req, res) => {
  const { userId, groupDiscussionId } = req.body;

  try {
    const newParticipant = new Participant({
      userId,
      groupDiscussionId,
    });

    await newParticipant.save();
    res.status(201).json(newParticipant);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const updateParticipant = async ({
  groupDiscussionId,
  userId,
  role,
  details,
}) => {
  const participantType =
    role === "admin"
      ? "admin"
      : role === "moderator"
      ? "moderators"
      : "participants";
  await Participant.findOneAndUpdate(
    { groupDiscussionId },
    {
      $set: {
        [`${participantType}.${userId}`]: details,
      },
    },
    { upsert: true, new: true }
  );
};

const deleteParticipant = async ({ groupDiscussionId, userId, role }) => {
  const participantType =
    role === "admin"
      ? "admin"
      : role === "moderator"
      ? "moderators"
      : "participants";
  await Participant.findOneAndUpdate(
    { groupDiscussionId },
    { $unset: { [`${participantType}.${userId}`]: 1 } },
    { new: true }
  );
};

const addParticipant = async ({})=>{
  try {
    // Find or create the session
    let session = await Participant.findOne({ sessionId });
    if (!session) {
      session = new Participant({ sessionId, participants: [] });
      await session.save();
    }

    // Add the participant to the session
    const participant = new Participant({
      socketId: socket.id,
      sessionId,
      userId,
    });
    await participant.save();

    session.participants.push(participant._id);
    await session.save();

    console.log(`User ${userId} joined session ${sessionId}`);

    // Notify other participants in the session
    socket.join(sessionId);
    socket.to(sessionId).emit("USER_JOINED", { userId, socketId: socket.id });
  } catch (error) {
    console.error("Error joining session:", error);
  }
}

module.exports = {
  createParticipant,
  getParticipants,
  updateParticipant,
  deleteParticipant
};
