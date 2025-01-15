const mongoose = require("mongoose");

const ParticipantTimingSchema = new mongoose.Schema(
  {
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date },
  },
  { _id: false } // Disable automatic _id generation
);

const DetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  socketId: {
    type: String,
    required() {
      return this.isActive;
    },
  },
  isActive: { type: Boolean, default: true },
  switchedTo: { type: String, default: "" },
  name: { type: String },
  muteStatus: { type: Boolean, default: false },
  timing: [ParticipantTimingSchema],
});

const BlockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
  blockedBy: {
    type: String,
    required: true,
  },
  reason: String,
  blockedAt: {
    type: Date,
    default: Date.now,
  },
});

const ParticipantSchema = new mongoose.Schema(
  {
    // sessionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Session",
    //   required: true,
    // },
    // groupDiscussionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "GroupDiscussion",
    //   required: true,
    // },
    participant: {
      type: Map,
      of: DetailsSchema,
      default: {},
    },
    admin: {
      type: Map,
      of: DetailsSchema,
      default: {},
    },
    listener: {
      type: Map,
      of: DetailsSchema,
      default: {},
    },
    blockedList: [BlockSchema],
    maxParticipants: { type: Number },
    // sessionPassword: { type: String },
    // features: [{ type: String }], // e.g., ["screenSharing", "recording"],
    // sessionTimeout: { type: Number }, // in minutes
  },
  { timestamps: true }
);

// Middleware to update 'updatedAt' field
ParticipantSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Participant = mongoose.model("Participant", ParticipantSchema);

module.exports = Participant;
