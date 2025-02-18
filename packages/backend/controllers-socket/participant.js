const Participant = require("../models/participant");
const UserDetails = require("../models/user-details");
const User = require("../models/user");
const {
  getUserRole,
  getRoleData,
  getUserData,
} = require("../shared/getUserRole");
const { getUserNameOrEmail } = require("./common");
const Session = require("../models/session");
const { generateConversation } = require("./generate");

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

    if (!participant[role]) participant[role] = new Map();

    if (role) {
      const user = participant[role].get(userId);
      user.isActive = true;
      user.socketId = socket.id;
      user.timing.push({ joinedAt: new Date(), leftAt: null });
      participant[role].set(userId, user);
    } else {
      const admins = ["67541f953969247972408a47"];

      const role = admins.includes(userId) ? "admin" : "participant";

      const userDetail = await getUserNameOrEmail(userId);
      participant[role].set(userId, {
        userId,
        socketId: socket.id,
        name: userDetail?.name || userDetail?.email || userDetail,
        isActive: true,
        muteStatus: false,
        timing: [{ joinedAt: new Date(), leftAt: null }],
      });
    }

    await participant.save();

    console.log({ participant, role });

    const room = sessionId;

    socket.join(room);
    socket.join(`${room}-${role}`);

    const participantList = getRoleData(participant, userId, role);

    const userSession = participant[role].get(userId);

    io.to(socket?.id).emit("USER_SESSION", userSession);

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
  passedParticipant,
}) => {
  try {
    let participant =
      passedParticipant || (await Participant.findOne({ sessionId }));

    const { role, user } = getUserData(participant, targetUserId);

    if (user) {
      const user = participant[role].get(targetUserId);
      user.muteStatus = isMuted;
      participant[role].set(targetUserId, user);

      await participant.save();

      let muteStatusChanged = {
        targetUserId,
        isMuted,
      }

      if(userId !== "DISCUSSION") muteStatusChanged['userId'] = userId

      io.to(sessionId).emit("mute-status-changed", muteStatusChanged);

      if (userId === "DISCUSSION") {
        io.to(targetUserId).emit("TURN_TO_SPEAK", {
          message: "Your turn to speak",
        });
      } else if (userId !== targetUserId) {
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
      }
    }

    return;
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

    // Get the current session
    const session = await Session.findOne({ _id: sessionId });

    // Set the order for the new participant based on the queue length
    const order = session.queue.length + 1;

    // Add the order field to the participant data
    const newParticipant = { ...rest, order, status: "NOT_STARTED" };

    // Update the session with the new participant added to the queue
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionId },
      { $push: { queue: newParticipant } },
      { new: true, upsert: true }
    );

    if (updatedSession && rest?.type !== "AI") {
      const previousUser =
        updatedSession.queue[updatedSession.queue.length - 2];
      if (previousUser) {
        let name = "";
        if (previousUser.type === "AI") {
          name = await getAIName(previousUser.aiId);
        } else {
          name =
            (await getUserNameOrEmail(previousUser.userId)?.name) ||
            getUserNameOrEmail(previousUser.userId)?.email;
        }
        io.to(rest.userId).emit("TURN_TO_SPEAK", {
          message: `You will speak after ${name}`,
          type: "Add",
        });
      }
    }

    // Emit the updated queue to the admin
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: `${rest.name} added to the queue`,
      },
      queue: updatedSession.queue,
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

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, "queue._id": _id },
      { $set: { "queue.$": updates } },
      { new: true }
    );

    if (true && rest?.type !== "AI") {
      const previousUser = session.queue.pop().pop();
      if (previousUser) {
        let name = "";

        if (type === "AI") name = await getAIName(previousUser?.aiId);
        else
          name =
            (await getUserNameOrEmail(previousUser?.userId)?.name) ||
            getUserNameOrEmail(previousUser?.userId)?.email;

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

const changeOrder = async ({
  io,
  socket,
  sessionId,
  sourceIndex,
  destinationIndex,
}) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Updating discussion queue order",
    });

    // Fetch the session and the current queue
    const session = await Session.findOne({ _id: sessionId });

    const queue = session.queue;

    if (
      sourceIndex < 0 ||
      destinationIndex < 0 ||
      sourceIndex >= queue.length ||
      destinationIndex >= queue.length
    ) {
      throw new Error("Invalid source or destination index");
    }

    queue[sourceIndex].order = destinationIndex + 1;

    if (sourceIndex < destinationIndex) {
      for (let i = sourceIndex + 1; i <= destinationIndex; i++) {
        if (queue[i].order > sourceIndex) {
          queue[i].order = i;
        }
      }
    } else {
      for (let i = destinationIndex; i < sourceIndex; i++) {
        if (queue[i].order <= sourceIndex) {
          queue[i].order += 1;
        }
      }
    }

    const sorted = queue?.sort((a, b) => a.order - b.order);

    session.queue = sorted;

    await session.save();

    // Emit updated queue
    io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: `Discussion queue order updated successfully`,
      },
      queue: session.queue,
    });
  } catch (error) {
    console.error("Error updating discussion queue order:", error);
    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message: "Failed to update discussion queue order",
    });
  }
};

