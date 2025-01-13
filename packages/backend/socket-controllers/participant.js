const Participant = require("../models/participant");

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

const addParticipant = async ({
  socket,
  groupDiscussionId,
  participantDetails,
}) => {
  try {
    // Find or create the session
    let newParticipant = await Participant.findOne({ groupDiscussionId });

    newParticipant.participants.push(participantDetails);
    await newParticipant.save();

    console.log(`User ${userId} joined session ${groupDiscussionId}`);

    socket.join(groupDiscussionId);
    return socket
      .to(groupDiscussionId)
      .emit("USER_JOINED", { userId, socketId: socket.id });
  } catch (error) {
    console.error("Error joining session:", error);
  }
};

module.exports = {
  addParticipant,
  updateParticipant,
  deleteParticipant,
};
