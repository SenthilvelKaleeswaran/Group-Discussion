const PerformanceMetricsPrompt = (isConclusion) => {
  const getInstruction = () => {
    if (!isConclusion)
      return `Analyze the POINT provided based on the following metrics according to TOPIC. Return a complete JSON object with all metrics included.`;
    return `Analyze the CONCLUSION point of the discussion based on the following metrics according to the **TOPIC**. Evaluate how well the key points were synthesized and how the conclusion aligns with the topic. Return a complete JSON object with all metrics included.`;
  };
  return `
Instructions: ${getInstruction()}
Output Format:
{
"Self-Correction Rate": <out of hundred>,
"Constructiveness": <out of hundred>,
"Empathy Detection": <out of hundred>,
"Intensity of Emotion": "<Low|Medium|High>",
"Polarity": "<Positive|Neutral|Negative>",
"Turn Dominance": <out of hundred>,
"Topic Relevance": <Aligned|Divergent|Detached>,
}
AI Response:
`;
};

module.exports = {
  PerformanceMetricsPrompt,
};
