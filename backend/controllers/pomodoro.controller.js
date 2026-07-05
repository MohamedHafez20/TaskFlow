const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { awardFocusSession } = require('../utils/gamification');

const normalizeMode = (mode) => {
  if (!mode || mode === 'work') return 'focus';
  if (mode === 'shortBreak') return 'short-break';
  if (mode === 'longBreak') return 'long-break';
  return mode;
};

const startSession = asyncHandler(async (req, res) => {
  const { mode, duration, isDeepSession } = req.body;

  if (!duration) {
    res.status(400);
    throw new Error('Duration is required');
  }

  const session = await PomodoroSession.create({
    user: req.user._id,
    mode: normalizeMode(mode),
    duration,
    isDeepSession: Boolean(isDeepSession),
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
      await awardFocusSession(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          totalFocusMinutes: Math.max(1, Math.round(session.duration / 60)),
          ...(session.isDeepSession ? { totalDeepSessions: 1 } : {}),
        },
      });
    }
  }

  res.status(200).json(session);
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await PomodoroSession.find({ user: req.user._id }).sort({ startedAt: -1 });
  res.status(200).json(history);
});

module.exports = {
  startSession,
  completeSession,
  getHistory,
};
