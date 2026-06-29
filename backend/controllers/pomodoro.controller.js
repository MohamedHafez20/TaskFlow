const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const normalizeMode = (mode) => {
  if (!mode || mode === 'work') return 'focus';
  if (mode === 'shortBreak') return 'short-break';
  if (mode === 'longBreak') return 'long-break';
  return mode;
};

const startSession = asyncHandler(async (req, res) => {
  const { mode, duration } = req.body;

  if (!duration) {
    res.status(400);
    throw new Error('Duration is required');
  }

  const session = await PomodoroSession.create({
    user: req.user._id,
    mode: normalizeMode(mode),
    duration,
    startedAt: Date.now(),
  });

  res.status(201).json(session);
});

const completeSession = asyncHandler(async (req, res) => {
  const session = await PomodoroSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }

  if (!session.completed) {
    // Basic cheat prevention: verify duration elapsed (80% minimum)
    const elapsedSeconds = (Date.now() - new Date(session.startedAt).getTime()) / 1000;
    const minimumRequiredSeconds = session.duration * 0.8;

    if (elapsedSeconds < minimumRequiredSeconds) {
      res.status(400);
      throw new Error('Session cannot be completed so quickly. Finish your focus time!');
    }

    session.completed = true;
    session.completedAt = Date.now();
    await session.save();

    if (session.mode === 'focus' || session.mode === 'work') {
      const user = await User.findById(req.user._id);
      user.xp += 25;
      user.points += 10;
      user.level = Math.floor(user.xp / 100) + 1;
      await user.save();
    }
  }

  res.json(session);
});

const getHistory = asyncHandler(async (req, res) => {
  const sessions = await PomodoroSession.find({
    user: req.user._id,
    completed: true,
  }).sort({ completedAt: -1 });

  res.json(sessions);
});

module.exports = { startSession, completeSession, getHistory };
