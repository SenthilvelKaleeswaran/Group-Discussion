const { generateConversation } = require("./controllers/generate");
const { addParticipant, leftParticipant } = require("./controllers-socket/participant");
const Participant = require("./models/participant");

// async function socketHandler(io, socket) {
//   console.log("Client connected:", socket.id);

//   socket.on("JOIN_SESSION", (data) => addParticipant({ socket, ...data }));

//   socket.on("LEAVE_SESSION", (data) => leftParticipant({socket , ...data}));

//   socket.on("OFFER", ({ groupDiscussionId, userId, sdp }) => {
//     io.to(userId).emit("OFFER", { senderId: socket.id, sdp });
//   });

//   socket.on("ANSWER", ({ groupDiscussionId, userId, sdp }) => {
//     io.to(userId).emit("ANSWER", { senderId: socket.id, sdp });
//   });

//   socket.on("CANDIDATE", ({ groupDiscussionId, userId, candidate }) => {
//     io.to(userId).emit("CANDIDATE", { senderId: socket.id, candidate });
//   });

//   socket.on("disconnect", async () => {
//     // try {
//     //   const session = await Participant.findOne({
//     //     "participants.socketId": socket.id,
//     //   });
//     //   if (session) {
//     //     for (const [userId, participant] of session.participants) {
//     //       if (participant.socketId === socket.id) {
//     //         participant.isActive = false;
//     //         participant.timing[participant.timing.length - 1].leftAt =
//     //           new Date();
//     //         session.participants.set(userId, participant);
//     //         break;
//     //       }
//     //     }
//     //     await session.save();
//     //     const activeParticipants = Array.from(
//     //       session.participants.values()
//     //     ).filter((participant) => participant.isActive);
//     //     if (activeParticipants.length === 0) {
//     //       await Participant.findByIdAndDelete(session._id);
//     //     }
//     //   }
//     // } catch (err) {
//     //   console.error("Error on disconnect:", err);
//     // }
//   });

//   socket.on("GENERATE_FEEDBACK", (data) => {
//     console.log("GENERATE_FEEDBACK", data);
//   });

//   socket.on("error", (error) => {
//     console.error("Socket.IO error:", error);
//   });
// }

async function socketHandler(io,socket){
  
  // Namespace for group discussion
  const gdNamespace = io.of('/groupDiscussion');
  
  gdNamespace.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("JOIN_SESSION", (data) => addParticipant({ socket, ...data }));

    socket.on("LEAVE_SESSION", (data) => leftParticipant({socket , ...data}));
  
    // Admin joins main GD room
    socket.on('JOIN_GD', (gdId) => {
      socket.join(gdId); // Join main GD room
      console.log(`Admin joined GD: ${gdId}`);
    });
  
    // User joins specific session
    socket.on('joinSession', ({ gdId, sessionId, role }) => {
      const sessionRoom = `${gdId}_${sessionId}`;
      const roleRoom = `${sessionRoom}_${role}`;
  
      // Join session and role-specific rooms
      socket.join(sessionRoom);
      socket.join(roleRoom);
  
      console.log(`${role} joined ${sessionRoom}`);
  
      // Notify users in the session
      gdNamespace.to(sessionRoom).emit('notification', `${role} joined session: ${sessionId}`);
    });
  
    // Admin moves between sessions
    socket.on('moveToSession', ({ gdId, fromSession, toSession }) => {
      const fromRoom = `${gdId}_${fromSession}`;
      const toRoom = `${gdId}_${toSession}`;
  
      socket.leave(fromRoom);
      socket.join(toRoom);
  
      console.log(`Admin moved from ${fromRoom} to ${toRoom}`);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  
}

module.exports = { socketHandler };
