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
  ...rest
}) => {
  try {
    io.to(sessionId).emit("NEXT_ROUND_LOADING", {
      loading: "Creating next round",
    });

    const session = await Session.findOne({ _id: sessionId });
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
      ...restData
    } = session.toObject();

    console.log({ discussionDetails, rest });

    const { displayResult, restDiscussionDetails } = discussionDetails;

    const newSession = new Session({
      ...restData,
      ...restDiscussionDetails,
      switchedFrom: sessionId,
      status: "NOT_STARTED",
      createdBy: userId,
    });

    console.log({ newSession });

    await newSession.save();

    const newId = newSession._id;

    session.switchedTo = newId;
    session.status = "DECLARED";
    session.displayResult = displayResult;


    console.log({ session,newSession });

    await session.save();
    await new Participant({ sessionId: newId.toString() }).save();

    const participant = await Participant.findOne({ sessionId });
    if (!participant) {
      throw new Error("Participant not found");
    }

    const { participant: participantList } = participant;

    const grouppedParticipants = {
      SELECTED: [],
      WAITING_LIST: [],
      REJECTED: [],
    };

    // Iterate over the participantList and update statuses
    participantList.forEach((data, userId) => {
      console.log({ userId, data });
      const status = selectedParticipants[userId] || "REJECTED";

      data.participantSatus = status;
      if (status === "SELECTED") data.switchedTo = newId;

      grouppedParticipants[status].push(data?.socketId);
    });

    console.log({ participantList, grouppedParticipants });

    await participant.save();

    if (rest.switchNow) {
      const admins = Array.from(participant.admin.values()).map(
        (p) => p.socketId
      );
      const moderators = Array.from(participant.moderator.values()).map(
        (p) => p.socketId
      );
      const listeners = Array.from(participant.listener.values()).map(
        (p) => p.socketId
      );
      const selectedUsers = grouppedParticipants["SELECTED"];

      const usersToMove = [
        ...admins,
        ...moderators,
        ...listeners,
        ...selectedUsers,
      ];

      console.log({
        admins,
        moderators,
        listeners,
        selectedUsers,
        usersToMove,
      });

      await Promise.all(
        usersToMove.map((socketId) =>
          io.to(socketId).emit("NEXT_ROUND_SWITCH", { newSession: newId })
        )
      );

      await Promise.all(
        usersToMove.map((socketId) =>
          io.sockets.sockets.get(socketId)?.leave(sessionId)
        )
      );
    }
    io.to(sessionId).emit("UPDATED_SESSION", { displayResult,status : "DECLARED" });

    // io.to(sessionId).emit("NEXT_ROUND_SWITCH", {
    //   newSession: newId,
    //   displayResult,
    //   participant,
    // });
  } catch (error) {
    console.error("Error in nextRound:", error.message);
    io.to(sessionId).emit("NEXT_ROUND_ERROR", { error: error.message });
  }
};

module.exports = {
  nextRound,
  updateSession,
};
