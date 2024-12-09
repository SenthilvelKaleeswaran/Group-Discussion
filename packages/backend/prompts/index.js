const { PerformanceMetricsPrompt } = require("./performance-metrics");
const { AIConversationPrompt } = require("./ai-conversation");
const { generateConversationTemplate } = require("./generate-conversation-template");

module.exports = {
  AIConversationPrompt,
  PerformanceMetricsPrompt,
  generateConversationTemplate
};
