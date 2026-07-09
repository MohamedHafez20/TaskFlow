import { getLevelLabel } from '../constants/gamification';

export const calculateProductivityScore = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const highPriorityCompleted = tasks.filter((t) => t.priority === 'high' && t.completed).length;
  const recentCompleted = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo && t.completed;
  }).length;

  const productivityScore = Math.min(100, completionRate + highPriorityCompleted * 10 + recentCompleted * 5);
  const levelNumber = Math.max(1, Math.min(7, Math.ceil(productivityScore / 14)));
  const levelLabel = getLevelLabel(levelNumber);

  return {
    total,
    completed,
    completionRate,
    productivityScore,
    levelNumber,
    levelLabel,
    highPriorityCompleted,
    recentCompleted,
  };
};
