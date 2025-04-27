const express = require('express');
const router = express.Router();
const { getActiveSession, createSession, updateSession,getSessionQueue,getUserInSession } = require('../controllers/session');

router.get('/active/:id', getActiveSession);
router.get('/queue/:id', getSessionQueue);
router.post('/',createSession)
router.patch('/:id',updateSession)
router.get('/user/:id',getUserInSession)

module.exports = router;
