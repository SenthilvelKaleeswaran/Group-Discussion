const { generateConversation } = require("./controllers/generate");
const { addParticipant } = require("./socket-controllers/participant");

async function socketHandler(socket, connectedUsers) {
  console.log("Client connected:", socket.id);

  socket.on("JOIN_SESSION", async ({ sessionId, userId }) => {
    try {
      let session = await Session.findOne({ sessionId });
      if (!session) {
        session = new Session({ sessionId, participants: [] });
        await session.save();
      }

      const participant = new Participant({
        socketId: socket.id,
        sessionId,
        userId,
      });
      await participant.save();

      session.participants.push(participant._id);
      await session.save();

      socket.join(sessionId);
      socket.to(sessionId).emit("USER_JOINED", { socketId: socket.id });
    } catch (err) {
      console.error("Error joining session:", err);
    }
  });

  socket.on("LEAVE_SESSION", async ({ sessionId }) => {
    try {
      const participant = await Participant.findOneAndDelete({
        socketId: socket.id,
      });

      if (participant) {
        const session = await Session.findOne({ sessionId });
        if (session) {
          session.participants = session.participants.filter(
            (id) => id.toString() !== participant._id.toString()
          );
          await session.save();

          socket.to(sessionId).emit("USER_LEFT", { socketId: socket.id });

          if (session.participants.length === 0) {
            await Session.findOneAndDelete({ sessionId });
          }
        }
      }
    } catch (err) {
      console.error("Error leaving session:", err);
    }
  });

  socket.on("OFFER", ({ sessionId, receiverId, sdp }) => {
    io.to(receiverId).emit("OFFER", { senderId: socket.id, sdp });
  });

  socket.on("ANSWER", ({ sessionId, receiverId, sdp }) => {
    io.to(receiverId).emit("ANSWER", { senderId: socket.id, sdp });
  });

  socket.on("CANDIDATE", ({ sessionId, receiverId, candidate }) => {
    io.to(receiverId).emit("CANDIDATE", { senderId: socket.id, candidate });
  });

  socket.on("disconnect", async () => {
    try {
      const participant = await Participant.findOneAndDelete({
        socketId: socket.id,
      });

      if (participant) {
        const session = await Session.findOne({ sessionId: participant.sessionId });
        if (session) {
          session.participants = session.participants.filter(
            (id) => id.toString() !== participant._id.toString()
          );
          await session.save();

          socket.to(participant.sessionId).emit("USER_LEFT", {
            socketId: socket.id,
          });

          if (session.participants.length === 0) {
            await Session.findOneAndDelete({ sessionId: participant.sessionId });
          }
        }
      }
    } catch (err) {
      console.error("Error on disconnect:", err);
    }
  });
  
  socket.on("GENERATE_FEEDBACK", (data) => {
    console.log("GENERATE_FEEDBACK", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
}

module.exports = { socketHandler };
