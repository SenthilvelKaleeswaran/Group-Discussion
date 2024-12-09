const express = require('express');
const router = express.Router();
const { createGroupDiscussion, getGroupDiscussion } = require('../controllers/group-discussion');

router.post('/create', createGroupDiscussion);
router.get('/:groupDiscussionId', getGroupDiscussion);

module.exports = router;
