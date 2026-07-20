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

const refreshDailyStreak = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  const now = new Date();
  const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : null;

  if (!lastLoginAt) {
    user.loginStreak = 1;
  } else {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfLastLogin = new Date(lastLoginAt);
    startOfLastLogin.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startOfToday - startOfLastLogin) / 86400000);

    if (diffDays === 0) {
      user.loginStreak = user.loginStreak || 1;
    } else if (diffDays === 1) {
      user.loginStreak = (user.loginStreak || 0) + 1;
    } else {
      user.loginStreak = 1;
    }
  }

  user.longestLoginStreak = Math.max(user.longestLoginStreak || 0, user.loginStreak || 1);
  user.lastLoginAt = now;
  await user.save();
  return user;
};

const buildStats = async (userId) => {
  return calculateStats(userId);
};

const serializeStats = (stats, earned) => {
  const user = stats.user;
  const progress = getLevelProgress(user.xp);

  return {
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
  };
};

const getMyStats = asyncHandler(async (req, res) => {
  await refreshDailyStreak(req.user._id);
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

  res.json(serializeStats(stats, earned));
});

const awardGameCompletion = asyncHandler(async (req, res) => {
  const { gameId, score = 0, xpEarned = 0, pointsEarned = 0 } = req.body;

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  const xp = Number(xpEarned);
  const points = Number(pointsEarned);

  if (!Number.isFinite(xp) || xp < 0 || !Number.isFinite(points) || points < 0) {
    return res.status(400).json({ message: 'Rewards must be non-negative numbers.' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.xp += Math.floor(xp);
  user.points += Math.floor(points);
  user.level = getLevelFromXp(user.xp);
  user.levelName = getLevelLabel(user.level);
  await user.save();

  const stats = await buildStats(req.user._id);
  const earned = BADGES.filter((badge) => badge.check(stats)).map((badge) => badge.id);
  const previouslyEarned = stats.user.badges || [];
  const newlyEarned = earned.filter((badgeId) => !previouslyEarned.includes(badgeId));

  if (newlyEarned.length > 0) {
    const extraPoints = newlyEarned.reduce((sum, badgeId) => {
      const badgeConfig = BADGES.find((badge) => badge.id === badgeId);
      return sum + (badgeConfig?.points || 0);
    }, 0);

    stats.user.points += extraPoints;
    stats.user.xp += extraPoints;
    stats.user.level = getLevelFromXp(stats.user.xp);
    stats.user.levelName = getLevelLabel(stats.user.level);
  }

  stats.user.badges = earned;
  await stats.user.save();

  res.json({
    gameId,
    score: Number(score) || 0,
    xpEarned: Math.floor(xp),
    pointsEarned: Math.floor(points),
    stats: serializeStats(stats, earned),
  });
});

module.exports = { getLeaderboard, getMyStats, awardGameCompletion };
