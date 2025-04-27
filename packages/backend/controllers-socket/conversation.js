const Conversation = require("../models/conversation");
const Session = require("../models/session");

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

    io.to(sessionId).emit("NOTIFICATION", {
      message: "Saving Conversation",
      type : "loading"
    });


    if (!participant) {
      return io.to(sessionId).emit("NEXT_PARTICIPANT_ERROR", {
        error: "Participant not found",
      });
    }

    const newConversation = await Conversation.create({
      sessionId,
      [participantType === "AI" ? "aiId" : "userId"]: previousId,
      ...rest,
    });

    // After creation, populate the fields in a separate query
    const populatedConversation = await Conversation.findById(
      newConversation._id
    )
      .populate({
        path: "userId",
        select: "_id name email",
      })
      .populate({
        path: "aiId",
        select: "_id name email",
      });


    if (participant.participant.has(previousId)) {
      participant.participant.get(previousId).muteStatus = true;
      await participant.save();

      io.to(sessionId).emit("mute-status-changed", {
        targetUserId: previousId,
        isMuted: true,
      });
    }

    io.to(sessionId).emit("NOTIFICATION", {
      message: "Saved Conversation",
      type : "mesage"
    });


    io.to(sessionId).emit("CONVERSATION_ADD", {
      newConversation: populatedConversation,
    });

    return populatedConversation;
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
