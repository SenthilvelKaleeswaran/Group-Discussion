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
  discussionDetails,
  userId,
  sessionId,
}) => {
  try {
    io.to(sessionId).emit("NEXT_ROUND_LOADING", {
      loading: "Creating next round",
    });

    const session = await Session.findById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const {
      _id,
      topic,
      createdBy,
      createdAt,
      sessionPassword,
      status,
      sessionStartTime,
      sessionEndTime,
      updatedAt,
      globalOrder,
      queue,
      ...rest
    } = session;

    console.log({discussionDetails,rest})

    const {showResult, restDiscussionDetails} = discussionDetails

    const newSession = new Session({
      ...rest,
      ...restDiscussionDetails,
      switchedFrom: sessionId,
      status: "NOT_STARTED",
      createdBy : userId
    });

    console.log({newSession})

    await newSession.save();

    const newId = newSession._id;

    session.switchedTo = newId;
    session.status = "COMPLETED";
    session.showResult = showResult

    console.log({session})


    await session.save();


    const participant = await Participant.findOne({ sessionId });
    if (!participant) {
      throw new Error("Participant not found");
    }

    const { participant: participantList } = participant;

    // Iterate over the participantList and update statuses
    participantList.forEach((data, userId) => {
      console.log({ userId, data });
      if (selectedParticipants[userId]) {
        data.participantSatus = selectedParticipants[userId];
        if (selectedParticipants[userId] === "SELECTED") {
          data.switchedTo = newId;
        }
      } else {
        data.participantSatus = "REJECTED";
      }
    });

    console.log({participantList})


    // Save the updated participant list

    // await participant.save();

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
