const {
  addParticipant,
  leftParticipant,
} = require("./controllers-socket/participant");

const getRoomSockets = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? [...room] : [];
};

const socketHandler = (io, socket) => {
  const socketId = socket.id;

  socket.on("join-room", async ({ sessionId, userId, groupDiscussionId }) => {
    const roomSocketId = getRoomSockets(io, sessionId);
    const participantList = await addParticipant({
      io,
      socket,
      userId,
      sessionId,
      groupDiscussionId,
    });

    const { participant, role } = participantList;

    const existingUsers = Array.from(participant?.values())
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
      io.to(to).emit("receive-signal", { signal, userId, socketId: socket.id });
    });

    socket.on("user-left", async ({ userId, sessionId }) => {
      await leftParticipant({
        socket,
        userId,
        sessionId,
      });
    });
  });
};

module.exports = {
  socketHandler,
};
