const GroupDiscussion = require("../models/group-discussion");
const Conversation = require("../models/conversation");
const { extractPropertiesFromJson } = require("../utils/extract-metrics");
const { AIConversationPrompt, PerformanceMetricsPrompt, generateConversationTemplate } = require("../prompts");

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_GENERATOR_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

const generateConversation = async (req, res) => {
  const { id, participant, conversation: receivedConversation } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Id not found" });
  }

  try {
    // Step 1: Retrieve Group Discussion
    const groupDiscussion = await GroupDiscussion.findById(id).populate("conversationId");
    if (!groupDiscussion) {
      return res.status(404).json({ error: "Group discussion not found" });
    }

    const { topic, conversationId: { messages = [] } = {}, aiParticipants } = groupDiscussion;

    const promptTemplate =generateConversationTemplate(topic,receivedConversation);

  
    // Step 2: Make Hugging Face API calls in parallel
    const [aiResponseResult, performanceMetricsResult] = await Promise.all([
      fetch(HF_GENERATOR_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: promptTemplate + AIConversationPrompt,
        }),
      }).then(response => response.json()),

      // Make performance metrics API call only if participant is not AI
      participant?.type !== "AI"
        ? fetch(HF_GENERATOR_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: promptTemplate + PerformanceMetricsPrompt,
            }),
          }).then(response => response.json())
        : Promise.resolve(null), // Return null if it's an AI participant
    ]);

    // Extract AI response and performance metrics


    const rawText = aiResponseResult?.[0]?.generated_text || aiResponseResult?.text;
    const rawMetricsText = performanceMetricsResult?.[0]?.generated_text || performanceMetricsResult?.text;

    const responseText = (rawText?.split("AI Response:")[1] || rawText)?.trim();
    const responseMetricsText = (rawMetricsText?.split("AI Response:")[1] || rawMetricsText)?.trim();
    console.log({responseMetricsText})

    if (!responseText) {
      return res.status(500).json({
        error: "No valid response text generated.",
        details: aiResponseResult,
      });
    }

    // Extract performance metrics if available
    const metadata = responseMetricsText ? extractPropertiesFromJson(responseMetricsText) : {};
console.log({metadata})
    // Step 3: Update Messages
    const randomIndex = Math.floor(Math.random() * aiParticipants.length);
    const randomMember = aiParticipants[randomIndex];

    let newMessages = [];

    if (participant?.type !== "AI") {
      newMessages.push({
        _id: participant?._id,
        name: participant?.name,
        conversation: receivedConversation,
        metadata,
      });
    }

    newMessages.push({
      name: randomMember?.name,
      conversation: responseText,
      status: "GENERATED",
    });

    // Update last message's status to "SPOKEN"
    const conversation = await Conversation.findOne({ groupDiscussionId: id });

    if (conversation && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage?.status) {
        await Conversation.findOneAndUpdate(
          { groupDiscussionId: id },
          {
            $set: {
              [`messages.${conversation.messages.length - 1}.status`]: "SPOKEN", // Set status of last message
            },
          }
        );
      }
    }

    // Push new messages into the conversation
    const updatedConversation = await Conversation.findOneAndUpdate(
      { groupDiscussionId: id },
      {
        $push: {
          messages: {
            $each: newMessages, // Push multiple new messages
          },
        },
      },
      { new: true, upsert: true }
    );

    console.log({updatedConversation : updatedConversation?.messages})

    return res.status(200).json({
      generatedText: responseText,
      randomMember: randomMember?._id,
      conversation: updatedConversation?.messages,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message || error,
    });
  }
};

module.exports = {
  generateConversation,
};
