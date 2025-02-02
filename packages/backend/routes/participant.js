const express = require('express');
const router = express.Router();
const { getParticipants, createParticipant } = require('../controllers/participant');

router.post('/create', createParticipant);
router.get('/:sessionId', getParticipants);

module.exports = router;
