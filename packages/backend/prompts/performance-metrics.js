const PerformanceMetricsPrompt = `
Instructions: Analyze the POINT provided based on the following metrics according to TOPIC. Return a complete JSON object with all metrics included.
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

module.exports = {
    PerformanceMetricsPrompt
}