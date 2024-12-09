const Conversation = require('../models/conversation');

// Create a new conversation
const createConversation = async (req, res) => {
  const { groupDiscussionId, messages } = req.body;

  try {
    const newConversation = new Conversation({
      groupDiscussionId,
      messages,
    });

    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Update an existing conversation with a new message
const updateConversation = async (req, res) => {
  const { groupDiscussionId, message } = req.body;

  try {
    const conversation = await Conversation.findOneAndUpdate(
      { groupDiscussionId }, 
      { $push: { messages: message } },
      { new: true, upsert: true }
    );

    res.json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};


// Get all messages of a conversation
const getConversation = async (req, res) => {
  const groupDiscussionId = req.params.groupDiscussionId;

  try {
    const conversation = await Conversation.findOne({ groupDiscussionId });

    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
    createConversation,
    getConversation,
    updateConversation
}
