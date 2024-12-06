const express = require("express");
const http = require("http");
const multer = require("multer");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this based on your frontend URL
    methods: ["GET", "POST"],
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_WHISPER_URL =
  "https://api-inference.huggingface.co/models/openai/whisper-large";
const HF_GENERATOR_URL =
  "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("transcription", async (data) => {
    console.log("Received transcription data:", data);
    const { topic, user, conversation, audioBuffer } = data;

    try {
      // Step 1: Transcribe Audio
      const transcriptionResponse = await fetch(HF_WHISPER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: audioBuffer, // Sending the raw audio buffer as is (ensure this is correctly sent)
      });

      const transcriptionResult = await transcriptionResponse.json();
      if (!transcriptionResponse.ok) {
        socket.emit("error", {
          error: "Error transcribing audio.",
          details: transcriptionResult,
        });
        return;
      }

      const transcription = transcriptionResult.text || "No transcription available";
      console.log({transcription})
      socket.emit("transcription_result", {
        transcription,
        // generatedText,
      });

      // Step 2: Generate AI Response
      const aiResponse = await fetch(HF_GENERATOR_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Topic: ${topic}\n
Point: ${transcription}\n
Instructions: This is a structured group discussion involving both the user and AI members. 
Analyze the point in the context of the topic (${topic}). Generate a well-aligned point relevant to the topic that drives the discussion forward.`,
        }),
      });

      const aiResponseResult = await aiResponse.json();
      if (!aiResponse.ok) {
        socket.emit("error", {
          error: "Error generating AI response.",
          details: aiResponseResult,
        });
        return;
      }

      const generatedText = aiResponseResult[0]?.generated_text || "No response generated";

      // Emit the transcription and AI response to the client
      // socket.emit("transcription_result", {
      //   transcription,
      //   // generatedText,
      // });
    } catch (error) {
      console.error("Error during WebSocket processing:", error);
      socket.emit("error", {
        error: "Internal Server Error",
        details: error,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
