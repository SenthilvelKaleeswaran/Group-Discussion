const Conversation = require("../models/conversation");

const updateCurrentConversation = async ({
  io,
  socket,
  sessionId,
  participant,
  previousId,
  participantType,
  ...rest
}) => {
  try {
    io.to(sessionId).emit("NEXT_PARTICIPANT_LOADING", {
      loading: "Converstion is Saving",
    });

    if (!participant) {
      return io.to(sessionId).emit("NEXT_PARTICIPANT_ERROR", {
        error: "Participant not found",
      });
    }

    const  a  = await Conversation.create({
      sessionId,
      [participantType === "AI" ? "aiId" : "userId"]: previousId,
      ...rest,
    });
    console.log({a})

    if (participant.participant.has(previousId)) {
      participant.participant.get(previousId).muteStatus = true;
      await participant.save();

      io.to(sessionId).emit("mute-status-changed", {
        targetUserId: previousId,
        isMuted: true,
      });
    }

  } catch (err) {
    console.error("Error updating conversation:", err);
    socket.emit("MUTE_ERROR", {
      message: "Error selecting the next participant. Please try again.",
    });
  }
};

module.exports = {
  updateCurrentConversation,
};
