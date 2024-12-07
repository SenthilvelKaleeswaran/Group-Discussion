const mongoose = require('mongoose');

// Define the User schema
const UserDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes leading/trailing whitespace
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Auto-set creation timestamp
  },
});

// Export the model
module.exports = mongoose.model('UserDetails', UserDetailsSchema);
