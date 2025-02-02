const {
  addParticipant,
  leftParticipant,
  updateMuteStatus,
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

    socket.on(
      "toggle-mute",
      async ({ sessionId, userId, targetUserId, isMuted }) => {
        await updateMuteStatus({
          userId,
          sessionId,
          isMuted,
          io,
          targetUserId,
        });
      }
    );
  });
};

module.exports = {
  socketHandler,
};
