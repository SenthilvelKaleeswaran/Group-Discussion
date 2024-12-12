const express = require('express');
const { generateConversation, generateFeedback } = require('../controllers/generate');
const router = express.Router();

router.post('/conversation', generateConversation);
router.post('/feedback',generateFeedback)

module.exports = router;
