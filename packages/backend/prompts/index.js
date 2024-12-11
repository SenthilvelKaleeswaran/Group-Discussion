const { PerformanceMetricsPrompt } = require("./performance-metrics");
const { AIConversationPrompt } = require("./ai-conversation");
const { generateConversationTemplate } = require("./generate-conversation-template");
const { DiscussionTopicPrompt} =  require("./discussion-topic")
const { AIConclusionPrompt} =  require("./discussion-conclusion")
module.exports = {
  AIConclusionPrompt,
  AIConversationPrompt,
  DiscussionTopicPrompt,
  PerformanceMetricsPrompt,
  generateConversationTemplate
};
