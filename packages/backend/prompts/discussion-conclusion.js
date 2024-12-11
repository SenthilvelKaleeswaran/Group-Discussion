const AIConclusionPrompt = ({
    topic,
    discussionLength,
    conversation,
    conclusionPoints,
    conclusionBy,
  }) => {
  
    const getConcludedBy = () => {
      switch (conclusionBy) {
        case "Random":
          return "User / AI";
        case "You":
          return "User";
        default:
          return conclusionBy;
      }
    };
  
    const formattedConclusionPoints = conclusionPoints?.length
      ? `Conclusion Points: ${JSON.stringify(conclusionPoints)}`
      : '';
  
    return `
      Topic: ${topic}
      Total Conclusion Points: ${discussionLength}
      Current Conclusion Point Number: ${conclusionPoints?.length || 0}
      Conversation: ${JSON.stringify(conversation)}
      ${formattedConclusionPoints}
      Can be Concluded by: ${getConcludedBy()}
    
      Instructions:
      This is a structured group discussion involving both the participant and AI members. The discussion has been ongoing, and now the AI is tasked with summarizing the key points of the discussion and drawing a conclusion based on the topic.
    
      - Consider the total number of points (${discussionLength}) when generating the conclusion, including the ${conclusionPoints?.length || 0} points discussed so far.
      - Ensure the conclusion aligns with the **Topic** (${topic}) and reflects the important points discussed during the conversation.
      - The conclusion should incorporate key points from both the participant and AI members.
      - Make the conclusion well-rounded, concise, and relevant, synthesizing the points discussed.
      - Reiterate important points for clarity and reinforcement if necessary.
    
      AI Conclusion:
    `;
  };
  
  module.exports = {
    AIConclusionPrompt,
  };
  