const deleteDiscussionQueue = async ({
  io,
  socket,
  sessionId,
  _id,
  ...rest
}) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Deleting Participant in discussion queue",
    });

    // Get the current session
    const session = await Session.findOne({ _id: sessionId });

    // Remove the participant from the queue
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionId },
      { $pull: { queue: { _id } } },
      { new: true }
    );

    // Update the order of remaining participants in the queue
    updatedSession.queue.forEach((participant, index) => {
      participant.order = index + 1; // Reassign order based on the new index
    });

    updatedSession.globalOrder -= 1;

    // Save the updated session with the new order values
    await updatedSession.save();

    if (rest?.userId) {
      io.to(rest?.userId).emit("TURN_TO_SPEAK", {
        message: `Your turn is changed. Wait for further updation`,
        type: "Delete",
      });
    }

    // Emit the updated queue to the session
    io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: {
        message: "Participant removed from queue",
      },
      queue: updatedSession.queue,
      action: "DELETE",
      globalOrder: updatedSession.globalOrder,
      id: _id,
    });
  } catch (error) {
    console.error("Error deleting participant from queue:", error);
    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message: "Failed to remove participant from queue",
    });
  }
};

const clearDiscussionQueue = async ({ io, socket, sessionId, queueLength }) => {
  try {
    io.to(`${sessionId}-admin`).emit("DISCUSSION_QUEUE_LOADING", {
      loading: "Clearing discussion queue",
    });

    // Find and update session, removing items with status "NOT_STARTED"
    const session = await Session.findOneAndUpdate(
      { _id: sessionId },
      { $pull: { queue: { status: "NOT_STARTED" } } },
      { new: true } // Return updated session
    );

    // Check if session exists (avoid accessing properties of null)
    if (!session) {
      throw new Error("Session not found");
    }

    const sessionQueueLength = session.queue.length;

    if (queueLength === sessionQueueLength) {
      io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
        notify: { message: "No items to clear" },
      });

      return;
    }

    // Update globalOrder based on queue length
    session.globalOrder = (queueLength || 0) - (sessionQueueLength || 0);

    await session.save();

    // Emit queue update event
    io.to(sessionId).emit("DISCUSSION_QUEUE_UPDATED", {
      notify: { message: "Discussion queue cleared" },
      queue: session.queue, // Send updated queue
      globalOrder: session.globalOrder,
    });

    // Notify users about changes
    io.to(sessionId).emit("TURN_TO_SPEAK", {
      message: `Changes in discussion queue. Wait for further updates.`,
      type: "Clear",
    });
  } catch (error) {
    console.error("Error clearing discussion queue:", error);

    socket.emit("DISCUSSION_QUEUE_ERROR", {
      message: "Failed to clear discussion queue",
    });
  }
};

