const Session = require("../models/session");
const Participant = require("../models/participant");

const updateSession = async ({ id, io, socket, ...rest }) => {
  try {
    if (!id) {
      socket.to("").emit("SESSION_ERROR", { error: "No session Id found" });
      return;
    }

    const updatedSession = await Session.findByIdAndUpdate(id, rest, {
      new: true,
    });

    if (!updatedSession) {
      socket.to("").emit("SESSION_ERROR", { error: "Session not found." });
    }
  } catch (error) {
    console.error("Error updating session:", error);
    socket.to("").emit("SESSION_ERROR", { error: "Internal server error." });
  }
};

const nextRound = async ({
  io,
  socket,
  selectedParticipants,
  sessionId,
  ...restData
}) => {
  try {
    io.to(sessionId).emit("NEXT_ROUND_LOADING", {
      loading: "Creating next round",
    });

    const session = await Session.findById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const newSession = new Session({
      ...session.toObject(), // Copy all fields from the existing session
      ...restData,
      switchedFrom: sessionId,
      switchedTo: undefined, // Reset switchedTo for the new session
      status: "NOT_STARTED", // Assuming the new session starts as NOT_STARTED
    });

    await newSession.save();

    const newId = newSession._id;

    session.switchedTo = newId;
    session.status = "COMPLETED";

    await session.save();

    const participant = await Participant.findOne({ sessionId });
    if (!participant) {
      throw new Error("Participant not found");
    }

    const { participant: participantList } = participant;

    selectedParticipants.forEach((item) => {
      const data = participantList.get(item?.userId);
      if (data) {
        if (item?.status === "SELECTED") {
          data.switchedTo = newId;
        } 
        data.participantSatus = item?.status;
      }
    });

    await participant.save();

    io.to(sessionId).emit("NEXT_ROUND_SWITCH", { newSession: newId });
  } catch (error) {
    console.error("Error in nextRound:", error.message);
    io.to(sessionId).emit("NEXT_ROUND_ERROR", { error: error.message });
  }
};

module.exports = {
  nextRound,
  updateSession,
};
