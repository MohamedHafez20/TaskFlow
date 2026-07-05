import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaRedoAlt, FaPlus } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSkipForward } from 'react-icons/fi';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/Ui/ToastProvider';
import useTaskStore from '../store/useTaskStore';
import useUserStore from '../store/useUserStore';
import api from '../api/axios';
import { XP_PER_LEVEL, getLevelLabel, getLevelProgress } from '../constants/gamification';

const timerModes = [
  { label: 'Pomodoro', minutes: 25, key: 'pomodoro' },
  { label: 'Short Break', minutes: 5, key: 'short' },
  { label: 'Long Break', minutes: 15, key: 'long' },
  { label: 'Set custom time', key: 'custom', minutes: 0 }
];

function Pomodoro() {
  usePageTitle('Pomodoro');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const tasks = useTaskStore((s) => s.tasks);
  const pomodoroHistory = useTaskStore((s) => s.pomodoroHistory);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completePomodoroSession = useTaskStore((s) => s.completePomodoroSession);
  const fetchPomodoroHistory = useTaskStore((s) => s.fetchPomodoroHistory);

  const location = useLocation();
  const isDeepSession = useTaskStore((s) => s.isDeepSession);
  const setIsDeepSession = useTaskStore((s) => s.setIsDeepSession);

  // Load persisted session state from sessionStorage
  const [mode, setMode] = useState(() => sessionStorage.getItem('pomodoroMode') || 'pomodoro');
  const [selectedDuration, setSelectedDuration] = useState(() => parseInt(sessionStorage.getItem('pomodoroSelectedDuration')) || 25);
  const [durationSelected, setDurationSelected] = useState(() => sessionStorage.getItem('pom odorodurationSelected') !== 'false');
  const [customMinutes, setCustomMinutes] = useState(() => parseInt(sessionStorage.getItem('pomodoroCustomMinutes')) || 25);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isRunning, setIsRunning] = useState(() => sessionStorage.getItem('pomodoroIsRunning') === 'true');
  const [taskCompletionPrompt, setTaskCompletionPrompt] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(() => sessionStorage.getItem('pomodoroActiveTaskId'));
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showDeepSessionCard, setShowDeepSessionCard] = useState(false);

  useEffect(() => {
    if (location.state?.openDeepSession) {
      setShowDeepSessionCard(true);
      // Clean location state to avoid reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Calculate remaining seconds based on elapsed time
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const savedTimestamp = sessionStorage.getItem('pomodoroSessionTimestamp');
    const savedRemaining = parseInt(sessionStorage.getItem('pomodoroRemainingSeconds')) || (25 * 60);
    const savedIsRunning = sessionStorage.getItem('pomodoroIsRunning') === 'true';
    
    if (!savedTimestamp || !savedIsRunning) return savedRemaining;

    const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
    const adjusted = Math.max(0, savedRemaining - elapsed);
    return adjusted;
  });

  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const currentTask = useMemo(() => incompleteTasks.find((t) => t.id === activeTaskId) || null, [incompleteTasks, activeTaskId]);

  const modeConfig = useMemo(() => timerModes.find((item) => item.key === mode) || timerModes[0], [mode]);
  const modeLabel = modeConfig.key === 'custom' ? 'Custom timer' : modeConfig.label;
  const isAwaitingTaskDecision = Boolean(taskCompletionPrompt);
  const isStartActionDisabled = isAwaitingTaskDecision || (!isRunning && !durationSelected);

  useEffect(() => {
    if (modeConfig.key !== 'custom') {
      setSelectedDuration(modeConfig.minutes);
      if (!isRunning) {
        setRemainingSeconds(modeConfig.minutes * 60);
      }
    } else if (!isRunning) {
      setCustomMinutes(selectedDuration);
      setRemainingSeconds(selectedDuration * 60);
    }
  }, [modeConfig.key, modeConfig.minutes, selectedDuration]);

  useEffect(() => {
    fetchPomodoroHistory();
  }, [fetchPomodoroHistory]);

  const alertAudioRef = useRef(null);
  const activeSessionIdRef = useRef(sessionStorage.getItem('pomodoroSessionId') || null);

  useEffect(() => {
    alertAudioRef.current = new Audio('/sounds/pomodoro-alert.mp3');
    alertAudioRef.current.volume = 0.75;
  }, []);

  // Save timer state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('pomodoroMode', mode);
    sessionStorage.setItem('pomodoroSelectedDuration', selectedDuration);
    sessionStorage.setItem('pomodorodurationSelected', durationSelected);
    sessionStorage.setItem('pomodoroCustomMinutes', customMinutes);
    sessionStorage.setItem('pomodoroIsRunning', isRunning);
    sessionStorage.setItem('pomodoroActiveTaskId', activeTaskId || '');
    sessionStorage.setItem('pomodoroIsDeepSession', isDeepSession);
    sessionStorage.setItem('pomodoroRemainingSeconds', remainingSeconds);
    if (isRunning) {
      sessionStorage.setItem('pomodoroSessionTimestamp', Date.now());
    }
  }, [mode, selectedDuration, durationSelected, customMinutes, isRunning, activeTaskId, isDeepSession, remainingSeconds]);

  // Save sessionId to sessionStorage
  useEffect(() => {
    if (activeSessionIdRef.current) {
      sessionStorage.setItem('pomodoroSessionId', activeSessionIdRef.current);
    }
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
            sessionStorage.removeItem('pomodoroSessionId');
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
              setTaskCompletionPrompt({ id: activeTaskId, title: task.title });
            }
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
    const completedSessions = pomodoroHistory.filter((session) => session.completed);
    const totalPomodoros = completedSessions.length;
    const totalSeconds = completedSessions.reduce((sum, session) => sum + (Number(session.duration) || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalHours = totalSeconds === 0 ? 0 : parseFloat((totalSeconds / 3600).toFixed(1));
    const deepWorkLabel = totalSeconds === 0
      ? '0.0h'
      : totalMinutes >= 60
        ? `${totalHours.toFixed(1)}h`
        : `${totalMinutes}m`;

    const totalEarnedXp = completedCount * 250 + totalPomodoros * 50;
    const levelProgress = getLevelProgress(totalEarnedXp);
    const currentLevel = levelProgress.level;
    const xpInCurrentLevel = levelProgress.xpInLevel;
    const xpProgressPercentage = totalEarnedXp === 0 ? 0 : Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);
    const rankLabel = getLevelLabel(currentLevel);

    return {
      completedCount,
      totalPomodoros,
      totalHours,
      deepWorkLabel,
      currentLevel,
      xpInCurrentLevel,
      xpProgressPercentage,
      totalEarnedXp,
      rankLabel,
    };
  }, [tasks, pomodoroHistory]);

  // إضافة تاسك حقيقية للـ Store عشان تسمع في الداشبورد فوراً
  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const taskId = Date.now().toString();
    addTask({
      id: taskId,
      title: newTaskTitle,
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    setActiveTaskId(taskId);
    setNewTaskTitle('');
    setShowAddTask(false);
    showToast('Task added to system queue', 'success');
  };

  const handleToggleTask = (taskId) => {
    const task = tasks.find((item) => item.id === taskId);

    if (task?.completed) {
      toggleTask(taskId);
      return;
    }

    if (isRunning) {
      showToast('Stop the current session before completing the task.', 'error');
      return;
    }

    toggleTask(taskId);
  };

  const handleStart = async () => {
    if (!durationSelected) {
      showToast('Choose a duration first.', 'info');
      return;
    }

    setTaskCompletionPrompt(null);
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
        duration: selectedDuration * 60,
        isDeepSession,
      });
      activeSessionIdRef.current = data._id;
      sessionStorage.setItem('pomodoroSessionId', data._id);
    } catch (err) {
      console.error("Failed to start session on backend", err);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    showToast('Paused the timer', 'info');
  };

  const handleReset = () => {
    setTaskCompletionPrompt(null);
    setIsRunning(false);
    setRemainingSeconds(selectedDuration * 60);
    sessionStorage.removeItem('pomodoroSessionTimestamp');
    showToast('Reset the timer', 'info');
  };

  const handleSkip = () => {
    setTaskCompletionPrompt(null);
    setIsRunning(false);
    sessionStorage.removeItem('pomodoroSessionTimestamp');
    showToast('Session skipped', 'info');
    if (mode === 'pomodoro') setMode('short');
    else setMode('pomodoro');
  };

  const handleSetCustomDuration = () => {
    const minutes = Number(customMinutes);
    if (Number.isNaN(minutes) || minutes <= 0 || minutes > 180) {
      showToast('Enter a valid duration between 1 and 180 minutes.', 'error');
      return;
    }
    setSelectedDuration(minutes);
    setRemainingSeconds(minutes * 60);
    setDurationSelected(true);
    setShowCustomModal(false);
    showToast(`Custom duration set to ${minutes} minutes.`, 'success');
  };

  const handleMarkTaskComplete = (taskId) => {
    updateTask(taskId, { completed: true });
    setTaskCompletionPrompt(null);
    setActiveTaskId(null);
    showToast('Task marked complete. Great work!', 'success');
  };

  const handleDismissTaskCompletion = () => {
    setTaskCompletionPrompt(null);
  };

  const handleOpenDeepSessionCard = () => {
    setShowDeepSessionCard(true);
  };

  const handleCloseDeepSessionCard = () => {
    setShowDeepSessionCard(false);
  };

  const handleToggleDeepSession = () => {
    if (isDeepSession) {
      setIsDeepSession(false);
      setShowDeepSessionCard(false);
      showToast('Deep session turned off.', 'info');
      return;
    }

    setIsDeepSession(true);
    setShowDeepSessionCard(false);
    showToast('Deep Sessions Activated', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr] p-2 antialiased font-sans text-slate-300"
    >
      <div className="flex flex-col items-center justify-between min-h-[620px] py-4">
        
        {/* Timer mode selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-inner">
            {timerModes.map((item) => (
              <button
                key={item.key}
                disabled={isAwaitingTaskDecision}
                onClick={() => {
                  const changeMode = () => {
                    setMode(item.key);
                    if (item.key === 'custom') {
                      setDurationSelected(false);
                      setShowCustomModal(true);
                    } else {
                      setDurationSelected(true);
                    }
                  };

                  if (isRunning) {
                    showToast('Stop the current session before changing mode.', 'error');
                    return;
                  }

                  changeMode();
                }}
                className={`rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-all duration-300 ${
                  mode === item.key 
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-300 bg-transparent'
                } ${isAwaitingTaskDecision ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
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
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-[5.5rem] font-bold tracking-tight text-white font-mono leading-none select-none">
              {timerLabel}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 mt-2">
              {modeLabel}
            </span>
            {currentTask && (
              <span className="text-[11px] text-slate-400 mt-2 max-w-[260px]">
                Working on: {currentTask.title}
              </span>
            )}
          </div>
        </div>

        {taskCompletionPrompt && (
          <div className="mb-5 w-full max-w-lg rounded-3xl border border-white/[0.08] bg-white/5 px-5 py-4 text-sm text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-100 flex-1 min-w-0">
               <span className="font-semibold text-white">{taskCompletionPrompt.title}</span>. Did you complete this task during the session?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkTaskComplete(taskCompletionPrompt.id)}
                  className="rounded-full bg-purple-500 px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
                >
                  Yes, completed
                </button>
                <button
                  type="button"
                  onClick={handleDismissTaskCompletion}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Not yet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Control buttons */}
        <div className="mt-2 mb-[100px] flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              disabled={isAwaitingTaskDecision}
              className={`h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg ${isAwaitingTaskDecision ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Reset Timer"
            >
              <FaRedoAlt size={14} />
            </button>
            <button
              onClick={isRunning ? handlePause : handleStart}
              disabled={isStartActionDisabled}
              className={`h-12 px-5 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-500/10 hover:opacity-95 transition-all flex items-center gap-2 justify-center ${isStartActionDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isRunning ? <><FaPause size={12} /> Pause</> : <>Start Session</>}
            </button>

          <button
            onClick={handleSkip}
            disabled={isAwaitingTaskDecision}
            className={`h-12 w-12 rounded-full bg-[#13131a] border border-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg ${isAwaitingTaskDecision ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Skip Session"
          >
            <FiSkipForward size={16} />
          </button>
          </div>

          {!durationSelected && !isRunning && (
            <p className="text-[11px] text-slate-500">Choose a duration first</p>
          )}
        </div>

      </div>

      <button
        type="button"
        onClick={handleOpenDeepSessionCard}
        className={`fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 shadow-[0_0_18px_rgba(168,85,247,0.22)] transition-all duration-500 sm:right-6 ${
          isDeepSession
            ? 'border-purple-500 bg-purple-900'
            : 'bg-[#13131a] hover:scale-105'
        }`}
      >
        {isDeepSession && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-t-2 border-purple-400"
          />
        )}
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white leading-3 text-center">
          Deep
        </span>
      </button>

      <aside className="space-y-5">
        
        {/* Chatbot CTA above progress card */}
     
          
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold ml-4">Task Flow AI</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                <span className='ml-4'>Go manage, study, plan, or ask the Task Flow AI.</span>
                <button
                  type="button"
                  onClick={() => navigate('/app/chatbot')}
                  className="text-purple-100 underline underline-offset-4 decoration-white hover:text-purple-300 transition"
                >
                  Chatbot →
                </button>
              </div>
            </div>
      
        

        {/* Daily Progress card */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-wide">Daily Progress</h3>
            <span className="text-[10px] bg-white/[0.03] border border-white/10 rounded-full px-2.5 py-1 text-purple-400 font-bold tracking-wide">
              +{userStats.totalEarnedXp} XP Today
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level {userStats.currentLevel}</span>
            <div className="h-2 w-full rounded-full bg-white/[0.05] relative overflow-hidden mt-1">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${userStats.xpProgressPercentage}%` }} />
            </div>
            <div className="flex justify-end text-[10px] text-slate-500 font-medium pt-1">
              <span>{userStats.xpInCurrentLevel} / 1000 XP</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.03]">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pomodoro Sessions</span>
              <span className="text-xl font-bold text-white tracking-tight mt-1 block">
                {userStats.totalPomodoros}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Completed focus blocks</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deep Work</span>
              <span className="text-xl font-bold text-white tracking-tight mt-1 block">{userStats.deepWorkLabel}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Estimated time from completed sessions</span>
            </div>
          </div>
        </div>

        {/* Current tasks list */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-5 border border-white/10 flex flex-col min-h-[340px]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <h3 className="text-base font-bold text-white tracking-wide">Current Tasks ({incompleteTasks.length})</h3>
            <button 
              onClick={() => setShowAddTask(!showAddTask)}
              className="h-6 w-6 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <FaPlus size={10} />
            </button>
          </div>
          {!isRunning && !currentTask && (
            <p className="text-[11px] text-slate-500 mb-4">Select a specific task to assign this Pomodoro timer.</p>
          )}

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
            {incompleteTasks.map((task) => {
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
                      onChange={() => handleToggleTask(task.id)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="cursor-pointer flex-1" onClick={() => setActiveTaskId(task.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold tracking-wide text-white">
                          {task.title}
                        </p>
                        {isSelectedForTimer && (
                          <span className="rounded-full bg-purple-500/15 text-purple-200 px-2 py-0.5 text-[10px] font-semibold">
                            {isRunning ? timerLabel : 'Selected'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-1 block uppercase tracking-wider">
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTaskId(isSelectedForTimer ? null : task.id)}
                    className={`h-6 w-6 rounded-full flex items-center justify-center transition ${
                      isSelectedForTimer ? 'bg-purple-500 text-white' : 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
                    }`}
                  >
                    <FaPlay size={7} className={isSelectedForTimer ? "" : "ml-0.5"} />
                  </button>
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

      <AnimatePresence>
        {showDeepSessionCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDeepSessionCard}
            className="fixed inset-0 z-[100] bg-black/15 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              style={{ transformOrigin: 'bottom right' }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] overflow-hidden rounded-[28px] bg-[#0d0d15]/95 backdrop-blur-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="mb-3.5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-purple-400">Deep Session</p>
                    <h2 className="mt-1.5 text-lg font-bold text-white">Focus mode that feels deeper</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseDeepSessionCard}
                    className="rounded-full py-1 text-sm text-slate-400 transition hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs leading-5 text-slate-400">
                  When you turn this on, your next focus block will be marked as a deep work session and counted in your stats, streak, and weekly progress.
                </p>

                <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Deep Session</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Enable or disable it anytime.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleDeepSession}
                      className={`relative h-6 w-12 rounded-full transition-all duration-300 ${isDeepSession ? 'bg-purple-500' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 ${isDeepSession ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 25, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 25, opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-semibold">Custom Timer</p>
                  <h2 className="mt-3 text-2xl font-bold text-white">Enter duration in minutes</h2>
                  <p className="mt-2 text-sm text-slate-400">Type the minutes you want and launch focused work instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 transition hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-8 space-y-3">
                <label className="text-sm font-semibold text-slate-300">Custom duration</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Enter minutes"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-lg font-semibold text-white outline-none transition focus:border-purple-500/40"
                />
                <p className="text-sm text-slate-500">Just type the number of minutes you want for this custom session.</p>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="rounded-2xl   px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white "
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSetCustomDuration}
                  className="rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:opacity-95"
                >
                  Confirm time
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Chat moved to standalone page — link provided in the aside. */}
    </motion.div>
  );
}

export default Pomodoro;