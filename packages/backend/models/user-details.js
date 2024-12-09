const mongoose = require('mongoose');

// Define the User schema
const UserDetailsSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: {
    type: String,
    required: true,
    trim: true, // Removes leading/trailing whitespace
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Auto-set creation timestamp
  },
});

// Export the model
module.exports = mongoose.model('UserDetails', UserDetailsSchema);
