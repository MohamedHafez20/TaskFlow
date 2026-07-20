export const XP_PER_LEVEL = 1000;

export const XP_REWARDS = {
  task: 20,
  focusSession: 15,
};

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

export const getLevelFromXp = (xp) => {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
};

export const getLevelLabel = (level) => {
  const entry = LEVEL_LABELS.find((item) => level <= item.maxLevel);
  return entry ? entry.label : 'Legend';
};

export const getLevelThresholds = (maxLevels = 10) => {
  const thresholds = [];

  for (let level = 1; level <= maxLevels; level += 1) {
    const minXp = (level - 1) * XP_PER_LEVEL;
    const maxXp = level * XP_PER_LEVEL - 1;

    thresholds.push({
      level,
      minXp,
      maxXp,
      label: getLevelLabel(level),
      rangeText: level === maxLevels ? `${minXp.toLocaleString()}+ XP` : `${minXp.toLocaleString()}–${maxXp.toLocaleString()} XP`,
    });
  }

  return thresholds;
};

export const getLevelProgress = (xp) => {
  const level = getLevelFromXp(xp);
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  return { level, xpInLevel, xpToNext };
};
