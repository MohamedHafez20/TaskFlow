const express = require('express');
const protect = require('../middleware/auth');
const {
  startSession,
  completeSession,
  getHistory,
} = require('../controllers/pomodoro.controller');

const router = express.Router();

router.use(protect);

router.post('/start', startSession);
router.get('/history', getHistory);
router.put('/:id/complete', completeSession);

module.exports = router;
