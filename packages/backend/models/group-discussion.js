const mongoose = require('mongoose');

const GroupDiscussionSchema = new mongoose.Schema({
  topic: { 
    type: String, 
    required: true 
  }, 
  noOfAiModels: { 
    type: Number, 
    default: 0
  }, 
  noOfUsers: { 
    type: Number, 
    default: 1
  }, 
  aiParticipants: [
    { 
      name: String 
    }
  ], 
  participants: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Participant' 
    }
  ], // References to non-AI participants (users)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  } 
});

module.exports = mongoose.model('GroupDiscussion', GroupDiscussionSchema);
