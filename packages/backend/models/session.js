const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  // Topic Settings
  groupDiscussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
    required: true,
  },
  // moderators: {
  //   type: Map,
  //   of: new mongoose.Schema({
  //     userId: { type: String, required: true, unique: true },
  //     role: { type: String, required: true },
  //     startAt: { type: Date, required: true },
  //     endAt: { type: Date, required: true },
  //   }),
  //   default: {},
  // },

  defaultSettings: {
    type: Boolean,
    default: false,
  },

  topic: {
    type: String,
  },

  topicSetting: {
    type: String,
    enum: ["manual", "ai", "dynamic"],
    default: "admin",
  },

  // Participants
  aiParticipants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIModel",
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
    enum: ["limit", "noLimit", "onDiscussion"],
    default: "fixed",
  },

  // Points Settings
  pointsSetting: {
    type: String,
    enum: ["limit", "noLimit", "range"],
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
    enum: ["limit", "noLimit", "range"],
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
  // rounds: {
  //   type: String,
  //   enum: ["single", "multiple"],
  //   default: "single",
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sessionPassword: { type: String },
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

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;

