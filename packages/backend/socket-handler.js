const {
  addParticipant,
  leftParticipant,
  updateMuteStatus,
} = require("./controllers-socket/participant");
const { updateSession } = require("./controllers-socket/session");
const { sessionLoadingState } = require("./utils/session-loading-state");

const getRoomSockets = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? [...room] : [];
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
      .filter((value) => value.isActive && value.socketId !== socket.id)
      .map((value) => ({
        socketId: value.socketId,
        userId: value.userId,
      }));

    socket.emit("user-list", existingUsers);

    socket
      .to(sessionId)
      .emit("user-joined", { newUserSocketId: socket.id, userId });

    socket.on("send-signal", ({ signal, to }) => {
      io.to(to).emit("receive-signal", {
        signal,
        userId,
        socketId: socket.id,
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

    socket.on(
      "UPDATE_SESSION",
      async (data) => await updateSession({ socket, io, ...data })
    );
  });
};

module.exports = {
  socketHandler,
};
