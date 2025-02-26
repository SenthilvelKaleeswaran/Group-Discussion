const { updateSessionQueueStatus } = require("./controllers-socket/common");
const {
  updateCurrentConversation,
} = require("./controllers-socket/conversation");
const { generateFeedback } = require("./controllers-socket/generate");
const {
  addParticipant,
  leftParticipant,
  updateMuteStatus,
  chooseNextParticipant,
  addDiscussionQueue,
  updateDiscussionQueue,
  deleteDiscussionQueue,
  clearDiscussionQueue,
  changeOrder,
  muteAllParticipants,
} = require("./controllers-socket/participant");
const { updateSession, nextRound } = require("./controllers-socket/session");
const Conversation = require("./models/conversation");
const Participant = require("./models/participant");
const Session = require("./models/session");
const { sessionLoadingState } = require("./utils/session-loading-state");
const fs = require("fs");
const path = require("path");

const getRoomSockets = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? [...room] : [];
};

let countdownTimers = {}; // Store timers per session
let audioPlaybackData = {};
let currentSpeaker = {};

const startCountdown = ({ io, sessionId, socket, duration = 10 }) => {
  if (countdownTimers[sessionId]) return; // Prevent duplicate timers

  const endTime = Date.now() + (duration + 2) * 1000; // Calculate the end time

  countdownTimers[sessionId] = setInterval(async () => {
    const remainingTime = Math.max(
      -1,
      Math.floor((endTime - Date.now()) / 1000)
    );

    io.to(sessionId).emit("TIMER_UPDATE", { remainingTime });

    if (remainingTime === -1) {
      clearInterval(countdownTimers[sessionId]);
      delete countdownTimers[sessionId];

      try {
        await muteAllParticipants({ io, socket, sessionId });
        await chooseNextParticipant({
          io,
          socket,
          sessionId,
          audioPlaybackData,
          currentSpeaker,
        });
      } catch (error) {
        console.error("Error choosing next participant:", error);
      }

      io.to(sessionId).emit("TIMER_ENDED");
    }
  }, 1000);
};

const socketHandler = (io, socket) => {
  const socketId = socket.id;

  socket.on("join-room", async ({ sessionId, userId, groupDiscussionId }) => {
    const room = sessionId;
    const roomSocketId = getRoomSockets(io, sessionId);
    const participantList = await addParticipant({
      io,
      socket,
      userId,
      sessionId,
      groupDiscussionId,
    });

    if (currentSpeaker[sessionId]?.userId === userId) {
      socket.emit("YOUR_TURN_TO_SPEAK", {
        message: "Your turn to speak",
        type: "YOUR_TURN",
        userStatus: "IN_PROGRESS",
      });
    }

    if (audioPlaybackData[sessionId]) {
      const { audioUrl, startTime, discussion } = audioPlaybackData[sessionId];
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      socket.emit("GENERATED_TEXT_AUDIO", {
        audioUrl,
        startTime,
        elapsedTime,
        discussion,
      });
    }

    const { participant = {}, role } = participantList;

    const list = [
      ...participant?.participant,
      ...participant?.listener,
      ...participant?.admin,
      ...participant?.moderator,
    ];

    const existingUsers = list
      .filter((value) => value.isActive && value.socketId !== socketId)
      .map((value) => ({
        socketId: value.socketId,
        userId: value.userId,
      }));

    socket.emit("user-list", existingUsers);

    socket
      .to(sessionId)
      .emit("user-joined", { newUserSocketId: socketId, userId });

    socket.on("send-signal", ({ signal, to }) => {
      io.to(to).emit("receive-signal", {
        signal,
        userId,
        socketId: socketId,
      });
    });

    socket.on("user-left", async ({ userId, sessionId }) => {
      await leftParticipant({
        socket,
        userId,
        sessionId,
        io,
      });
    });

    const conversation = await Conversation.find({ sessionId })
      .populate({
        path: "userId",
        select: "name email", // Specify the fields you want from the User model
      })
      .populate({
        path: "aiId",
        select: "name email", // Specify the fields you want from the AIModel model
      })
      .sort({
        createdAt: 1,
      });

    socket.emit("CONVERSATION", { conversation });

    socket.on("toggle-mute", async (data) => {
      await updateMuteStatus({ socket, io, ...data });
    });

    socket.on("START_TIMER", async ({ duration }) => {
      startCountdown({ io, socket, sessionId, duration });
    });

    socket.on("UPDATE_SESSION_STATUS", async ({ type }) => {
      const event = sessionLoadingState[type];

      const targetRoom = `${sessionId}${event.to ? `-${event.to}` : ""}`;

      io.to(targetRoom).emit(`${type}_LOADING`, event[`${type}_LOADING`]);

      const data = {};

      if (event?.status) data["status"] = event?.status;

      if (event.id) data[event.id] = new Date();

      await updateSession({
        id: sessionId,
        ...data,
        io,
        socket,
      });

      io.to(sessionId).emit(`${type}_LOADED`, event[`${type}_LOADED`]);
    });

    socket.on("DISCUSSION_QUEUE", async ({ action, ...rest }) => {
      const props = { io, socket, ...rest };

      if (action === "ADD") await addDiscussionQueue(props);
      else if (action === "ORDER") await changeOrder(props);
      else if (action === "UPDATE") await updateDiscussionQueue(props);
      else if (action === "DELETE") await deleteDiscussionQueue(props);
      else if (action === "CLEAR") await clearDiscussionQueue(props);
      else
        socket.emit("DISCUSSION_QUEUE_ERROR", {
          message: "Invalid discussion queue action type.",
        });
    });

    socket.on("NEXT_ROUND",async(data)=>await nextRound({io,socket,...data}) )

    socket.on(
      "NEXT_PARTICIPANT",
      async ({ previousId, currentQueue, ...data }) => {
        let session = await Session.findOne({ _id: sessionId });
        let participant = await Participant.findOne({ sessionId });
        console.log({ previousId, currentQueue });
        if (previousId) {
          io.to(sessionId).emit("TRANSCRIPT", { transcript: "" });
          console.log({ lllllll22: session?.globalOrder });

          if (currentQueue)
            session = await updateSessionQueueStatus({
              sessionId,
              queueItemId: currentQueue?._id,
            });

          console.log({ lllllll: session?.globalOrder });

          await updateCurrentConversation({
            io,
            socket,
            sessionId,
            participant,
            previousId,
            status: "SPOKEN",
            ...data, // isConclusion, discussion
          });

          if (previousId === currentSpeaker?.sessionId?.userId) {
            delete currentSpeaker?.sessionId;
          }
        }

        await chooseNextParticipant({
          io,
          socket,
          passedSession: session,
          sessionId,
          passedParticipant: participant,
          audioPlaybackData,
          currentSpeaker,
        });
      }
    );

    socket.on("GENERATE_FEEDBACK", async ({ sessionId }) => {
     await  generateFeedback({sessionId,socket,io})
    });

    socket.on("TRANSCRIPT", async (transcript) => {
      socket.to(sessionId).emit("TRANSCRIPT", transcript);
    });

    socket.on(
      "UPDATE_SESSION",
      async (data) => await updateSession({ socket, io, ...data })
    );
  });
};

module.exports = {
  socketHandler,
};
