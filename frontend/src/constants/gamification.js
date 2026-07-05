export const XP_PER_LEVEL = 1000;

export const LEVEL_LABELS = [
  { maxLevel: 2, label: 'Beginner' },
  { maxLevel: 4, label: 'Explorer' },
  { maxLevel: 7, label: 'Skilled' },
  { maxLevel: 10, label: 'Advanced' },
  { maxLevel: 14, label: 'Master' },
  { maxLevel: 19, label: 'Champion' },
  { maxLevel: Infinity, label: 'Legend' },
];

export const BADGES = [
  { id: 'first_task', label: 'First Task', points: 10, icon: '🎯' },
  { id: 'ten_tasks', label: 'Task Master', points: 50, icon: '🔥' },
  { id: 'focus_streak', label: 'Focus Streak', points: 80, icon: '⏱️' },
  { id: 'pomodoro_pro', label: 'Pomodoro Pro', points: 100, icon: '💪' },
  { id: 'level_5', label: 'Rising Star', points: 250, icon: '👑' },
];

export const getLevelLabel = (level) => {
  const entry = LEVEL_LABELS.find((item) => level <= item.maxLevel);
  return entry ? entry.label : 'Legend';
};

export const getLevelProgress = (xp) => {
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  return { level, xpInLevel, xpToNext };
};
