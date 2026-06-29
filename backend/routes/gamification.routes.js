const express = require('express');
const protect = require('../middleware/auth');
const { getLeaderboard, getMyStats } = require('../controllers/gamification.controller');

const router = express.Router();

router.use(protect);

router.get('/leaderboard', getLeaderboard);
router.get('/me', getMyStats);
router.get('/my-stats', getMyStats);

module.exports = router;
