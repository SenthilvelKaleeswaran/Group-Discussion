const mongoose = require("mongoose");

const AIModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  prompt: {
    type: String,
    required: true, 
  },
  type: {
    type: String,
    enum: [
      "polite", 
      "neutral", 
      "arrogant", 
      "calm", 
      "acceptsPoints", 
      "doesNotAcceptPoints", 
      "encouraging", 
      "assertive"
    ],
    required: true,
    default: "neutral",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AIModel", AIModelSchema);
