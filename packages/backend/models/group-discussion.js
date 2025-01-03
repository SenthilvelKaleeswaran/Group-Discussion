const mongoose = require("mongoose");

const GroupDiscussionSchema = new mongoose.Schema({
  // Topic Settings
  topic: {
    type: String,
  },
  topicSetting: {
    type: String,
    enum: ["AI", "admin", "dynamic"],
    default: "admin",
  },

  // Participants
  aiParticipants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIModels",
    },
  ],
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  otherParticipants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "listener"],
        default: "listener",
      },
    },
  ],

  // Discussion Settings
  discussionMode: {
    type: String,
    enum: ["random", "selection", "both"],
    default: "selection",
  },
  discussionLength: {
    type: Number,
    required() {
      return this.discussionLengthSetting === "fixed";
    },
  },
  discussionLengthSetting: {
    type: String,
    enum: ["fixed", "dynamic", "onDiscussion"],
    default: "fixed",
  },

  // Points Settings
  pointsSetting: {
    type: String,
    enum: ["noLimit", "limit", "range"],
    default: "noLimit",
  },
  minPoints: {
    type: Number,
    min: 0,
    required() {
      return this.pointsSetting === "range";
    },
  },
  maxPoints: {
    type: Number,
    required() {
      return this.pointsSetting === "range";
    },
  },
  pointsPerParticipant: {
    type: Number,
    required() {
      return this.pointsSetting === "limit";
    },
  },

  // Conclusion Settings
  conclusionBy: {
    type: String,
    enum: ["ai", "participants", "both", "you"],
    default: "both",
  },
  conclusionMode: {
    type: String,
    enum: ["random", "selection", "both"],
    default: "selection",
  },
  conclusionLength: {
    type: Number,
    required() {
      return this.conclusionLengthSetting === "fixed";
    },
  },
  conclusionLengthSetting: {
    type: String,
    enum: ["fixed", "dynamic", "onDiscussion"],
    default: "fixed",
  },

  // AI Settings
  aiSpeechMode: {
    type: String,
    enum: ["automatic", "selection", "periodic"],
    default: "selection",
  },
  aiSpeaksAtFrequency: {
    type: Number,
    required() {
      return this.aiSpeechMode === "periodic";
    },
  },

  // Participants settings
  accessConversation: {
    type: Boolean,
    default: false,
  },
  accessOthersConversation: {
    type: Boolean,
    default: false,
  },
  accessFeedback: {
    type: Boolean,
    default: false,
  },
  accessOthersFeedback: {
    type: Boolean,
    default: false,
  },


  // Other Participants settings
  accessParticipantConversation: {
    type: Boolean,
    default: false,
  },
  accessParticipantFeedback: {
    type: Boolean,
    default: false,
  },

  // Mic Settings
  micAccessWaitTime: {
    type: Number,
    default: 2,
  },

  // Meta Details
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rounds: {
    type: String,
    enum: ["single", "multiple"],
    default: "single",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["notStarted", "inProgress", "completed", "holded", "paused"],
    default: "notStarted",
  },
  sessionStartTime: {
    type: Date,
  },
  sessionEndTime: {
    type: Date,
  },
});

module.exports = mongoose.model("GroupDiscussion", GroupDiscussionSchema);
