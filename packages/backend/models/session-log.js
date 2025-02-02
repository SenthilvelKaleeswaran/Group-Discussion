const mongoose = require("mongoose");

const SessionLogSchema = new mongoose.Schema(
  {
    groupDiscussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupDiscussion",
      required: true,
    },
    
    events: [
      {
        action: {
          type: String,
          //   enum: ["mute", "kick", "warn"],
          required: true,
        },
        performedBy: {
          type: String,
        },
        targetUserId: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

SessionLogSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SessionLog = mongoose.model("SessionLog", SessionLogSchema);

module.exports = SessionLog;
