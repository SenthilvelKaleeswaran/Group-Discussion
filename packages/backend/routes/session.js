const express = require('express');
const router = express.Router();
const { getActiveSession, createSession, updateSession } = require('../controllers/session');

router.get('/active/:id', getActiveSession);
router.post('/',createSession)
router.patch('/:id',updateSession)

module.exports = router;
