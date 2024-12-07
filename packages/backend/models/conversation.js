const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  groupDiscussionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GroupDiscussion', 
    required: true 
  },
  
  messages: [
    { 
      name: { 
        type: String, 
        required: false 
      }, 

      _id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Participant', 
        required: false 
      },

      content: { 
        type: String, 
        required: true 
      },

      timestamp: { 
        type: Date, 
        default: Date.now 
      }
    }
  ], 
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
