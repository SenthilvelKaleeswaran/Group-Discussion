const {
  addParticipant,
  leftParticipant,
  updateMuteStatus,
  chooseNextParticipant,
  addDiscussionQueue,
  updateDiscussionQueue,
  deleteDiscussionQueue,
  clearDiscussionQueue,
} = require("./controllers-socket/participant");
const { updateSession } = require("./controllers-socket/session");
const { sessionLoadingState } = require("./utils/session-loading-state");

const getRoomSockets = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? [...room] : [];
};

const queue = [
  "67541f953969247972408a47",
  "67890bdcd6796f74dd9424af",
  "677ea6d25be00f8dfa4c1933",
  "677ea7985be00f8dfa4c1935",
];

let index = 0;

let countdownTimers = {}; // Store timers per session

const startCountdown = ({ io, sessionId, duration = 10 }) => {
  console.log({ countdownTimers });
  if (countdownTimers[sessionId]) return; // Prevent duplicate timers

  const endTime = Date.now() + (duration + 2) * 1000; // Calculate the end time
  console.log({ endTime, duration });

  countdownTimers[sessionId] = setInterval(() => {
    const remainingTime = Math.max(
      -1,
      Math.floor((endTime - Date.now()) / 1000)
    );
    console.log({ remainingTime });

    io.to(sessionId).emit("TIMER_UPDATE", { remainingTime });

    if (remainingTime === -1) {
      clearInterval(countdownTimers[sessionId]);
      delete countdownTimers[sessionId];

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

    socket.on("START_TIMER", ({ duration }) => {
      startCountdown({ io, sessionId, duration });
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

    socket.on("DISCUSSION_QUEUE", async ({ type, ...rest }) => {
      const props = { io, socket, sessionId, ...rest };
    
      if (type === "ADD") await addDiscussionQueue(props);
      else if (type === "UPDATE") await updateDiscussionQueue(props);
      else if (type === "DELETE") await deleteDiscussionQueue(props);
      else if (type === "CLEAR") await clearDiscussionQueue(props);
      else socket.emit("DISCUSSION_QUEUE_ERROR", { message: "Invalid discussion queue action type." });
    });
    
    socket.on("NEXT_PARTICIPANT", async (data) => {
      chooseNextParticipant({io,socket,...data})
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
