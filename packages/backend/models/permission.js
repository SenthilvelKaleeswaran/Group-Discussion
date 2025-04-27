const mongoose = require("mongoose");

// Permission Levels:
// 0 - No View
// 1 - View
// 2 - Create
// 3 - Edit
// 4 - Delete

// Data view level
// 5 - participant -> participant controls
// 6 - listener -> [listener, prticipant] controls
// 7 - host ->  [host,listener, prticipant ] controls
// 8 - admin -> [admin,host,listener, prticipant] controls

const PermissionControlSchema = new mongoose.Schema({
  permission: {
    admin: {
      type: Number,
      default: 0,
    },
    participant: {
      type: Number,
      default: 0,
    },
    listener: {
      type: Number,
      default: 0,
    },
  },
  timeLine: [
    {
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      history: [
        {
          updatedFor: {
            type: [String],
            enum: ["admin", "listener", "participant"],
            required: true,
          },
          from: {
            type: Number,
            required: true,
          },
          to: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
});

const PermissionSchema = new mongoose.Schema({
  groupDiscussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
  },
  feedbackTable: {
    type: PermissionControlSchema,
    default: () => ({}),
  },
});

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;

