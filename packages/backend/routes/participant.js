const express = require('express');
const router = express.Router();
const { getParticipants, createParticipant } = require('../controllers/participantController');

router.post('/create', createParticipant);
router.get('/:groupDiscussionId', getParticipants);

module.exports = router;
