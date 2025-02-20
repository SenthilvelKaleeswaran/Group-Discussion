const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  sessionId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  aiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "AIModel"
  },
  discussion: {
    type: String,
  },
  status: {
    type: String,
    enum: ["GENERATED", "SPOKEN"],
    default: "GENERATED",
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  pointAnalysis : {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isConclusion: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation
