const express = require("express");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

// Set up the app
const app = express();
const port = 5000;

// Set up storage for multer (file upload)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(cors());
app.use(express.json()); // Enable JSON parsing

// Hugging Face API details
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_WHISPER_URL =
  "https://api-inference.huggingface.co/models/openai/whisper-large";
const HF_CLASSIFIER_URL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
const HF_GENERATOR_URL =
  "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";
console.log({ HF_API_TOKEN });
// /transcribe route to handle audio transcript, analysis, and AI response
app.post("/transcribe", async (req, res) => {
  //   if (!req.file || !req.body.topic) {
  //     return res.status(400).json({ error: 'Audio file and topic are required.' });
  //   }

  const { topic, user, conversation,transcript } = req.body;
  console.log({topic,user,conversation,transcript},conversation)
  const updatedConversation = [...conversation,{ [user] : transcript}]
  console.log({updatedConversation})

  try {
    // Step 3: Generate AI Response
    const aiResponse = await fetch(HF_GENERATOR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Topic: ${topic}\n
Point: ${transcript}\n
Instructions: This is a structured group discussion involving both the user and AI members. 
The provided point is the most recent contribution from the user. Analyze the point in the context of the topic (${topic}). 
- If the point is relevant to the topic, respond professionally by either agreeing or disagreeing with it. Provide a detailed explanation and generate a new point that aligns with the topic to continue the discussion constructively. 
- If the point is irrelevant to the topic, do not critique or elaborate on it. Instead, generate a new and well-aligned point relevant to the topic (${topic}) that drives the discussion forward. 

Your response should be concise, engaging, and focused solely on the topic (${topic}). Avoid introducing unrelated ideas or personal thoughts. Ensure the response is suitable for real-time delivery to another AI member in the discussion and helps maintain the flow of the conversation.\n
AI Response:`,
      }),
    });

    const aiResponseResult = await aiResponse.json();
    if (!aiResponse.ok) {
      return res.status(500).json({
        error: "Error generating AI response.",
        details: aiResponseResult,
      });
    }

    // Extracting only the generated text
    // Extract and clean the generated response
    const rawText = aiResponseResult[0].generated_text || aiResponseResult.text;

    // Remove the prompt if it is included
    const separator = "AI Response:";
    const responseText = rawText?.includes(separator)
      ? rawText.split(separator)[1].trim()
      : rawText;

    if (!responseText) {
      return res.status(500).json({
        error: "No valid generated text found in AI response.",
        details: aiResponseResult,
      });
    }

    console.log("Cleaned AI Response:", responseText);

    // Return only the cleaned response
    return res.status(200).json({
      generatedText: responseText,
      transcript,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
