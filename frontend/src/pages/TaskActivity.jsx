import { motion } from 'framer-motion';
import { useMemo, useState, useEffect, useTransition } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTasks, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import useTaskStore from '../store/useTaskStore';
import usePageTitle from '../hooks/usePageTitle';

const calculateDuration = (created, completed) => {
  if (!created || !completed) return '—';
  const diffMs = new Date(completed).getTime() - new Date(created).getTime();
  if (diffMs <= 0) return '0m';
  
  const diffMins = Math.round(diffMs / (1000 * 60));
  if (diffMins < 60) {
    return `${diffMins}m`;
  }
  const diffHours = diffMs / (1000 * 60 * 60);
  return `${diffHours.toFixed(1)}h`;
};

function TaskActivity() {
  const tasks = useTaskStore((s) => s.tasks);
  usePageTitle('Task Activity');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const tasksPerPage = 6;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalPomodoros = tasks.reduce((count, task) => count + (task.pomodoroSessions || 0), 0);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      return !query || task.title?.toLowerCase().includes(query);
    });
  }, [tasks, searchQuery]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'oldest' ? aDate - bDate : bDate - aDate;
    });
  }, [filteredTasks, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / tasksPerPage));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * tasksPerPage;
    return sortedTasks.slice(start, start + tasksPerPage);
  }, [sortedTasks, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-2 text-sub antialiased font-sans"
    >
      <div className="rounded-3xl border border-hair bg-card/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Profile Sidebar</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Task activity & timing</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">Review every task with creation, completion, and Pomodoro session details in one place.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-hair bg-card px-4 py-3 text-center">
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted">Total tasks</p>
              <p className="mt-2 text-2xl font-bold text-ink">{totalTasks}</p>
            </div>
            <div className="rounded-3xl border border-hair bg-card px-4 py-3 text-center">
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted">Completed</p>
              <p className="mt-2 text-2xl font-bold text-ink">{completedTasks}</p>
            </div>
            <div className="rounded-3xl border border-hair bg-card px-4 py-3 text-center">
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted">Pomodoro sessions</p>
              <p className="mt-2 text-2xl font-bold text-ink">{totalPomodoros}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-hair bg-card/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="space-y-4 border-b border-hair pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Recent task activity</h2>
              <p className="text-sm text-muted">Filter, sort and page through your latest task work.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300">
              <FaTasks /> Updated in real time
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-center">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                placeholder="Search tasks by title..."
                className="w-full rounded-2xl border border-hair bg-card/95 px-4 py-3 text-sm text-ink outline-none focus:border-purple-500/50 focus:ring-0"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-muted">Search within all tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="rounded-2xl px-4 py-3 text-xs font-semibold transition bg-card/95 border border-hair text-ink hover:bg-card"
                title={`Switch to ${sortOrder === 'newest' ? 'Oldest' : 'Newest'} order`}
              >
                {sortOrder === 'newest' ? (
                  <>
                    <FaSortAmountUp className="inline mr-2" /> Newest
                  </>
                ) : (
                  <>
                    <FaSortAmountDown className="inline mr-2" /> Oldest
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {sortedTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-hair p-10 text-center text-sm text-muted">No tasks found. Adjust search or add a task to populate the activity feed.</div>
          ) : (
            <table className="w-full min-w-[900px] table-auto text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedTasks.map((task) => (
                  <tr key={task.id} className="bg-card/90">
                    <td className="px-4 py-4 align-top max-w-[420px] break-words">
                      <div className="font-semibold text-ink break-words text-sm sm:text-base">{task.title}</div>
                      <div className="mt-1 text-sm text-muted break-words">{task.description || '—'}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-muted">{task.category || 'General'}</td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase ${task.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : task.priority === 'medium' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{task.priority || 'medium'}</span>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-ink">{task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}</td>
                    <td className="px-4 py-4 align-top text-sm text-ink">{task.completed ? (task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Not recorded') : 'Pending'}</td>
                    <td className="px-4 py-4 align-top text-sm text-muted">{calculateDuration(task.createdAt, task.completedAt)}</td>
                    {/* Actions removed per design — task activity is read-only */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted">
          <span>{sortedTasks.length} task{sortedTasks.length === 1 ? '' : 's'} found</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-2xl border border-hair bg-hair px-3 py-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-2xl border border-hair bg-hair px-3 py-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default TaskActivity;
