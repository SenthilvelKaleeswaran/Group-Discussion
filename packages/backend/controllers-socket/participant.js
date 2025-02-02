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
  groupDiscussionId,
  sessionId,
  userId,
  io,
}) => {
  if (!groupDiscussionId || !userId || !sessionId) {
    console.error(
      "Error: groupDiscussionId and userId are required",
      groupDiscussionId,
      userId,
      sessionId
    );
    return;
  }

  try {
    let participant = await Participant.findOne({ sessionId });
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
      const admins = ["67850bd81755c252af4a35fb", "67541f953969247972408a47"];

      const type = admins.includes(userId) ? "admin" : "participant";

      const userDetail =
        (await UserDetails.findById(userId)) || (await User.findById(userId));
      participant[type].set(userId, {
        userId,
        socketId: socket.id,
        name: userDetail?.name || userDetail?.email,
        isActive: true,
        muteStatus: false,
        timing: [{ joinedAt: new Date(), leftAt: null }],
      });
    }

    await participant.save();
    socket.join(sessionId);

    const participantList = getRoleData(participant, userId, type);

    io.to(sessionId).emit("PARTICIPANT_LIST", participantList);
    return participantList;
  } catch (err) {
    console.error("Error joining session:", err);
  }
};

const leftParticipant = async ({ socket, sessionId, userId,io }) => {
  try {
    let participant = await Participant.findOne({ sessionId });

    const type = getUserRole(participant, userId);

    if (type) {
      const user = participant[type].get(userId);
      user.isActive = false;
      user.timing[user.timing.length - 1].leftAt = new Date();
      participant[type].set(userId, user);
      await participant.save();

      socket.to(sessionId).emit("user-left", { socketId: socket.id });
      const participantList = getRoleData(participant, userId, type);

      io.to(sessionId).emit("PARTICIPANT_LIST", participantList);
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
