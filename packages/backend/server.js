const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const ENDPOINT = process.env.ENDPOINT  || "http://localhost:"
const app = express();

app.use(cors());
app.use(express.json()); 

// Import routes
const authRoutes = require('./routes/auth');
const groupDiscussionRoutes = require('./routes/group-discussion');
const conversationRoutes = require('./routes/conversation');
const participantRoutes = require('./routes/participant');
const generateRoutes = require('./routes/generate');
const userRoutes = require('./routes/user');

const connectDB = require("./config/db");
const authMiddleware = require("./middleware/auth");


// Define routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use(authMiddleware);
app.use('/api/group-discussion', groupDiscussionRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/user', userRoutes);

// Default route for errors or undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${ENDPOINT}${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

