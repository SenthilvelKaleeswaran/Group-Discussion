const AIConversationPrompt = `
Instructions: This is a structured group discussion involving both the participant and AI members. The user’s most recent contribution is being analyzed. If relevant, the AI should agree or disagree or generate a new point aligned to the topic. If irrelevant, the AI should ignore it and generate a new relevant point to move the discussion forward. Ensure the response stays concise, engaging, and topic-relevant for real-time interaction.
AI Response:
`;

module.exports = {
  AIConversationPrompt,
};
