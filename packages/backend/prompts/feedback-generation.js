const Condition = `
Condition:
1. Only provide the OUTPUT FORMAT in given format. No additional single words / sugesstion are allowed.
2. Sugesstion for each metric should be one line.
`;

const getInstructions = () => {
  return `
Analyze the participant’s contribution based on their speech content during the specified POINT discussion in the Full Discussion. Evaluate their points using the following metrics. Provide a structured JSON object containing all the metrics. Ensure thorough evaluation for each metric.

${Condition}
`;
};

const getDiscussionInstruction = ({
  topic = "", // Default empty string if topic is not passed
  aiParticipants = "", // Default empty string if aiParticipants is not passed
  discussionLength = "", // Default empty string if discussionLength is not passed
  conclusionPoints = "", // Default empty string if conclusionPoints is not passed
  conclusionBy = "", // Default empty string if conclusionBy is not passed
  noOfUsers = "", // Default empty string if noOfUsers is not passed
  user = "", // Default empty string if user is not passed
} = {}) => {
  let instruction = `
      Topic: ${topic},
      User: ${user},
    `;

  if (aiParticipants) {
    instruction += `\n   Number of AI Participants: ${aiParticipants},`;
  }
  if (noOfUsers) {
    instruction += `\n   Number of Non-AI Participants: ${noOfUsers},`;
  }
  if (discussionLength) {
    instruction += `\n   Discussion Length: ${discussionLength},`;
  }
  if (conclusionPoints) {
    instruction += `\n   Conclusion Points Length: ${conclusionPoints},`;
  }
  if (conclusionBy) {
    instruction += `\n   Conclusion By: ${conclusionBy},`;
  }

  instruction += `
      Instruction: 
      1 - Above is the group discussion details.
      2 - Last ${
        conclusionPoints ? conclusionPoints : "N/A"
      } points are conclusion points.
      3 - Focus on the ${user} points from the above discussion.
    `;

  return instruction;
};

const getJsonValue = (key, value) => {
  return `
   "${key}": {"value": "${value}", "suggestion": "Suggestion based on discussion in a single line  "}`;
};

const pointAnalysis = () => {
  return `
   ${getInstructions()}

   Output Format:
   {
     "Content Analysis": {
       ${getJsonValue("Relevance to the Topic", "<Out of Hundered>")},
       ${getJsonValue("Depth of Analysis", "<Out of Hundered>")},
       ${getJsonValue("Evidence and Examples", "<Out of Hundered>")},
       ${getJsonValue("Originality", "<Out of Hundered>")}
     },
      "Analytical Thinking": {
      ${getJsonValue("Critical Thinking", "<Out of Hundered>")}
      ${getJsonValue("Problem-Solving", "<Out of Hundered>")}
      ${getJsonValue("Connections", "<Out of Hundered>")}
      ${getJsonValue("Analytical Depth", "<Out of Hundred>")}
      ${getJsonValue("Logical Reasoning", "<Out of Hundred>")}
      ${getJsonValue("Perspective Diversity", "<Out of Hundred>")}
    },
    "Communication Analysis" : {
      ${getJsonValue("Clarity of Expression", "<Out of Hundered>")}
      ${getJsonValue("Brevity", "<Out of Hundered>")}
      ${getJsonValue("Fluency", "<Out of Hundered>")}
      ${getJsonValue("Articulation", "<Out of Hundered>")}
      ${getJsonValue("Persuasiveness", "<Out of Hundred>")}
      ${getJsonValue("Argumentation Strength", "<Out of Hundred>")}
      ${getJsonValue("Language Adaptability", "<Out of Hundred>")}
    },
    "Engagement and Interaction": {
      ${getJsonValue("Response to Others", "<Out of Hundered>")}
      ${getJsonValue("Active Listening", "<Out of Hundered>")}
      ${getJsonValue("Counterarguments", "<Out of Hundered>")}
      ${getJsonValue("Encouragement", "<Out of Hundered>")}
    },
   }
   `;
};

const overAllAnalysis = () => {
  return `

  ${Condition}

   Output Format:
   {
    "Emotional Intelligence": {
   ${getJsonValue("Empathy", "<Out of Hundered>")}
   ${getJsonValue("Conflict Resolution", "<Out of Hundered>")}
   ${getJsonValue("Patience", "<Out of Hundered>")}
   ${getJsonValue("Active Listening", "<Out of Hundred>")}
   ${getJsonValue("Emotional Regulation", "<Out of Hundred>")}
   ${getJsonValue("Interpersonal Sensitivity ", "<Out of Hundred>")}
 },

     "Content Quality": {
      ${getJsonValue("Relevance to Topic", "<Out of Hundered>")}
      ${getJsonValue("Depth of Arguments", "<Out of Hundered>")}
      ${getJsonValue("Originality", "<Out of Hundered>")}
      ${getJsonValue("Factual Accuracy", "<Out of Hundered>")}
    },
 
  "Holistic Metrics": {
   ${getJsonValue("Overall Impact", "<Out of Hundered>")}
   ${getJsonValue("Influence", "<Out of Hundered>")}
   ${getJsonValue("Balance", "<Out of Hundered>")}
   ${getJsonValue("Topic Mastery", "<Out of Hundred>")}
   ${getJsonValue("Adaptability", "<Out of Hundred>")}
   ${getJsonValue("Leadership Potential", "<Out of Hundred>")}
 },
 "Collaboration and Teamwork": {
   ${getJsonValue("Collaborative Spirit", "<Out of Hundred>")}
   ${getJsonValue("Group Synergy", "<Out of Hundred>")}
   ${getJsonValue("Constructive Feedback", "<Out of Hundred>")}
   ${getJsonValue("Consensus Building", "<Out of Hundred>")}
   ${getJsonValue("Inclusive Communication", "<Out of Hundred>")}
 },
   }
   `;
};

// "Timing and Pacing": {
//    ${getJsonValue("Turn Timing", "<Out of Hundered>")}
//    ${getJsonValue("Pacing", "<Out of Hundered>")}
//    ${getJsonValue("Contribution Quality", "<Out of Hundred>")}
//    ${getJsonValue("Contribution Frequency", "<Out of Hundred>")}
//    ${getJsonValue("Discussion Pacing", "<Out of Hundred>")}
//    ${getJsonValue("Interruption Management", "<Out of Hundred>")}
//  },

// "Collaboration and Teamwork": {
//   ${getJsonValue("Collaborative Spirit", "<Out of Hundred>")}
//   ${getJsonValue("Group Synergy", "<Out of Hundred>")}
//   ${getJsonValue("Constructive Feedback", "<Out of Hundred>")}
//   ${getJsonValue("Consensus Building", "<Out of Hundred>")}
//   ${getJsonValue("Inclusive Communication", "<Out of Hundred>")}
// },

module.exports = {
  PointAnalysisPrompt: pointAnalysis(),
  OverAllAnalysisPrompt: overAllAnalysis(),
  discussionInstructionPrompt: getDiscussionInstruction,
};
