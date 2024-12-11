const mongoose = require("mongoose");

const GroupDiscussionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  aiModelsCount: {
    type: Number,
    default: 0,
  },
  noOfUsers: {
    type: Number,
    default: 1,
  },
  aiParticipants: [
    {
      name: String,
    },
  ],
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },
  ], // References to non-AI participants (users)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
  discussionLength: {
    type: Number,
    default: 5, // Default discussion length in minutes
  },
  conclusionBy: {
    type: String,
    enum: ["You", "User", "AI", "Random"],
    default: "Random",
  },
  conclusionPoints: {
    type: Number,
    default: 1,
  },
  micAccessWaitTime: {
    type: Number,
    default: 2, // Default wait time for mic access in seconds
  },
  isTopicAiGenerated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status : {
    type :String,
    enum : ["NOT_STARTED","IN_PROGRESS","COMPLETED","HOLDED","ARCHIVED"],
    default : "NOT_STARTED"
  }
});

module.exports = mongoose.model("GroupDiscussion", GroupDiscussionSchema);
