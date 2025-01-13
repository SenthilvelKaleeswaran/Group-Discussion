const mongoose = require("mongoose");

const ParticipantTimingSchema = new mongoose.Schema({
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date, required: true },
});

const DetailsSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  name: { type: String, required: true },
  muteStatus: { type: Boolean, default: false },
  timing: [ParticipantTimingSchema],
});

const BlockSchema = new mongoose.Schema({
  userId: { type: String, required: true },
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
    groupDiscussionId: { type: String, required: true, unique: true },
    participants: {
      type: Map,
      of: DetailsSchema,
      default: {},
    },
    admin: {
      type: Map,
      of: DetailsSchema,
      default: {},
    },
    moderators: {
      type: Map,
      of: DetailsSchema,
      default: {},
    },
    blockedList: [BlockSchema],
    maxParticipants: { type: Number },
    sessionPassword: { type: String },
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
