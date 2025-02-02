const express = require('express');
const router = express.Router();
const { getAIModels, getAIModelById, updateAIModel, deleteAIModel } = require('../controllers/ai-model');

router.get('', getAIModels);
router.get('/:id', getAIModelById);
router.put('/:id', updateAIModel);
router.delete('/:id', deleteAIModel);

module.exports = router;
