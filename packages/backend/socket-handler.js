const {
  updateCurrentConversation,
} = require("./controllers-socket/conversation");
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
const { updateSession } = require("./controllers-socket/session");
const Participant = require("./models/participant");
const Session = require("./models/session");
const { sessionLoadingState } = require("./utils/session-loading-state");

const getRoomSockets = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? [...room] : [];
};

let countdownTimers = {}; // Store timers per session

const startCountdown = ({ io, sessionId, socket, duration = 10 }) => {
  console.log({ countdownTimers });
  if (countdownTimers[sessionId]) return; // Prevent duplicate timers

  const endTime = Date.now() + (duration + 2) * 1000; // Calculate the end time
  console.log({ endTime, duration });

  countdownTimers[sessionId] = setInterval(async () => {
    const remainingTime = Math.max(
      -1,
      Math.floor((endTime - Date.now()) / 1000)
    );
    console.log({ remainingTime });

    io.to(sessionId).emit("TIMER_UPDATE", { remainingTime });

    if (remainingTime === -1) {
      clearInterval(countdownTimers[sessionId]);
      delete countdownTimers[sessionId];

      try {
        await muteAllParticipants({ io, socket, sessionId });
        await chooseNextParticipant({ io, socket, sessionId });
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

    const { participant, role } = participantList;

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

    socket.on("toggle-mute", async (data) => {
      await updateMuteStatus({ socket, io, ...data });
    });

    socket.on("START_TIMER", async ({ duration }) => {
      startCountdown({ io, socket, sessionId, duration });
    });

    socket.on("UPDATE_SESSION_STATUS", async ({ type }) => {
      console.log({type})

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

    socket.on("NEXT_PARTICIPANT", async ({ previousId, ...data }) => {
      let session = await Session.findOne({ _id: sessionId });
      let participant = await Participant.findOne({ sessionId });
      console.log({previousId})
      if (previousId) {
        console.log({previousId})

        io.to(sessionId).emit("TRANSCRIPT", {transcript : ""});

        await updateCurrentConversation({
          io,
          socket,
          session,
          sessionId,
          participant,
          previousId,
          status: "SPOKEN",
          ...data, // isConclusion, discussion
        });
      }
      console.log({ participanttttt2: participant });

      await chooseNextParticipant({
        io,
        socket,
        passedSession: session,
        sessionId,
        passedParticipant: participant,
        ...data,
      });
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
