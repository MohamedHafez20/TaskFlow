import { motion } from 'framer-motion';
import { useMemo } from 'react';
import useTaskStore from '../store/useTaskStore';
import { FaTrophy, FaStar, FaMedal, FaAward, FaCheckCircle, FaFire } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';

function ProductivityLevel() {
  usePageTitle('Productivity Level');

  const tasks = useTaskStore((s) => s.tasks);

  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const productivityStats = useMemo(() => {
    const total = tasks.length;
    const completed = completedTasks.length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const baseScore = completionRate;
    const highPriorityBonus = tasks.filter((t) => t.priority === 'high' && t.completed).length * 10;
    const recentBonus = tasks.filter((t) => {
      const taskDate = new Date(t.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo && t.completed;
    }).length * 5;

    const productivityScore = Math.min(100, baseScore + highPriorityBonus + recentBonus);

    let level = 'Starter';
    let levelColor = 'text-slate-400';
    let levelIcon = FaStar;

    if (productivityScore >= 90) {
      level = 'Master';
      levelColor = 'text-yellow-400';
      levelIcon = FaTrophy;
    } else if (productivityScore >= 75) {
      level = 'Expert';
      levelColor = 'text-purple-400';
      levelIcon = FaAward;
    } else if (productivityScore >= 60) {
      level = 'Pro';
      levelColor = 'text-blue-400';
      levelIcon = FaMedal;
    } else if (productivityScore >= 40) {
      level = 'Good';
      levelColor = 'text-fuchsia-400';
      levelIcon = FaFire;
    }

    return {
      total,
      completed,
      completionRate,
      productivityScore,
      level,
      levelColor,
      levelIcon,
      highPriorityCompleted: tasks.filter((t) => t.priority === 'high' && t.completed).length,
      recentCompleted: tasks.filter((t) => {
        const taskDate = new Date(t.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return taskDate >= weekAgo && t.completed;
      }).length
    };
  }, [tasks, completedTasks]);

  const LevelIcon = productivityStats.levelIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-2 antialiased font-sans text-slate-300"
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <LevelIcon className={`text-4xl ${productivityStats.levelColor}`} />
          Productivity Level
        </h1>
        <p className="text-slate-500">Track your productivity journey and achievements</p>
      </div>

      {/* Main Level Card */}
      <div className="rounded-3xl bg-[#13131a] p-8 border border-white/[0.04] text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mb-6">
          <LevelIcon className="text-4xl text-white" />
        </div>
        <h2 className={`text-4xl font-bold mb-2 ${productivityStats.levelColor}`}>
          {productivityStats.level}
        </h2>
        <p className="text-slate-400 mb-6 text-base">Productivity Score</p>

        {/* Score Display */}
        <div className="flex items-baseline justify-center gap-2 mb-8">
          <span className="text-6xl font-bold text-white">{productivityStats.productivityScore}</span>
          <span className="text-2xl text-slate-500">/100</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="h-3 w-full rounded-full bg-white/[0.06] relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${productivityStats.productivityScore}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-medium">
            <span>Progress</span>
            <span>{productivityStats.productivityScore}%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Tasks */}
        <div className="rounded-3xl bg-[#13131a] p-5 border border-white/[0.04] flex flex-col justify-between h-[170px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Tasks</p>
            <FaCheckCircle className="text-xl text-blue-400 opacity-60" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white tracking-tight">{productivityStats.total}</span>
            <span className="text-xs text-slate-500">tasks</span>
          </div>
          <div className="mt-auto pt-4 border-t border-white/[0.03]">
            <p className="text-[10px] text-slate-500 font-medium">Total tasks in system</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-3xl bg-[#13131a] p-5 border border-white/[0.04] flex flex-col justify-between h-[170px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</p>
            <FaTrophy className="text-xl text-green-400 opacity-60" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white tracking-tight">{productivityStats.completed}</span>
            <span className="text-xs text-slate-500">of {productivityStats.total}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] mt-4">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${productivityStats.completionRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-2">{productivityStats.completionRate}% completion rate</p>
        </div>

        {/* High Priority */}
        <div className="rounded-3xl bg-[#13131a] p-5 border border-white/[0.04] flex flex-col justify-between h-[170px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">High Priority</p>
            <FaFire className="text-xl text-orange-400 opacity-60" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white tracking-tight">{productivityStats.highPriorityCompleted}</span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="mt-auto pt-4 border-t border-white/[0.03]">
            <p className="text-[10px] text-slate-500 font-medium">High-priority tasks done</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productivityStats.recentCompleted > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-green-950/30 to-emerald-950/20 border border-green-500/20 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="text-2xl text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Weekly Warrior</h3>
                  <p className="text-green-300 text-xs mt-1">Completed {productivityStats.recentCompleted} tasks this week</p>
                </div>
              </div>
            </div>
          )}

          {productivityStats.completionRate >= 50 && (
            <div className="rounded-3xl bg-gradient-to-br from-blue-950/30 to-cyan-950/20 border border-blue-500/20 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FaMedal className="text-2xl text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Consistency King</h3>
                  <p className="text-blue-300 text-xs mt-1">{productivityStats.completionRate}% completion rate</p>
                </div>
              </div>
            </div>
          )}

          {productivityStats.highPriorityCompleted > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-purple-950/30 to-pink-950/20 border border-purple-500/20 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FaAward className="text-2xl text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Priority Master</h3>
                  <p className="text-purple-300 text-xs mt-1">Completed {productivityStats.highPriorityCompleted} high-priority tasks</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completed Tasks List */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Your Completed Tasks</h2>
        {completedTasks.length > 0 ? (
          <div className="space-y-3">
            {completedTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="rounded-2xl bg-[#13131a] p-4 border border-white/[0.04]">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-through text-slate-400">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">{task.priority} Priority</p>
                  </div>
                </div>
              </div>
            ))}
            {completedTasks.length > 10 && (
              <p className="text-center text-slate-500 text-sm mt-4">
                And {completedTasks.length - 10} more completed tasks...
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#13131a] p-12 border border-white/[0.04] text-center">
            <FaCheckCircle className="text-6xl text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No completed tasks yet</h3>
            <p className="text-slate-500 text-sm">Start completing tasks to see your productivity level grow!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProductivityLevel;