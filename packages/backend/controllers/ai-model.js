const AIModel = require('../models/ai-model'); 
const getAIModels = async (req, res) => {
  try {
    const aiModels = await AIModel.find({});
    console.log({aiModels})
    res.status(200).json(aiModels);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving AI models',
      error: error.message,
    });
  }
};

const getAIModelById = async (req, res) => {
  const { id } = req.params;

  try {
    const aiModel = await AIModel.findById(id);
    if (!aiModel) {
      return res.status(404).json({
        success: false,
        message: 'AI Model not found',
      });
    }
    res.status(200).json({
      success: true,
      data: aiModel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving the AI model',
      error: error.message,
    });
  }
};

const updateAIModel = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find AI model by ID and update it
    const aiModel = await AIModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!aiModel) {
      return res.status(404).json({
        success: false,
        message: 'AI Model not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'AI Model updated successfully',
      data: aiModel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating AI model',
      error: error.message,
    });
  }
};

const deleteAIModel = async (req, res) => {
  const { id } = req.params;

  try {
    const aiModel = await AIModel.findByIdAndDelete(id);

    if (!aiModel) {
      return res.status(404).json({
        success: false,
        message: 'AI Model not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'AI Model deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting AI model',
      error: error.message,
    });
  }
};

module.exports = {
  getAIModels,
  getAIModelById,
  updateAIModel,
  deleteAIModel,
};
