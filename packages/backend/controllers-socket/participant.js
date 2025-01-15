const Participant = require("../models/participant");
const { getUserRole } = require("../shared/getUserRole");

const updateParticipant = async ({
  groupDiscussionId,
  userId,
  role,
  details,
}) => {
  const participantType =
    role === "admin"
      ? "admin"
      : role === "listener"
      ? "listeners"
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
      : role === "listener"
      ? "listeners"
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
  sessionId,
  userId,
  name,
}) => {
  // console.log({ groupDiscussionId, userId, name });

  if (!groupDiscussionId || !userId) {
    console.error("Error: groupDiscussionId and userId is required");
    return;
  }

  if (!sessionId) {
    

  }

  try {
    // Fetch the participants
    let participant = await Participant.findById(sessionId);
    console.log({ participant });

    const type = getUserRole(participant, userId);

    // Check if the user already exists type will be assigned otherwise he moves to participants
    if (type) {
      const user = participant[type].get(userId);
      user.isActive = true;
      user.timing.push({ joinedAt: new Date(), leftAt: null });
      participant[type].set(userId, user);
    } else {
      console.log("flag2");
      // Add new participant
      participant.participants.set(userId, {
        userId,
        isActive: true,
        muteStatus: false,
        timing: [{ joinedAt: new Date(), leftAt: null }],
      });
    }

    await participant.save(); // Save the session

    // Join socket room and notify others
    const currentSession = `${groupDiscussionId}_${sessionId}`
    socket.join(currentSession);
    socket.to(currentSession).emit("USER_JOINED", { userId });
  } catch (err) {
    console.error("Error joining session:", err);
  }
};

const leftParticipant = async ({ groupDiscussionId, userId }) => {
  try {
    const session = await Participant.findById(groupDiscussionId);

    console.log({ session });

    if (session && session.participants.has(userId)) {
      const user = session.participants.get(userId);
      user.isActive = false;
      user.timing[user.timing.length - 1].leftAt = new Date();
      session.participants.set(userId, user);
      await session.save();

      console.log({ session });

      socket.to(groupDiscussionId).emit("USER_LEFT", { userId });

      // Remove session if no active participants
      // const activeParticipants = Array.from(
      //   session.participants.values()
      // ).filter((participant) => participant.isActive);

      // if (activeParticipants.length === 0) {
      //   await Participant.findByIdAndDelete(groupDiscussionId);
      // }
    }
  } catch (err) {
    console.error("Error leaving session:", err);
  }
};

module.exports = {
  addParticipant,
  leftParticipant,
  updateParticipant,
  deleteParticipant,
};
