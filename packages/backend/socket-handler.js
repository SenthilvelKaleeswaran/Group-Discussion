const { generateConversation } = require("./controllers/generate");
const {
  addParticipant,
  leftParticipant,
} = require("./controllers-socket/participant");
const Participant = require("./models/participant");

async function socketHandler(io, socket) {
  console.log("Client connected:", socket.id);

  socket.on("JOIN_SESSION", async (data) => {
    await addParticipant({ io, socket, ...data });
  });

  socket.on("LEAVE_SESSION", async (data) =>
    await leftParticipant({ io, socket, ...data })
  );

  socket.on('offer', ({ sessionId, receiverId, sdp, groupDiscussionId }) => {
    console.log(`Received offer from ${socket.id} for ${receiverId}:`, sdp);
    socket.emit('offer', { senderId: socket.id, sdp });
  });

  socket.on('answer', ({ sessionId, receiverId, sdp, groupDiscussionId }) => {
    console.log(`Received answer from ${socket.id} for ${receiverId}:`, sdp);
    socket.emit('answer', { senderId: socket.id, sdp });
  });

  socket.on('candidate', ({ sessionId, receiverId, candidate, groupDiscussionId }) => {
    console.log(`Received candidate from ${socket.id} for ${receiverId}:`, candidate);
    socket .emit('candidate', { senderId: socket.id, candidate });
  });

  // socket.on("offer", ({ groupDiscussionId,sessionId, userId, sdp }) => {
  //   console.log({sdp,offer : ''})
  //   io.to(`${groupDiscussionId}-${sessionId}`).emit("offer", { senderId: socket.id, sdp });
  // });

  // socket.on("answer", ({ groupDiscussionId,sessionId, userId, sdp }) => {
  //   console.log({sdp, answer : ''})
  //   io.to(`${groupDiscussionId}-${sessionId}`).emit("answer", { senderId: socket.id, sdp });
  // });

  // socket.on("candidate", ({ groupDiscussionId,sessionId, userId, candidate }) => {
  //   console.log({sdp,candidate})
  //   io.to(`${groupDiscussionId}-${sessionId}`).emit("candidate", { senderId: socket.id, candidate });
  // });

  socket.on("disconnect", async () => {
    // try {
    //   const session = await Participant.findOne({
    //     "participants.socketId": socket.id,
    //   });
    //   if (session) {
    //     for (const [userId, participant] of session.participants) {
    //       if (participant.socketId === socket.id) {
    //         participant.isActive = false;
    //         participant.timing[participant.timing.length - 1].leftAt =
    //           new Date();
    //         session.participants.set(userId, participant);
    //         break;
    //       }
    //     }
    //     await session.save();
    //     const activeParticipants = Array.from(
    //       session.participants.values()
    //     ).filter((participant) => participant.isActive);
    //     if (activeParticipants.length === 0) {
    //       await Participant.findByIdAndDelete(session._id);
    //     }
    //   }
    // } catch (err) {
    //   console.error("Error on disconnect:", err);
    // }
  });
}

// async function socketHandler(socket, connectedUsers) {
//   console.log("Client connected:", socket.id);

//   socket.on("JOIN_SESSION", async ({ sessionId, userId }) => {
//     try {
//       let session = await Session.findOne({ sessionId });
//       if (!session) {
//         session = new Session({ sessionId, participants: [] });
//         await session.save();
//       }

//       const participant = new Participant({
//         socketId: socket.id,
//         sessionId,
//         userId,
//       });
//       await participant.save();

//       session.participants.push(participant._id);
//       await session.save();

//       socket.join(sessionId);
//       socket.to(sessionId).emit("USER_JOINED", { socketId: socket.id });
//     } catch (err) {
//       console.error("Error joining session:", err);
//     }
//   });

//   socket.on("LEAVE_SESSION", async ({ sessionId }) => {
//     try {
//       const participant = await Participant.findOneAndDelete({
//         socketId: socket.id,
//       });

//       if (participant) {
//         const session = await Session.findOne({ sessionId });
//         if (session) {
//           session.participants = session.participants.filter(
//             (id) => id.toString() !== participant._id.toString()
//           );
//           await session.save();

//           socket.to(sessionId).emit("USER_LEFT", { socketId: socket.id });

//           if (session.participants.length === 0) {
//             await Session.findOneAndDelete({ sessionId });
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Error leaving session:", err);
//     }
//   });

//   socket.on("OFFER", ({ sessionId, receiverId, sdp }) => {
//     io.to(receiverId).emit("OFFER", { senderId: socket.id, sdp });
//   });

//   socket.on("ANSWER", ({ sessionId, receiverId, sdp }) => {
//     io.to(receiverId).emit("ANSWER", { senderId: socket.id, sdp });
//   });

//   socket.on("CANDIDATE", ({ sessionId, receiverId, candidate }) => {
//     io.to(receiverId).emit("CANDIDATE", { senderId: socket.id, candidate });
//   });

//   socket.on("disconnect", async () => {
//     try {
//       const participant = await Participant.findOneAndDelete({
//         socketId: socket.id,
//       });

//       if (participant) {
//         const session = await Session.findOne({
//           sessionId: participant.sessionId,
//         });
//         if (session) {
//           session.participants = session.participants.filter(
//             (id) => id.toString() !== participant._id.toString()
//           );
//           await session.save();

//           socket.to(participant.sessionId).emit("USER_LEFT", {
//             socketId: socket.id,
//           });

//           if (session.participants.length === 0) {
//             await Session.findOneAndDelete({
//               sessionId: participant.sessionId,
//             });
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Error on disconnect:", err);
//     }
//   });

//   socket.on("GENERATE_FEEDBACK", (data) => {
//     console.log("GENERATE_FEEDBACK", data);
//   });
// }

module.exports = { socketHandler };
