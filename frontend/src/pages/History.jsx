import { motion } from 'framer-motion';
import useTaskStore from '../store/useTaskStore';
import { FaCheckCircle, FaTrophy, FaRocket } from 'react-icons/fa';
import TaskCard from '../components/task/TaskCard';
import { useMemo } from 'react';
import usePageTitle from '../hooks/usePageTitle';

function History() {
  const tasks = useTaskStore((s) => s.tasks);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const completionStats = useMemo(() => {
    const total = tasks.length;
    const completed = completedTasks.length;
    return { total, completed, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [tasks, completedTasks]);

  const tasksByCategory = useMemo(() => {
    const categories = {};
    tasks.forEach((task) => {
      const key = task.category || 'general';
      categories[key] = categories[key] || [];
      categories[key].push(task);
    });
    return categories;
  }, [tasks]);

  usePageTitle('History');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-8'
    >
      <div className='rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>History</p>
            <h1 className='mt-3 text-4xl font-semibold text-white'>Achievement Timeline</h1>
            <p className='mt-3 max-w-2xl text-slate-300'>Review your wins, completion streaks, and progress through a premium dashboard timeline.</p>
          </div>
          <div className='rounded-[28px] bg-[#111118] p-5 text-center ring-1 ring-violet-500/20'>
            <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Completed</p>
            <p className='mt-3 text-3xl font-semibold text-emerald-300'>{completedTasks.length}</p>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
          <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Completion rate</p>
          <p className='mt-4 text-4xl font-semibold text-white'>{completionStats.percentage}%</p>
          <p className='mt-2 text-slate-400'>Overall task success over time.</p>
        </div>
        <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
          <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Milestones</p>
          <p className='mt-4 text-4xl font-semibold text-violet-300'>{Math.min(10, completedTasks.length)}</p>
          <p className='mt-2 text-slate-400'>Recent goals reached.</p>
        </div>
        <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
          <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Momentum</p>
          <p className='mt-4 text-4xl font-semibold text-cyan-300'>{Math.round(completionStats.percentage / 10)}/10</p>
          <p className='mt-2 text-slate-400'>Your current productivity momentum.</p>
        </div>
      </div>

      <div className='rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl'>
        <h2 className='text-xl font-semibold text-white'>Achievements by Category</h2>
        <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Object.entries(tasksByCategory).length > 0 ? (
            Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
              const completed = categoryTasks.filter((t) => t.completed).length;
              return (
                <div key={category} className='rounded-[28px] border border-white/10 bg-[#111118] p-5'>
                  <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>{category}</p>
                  <p className='mt-3 text-3xl font-semibold text-white'>{completed}/{categoryTasks.length}</p>
                  <p className='mt-2 text-slate-400'>{Math.round((completed / categoryTasks.length) * 100)}% complete</p>
                </div>
              );
            })
          ) : (
            <div className='col-span-full rounded-[28px] bg-[#131318] p-8 text-center text-slate-400'>No tasks yet. Add a task to populate history.</div>
          )}
        </div>
      </div>

      <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Completed task log</p>
            <h2 className='mt-3 text-3xl font-semibold text-white'>All completed tasks</h2>
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-200'>
            <FaRocket />
            Keep focusing
          </div>
        </div>

        <div className='mt-6 space-y-4'>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className='rounded-[28px] bg-[#131318] p-10 text-center text-slate-400'>No completed tasks yet. Complete tasks to build your history.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default History;
