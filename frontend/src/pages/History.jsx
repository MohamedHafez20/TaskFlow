import { motion } from 'framer-motion';
import useTaskStore from '../store/useTaskStore';
import { FaCheckCircle, FaTrophy, FaRocket, FaClock, FaHistory } from 'react-icons/fa';
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6'
    >
      <section className='rounded-[32px] border border-white/[0.06] bg-[#111118] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-[11px] font-black uppercase tracking-[0.3em] text-slate-500'>History</p>
            <h1 className='mt-3 text-3xl font-semibold text-white'>Achievement timeline</h1>
            <p className='mt-2 max-w-2xl text-sm text-slate-400'>Review completed work, milestones, and your productivity rhythm in a clean timeline view.</p>
          </div>
          <div className='rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-slate-400'>Completed</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-300'>{completedTasks.length}</p>
          </div>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-[24px] border border-white/[0.06] bg-[#111118] p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-slate-500'>Completion rate</p>
            <FaCheckCircle className='text-emerald-300' />
          </div>
          <p className='mt-4 text-2xl font-semibold text-white'>{completionStats.percentage}%</p>
          <p className='mt-2 text-sm text-slate-400'>Overall task success over time.</p>
        </div>
        <div className='rounded-[24px] border border-white/[0.06] bg-[#111118] p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-slate-500'>Milestones</p>
            <FaTrophy className='text-purple-300' />
          </div>
          <p className='mt-4 text-2xl font-semibold text-white'>{Math.min(10, completedTasks.length)}</p>
          <p className='mt-2 text-sm text-slate-400'>Recent goals reached.</p>
        </div>
        <div className='rounded-[24px] border border-white/[0.06] bg-[#111118] p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-slate-500'>Momentum</p>
            <FaRocket className='text-cyan-300' />
          </div>
          <p className='mt-4 text-2xl font-semibold text-white'>{Math.round(completionStats.percentage / 10)}/10</p>
          <p className='mt-2 text-sm text-slate-400'>Your current productivity momentum.</p>
        </div>
      </div>

      <section className='rounded-[32px] border border-white/[0.06] bg-[#111118] p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Achievements by category</h2>
            <p className='mt-1 text-sm text-slate-400'>See how your completed work is distributed.</p>
          </div>
          <FaHistory className='text-purple-300' />
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {Object.entries(tasksByCategory).length > 0 ? (
            Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
              const completed = categoryTasks.filter((t) => t.completed).length;
              return (
                <div key={category} className='rounded-[20px] border border-white/[0.05] bg-[#171723] p-4'>
                  <p className='text-[10px] font-black uppercase tracking-[0.28em] text-slate-500'>{category}</p>
                  <p className='mt-3 text-2xl font-semibold text-white'>{completed}/{categoryTasks.length}</p>
                  <p className='mt-2 text-sm text-slate-400'>{Math.round((completed / categoryTasks.length) * 100)}% complete</p>
                </div>
              );
            })
          ) : (
            <div className='col-span-full rounded-[20px] border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500'>No tasks yet. Add a task to populate history.</div>
          )}
        </div>
      </section>

      <section className='rounded-[32px] border border-white/[0.06] bg-[#111118] p-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-slate-500'>Completed task log</p>
            <h2 className='mt-2 text-xl font-semibold text-white'>All completed tasks</h2>
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm text-purple-200'>
            <FaClock />
            Keep focusing
          </div>
        </div>

        <div className='mt-6 space-y-4'>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className='rounded-[20px] border border-dashed border-white/[0.08] p-10 text-center text-sm text-slate-500'>No completed tasks yet. Complete tasks to build your history.</div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

export default History;
