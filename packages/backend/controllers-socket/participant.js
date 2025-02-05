const Participant = require("../models/participant");
const UserDetails = require("../models/user-details");
const User = require("../models/user");
const {
  getUserRole,
  getRoleData,
  getUserData,
} = require("../shared/getUserRole");
const { getUserNameOrEmail } = require("./common");

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

      const userDetail = await getUserNameOrEmail(userId);
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

const addDiscussionQueue = async ({ io, socket, sessionId, ...rest }) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Adding participant to the queue",
    });

    const session = await Participant.findOneAndUpdate(
      { sessionId },
      { $push: { queue: rest } },
      { new: true, upsert: true }
    );

    if (true && rest?.type !== "AI") {
      const previousUser = session.queue.pop().pop();
      if (previousUser) {
        let name = "";

        if (type === "AI") name = await getAIName(previousUser?.aiId);
        else name = await getUserNameOrEmail(previousUser?.userId);

        io.to(rest?.userId).emit("TURN_TO_SPEAK", {
          message: `You will speak after ${name}`,
          type : 'Add'
        });
      }
    }

    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: `${rest?.name} added to the queue`,
      },
    });
  } catch (err) {
    console.error(err);
    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message:
        "Error adding the next participant to the queue. Please try again.",
    });
  }
};

const updateDiscussionQueue = async ({
  io,
  socket,
  sessionId,
  _id,
  ...updates
}) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Updating discussion queue",
    });

    const session = await Participant.findOneAndUpdate(
      { _id: sessionId, "queue._id": _id },
      { $set: { "queue.$": updates } },
      { new: true }
    );

    if (true && rest?.type !== "AI") {
      const previousUser = session.queue.pop().pop();
      if (previousUser) {
        let name = "";

        if (type === "AI") name = await getAIName(previousUser?.aiId);
        else name = await getUserNameOrEmail(previousUser?.userId);

        io.to(rest?.userId).emit("TURN_TO_SPEAK", {
          message: `Your previous turn is changed. You will speak after ${name}`,
          type: "Update",
        });
      }
    }

    io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: `Discussion queue updated successfully`,
      },
      queue: session.queue,
    });
  } catch (error) {
    console.error("Error updating discussion queue:", error);
    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message: "Failed to update discussion queue",
    });
  }
};

const deleteDiscussionQueue = async ({ io, socket, sessionId, _id }) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Deleting Participant in discussion queue",
    });

    const session = await Participant.findOneAndUpdate(
      { _id: sessionId },
      { $pull: { queue: { _id } } },
      { new: true }
    );

    if (true && rest?.type !== "AI") {
      io.to(rest?.userId).emit("TURN_TO_SPEAK", {
        message: `Your turn is changed. Wait for further updation`,
        type: "Delete",
      });
    }

    io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: "Participant removed from queue",
      },
      queue: session.queue,
    });
  } catch (error) {
    console.error("Error deleting participant from queue:", error);
    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message: "Failed to remove participant from queue",
    });
  }
};

const clearDiscussionQueue = async ({ io, socket, sessionId }) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Clearing discussion queue",
    });

    const session = await Participant.findOneAndUpdate(
      { _id: sessionId },
      { $set: { queue: [] } },
      { new: true }
    );

    if (true) {
      io.to(session).emit("TURN_TO_SPEAK", {
        message: `Changes in discussion queue. Wait for further updation.`,
        type: "Clear",
      });
    }
    io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: "Discussion queue cleared",
      },
      queue: [],
    });
  } catch (error) {
    console.error("Error clearing discussion queue:", error);
    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message: "Failed to clear discussion queue",
    });
  }
};

const chooseNextParticipant = async ({ io, socket, sessionId }) => {
  try {
    io.to(sessionId).emit("NEXT_PARTICIPANT_LOADING", {
      loading: "Discussion Queue is Loading",
    });

    let participant = await Participant.findOne({ sessionId });

    if (!participant) {
      return io.to(sessionId).emit("NEXT_PARTICIPANT_ERROR", {
        error: "Participant not found",
      });
    }

    const { queue = [], participant: discussionParticipant } = participant;

    if (!queue.length) {
       io.to(sessionId).emit("DISCUSSION_QUEUE_NO_PARTICIPANT", {
        warning : "No Participant in Discussion Queue",
      });
      return
    }

    let index = queue.findIndex((item) => item.status === "NOT_STARTED");

    if (index === -1) {
       io.to(sessionId).emit("DISCUSSION_QUEUE_COMPLETED", {
        message: "All participants have spoken",
      });
      return
    }

    const takeNextParticipant = async (index) => {
      if (index >= queue.length) {
        return io.to(sessionId).emit("DISCUSSION_QUEUE_COMPLETED", {
          warning: "No more active participants left",
        });
      }

      const currentPerson = queue[index]?.userId;
      const user = discussionParticipant?.get(currentPerson);

      if (user?.isActive) {
        await updateMuteStatus({
          socket,
          io,
          userId: "DISCUSSION",
          targetUserId: currentPerson,
          sessionId,
          isMuted: false,
        });

        queue[index].status = "IN_PROGRESS";

        io.to(currentPerson).emit("TURN_TO_SPEAK", {
          message: "Your turn to speak",
        });

        io.to(sessionId)
          .except(currentPerson)
          .emit("TURN_TO_SPEAK_NOTIFY_OTHERS", {
            message: `${user?.name} turn to speak`,
          });

        participant.queue = queue;
        await participant.save();
      } else {
        queue[index].status = "INACTIVE";

        participant.queue = queue;
        await participant.save();

        io.to(sessionId).emit("TURN_TO_SPEAK_INACTIVE", {
          error: `${user?.name} is inactive`,
        });

        return takeNextParticipant(index + 1);
      }
    };

    return takeNextParticipant(index);
  } catch (err) {
    console.error(err);
    socket.emit("MUTE_ERROR", {
      message: "Error selecting the next participant. Please try again.",
    });
  }
};

module.exports = {
  addParticipant,
  addDiscussionQueue,
  clearDiscussionQueue,
  chooseNextParticipant,
  deleteDiscussionQueue,
  leftParticipant,
  updateDiscussionQueue,
  updateMuteStatus,
  updateParticipant,
  deleteParticipant,
};
