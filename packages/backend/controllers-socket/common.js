const User = require("../models/user");
const UserDetails = require("../models/user-details");
const AIModel = require("../models/ai-model");
const Session = require("../models/session");

const getUserNameOrEmail = async (id) => {
  const name = await UserDetails.findById(id);
  const email = await User.findById(id);
  return { name : name?.name, email : email?.email };
};

const getAIName = async (id) => {
  return await AIModel.findById(id)?.name;
};


const updateSessionQueueStatus = async ({ sessionId, queueItemId, status='COMPLETED' }) => {
  try {
    const updatedSession = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        "queue._id": queueItemId, 
      },
      {
        $set: {
          "queue.$.status": status, 
        },
        $inc: {
          globalOrder: 1, 
        },
      },
      { new: true } // Return the updated document
    );

    return updatedSession;
  } catch (error) {
    console.error("Error updating session queue status:", error);
    throw error;
  }
};

module.exports = {
};


module.exports = {
  getAIName,
  getUserNameOrEmail,
  updateSessionQueueStatus,

};
