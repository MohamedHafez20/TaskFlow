import { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaClock, FaFire, FaTag, FaPlay, FaPause, FaRedo, FaCog } from "react-icons/fa";
import useTaskStore from "../../store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../Ui/ToastProvider";

function TaskCard({ task, setEditingTask }) {
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updatePomodoroSession = useTaskStore((s) => s.updatePomodoroSession);
  const updateTaskPriority = useTaskStore((s) => s.updateTaskPriority);
  const { showToast } = useToast();

  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [selectedTime, setSelectedTime] = useState(25);
  const [isRunning, setIsRunning] = useState(false);

  const pomodoroOptions = [
    { label: "25 min", value: 25 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((time) => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsRunning(false);
      showToast("Pomodoro session completed", "success");
      updatePomodoroSession(task.id, (task.pomodoroSessions || 0) + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime, task.id, updatePomodoroSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPomodoro = () => {
    setPomodoroTime(selectedTime * 60);
    setIsRunning(true);
    setShowPomodoro(true);
    showToast(`Pomodoro started for ${selectedTime} minutes`, "info");
  };

  const pausePomodoro = () => {
    setIsRunning(false);
    showToast("Pomodoro paused", "info");
  };

  const resetPomodoro = () => {
    if (!isRunning && pomodoroTime === selectedTime * 60) {
      return;
    }

    setIsRunning(false);
    setPomodoroTime(selectedTime * 60);
    showToast("Pomodoro reset", "info");
  };

  // Priority colors
  const priorityColors = {
    high: "from-red-500 to-red-600",
    medium: "from-yellow-500 to-yellow-600",
    low: "from-green-500 to-green-600",
  };

  const priorityTextColors = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  const handleDelete = () => {
    deleteTask(task.id);
    showToast("Task deleted", "success");
  };

  const handleToggle = () => {
    toggleTask(task.id);
    showToast(task.completed ? "Task unmarked" : "Task completed", "success");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
      className="relative group"
    >
      <div
        className={`bg-gradient-to-br ${
          task.completed ? "from-gray-700 to-gray-800" : "from-white/10 to-white/5"
        } backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:border-purple-400/50 transition-all`}
      >
        {/* Content Grid */}
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              task.completed
                ? "bg-green-500 border-green-500"
                : "border-white/30 hover:border-green-400"
            }`}
          >
            {task.completed && <FaCheck className="text-white text-sm" />}
          </motion.button>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-lg font-semibold transition-all ${
                task.completed
                  ? "line-through text-gray-500"
                  : "text-white"
              }`}
            >
              {task.title}
            </h3>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {/* Category */}
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <FaTag className="text-blue-400 text-xs" />
                <span className="text-gray-300 capitalize">{task.category || "general"}</span>
              </div>

              {/* Priority */}
              <div
                className={`flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full`}
              >
                <FaFire className={priorityTextColors[task.priority] + " text-xs"} />
                <span className={`capitalize ${priorityTextColors[task.priority]}`}>
                  {task.priority || "medium"}
                </span>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-gray-300">
                <FaClock className="text-purple-400 text-xs" />
                <span>{task.estimatedTime || "1h"}</span>
              </div>
            </div>

            {/* Pomodoro Counter */}
            {task.pomodoroSessions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-lg w-fit"
              >
                <span className="text-2xl">🍅</span>
                <span className="text-orange-300 font-semibold">{task.pomodoroSessions}</span>
                <span className="text-xs text-orange-300">sessions</span>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Pomodoro Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPomodoro(!showPomodoro)}
              className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 transition-all"
              title="Start Pomodoro"
            >
              🍅
            </motion.button>

            {/* Edit Button */}
            {!task.completed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditingTask(task)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-all"
                title="Edit task"
              >
                <FaCog className="text-sm" />
              </motion.button>
            )}
            {task.completed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => showToast("Task completed", "info")}
                className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/40 text-gray-400 transition-all cursor-not-allowed"
                title="Cannot edit completed task"
              >
                <FaCog className="text-sm" />
              </motion.button>
            )}

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all"
              title="Delete task"
            >
              <FaTrash className="text-sm" />
            </motion.button>
          </div>
        </div>

        {/* Pomodoro Timer */}
        <AnimatePresence>
          {showPomodoro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4">
                {/* Time Selection */}
                {!isRunning && pomodoroTime === selectedTime * 60 && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-3 text-center">Choose duration:</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {pomodoroOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedTime(option.value)}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                            selectedTime === option.value
                              ? "bg-orange-500 text-white"
                              : "bg-white/10 text-gray-300 hover:bg-white/20"
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timer Display */}
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">⏱️ Pomodoro Timer</p>
                  <p className="text-3xl font-bold text-orange-300 mb-4">
                    {formatTime(pomodoroTime)}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(pomodoroTime / (selectedTime * 60)) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2 justify-center">
                    {!isRunning && pomodoroTime === selectedTime * 60 ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startPomodoro}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <FaPlay className="text-sm" />
                        Start
                      </motion.button>
                    ) : isRunning ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={pausePomodoro}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <FaPause className="text-sm" />
                        Pause
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startPomodoro}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <FaPlay className="text-sm" />
                        Resume
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetPomodoro}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <FaRedo className="text-sm" />
                      Reset
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default TaskCard;
