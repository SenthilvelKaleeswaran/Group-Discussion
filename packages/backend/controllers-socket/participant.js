const Participant = require("../models/participant");
const UserDetails = require("../models/user-details");
const User = require("../models/user");
const { getUserRole, getRoleData } = require("../shared/getUserRole");

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
  io,
  groupDiscussionId,
  sessionId,
  userId,
}) => {
  // console.log({ groupDiscussionId, userId, name });

  if (!groupDiscussionId || !userId || !sessionId) {
    console.error("Error: groupDiscussionId and userId is required");
    return;
  }

  try {
    // Fetch the participants
    let participant = await Participant.findById(sessionId);
    console.log({ participant });

    const type = getUserRole(participant, userId);

    if (!participant[type]) {
      participant[type] = new Map();
    }

    if (type) {
      const user = participant[type].get(userId);
      user.isActive = true;
      user.socketId = socket.id;
      user.timing.push({ joinedAt: new Date(), leftAt: null });
      participant[type].set(userId, user);
    } else {
      console.log("flag2");

      const userDetail =
        (await UserDetails.findById(userId)) || (await User.findById(userId));

      console.log({userId})

      // Add new participant
      participant.admin.set(userId, {
        userId,
        socketId: socket.id,
        name: userDetail?.name || userDetail?.email,
        isActive: true,
        muteStatus: false,
        timing: [{ joinedAt: new Date(), leftAt: null }],
      });
    }

    await participant.save(); // Save the session

    // Join socket room and notify others
    const currentSession = `${groupDiscussionId}_${sessionId}`;

    // socket.join(currentSession);
    // socket.to(currentSession).emit("USER_JOINED", { userId });
    socket.emit("USER_JOINED", { userId });

    const particpantList = getRoleData(participant, userId);
    console.log({particpantList})
    io.emit("PARTICIPANTS_UPDATED", particpantList);
  } catch (err) {
    console.error("Error joining session:", err);
  }
};

const leftParticipant = async ({
  io,
  socket,
  sessionId,
  groupDiscussionId,
  userId,
}) => {
  try {
    let participant = await Participant.findById(sessionId);

    const type = getUserRole(participant, userId);

    if (type) {
      const user = participant[type].get(userId);
      user.isActive = false;
      user.timing[user.timing.length - 1].leftAt = new Date();
      participant[type].set(userId, user);
      await participant.save();


      socket.to(groupDiscussionId).emit("USER_LEFT", { userId });

      const currentSession = `${groupDiscussionId}_${sessionId}`;

      const particpantList = getRoleData(participant, userId);
      io.to(currentSession).emit("PARTICIPANTS_UPDATED", particpantList);

      // Remove session if no active participants
      // const activeParticipants = Array.from(
      //   session.participant.values()
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
