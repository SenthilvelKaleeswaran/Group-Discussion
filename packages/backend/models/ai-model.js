const mongoose = require("mongoose");

const AIModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
  },
  gender: {
    type: String,
    enum : ['male','female'],
    default : 'male'
  },
  description: {
    type: String,
  },
  prompt: {
    type: String,
    required: true,
  },
  aiType: {
    type:  mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AIModel", AIModelSchema);
