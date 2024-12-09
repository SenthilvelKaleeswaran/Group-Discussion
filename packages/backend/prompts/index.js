const { PerformanceMetricsPrompt } = require("./performance-metrics");
const { AIConversationPrompt } = require("./ai-conversation");
const { generateConversationTemplate } = require("./generate-conversation-template");
const { DiscussionTopicPrompt} =  require("./discussion-topic")
module.exports = {
  AIConversationPrompt,
  DiscussionTopicPrompt,
  PerformanceMetricsPrompt,
  generateConversationTemplate
};
