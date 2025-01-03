const mongoose = require("mongoose");

const DiscussionLog = new mongoose.Schema({
  groupDiscussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
    required: true,
  },
  logs: [
    {
      message: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("DiscussionLog", DiscussionLog);
