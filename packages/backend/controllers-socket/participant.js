const Participant = require("../models/participant");
const UserDetails = require("../models/user-details");
const User = require("../models/user");
const {
  getUserRole,
  getRoleData,
  getUserData,
} = require("../shared/getUserRole");

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

const joinRooms = (id, role, socket) => {
  socket.join(id);
  socket.join(`${id}-${role}`);
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
    const role = getUserRole(participant, userId);

    if (!participant[role]) {
      participant[role] = new Map();
    }

    if (role) {
      const user = participant[role].get(userId);
      user.isActive = true;
      user.socketId = socket.id;
      user.timing.push({ joinedAt: new Date(), leftAt: null });
      participant[role].set(userId, user);
    } else {
      const admins = ["67850bd81755c252af4a35fb", "67541f953969247972408a47"];

      const role = admins.includes(userId) ? "admin" : "participant";

      const userDetail =
        (await UserDetails.findById(userId)) || (await User.findById(userId));
      participant[role].set(userId, {
        userId,
        socketId: socket.id,
        name: userDetail?.name || userDetail?.email,
        isActive: true,
        muteStatus: false,
        timing: [{ joinedAt: new Date(), leftAt: null }],
      });
    }

    await participant.save();

    const room = sessionId;

    socket.join(room);
    socket.join(`${room}-${role}`);

    const participantList = getRoleData(participant, userId, role);

    io.to(sessionId).emit("PARTICIPANT_LIST", participantList);
    return participantList;
  } catch (err) {
    console.error("Error joining session:", err);
  }
};

const leftParticipant = async ({ socket, sessionId, userId, io }) => {
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

const updateMuteStatus = async ({
  io,
  socket,
  userId,
  targetUserId,
  sessionId,
  isMuted,
}) => {
  try {
    let participant = await Participant.findOne({ sessionId });

    const { role, user } = getUserData(participant, targetUserId);

    if (user) {
      const user = participant[role].get(targetUserId);
      user.muteStatus = isMuted;
      participant[role].set(targetUserId, user);

      await participant.save();

      io.to(sessionId).emit("mute-status-changed", {
        targetUserId,
        isMuted,
        userId,
      });

      if (userId !== targetUserId) {
        socket.emit("MUTE_SUCCESS", {
          message: `Successfully ${isMuted ? "muted" : "unmuted"} ${user.name}`,
        });

        const { user: mutedBy } = getUserData(participant, userId);

        if (mutedBy) {
          io.to(user.socketId).emit("USER_MUTED", {
            message: `You were ${isMuted ? "muted" : "unmuted"} by ${
              mutedBy.name
            }`,
          });
        }
      } else if (userId === "DISCUSISSION") {
        io.to(targetUserId).emit("TURN_TO_SPEAK", {
          message: "Your turn to speak",
        });
      }
    }
  } catch (err) {
    console.error(err);
    socket.emit("MUTE_ERROR", {
      message: "Error muting user. Please try again.",
    });
  }
};

module.exports = {
  addParticipant,
  leftParticipant,
  updateMuteStatus,
  updateParticipant,
  deleteParticipant,
};
