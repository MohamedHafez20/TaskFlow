const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { BADGES, getLevelFromXp, getLevelLabel, getLevelProgress } = require('../constants/gamification');
const { calculateStats } = require('../utils/gamification');

const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('name points level')
    .sort({ points: -1 })
    .limit(10);

  res.json(users);
});

const buildStats = async (userId) => {
  return calculateStats(userId);
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
    user.level = getLevelFromXp(user.xp);
    user.levelName = getLevelLabel(user.level);
  }

  user.badges = earned;
  await user.save();

  const progress = getLevelProgress(user.xp);

  res.json({
    points: user.points,
    xp: user.xp,
    level: user.level,
    levelName: user.levelName,
    tasksDone: stats.tasksDone,
    focusSessions: stats.focusSessions,
    deepSessions: stats.deepSessions,
    focusMinutes: stats.focusMinutes,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    badges: earned,
    allBadges: BADGES.map(({ check, ...badge }) => ({
      ...badge,
      earned: earned.includes(badge.id),
    })),
    xpInCurrentLevel: progress.xpInLevel,
    xpToNextLevel: progress.xpToNext,
  });
});

module.exports = { getLeaderboard, getMyStats };
