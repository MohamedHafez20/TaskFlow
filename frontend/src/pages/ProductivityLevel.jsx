import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import useTaskStore from '../store/useTaskStore';
import { FaTrophy, FaStar, FaMedal, FaAward, FaCheckCircle, FaFire } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';
import { getLevelLabel } from '../constants/gamification';

function ProductivityLevel() {
  usePageTitle('Productivity Level');

  const tasks = useTaskStore((s) => s.tasks);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const totalPages = Math.max(1, Math.ceil(completedTasks.length / tasksPerPage));
  const paginatedCompletedTasks = useMemo(() => {
    const start = (currentPage - 1) * tasksPerPage;
    return completedTasks.slice(start, start + tasksPerPage);
  }, [completedTasks, currentPage]);

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

    const levelNumber = Math.max(1, Math.min(7, Math.ceil(productivityScore / 14)));
    const level = getLevelLabel(levelNumber);
    let levelColor = 'text-slate-400';
    let levelIcon = FaStar;

    if (levelNumber >= 6) {
      levelColor = 'text-yellow-400';
      levelIcon = FaTrophy;
    } else if (levelNumber >= 5) {
      levelColor = 'text-purple-400';
      levelIcon = FaAward;
    } else if (levelNumber >= 4) {
      levelColor = 'text-blue-400';
      levelIcon = FaMedal;
    } else if (levelNumber >= 3) {
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
          Level & Rank
        </h1>
        <p className="text-slate-500">See your current level and rank in the system.</p>
      </div>

      {/* Main Level Card */}
      <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-8 border border-white/10 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mb-6">
          <LevelIcon className="text-4xl text-white" />
        </div>
        <h2 className={`text-4xl font-bold mb-2 ${productivityStats.levelColor}`}>
          {productivityStats.level}
        </h2>
        <p className="text-slate-400 mb-6 text-base">Current Rank</p>

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
            <span>System Score</span>
            <span>{productivityStats.productivityScore}%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Tasks */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-5 border border-white/10 flex flex-col justify-between h-[170px]">
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
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-5 border border-white/10 flex flex-col justify-between h-[170px]">
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
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-5 border border-white/10 flex flex-col justify-between h-[170px]">
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
      <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-6 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <h2 className="text-base font-bold text-white tracking-wide">Your Completed Tasks</h2>
          <button className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1">
            {completedTasks.length} completed
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {completedTasks.length > 0 ? (
            paginatedCompletedTasks.map((task) => (
              <div key={task.id} className="flex flex-col rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden transition-all">
                <div className="flex items-center justify-between p-4 opacity-60">
                  <div className="flex items-start gap-4 flex-1">
                    <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-through text-slate-400">{task.title}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${task.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : task.priority === 'medium' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                          {task.priority || 'medium'} Priority
                        </span>
                        {task.completedAt && <span className="text-[10px] text-slate-500">Completed: {new Date(task.completedAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-white/[0.08] p-10 text-center text-sm text-slate-500">
              <FaCheckCircle className="text-4xl text-slate-600 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No completed tasks yet</p>
              <p className="text-xs mt-1">Start completing tasks to see them here</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-4">
            <div className="text-xs font-semibold text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/[0.05] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/[0.05] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProductivityLevel;