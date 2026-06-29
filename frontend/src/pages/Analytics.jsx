import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useTaskStore from '../store/useTaskStore';
import { FaFire, FaCheckCircle, FaTrophy, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ORDERED_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Analytics() {
  const tasks = useTaskStore((s) => s.tasks);
  const pomodoroHistory = useTaskStore((s) => s.pomodoroHistory);

  const completionStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [tasks]);

  const productivityScore = useMemo(() => {
    const highCompleted = tasks.filter((t) => t.priority === 'high' && t.completed).length;
    return Math.min(100, completionStats.percentage + highCompleted * 8);
  }, [completionStats.percentage, tasks]);

  const tasksByCategory = useMemo(() => {
    const categories = {};
    tasks.forEach((task) => {
      const key = task.category || 'general';
      categories[key] = categories[key] || [];
      categories[key].push(task);
    });
    return categories;
  }, [tasks]);

  const chartData = Object.entries(tasksByCategory).map(([category, tasks]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
  }));

  const pieData = [
    { name: 'Completed', value: completionStats.completed },
    { name: 'Pending', value: completionStats.total - completionStats.completed },
  ];

  const COLORS = ['#8B5CF6', '#C084FC'];

  const weeklyData = useMemo(() => {
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    pomodoroHistory.forEach((session) => {
      const date = new Date(session.completedAt);
      if (date >= oneWeekAgo) {
        const dayName = DAY_NAMES[date.getDay()];
        if (dayName in counts) counts[dayName]++;
      }
    });
    return ORDERED_DAYS.map((day) => ({ day, value: counts[day] }));
  }, [pomodoroHistory]);

  usePageTitle('Analytics');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-8'
    >
      <div className='rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Analytics</p>
            <h1 className='mt-3 text-4xl font-semibold text-white'>Productivity Intelligence</h1>
            <p className='mt-3 max-w-2xl text-slate-300'>Visualize your focus performance, session analytics, and category trends in one dashboard.</p>
          </div>
          <div className='rounded-[28px] bg-[#111118] p-5 text-center ring-1 ring-violet-500/20'>
            <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Efficiency</p>
            <p className='mt-3 text-3xl font-semibold text-violet-300'>{productivityScore}%</p>
          </div>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-4'>
        {[
          { label: 'Total Tasks', value: completionStats.total, icon: FaCalendarAlt, color: 'text-cyan-300' },
          { label: 'Completed', value: completionStats.completed, icon: FaCheckCircle, color: 'text-emerald-300' },
          { label: 'Productivity', value: productivityScore + '%', icon: FaTrophy, color: 'text-violet-300' },
          { label: 'Focus Burst', value: pomodoroHistory.length + ' sessions', icon: FaFire, color: 'text-rose-300' },
        ].map((item) => (
          <div key={item.label} className='rounded-[28px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>{item.label}</p>
                <p className='mt-4 text-3xl font-semibold text-white'>{item.value}</p>
              </div>
              <item.icon className={`text-4xl ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
        <div className='rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl'>
          <h2 className='text-xl font-semibold text-white'>Weekly Focus Intensity</h2>
          <p className='mt-2 text-slate-400'>Your output across the week, with focus peaks and deep work bursts.</p>
          <div className='mt-6 h-[320px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray='4 4' stroke='#ffffff15' />
                <XAxis dataKey='day' stroke='#ffffff80' />
                <YAxis stroke='#ffffff80' />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: 12 }} />
                <Line type='monotone' dataKey='value' stroke='#8b5cf6' strokeWidth={3} dot={{ fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
            <h3 className='text-sm uppercase tracking-[0.25em] text-slate-500'>Category Breakdown</h3>
            <div className='mt-6 space-y-4'>
              {chartData.length > 0 ? chartData.map((item) => (
                <div key={item.name} className='rounded-3xl bg-[#131318] p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='text-sm text-slate-300'>{item.name}</p>
                    <span className='text-white font-semibold'>{item.total} tasks</span>
                  </div>
                  <div className='mt-3 h-2 rounded-full bg-white/10'>
                    <div className='h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500' style={{ width: `${(item.completed / item.total) * 100}%` }} />
                  </div>
                </div>
              )) : (
                <p className='text-slate-500'>Add tasks to see your category split.</p>
              )}
            </div>
          </div>

          <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-sm uppercase tracking-[0.25em] text-slate-500'>Completion Snapshot</p>
              <FaShieldAlt className='text-violet-300' />
            </div>
            <div className='mt-6 text-3xl font-semibold text-white'>{completionStats.percentage}%</div>
            <p className='mt-3 text-slate-400'>Your current completion ratio across all tracked tasks.</p>
          </div>
        </div>
      </div>

      <div className='rounded-[32px] border border-white/10 bg-[#111118] p-6 shadow-glow backdrop-blur-xl'>
        <h2 className='text-xl font-semibold text-white'>Productivity summary</h2>
        <p className='mt-2 text-slate-400'>Combine your task results with focused time and session performance to plan the next work cycle.</p>
      </div>
    </motion.div>
  );
}

export default Analytics;
