const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserDetails', 
    required: false 
  }, // Null for AI participants
  groupDiscussionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GroupDiscussion', 
    required: true 
  }, 
});

module.exports = mongoose.model('Participant', ParticipantSchema);
