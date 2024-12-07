const express = require('express');
const router = express.Router();
const { createConversation, updateConversation, getConversation } = require('../controllers/conversationController');

router.post('/create', createConversation);
router.put('/update', updateConversation);
router.get('/get/:groupDiscussionId', getConversation);

module.exports = router;
