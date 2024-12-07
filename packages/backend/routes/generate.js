const express = require('express');
const { generateConversation } = require('../controllers/generate');
const router = express.Router();

router.post('/', generateConversation);

module.exports = router;
