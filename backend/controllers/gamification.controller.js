const User = require('../models/User');
const Task = require('../models/Task');
const PomodoroSession = require('../models/PomodoroSession');
const asyncHandler = require('../middleware/asyncHandler');

const BADGES = [
  { id: 'first_task', label: 'First Step', name: 'First Step', points: 10, check: (s) => s.tasksDone >= 1 },
  { id: 'ten_tasks', label: 'Task Master', name: 'Task Master', points: 50, check: (s) => s.tasksDone >= 10 },
  { id: 'pomodoro_pro', label: 'Pomodoro Pro', name: 'Pomodoro Pro', points: 100, check: (s) => s.focusSessions >= 25 },
  { id: 'level_5', label: 'Rising Star', name: 'Rising Star', points: 250, check: (s) => s.level >= 5 },
];

const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('name points level')
    .sort({ points: -1 })
    .limit(10);

  res.json(users);
});

const buildStats = async (userId) => {
  const [user, tasksDone, focusSessions] = await Promise.all([
    User.findById(userId),
    Task.countDocuments({ user: userId, status: 'done' }),
    PomodoroSession.countDocuments({
      user: userId,
      mode: { $in: ['focus', 'work'] },
      completed: true,
    }),
  ]);

  return { user, tasksDone, focusSessions, level: user.level };
};

const getMyStats = asyncHandler(async (req, res) => {
  const stats = await buildStats(req.user._id);
  const earned = BADGES.filter((badge) => badge.check(stats)).map((badge) => badge.id);
  const user = stats.user;

  // Track previously earned badges to calculate new point awards
  const previouslyEarned = user.badges || [];
  const newlyEarned = earned.filter((badgeId) => !previouslyEarned.includes(badgeId));

  if (newlyEarned.length > 0) {
    let extraPoints = 0;
    newlyEarned.forEach((badgeId) => {
      const badgeConfig = BADGES.find((b) => b.id === badgeId);
      if (badgeConfig) {
        extraPoints += badgeConfig.points;
      }
    });

    user.points += extraPoints;
    user.xp += extraPoints;
    user.level = Math.floor(user.xp / 100) + 1;
  }

  user.badges = earned;
  await user.save();

  res.json({
    points: user.points,
    xp: user.xp,
    level: user.level,
    tasksDone: stats.tasksDone,
    focusSessions: stats.focusSessions,
    badges: earned,
    allBadges: BADGES.map(({ check, ...badge }) => ({
      ...badge,
      earned: earned.includes(badge.id),
    })),
  });
});

module.exports = { getLeaderboard, getMyStats };
