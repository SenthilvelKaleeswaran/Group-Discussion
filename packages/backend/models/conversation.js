const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  groupDiscussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
    required: true,
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  participantType: {
    type: String,
    enum: ["ai", "participant"],
    required: true,
  },
  discussion: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["generated", "spoken"],
    default: "generated",
  },
  feedback: {
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

ConversationSchema.methods.getParticipantDetails = async function () {
  if (this.participantType === "particiapnt") {
    return mongoose.model("User").findById(this.participantId);
  } else if (this.participantType === "AI") {
    return mongoose.model("AIModels").findById(this.participantId);
  }
};

module.exports = mongoose.model("Conversation", ConversationSchema);
