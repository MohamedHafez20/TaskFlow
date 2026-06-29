import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaRedoAlt, FaPlus } from 'react-icons/fa';
import { FiSkipForward } from 'react-icons/fi';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/Ui/ToastProvider';
import useTaskStore from '../store/useTaskStore';
import useUserStore from '../store/useUserStore';
import api from '../api/axios';

const timerModes = [
  { label: 'Pomodoro', minutes: 25, key: 'pomodoro' },
  { label: 'Short Break', minutes: 5, key: 'short' },
  { label: 'Long Break', minutes: 15, key: 'long' },
];

function Pomodoro() {
  usePageTitle('Timer');
  const { showToast } = useToast();

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completePomodoroSession = useTaskStore((s) => s.completePomodoroSession);

  const [mode, setMode] = useState('pomodoro');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // لربط التايمر بتاسك معينة لو المستخدم حب يشغل تايمر لتاسك محددة
  const [activeTaskId, setActiveTaskId] = useState(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  const modeConfig = useMemo(() => timerModes.find((item) => item.key === mode) || timerModes[0], [mode]);

  useEffect(() => {
    setSelectedDuration(modeConfig.minutes);
  }, [modeConfig]);

  useEffect(() => {
    if (!isRunning) {
      setRemainingSeconds(selectedDuration * 60);
    }
  }, [selectedDuration, isRunning]);

  const alertAudioRef = useRef(null);
  const activeSessionIdRef = useRef(null);

  useEffect(() => {
    alertAudioRef.current = new Audio('/sounds/pomodoro-alert.mp3');
    alertAudioRef.current.volume = 0.75;
  }, []);

  const fallbackBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, context.currentTime);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);

      setTimeout(() => context.close(), 700);
    } catch (error) {
      console.warn('Unable to play fallback sound', error);
    }
  }, []);

  const playAlert = useCallback(() => {
    const audio = alertAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => fallbackBeep());
    } else {
      fallbackBeep();
    }
  }, [fallbackBeep]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playAlert();
          
          if (activeSessionIdRef.current) {
            const sessionId = activeSessionIdRef.current;
            activeSessionIdRef.current = null;
            completePomodoroSession(sessionId).then((result) => {
              if (!result.success) {
                console.error('Session completion rejected:', result.message);
              }
            });
          }

          if (activeTaskId) {
            const task = tasks.find(t => t.id === activeTaskId);
            if (task) {
              updateTask(activeTaskId, { pomodoroCompleted: (task.pomodoroCompleted || 0) + 1 });
            }
            setActiveTaskId(null);
          }
          showToast('Session finished! Great job.', 'success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, playAlert, showToast, activeTaskId, tasks, updateTask]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timerLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const totalSeconds = selectedDuration * 60;
  const strokeRadius = 135;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference * (1 - remainingSeconds / totalSeconds);

  // Calculate XP and Level dynamically from store data
  const userStats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed);
    const completedCount = completedTasks.length;
    
    const totalEarnedXp = completedCount * 500; 
    const currentLevel = 24 + Math.floor(totalEarnedXp / 1000); // يبدأ من ليفل 24 الموضح في الصورة
    const xpInCurrentLevel = 2450 + (totalEarnedXp % 1000);
    const xpProgressPercentage = (Math.min(xpInCurrentLevel, 3000) / 3000) * 100;

    return {
      completedCount,
      currentLevel,
      xpInCurrentLevel: xpInCurrentLevel > 3000 ? xpInCurrentLevel % 3000 : xpInCurrentLevel,
      xpProgressPercentage,
      totalEarnedXp
    };
  }, [tasks]);

  // إضافة تاسك حقيقية للـ Store عشان تسمع في الداشبورد فوراً
  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    setNewTaskTitle('');
    setShowAddTask(false);
    showToast('Task added to system queue', 'success');
  };

  const handleStart = async () => {
    setIsRunning(true);
    showToast('Started a Pomodoro session', 'success');

    try {
      const modeMap = {
        pomodoro: 'focus',
        short: 'short-break',
        long: 'long-break'
      };
      const { data } = await api.post('/pomodoro/start', {
        mode: modeMap[mode] || 'focus',
        duration: selectedDuration * 60
      });
      activeSessionIdRef.current = data._id;
    } catch (err) {
      console.error("Failed to start session on backend", err);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    showToast('Paused the timer', 'info');
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(selectedDuration * 60);
    showToast('Reset the timer', 'info');
  };

  const handleSkip = () => {
    setIsRunning(false);
    showToast('Session skipped', 'info');
    if (mode === 'pomodoro') setMode('short');
    else setMode('pomodoro');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr] p-2 antialiased font-sans text-slate-300"
    >
      <div className="flex flex-col items-center justify-between min-h-[620px] py-4">
        
        {/* Timer mode selector */}
        <div className="inline-flex items-center gap-1 bg-[#13131a] border border-white/[0.04] p-1.5 rounded-full shadow-inner">
          {timerModes.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (isRunning) {
                  if (confirm("Stop current session to change mode?")) {
                    setIsRunning(false);
                    setMode(item.key);
                  }
                } else {
                  setMode(item.key);
                }
              }}
              className={`rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-all duration-300 ${
                mode === item.key 
                  ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-300 bg-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Central circular timer */}
        <div className="relative flex items-center justify-center my-auto">
          <svg viewBox="0 0 300 300" className="h-[340px] w-[340px] drop-shadow-[0_0_30px_rgba(168,85,247,0.06)]">
            <circle cx="150" cy="150" r={strokeRadius} className="fill-none stroke-white/[0.03] stroke-[6]" />
            <circle
              cx="150"
              cy="150"
              r={strokeRadius}
              className="fill-none stroke-purple-500 stroke-[6] stroke-linecap-round transition-all duration-300"
              style={{
                strokeDasharray: strokeCircumference,
                strokeDashoffset: strokeDashoffset,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[5.5rem] font-bold tracking-tight text-white font-mono leading-none select-none">
              {timerLabel}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 mt-2">
              Focus Session
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-5">
          <button
            onClick={handleReset}
            className="h-12 w-12 rounded-full bg-[#13131a] border border-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg"
            title="Reset Timer"
          >
            <FaRedoAlt size={14} />
          </button>

          <button
            onClick={isRunning ? handlePause : handleStart}
            className="h-14 px-10 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-purple-500/10 hover:opacity-95 transition-all flex items-center gap-2.5 min-w-[180px] justify-center"
          >
            {isRunning ? <><FaPause size={12} /> Pause Session</> : <>Start Session</>}
          </button>

          <button
            onClick={handleSkip}
            className="h-12 w-12 rounded-full bg-[#13131a] border border-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg"
            title="Skip Session"
          >
            <FiSkipForward size={16} />
          </button>
        </div>

      </div>

      <aside className="space-y-5">
        
        {/* Daily Progress card */}
        <div className="rounded-3xl bg-[#13131a] p-5 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-wide">Daily Progress</h3>
            <span className="text-[10px] bg-white/[0.03] border border-white/10 rounded-full px-2.5 py-1 text-purple-400 font-bold tracking-wide">
              +{userStats.totalEarnedXp > 0 ? userStats.totalEarnedXp : 450} XP Today
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level {userStats.currentLevel}</span>
            <div className="h-2 w-full rounded-full bg-white/[0.05] relative overflow-hidden mt-1">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${userStats.xpProgressPercentage}%` }} />
            </div>
            <div className="flex justify-end text-[10px] text-slate-500 font-medium pt-1">
              <span>{userStats.xpInCurrentLevel} / 3000 XP</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.03]">
            <div className="bg-[#161622]/40 rounded-2xl p-3 border border-white/[0.02]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sessions</span>
              <span className="text-xl font-bold text-white tracking-tight mt-1 block">
                {String(userStats.completedCount + 6).padStart(2, '0')}<span className="text-xs text-slate-500 font-medium">/10</span>
              </span>
            </div>
            <div className="bg-[#161622]/40 rounded-2xl p-3 border border-white/[0.02]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deep Work</span>
              <span className="text-xl font-bold text-white tracking-tight mt-1 block">{(2.5 + userStats.completedCount * 0.5).toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* Current tasks list */}
        <div className="rounded-3xl bg-[#13131a] p-5 border border-white/[0.04] flex flex-col min-h-[340px]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
            <h3 className="text-base font-bold text-white tracking-wide">Current Tasks ({tasks.length})</h3>
            <button 
              onClick={() => setShowAddTask(!showAddTask)}
              className="h-6 w-6 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <FaPlus size={10} />
            </button>
          </div>

          {/* Add task form */}
          <AnimatePresence>
            {showAddTask && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddNewTask}
                className="mb-4 bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-2.5 overflow-hidden"
              >
                <input 
                  type="text" 
                  required 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..." 
                  className="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50" 
                />
                <div className="flex justify-between items-center">
                  <select 
                    value={newTaskPriority} 
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="bg-[#111118] border border-white/10 rounded-lg text-[10px] text-slate-300 px-2 py-1 outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button type="submit" className="px-3 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:opacity-90">
                    Add Task
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Task list rendering */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] pr-1 scrollbar-thin">
            {tasks.map((task) => {
              const isSelectedForTimer = activeTaskId === task.id;
              return (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                    isSelectedForTimer ? 'bg-purple-950/20 border-purple-500/30' : 'bg-[#161622]/30 border-white/[0.02]'
                  } ${task.completed ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="cursor-pointer flex-1" onClick={() => !task.completed && setActiveTaskId(task.id)}>
                      <p className={`text-xs font-semibold tracking-wide ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium mt-1 block uppercase tracking-wider">
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>

                  {!task.completed && (
                    <button 
                      onClick={() => setActiveTaskId(isSelectedForTimer ? null : task.id)}
                      className={`h-6 w-6 rounded-full flex items-center justify-center transition ${
                        isSelectedForTimer ? 'bg-purple-500 text-white' : 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
                      }`}
                    >
                      <FaPlay size={7} className={isSelectedForTimer ? "" : "ml-0.5"} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* View all tasks footer */}
          <button className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-300 transition mt-4 pt-3 border-t border-white/[0.03]">
            View All Active Tasks
          </button>
        </div>

      </aside>
    </motion.div>
  );
}

export default Pomodoro;