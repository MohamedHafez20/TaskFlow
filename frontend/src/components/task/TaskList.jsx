import TaskCard from './TaskCard';
import useTaskStore from '../../store/useTaskStore';
import { motion } from 'framer-motion';

function TaskList({ tasks = null, setEditingTask }) {
  const storeTasks = useTaskStore((s) => s.tasks);
  const taskList = tasks || storeTasks;

  if (taskList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='rounded-[32px] border border-hair bg-card2 p-10 text-center text-muted'
      >
        <p className='text-lg'>🚀 No tasks yet.</p>
        <p className='text-sm mt-2'>Add a task to fill your focus dashboard.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='grid gap-4'
    >
      {taskList.map((task) => (
        <TaskCard key={task.id} task={task} setEditingTask={setEditingTask} />
      ))}
    </motion.div>
  );
}

export default TaskList;
