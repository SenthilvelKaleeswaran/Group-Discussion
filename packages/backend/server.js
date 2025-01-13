const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const PORT = process.env.PORT || 5000;
const ENDPOINT = process.env.ENDPOINT || "http://localhost:";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const groupDiscussionRoutes = require("./routes/group-discussion");
const conversationRoutes = require("./routes/conversation");
const participantRoutes = require("./routes/participant");
const generateRoutes = require("./routes/generate");
const userRoutes = require("./routes/user");
const aiModelRoutes = require("./routes/ai-model");

const connectDB = require("./config/db");
const { authMiddleware, authSocketMiddleware } = require("./middleware/auth");
const { socketHandler } = require("./socket-handler");

// Define RESTful API routes
app.use("/api/auth", authRoutes);

// Protected Routes for REST
app.use(authMiddleware);
app.use("/api/group-discussion", groupDiscussionRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai-model", aiModelRoutes);

// Default route for errors or undefined routes
app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Update as per your client origin
    methods: ["GET", "POST"],
  },
});

io.use(authSocketMiddleware);

io.on("connection", (socket) => {
  socketHandler(socket);
});

// Start the server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on ${ENDPOINT}${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
