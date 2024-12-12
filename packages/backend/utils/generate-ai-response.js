const { jsonParser } = require("./json-parser");

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_GENERATOR_URL =
  "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

const generateAIResponse = async ({
  prompt,
  separator = "AI Response:",
  isParse = false,
}) => {
  try {
    // Make the API request
    const response = await fetch(HF_GENERATOR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error from Hugging Face API: ${
          errorData.error || response.statusText
        } (Status: ${response.status})`
      );
    }

    const data = await response.json();
    const rawText = data?.[0]?.generated_text || data?.text;

    if (!rawText) {
      throw new Error("Unexpected response format: No text generated.");
    }

    // Extract the AI response
    const responseText = (rawText.split(separator)[1] || rawText)?.trim();
    if (isParse) return jsonParser(responseText);

    return responseText;
  } catch (error) {
    console.error("Error in generateAIResponse:", error.message);
    throw new Error(
      "Failed to generate AI response. Please try again later or contact support if the issue persists."
    );
  }
};

module.exports = {
  generateAIResponse,
};
