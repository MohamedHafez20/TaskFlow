const XP_PER_LEVEL = 1000;

const LEVEL_LABELS = [
  { maxLevel: 2, label: 'Beginner' },
  { maxLevel: 4, label: 'Explorer' },
  { maxLevel: 7, label: 'Skilled' },
  { maxLevel: 10, label: 'Advanced' },
  { maxLevel: 14, label: 'Master' },
  { maxLevel: 19, label: 'Champion' },
  { maxLevel: Infinity, label: 'Legend' },
];

const BADGES = [
  { id: 'first_task', label: 'First Task', name: 'First Task', points: 10, check: (stats) => stats.tasksDone >= 1 },
  { id: 'ten_tasks', label: 'Task Master', name: 'Task Master', points: 50, check: (stats) => stats.tasksDone >= 10 },
  { id: 'focus_streak', label: 'Focus Streak', name: 'Focus Streak', points: 80, check: (stats) => stats.currentStreak >= 3 },
  { id: 'pomodoro_pro', label: 'Pomodoro Pro', name: 'Pomodoro Pro', points: 100, check: (stats) => stats.focusSessions >= 25 },
  { id: 'level_5', label: 'Rising Star', name: 'Rising Star', points: 250, check: (stats) => stats.level >= 5 },
];

const TASK_REWARD = { xp: 20, points: 10 };
const FOCUS_SESSION_REWARD = { xp: 15, points: 8 };

const getLevelFromXp = (xp) => Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);

const getLevelLabel = (level) => {
  const entry = LEVEL_LABELS.find((item) => level <= item.maxLevel);
  return entry ? entry.label : 'Legend';
};

const getLevelProgress = (xp) => {
  const level = getLevelFromXp(xp);
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  return { level, xpInLevel, xpToNext };
};

module.exports = {
  XP_PER_LEVEL,
  LEVEL_LABELS,
  BADGES,
  TASK_REWARD,
  FOCUS_SESSION_REWARD,
  getLevelFromXp,
  getLevelLabel,
  getLevelProgress,
};
