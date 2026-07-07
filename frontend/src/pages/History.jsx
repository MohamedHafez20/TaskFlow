import { motion, AnimatePresence } from 'framer-motion';
import useTaskStore from '../store/useTaskStore';
import { FaCheckCircle, FaTrophy, FaRocket, FaHistory, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { useMemo, useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';

function History() {
  const tasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  const completionStats = useMemo(() => {
    const total = tasks.length;
    const completed = completedTasks.length;
    return { total, completed, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [tasks, completedTasks]);

  const totalPages = Math.max(1, Math.ceil(tasks.length / tasksPerPage));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * tasksPerPage;
    return tasks.slice(start, start + tasksPerPage);
  }, [tasks, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const openEditModal = (task) => {
    setCurrentTaskId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(currentTaskId, { title: editTitle, priority: editPriority });
      setShowEditModal(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Delete this task?')) {
      deleteTask(taskId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6'
    >
      <section className='rounded-[32px] border border-hair bg-hair backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-[11px] font-black uppercase tracking-[0.3em] text-muted'>History</p>
            <h1 className='mt-3 text-3xl font-semibold text-ink'>Achievement timeline</h1>
            <p className='mt-2 max-w-2xl text-sm text-muted'>Review completed work, milestones, and your productivity rhythm in a clean timeline view.</p>
          </div>
          <div className='rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-muted'>Completed</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-300'>{completedTasks.length}</p>
          </div>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-[24px] border border-hair bg-hair backdrop-blur-md p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-muted'>Completion rate</p>
            <FaCheckCircle className='text-emerald-300' />
          </div>
          <p className='mt-4 text-2xl font-semibold text-ink'>{completionStats.percentage}%</p>
          <p className='mt-2 text-sm text-muted'>Overall task success over time.</p>
        </div>
        <div className='rounded-[24px] border border-hair bg-hair backdrop-blur-md p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-muted'>Milestones</p>
            <FaTrophy className='text-purple-300' />
          </div>
          <p className='mt-4 text-2xl font-semibold text-ink'>{Math.min(10, completedTasks.length)}</p>
          <p className='mt-2 text-sm text-muted'>Recent goals reached.</p>
        </div>
        <div className='rounded-[24px] border border-hair bg-hair backdrop-blur-md p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-black uppercase tracking-[0.28em] text-muted'>Momentum</p>
            <FaRocket className='text-[var(--c-accent)]' />
          </div>
          <p className='mt-4 text-2xl font-semibold text-ink'>{Math.round(completionStats.percentage / 10)}/10</p>
          <p className='mt-2 text-sm text-muted'>Your current productivity momentum.</p>
        </div>
      </div>

      <section className='rounded-[32px] border border-hair bg-hair backdrop-blur-xl p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-ink'>Achievements by category</h2>
            <p className='mt-1 text-sm text-muted'>See how your completed work is distributed.</p>
          </div>
          <FaHistory className='text-purple-300' />
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {Object.entries(tasksByCategory).length > 0 ? (
            Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
              const completed = categoryTasks.filter((t) => t.completed).length;
              return (
                <div key={category} className='rounded-[20px] border border-hair bg-hair backdrop-blur-md p-4'>
                  <p className='text-[10px] font-black uppercase tracking-[0.28em] text-muted'>{category}</p>
                  <p className='mt-3 text-2xl font-semibold text-ink'>{completed}/{categoryTasks.length}</p>
                  <p className='mt-2 text-sm text-muted'>{Math.round((completed / categoryTasks.length) * 100)}% complete</p>
                </div>
              );
            })
          ) : (
            <div className='col-span-full rounded-[20px] border border-dashed border-hair p-8 text-center text-sm text-muted'>No tasks yet. Add a task to populate history.</div>
          )}
        </div>
      </section>

      <section className='rounded-3xl bg-hair backdrop-blur-xl p-6 border border-hair'>
        <div className='flex items-center justify-between border-b border-hair pb-4'>
          <h2 className='text-base font-bold text-ink tracking-wide'>All Tasks</h2>
          <button className='text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1'>
            {tasks.length} total
          </button>
        </div>

        <div className='mt-4 space-y-3'>
          {tasks.length > 0 ? (
            paginatedTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              return (
                <div key={task.id} className='flex flex-col rounded-2xl bg-hair backdrop-blur-md border border-hair overflow-hidden transition-all'>
                  
                  {/* السطر الأساسي للتاسك */}
                  <div className={`flex items-center justify-between p-4 ${task.completed ? 'opacity-40' : ''}`}>
                    <div className='flex items-start gap-4 flex-1'>
                      <input 
                        type='checkbox' 
                        checked={task.completed} 
                        onChange={() => updateTask(task.id, { completed: !task.completed })}
                        className='mt-1 h-4 w-4 rounded-md border-hair bg-transparent text-purple-600 focus:ring-0 cursor-pointer' 
                      />
                      <div>
                        <p className={`text-sm font-medium ${task.completed ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</p>
                        <div className='mt-2 flex items-center gap-3'>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${task.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : task.priority === 'medium' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                            {task.priority || 'medium'} Priority
                          </span>
                          {task.dueDate && <span className='text-[10px] text-muted'>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-1 border-l border-hair pl-2'>
                      <button onClick={() => openEditModal(task)} className='h-7 w-7 rounded-lg flex items-center justify-center text-muted hover:bg-hair hover:text-purple-400 transition'>
                        <FaEdit size={12} />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className='h-7 w-7 rounded-lg flex items-center justify-center text-muted hover:bg-red-500/10 hover:text-red-400 transition'>
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className='rounded-[20px] border border-dashed border-hair p-10 text-center text-sm text-muted'>No tasks yet. Add work to populate history.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between border-t border-hair pt-4'>
            <div className='text-xs font-semibold text-muted'>
              Page {currentPage} of {totalPages}
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-hair bg-hair text-sub hover:bg-hair disabled:opacity-40 disabled:cursor-not-allowed transition'
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-hair bg-hair text-sub hover:bg-hair disabled:opacity-40 disabled:cursor-not-allowed transition'
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className='w-96 rounded-2xl bg-hair backdrop-blur-xl border border-hair p-6 shadow-xl'
          >
            <h3 className='text-lg font-bold text-ink'>Edit Task</h3>
            <div className='mt-4 space-y-4'>
              <div>
                <label className='block text-xs font-bold text-muted mb-2'>Title</label>
                <input 
                  type='text'
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg border border-hair bg-hair text-ink text-sm focus:border-purple-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-muted mb-2'>Priority</label>
                <select 
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg border border-hair bg-hair text-ink text-sm focus:border-purple-500 outline-none'
                >
                  <option value='low'>Low</option>
                  <option value='medium'>Medium</option>
                  <option value='high'>High</option>
                </select>
              </div>
              <div className='flex gap-2 pt-4'>
                <button 
                  onClick={handleSaveEdit}
                  className='flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-bold hover:opacity-90'
                >
                  Save
                </button>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className='flex-1 px-4 py-2 rounded-lg border border-hair text-sub text-xs font-bold hover:bg-hair'
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default History;
