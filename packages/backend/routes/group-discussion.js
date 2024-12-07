const express = require('express');
const router = express.Router();
const { createGroupDiscussion, getGroupDiscussion } = require('../controllers/groupDiscussionController');

router.post('/create', createGroupDiscussion);
router.get('/get/:groupDiscussionId', getGroupDiscussion);

module.exports = router;
