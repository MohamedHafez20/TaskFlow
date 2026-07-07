import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import useTaskStore from '../store/useTaskStore';
import { FaFire, FaCheckCircle, FaTrophy, FaCalendarAlt, FaClock, FaShieldAlt } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ORDERED_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#8B5CF6', '#C084FC', '#F472B6'];

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

  const chartData = Object.entries(tasksByCategory).map(([category, categoryTasks]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    total: categoryTasks.length,
    completed: categoryTasks.filter((t) => t.completed).length,
  }));

  const pieData = [
    { name: 'Completed', value: completionStats.completed },
    { name: 'Pending', value: Math.max(0, completionStats.total - completionStats.completed) },
  ];

  const weeklyData = useMemo(() => {
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    pomodoroHistory.forEach((session) => {
      const date = new Date(session.completedAt);
      if (date >= oneWeekAgo) {
        const dayName = DAY_NAMES[date.getDay()];
        if (dayName in counts) counts[dayName] += 1;
      }
    });

    return ORDERED_DAYS.map((day) => ({ day, value: counts[day] }));
  }, [pomodoroHistory]);

  usePageTitle('Analytics');

  const insightCards = [
    { label: 'Total Tasks', value: completionStats.total, icon: FaCalendarAlt, color: 'text-[var(--c-accent)]' },
    { label: 'Completed', value: completionStats.completed, icon: FaCheckCircle, color: 'text-emerald-300' },
    { label: 'Productivity', value: `${productivityScore}%`, icon: FaTrophy, color: 'text-violet-300' },
    { label: 'Focus Sessions', value: `${pomodoroHistory.length}`, icon: FaFire, color: 'text-rose-300' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6'
    >
      <section className='rounded-[32px] border border-hair bg-card2 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-[11px] font-black uppercase tracking-[0.3em] text-muted'>Analytics</p>
            <h1 className='mt-3 text-3xl font-semibold text-ink'>Productivity overview</h1>
            <p className='mt-2 max-w-2xl text-sm text-muted'>Track focus, task completion, and performance in a view that matches the rest of the app.</p>
          </div>
          <div className='rounded-[24px] border border-purple-500/20 bg-purple-500/10 px-5 py-4 text-center'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-muted'>Efficiency</p>
            <p className='mt-2 text-3xl font-semibold text-purple-300'>{productivityScore}%</p>
          </div>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {insightCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className='rounded-[24px] border border-hair bg-card2 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-[0.28em] text-muted'>{item.label}</p>
                  <p className='mt-4 text-2xl font-semibold text-ink'>{item.value}</p>
                </div>
                <Icon className={`text-2xl ${item.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
        <section className='rounded-[32px] border border-hair bg-card2 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-ink'>Weekly focus rhythm</h2>
              <p className='mt-1 text-sm text-muted'>A simple view of your focus sessions across the last week.</p>
            </div>
            <div className='rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-purple-300'>Last 7 days</div>
          </div>
          <div className='mt-6 h-[280px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={weeklyData}>
                <CartesianGrid stroke='#ffffff12' vertical={false} />
                <XAxis dataKey='day' stroke='#94a3b8' tickLine={false} axisLine={false} />
                <YAxis stroke='#94a3b8' tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                />
                <Bar dataKey='value' fill='#8B5CF6' radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className='rounded-[32px] border border-hair bg-card2 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-ink'>Completion snapshot</h2>
              <p className='mt-1 text-sm text-muted'>Your current task completion balance.</p>
            </div>
            <FaShieldAlt className='text-purple-300' />
          </div>
          <div className='mt-6 h-[220px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie data={pieData} dataKey='value' innerRadius={60} outerRadius={84} paddingAngle={2}>
                  <Cell fill='#8B5CF6' />
                  <Cell fill='#C084FC' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className='mt-2 flex items-center justify-center gap-6 text-sm text-muted'>
            <span className='flex items-center gap-2'><span className='h-2.5 w-2.5 rounded-full bg-purple-500' /> Completed</span>
            <span className='flex items-center gap-2'><span className='h-2.5 w-2.5 rounded-full bg-fuchsia-400' /> Pending</span>
          </div>
        </section>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1fr_0.9fr]'>
        <section className='rounded-[32px] border border-hair bg-card2 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-ink'>Category breakdown</h2>
              <p className='mt-1 text-sm text-muted'>See how your work is distributed across categories.</p>
            </div>
            <FaClock className='text-purple-300' />
          </div>
          <div className='mt-6 space-y-4'>
            {chartData.length > 0 ? chartData.map((item) => (
              <div key={item.name} className='rounded-[20px] border border-hair bg-card2 p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-sm text-sub'>{item.name}</p>
                  <span className='text-sm font-semibold text-ink'>{item.total} tasks</span>
                </div>
                <div className='mt-3 h-2 rounded-full bg-hair'>
                  <div className='h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500' style={{ width: `${item.total === 0 ? 0 : Math.max(8, (item.completed / item.total) * 100)}%` }} />
                </div>
              </div>
            )) : (
              <p className='rounded-[20px] border border-dashed border-hair p-4 text-sm text-muted'>Add tasks to see your category split.</p>
            )}
          </div>
        </section>

        <section className='rounded-[32px] border border-hair bg-card2 p-6'>
          <h2 className='text-lg font-semibold text-ink'>Focus insights</h2>
          <p className='mt-1 text-sm text-muted'>A short summary of what your current pattern suggests.</p>
          <div className='mt-6 space-y-3'>
            <div className='rounded-[20px] border border-hair bg-card2 p-4 text-sm text-sub'>
              <span className='font-semibold text-ink'>Momentum:</span> your completion rate is {completionStats.percentage}% and the highest impact tasks are moving well.
            </div>
            <div className='rounded-[20px] border border-hair bg-card2 p-4 text-sm text-sub'>
              <span className='font-semibold text-ink'>Sessions:</span> {pomodoroHistory.length} focus sessions tracked so far this week.
            </div>
            <div className='rounded-[20px] border border-hair bg-card2 p-4 text-sm text-sub'>
              <span className='font-semibold text-ink'>Next step:</span> keep the streak going and use the same focus rhythm for your next deep work block.
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export default Analytics;
