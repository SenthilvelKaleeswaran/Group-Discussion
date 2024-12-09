const express = require('express');
const { generateConversation } = require('../controllers/generate');
const router = express.Router();

router.post('/conversation', generateConversation);

module.exports = router;
