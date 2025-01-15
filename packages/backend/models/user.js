const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    lowercase: true, // Converts email to lowercase
    match: [/.+@.+\..+/, "Please enter a valid email"], // Validates email format
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum password length
  },
  createdAt: {
    type: Date,
    default: Date.now, // Auto-set creation timestamp
  },
});

// Export the model
const User = mongoose.model("User", UserSchema);

module.exports = User;
