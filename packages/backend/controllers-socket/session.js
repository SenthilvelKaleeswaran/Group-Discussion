
const Session = require("../models/session");

const updateSession = async ({id,io,socket,...rest}) => {
  try {
    if (!id) {
      socket.to('').emit('SESSION_ERROR',{error : 'No session Id found'})
      return ;
    }

    const updatedSession = await Session.findByIdAndUpdate(id, rest, {
      new: true,
    });

    if (!updatedSession) {
      socket.to('').emit('SESSION_ERROR',{error : "Session not found."})
    }
  } catch (error) {
    console.error("Error updating session:", error);
    socket.to('').emit('SESSION_ERROR',{error : "Internal server error." })
  }
};

module.exports = {
  updateSession,
};
