const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  groupDiscussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
    required: true,
  },

  messages: [
    {
      name: {
        type: String,
        required: false,
      },

      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserDetails",
        required: false,
      },

      conversation: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: ["GENERATED", "SPOKEN"],
      },

      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      isConclusion: {
        type: Boolean,
        default: false,
      },
    },
  ],

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Conversation", ConversationSchema);