const chooseNextParticipant = async ({
  io,
  socket,
  sessionId,
  passedSession,
  passedParticipant,
  audioPlaybackData
}) => {
  try {
    io.to(sessionId).emit("NEXT_PARTICIPANT_LOADING", {
      loading: "Discussion Queue is Loading",
    });

    let session = passedSession || (await Session.findOne({ _id: sessionId }));
    let participant =
      passedParticipant || (await Participant.findOne({ sessionId }));

    console.log({ participanttttt: participant });

    if (!participant) {
      io.to(sessionId).emit("NEXT_PARTICIPANT_ERROR", {
        error: "Participant not found",
      });
      return
    }

    const { queue = [], globalOrder } = session;
    const { participant: discussionParticipant = {} } = participant;

    if (!queue.length) {
      io.to(sessionId).emit("DISCUSSION_QUEUE_NO_PARTICIPANT", {
        warning: "No Participant in Discussion Queue",
      });
      return;
    }

    if (queue.length === globalOrder) {
      io.to(sessionId).emit("DISCUSSION_QUEUE_COMPLETED", {
        message: "All participants have spoken",
      });
      return;
    }

    let index = globalOrder;

    console.log({ queue });

    const takeNextParticipant = async (index) => {
      if (index >= queue.length) {
        io.to(sessionId).emit("DISCUSSION_QUEUE_COMPLETED", {
          warning: "No more active participants left",
        });
        return;
      }

      const currentPerson = queue[index];

      if (currentPerson?.userId?.toString()) {
        const user = discussionParticipant?.get(
          currentPerson?.userId?.toString()
        );

        if (user?.isActive) {
          await updateMuteStatus({
            socket,
            io,
            userId: "DISCUSSION",
            targetUserId: currentPerson?.userId?.toString(),
            sessionId,
            isMuted: false,
            passedParticipant: participant,
          });

          queue[index].status = "IN_PROGRESS";

          io.to(user?.socketId).emit("TURN_TO_SPEAK", {
            message: "Your turn to speak",
            type: "YOUR_TURN",
            userStatus: "IN_PROGRESS",
          });

          io.to(sessionId)
            .except(user?.socketId)
            .emit("TURN_TO_SPEAK_NOTIFY_OTHERS", {
              message: `${user?.name} turn to speak`,
            });

          session.queue = queue;
          session.globalOrder = index + 1;

          await session.save();

          return;
        } else {
          queue[index].status = "IN_ACTIVE";

          session.queue = queue;
          session.globalOrder = index + 1;
          index += 1;

          await session.save();

          io.to(sessionId).emit("TURN_TO_SPEAK_INACTIVE", {
            error: `${user?.name} is inactive`,
          });

          return takeNextParticipant(index);
        }
      } else {
        await generateConversation({
          socket,
          io,
          passedSession: session,
          aiId: currentPerson?.aiId?.toString(),
          sessionId,
          audioPlaybackData
        });
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

const muteAllParticipants = async ({
  io,
  socket,
  sessionId,
  passedParticipant,
}) => {
  try {
    // Retrieve the participant document if not passed
    let participant =
      passedParticipant || (await Participant.findOne({ sessionId }));

    if (!participant) {
      throw new Error("Session not found");
    }

    // Function to mute a specific type of participant
    const mute = (type) => {
      participant[type].forEach((details) => {
        details.muteStatus = true;
      });
    };

    // Array of participant types to mute
    const participantTypes = ["admin", "moderator", "listener", "participant"];

    // Mute all participant types
    participantTypes.forEach((type) => mute(type));

    // Save the updated participant document
    await participant.save();

    // Emit an event to notify clients
    io.to(sessionId).emit("DISCUSSION", "ll");
  } catch (err) {
    console.error(err);
    socket.emit("MUTE_ERROR", {
      message: "Error muting all the participants. Please try again.",
    });
  }
};

module.exports = {
  addParticipant,
  addDiscussionQueue,
  clearDiscussionQueue,
  changeOrder,
  chooseNextParticipant,
  deleteDiscussionQueue,
  leftParticipant,
  muteAllParticipants,
  updateDiscussionQueue,
  updateMuteStatus,
  updateParticipant,
  deleteParticipant,
};
