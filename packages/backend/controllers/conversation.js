const Conversation = require('../models/conversation');

const getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: "Conversation ID is required." });
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found." });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ msg: "Internal server error." });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { title, participants, messages } = req.body;

    if (!title || !participants) {
      return res.status(400).json({ msg: "Title and participants are required." });
    }

    const newConversation = new Conversation({ title, participants, messages });
    await newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ msg: "Internal server error." });
  }
};

// Update an existing conversation
const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ msg: "Conversation ID is required." });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
    });

    if (!updatedConversation) {
      return res.status(404).json({ msg: "Conversation not found." });
    }

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ msg: "Internal server error." });
  }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: "Conversation ID is required." });
    }

    const deletedConversation = await Conversation.findByIdAndDelete(id);

    if (!deletedConversation) {
      return res.status(404).json({ msg: "Conversation not found." });
    }

    res.status(200).json({ msg: "Conversation deleted successfully." });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ msg: "Internal server error." });
  }
};

module.exports = {
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
};
