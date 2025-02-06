const express = require('express');
const router = express.Router();
const { getActiveSession, createSession, updateSession,getSessionQueue } = require('../controllers/session');

router.get('/active/:id', getActiveSession);
router.get('/queue/:id', getSessionQueue);
router.post('/',createSession)
router.patch('/:id',updateSession)

module.exports = router;
