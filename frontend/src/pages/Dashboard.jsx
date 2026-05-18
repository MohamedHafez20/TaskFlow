// 📊 Dashboard Page — كمال's task
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, Circle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';

const priorityColor = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' };
const statusColor   = { done: 'bg-green-500/20 text-green-400', 'in-progress': 'bg-yellow-500/20 text-yellow-400', todo: 'bg-slate-500/20 text-slate-400' };

export default function Dashboard() {
  const { user } = useAuthStore();
  const { tasks, stats, loading, fetchTasks, fetchStats, createTask, updateTask, deleteTask } = useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '' });

  useEffect(() => { fetchTasks(); fetchStats(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    const res = await createTask(form);
    if (res.success) { toast.success('Task created!'); setShowForm(false); setForm({ title: '', description: '', priority: 'medium', deadline: '' }); fetchStats(); }
    else toast.error(res.message);
  };

  const handleStatus = async (id, status) => {
    await updateTask(id, { status });
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    const res = await deleteTask(id);
    if (res.success) { toast.success('Deleted'); fetchStats(); }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Good day, {user?.name} 👋</h1>
          <p className="text-slate-400 mt-1">Here's what's on your plate</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',       value: stats.total,      icon: Circle,      color: 'text-blue-400'   },
          { label: 'Todo',        value: stats.todo,       icon: Circle,      color: 'text-slate-400'  },
          { label: 'In Progress', value: stats.inProgress, icon: Clock,       color: 'text-yellow-400' },
          { label: 'Done',        value: stats.done,       icon: CheckCircle, color: 'text-green-400'  },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="text-white font-semibold mb-4">Create New Task</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title *" className="col-span-2 bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)" className="col-span-2 bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500" />
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Create</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tasks list */}
      <div className="space-y-3">
        {loading && <p className="text-slate-400 text-center py-8">Loading tasks...</p>}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No tasks yet</p>
            <p className="text-slate-600 text-sm mt-1">Click "New Task" to get started</p>
          </div>
        )}
        {tasks.map((task) => (
          <motion.div key={task._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800 rounded-xl px-5 py-4 border border-slate-700 flex items-center gap-4">
            <div className="flex-1">
              <p className={`font-medium text-white ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
              {task.description && <p className="text-slate-400 text-sm mt-0.5">{task.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-medium ${priorityColor[task.priority]}`}>{task.priority} priority</span>
                {task.deadline && <span className="text-xs text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
            <select value={task.status} onChange={(e) => handleStatus(task._id, e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-full border-0 font-medium cursor-pointer ${statusColor[task.status]}`}>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button onClick={() => handleDelete(task._id)} className="text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
