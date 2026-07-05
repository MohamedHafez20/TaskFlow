const Task = require('../models/Task');
const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const {
  BADGES,
  TASK_REWARD,
  FOCUS_SESSION_REWARD,
  getLevelFromXp,
  getLevelLabel,
} = require('../constants/gamification');

const formatDayKey = (date) => new Date(date).toISOString().slice(0, 10);

const buildActivityDays = async (userId) => {
  const [tasks, sessions] = await Promise.all([
    Task.find({ user: userId, status: 'done' }).select('updatedAt').lean(),
    PomodoroSession.find({ user: userId, completed: true }).select('completedAt').lean(),
  ]);

  const dayKeys = new Set();

  tasks.forEach((task) => {
    if (task.updatedAt) {
      dayKeys.add(formatDayKey(task.updatedAt));
    }
  });

  sessions.forEach((session) => {
    if (session.completedAt) {
      dayKeys.add(formatDayKey(session.completedAt));
    }
  });

  return Array.from(dayKeys).sort((a, b) => b.localeCompare(a));
};

const calculateStreaks = (sortedDayKeys) => {
  if (!sortedDayKeys.length) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let streak = 1;
  let previousDate = new Date(sortedDayKeys[0]);
  previousDate.setHours(0, 0, 0, 0);
  const dayKeySet = new Set(sortedDayKeys);

  for (let i = 1; i < sortedDayKeys.length; i += 1) {
    const currentDate = new Date(sortedDayKeys[i]);
    currentDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((previousDate - currentDate) / 86400000);

    if (diffDays === 1) {
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }

    previousDate = currentDate;
  }

  let currentStreak = 0;
  let checkDay = new Date(sortedDayKeys[0]);
  checkDay.setHours(0, 0, 0, 0);

  while (dayKeySet.has(formatDayKey(checkDay))) {
    currentStreak += 1;
    checkDay.setDate(checkDay.getDate() - 1);
  }

  return { currentStreak, longestStreak };
};

const calculateStats = async (userId) => {
  const [user, tasksDone, focusSessions, deepSessions, focusMinutes] = await Promise.all([
    User.findById(userId),
    Task.countDocuments({ user: userId, status: 'done' }),
    PomodoroSession.countDocuments({
      user: userId,
      completed: true,
      mode: { $in: ['focus', 'work'] },
    }),
    PomodoroSession.countDocuments({
      user: userId,
      completed: true,
      isDeepSession: true,
      mode: { $in: ['focus', 'work'] },
    }),
    User.findById(userId).select('totalFocusMinutes').lean(),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const activityDays = await buildActivityDays(userId);
  const { currentStreak, longestStreak } = calculateStreaks(activityDays);
  const level = getLevelFromXp(user.xp);
  const levelName = getLevelLabel(level);

  return {
    user,
    tasksDone,
    focusSessions,
    deepSessions,
    focusMinutes: focusMinutes?.totalFocusMinutes || 0,
    currentStreak: user.loginStreak || currentStreak,
    longestStreak: user.longestLoginStreak || longestStreak,
    level,
    levelName,
  };
};

const awardTaskCompletion = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.totalTasksDone = (user.totalTasksDone || 0) + 1;
  user.xp += TASK_REWARD.xp;
  user.points += TASK_REWARD.points;
  user.level = getLevelFromXp(user.xp);
  user.levelName = getLevelLabel(user.level);

  await user.save();
  return user;
};

const awardFocusSession = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.totalFocusSessions = (user.totalFocusSessions || 0) + 1;
  user.xp += FOCUS_SESSION_REWARD.xp;
  user.points += FOCUS_SESSION_REWARD.points;
  user.level = getLevelFromXp(user.xp);
  user.levelName = getLevelLabel(user.level);

  await user.save();
  return user;
};

module.exports = {
  calculateStats,
  awardTaskCompletion,
  awardFocusSession,
};
