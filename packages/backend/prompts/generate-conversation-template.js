const generateConversationTemplate = (topic, receivedConversation) => {
  return `
    Topic: ${topic}
    Point: ${receivedConversation}
  `;
};

module.exports = {
  generateConversationTemplate,
};
