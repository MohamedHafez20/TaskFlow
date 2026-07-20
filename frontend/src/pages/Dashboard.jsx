import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaPlus, FaRobot, FaEllipsisH, FaTimes, 
  FaPlay, FaPause, FaEdit, FaTrash, FaInfoCircle, FaChevronRight,
  FaTrophy, FaChartLine, FaChartBar, FaClock, FaStop
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useNavigate } from 'react-router-dom';
import useTaskStore from '../store/useTaskStore';
import useUserStore from '../store/useUserStore';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/Ui/ToastProvider';
import { XP_PER_LEVEL, XP_REWARDS, getLevelProgress, getLevelLabel } from '../constants/gamification';
import { calculateProductivityScore } from '../utils/helpers';

const formatHours = (minutes) => {
  if (!minutes || minutes <= 0) return '0.0h';
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
};

function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const globalSearch = useTaskStore((s) => s.globalSearch);
  const gamificationStats = useTaskStore((s) => s.gamificationStats);
  const isDeepSession = useTaskStore((s) => s.isDeepSession);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const userName = useUserStore((s) => s.userName);
  const { showToast } = useToast();
  
  const [timeRange, setTimeRange] = useState('All Time');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
//   new state for the Pomodoro timer
  const [expandedTaskId, setExpandedTaskId] = useState(null); // open/close the task details
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null); // the task that currently has the Pomodoro timer running
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false); // whether the Pomodoro timer is running or paused
  const [customMinutes, setCustomMinutes] = useState('25');  // for the custom input field
  const activeTimerSessionIdRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  usePageTitle('Dashboard');
  const navigate = useNavigate();

  // عدّاد الثواني (Pomodoro Engine)
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert("⏱️ Pomodoro session finished! Masterfully done.");
      
      const sessionId = activeTimerSessionIdRef.current;
      if (sessionId) {
        activeTimerSessionIdRef.current = null;
        useTaskStore.getState().completePomodoroSession(sessionId).then((result) => {
          if (result.success) {
            useTaskStore.getState().fetchGamificationStats();
            useTaskStore.getState().fetchPomodoroHistory();
          } else {
            console.error("Session completion rejected:", result.message);
          }
        });
      }

      if (activeTimerTaskId) {
        const task = tasks.find(t => t.id === activeTimerTaskId);
        if (task) {
          updateTask(activeTimerTaskId, { pomodoroCompleted: (task.pomodoroCompleted || 0) + 1 });
        }
      }
      
      setActiveTimerTaskId(null);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, activeTimerTaskId, tasks, updateTask]);


  const toggleTimer = async (taskId) => {
    if (activeTimerTaskId === taskId) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerTaskId(taskId);
      setIsTimerRunning(true);

      try {
        const result = await useTaskStore.getState().startPomodoroSession({
          mode: 'focus',
          duration: timeLeft,
          isDeepSession
        });
        if (result.success && result.data) {
          activeTimerSessionIdRef.current = result.data._id;
        }
      } catch (err) {
        console.error("Failed to start pomodoro session on backend", err);
      }
    }
  };

  // decline the current Pomodoro session
  const resetTimer = () => {
    setIsTimerRunning(false);
    setActiveTimerTaskId(null);
    setTimeLeft(25 * 60);
  };

//  set the Pomodoro duration for the current task
  const setTaskDuration = (minutes) => {
    if (isTimerRunning) {
      alert("⚠️ Cannot change duration while a timer is running. Stop the current timer first!");
      return;
    }
    const mins = parseInt(minutes, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 180) {
      setTimeLeft(mins * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const userStats = useMemo(() => {
    const total = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed);
    const completedCount = completedTasks.length;
    const completedRatio = total === 0 ? 0 : completedCount / total;
    const totalEarnedXp = gamificationStats?.xp ?? 0;
    const levelProgress = getLevelProgress(totalEarnedXp);
    const currentLevel = gamificationStats?.level ?? levelProgress.level;
    const xpInCurrentLevel = gamificationStats?.xpInCurrentLevel ?? levelProgress.xpInLevel;
    const xpToNext = gamificationStats?.xpToNextLevel ?? levelProgress.xpToNext;
    const xpProgressPercentage = totalEarnedXp === 0 ? 0 : Math.min(100, (xpInCurrentLevel / XP_PER_LEVEL) * 100);
    const rankData = calculateProductivityScore(tasks);
    const xpLevelLabel = getLevelLabel(currentLevel);

    const weeklyStreak = (() => {
      if (!tasks || tasks.length === 0) return 0;
      const today = new Date();
      const toYMD = (d) => new Date(d).toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      const activityDays = new Set();

      tasks.forEach((t) => {
        if (!t.createdAt) return;
        const d = new Date(t.createdAt);
        if (d >= sevenDaysAgo && d <= today) activityDays.add(toYMD(d));
      });

      let streak = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        if (activityDays.has(toYMD(d))) streak += 1;
        else break;
      }
      return streak;
    })();

    const globalTopPercentage = total === 0 ? 0 : Math.max(1, Math.min(98, 100 - Math.round(completedRatio * 100)));

    return {
      total,
      completedCount,
      percentage: Math.round(completedRatio * 100),
      currentLevel,
      xpInCurrentLevel,
      xpProgressPercentage,
      totalEarnedXp,
      xpToNext,
      xpLevelLabel,
      rankLabel: gamificationStats?.levelName ?? rankData.levelLabel,
      weeklyStreak,
      globalTopPercentage,
      streakDays: gamificationStats?.currentStreak ?? 0,
    };
  }, [tasks, gamificationStats]);

  // حساب بيانات الـ Focus Intensity للأيام الحقيقية
  const dynamicBarData = useMemo(() => {
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const initialData = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
    
    tasks.forEach(task => {
      if (task.createdAt) {
        const date = new Date(task.createdAt);
        const dayName = daysOfWeek[date.getDay()];
        if (initialData[dayName] !== undefined) {
          initialData[dayName] += task.completed ? 35 : 15;
        }
      }
    });

    const order = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return order.map(day => ({
      day,
      value: initialData[day] === 0 ? Math.floor(Math.random() * 25) + 15 : Math.min(100, initialData[day])
    }));
  }, [tasks]);

  const filteredTasksByTime = useMemo(() => {
    const todayStr = new Date().toDateString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const query = globalSearch.trim().toLowerCase();

    return [...tasks]
      .filter((task) => {
        const matchesSearch = !query || task.title?.toLowerCase().includes(query);
        const matchesTime = (() => {
          if (timeRange === 'Today') return new Date(task.createdAt).toDateString() === todayStr;
          if (timeRange === 'This Week') return new Date(task.createdAt) >= oneWeekAgo;
          return true;
        })();

        return matchesSearch && matchesTime;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [tasks, timeRange, globalSearch]);

  // حساب ساعات التركيز بناءً على جلسات بومودورو المكتملة
  const focusMetrics = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const totalPomodorosAll = tasks.reduce((s, t) => s + (t.pomodoroCompleted || 0), 0);
    const totalHoursAll = (totalPomodorosAll * 25) / 60;

    const pomodorosThisWeek = tasks
      .filter((t) => new Date(t.createdAt) >= oneWeekAgo)
      .reduce((s, t) => s + (t.pomodoroCompleted || 0), 0);
    const hoursThisWeek = (pomodorosThisWeek * 25) / 60;

    const pomodorosPrevWeek = tasks
      .filter((t) => {
        const d = new Date(t.createdAt);
        return d >= twoWeeksAgo && d < oneWeekAgo;
      })
      .reduce((s, t) => s + (t.pomodoroCompleted || 0), 0);
    const hoursPrevWeek = (pomodorosPrevWeek * 25) / 60;

    const percentageChange = hoursPrevWeek === 0 ? (hoursThisWeek > 0 ? 100 : 0) : Math.round(((hoursThisWeek - hoursPrevWeek) / hoursPrevWeek) * 100);

    return {
      totalPomodorosAll,
      totalHoursAll,
      pomodorosThisWeek,
      hoursThisWeek,
      pomodorosPrevWeek,
      hoursPrevWeek,
      percentageChange,
    };
  }, [tasks]);

  const openCreateModal = () => {
    setIsEditing(false);
    setNewTitle('');
    setNewPriority('medium');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    if (task.completed) {
      showToast('Task already completed. Uncheck it first if you want to edit its details.', 'warning');
      return;
    }

    setIsEditing(true);
    setCurrentTaskId(task.id);
    setNewTitle(task.title);
    setNewPriority(task.priority);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (isEditing) {
      updateTask(currentTaskId, { title: newTitle, priority: newPriority });
      showToast('Task updated successfully', 'success');
    } else {
      addTask({
        id: Date.now().toString(),
        title: newTitle,
        priority: newPriority,
        completed: false,
        createdAt: new Date().toISOString(),
      });
      showToast('Task added successfully', 'success');
    }
    setShowModal(false);
  };

  const dataPie = [{ value: 92 }, { value: 8 }];
  const currentDayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

  // Pagination for Active Flow Tasks
  const totalPages = Math.max(1, Math.ceil(filteredTasksByTime.length / tasksPerPage));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * tasksPerPage;
    return filteredTasksByTime.slice(start, start + tasksPerPage);
  }, [filteredTasksByTime, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange, globalSearch]);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2 text-sub antialiased font-sans">
      
     
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
              <p className="mt-1 text-sm text-muted">Welcome back, {userName}. Your deep work streak is at {userStats.streakDays} days.</p>
            </div>
          <div className="flex items-center gap-3 relative self-start sm:self-center">
            <div className="relative">
              <button 
                onClick={() => setShowTimeDropdown(!showTimeDropdown)} 
                className="inline-flex items-center gap-2 rounded-xl bg-card/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-sub hover:bg-card transition border border-hair"
              >
                <FaCalendarAlt className="text-muted" />
                {timeRange}
              </button>
              
              {showTimeDropdown && (
                <div className="absolute right-0 mt-2 bg-card/95 backdrop-blur-md border border-hair rounded-xl py-1 w-32 shadow-xl z-50 text-xs">
                  {['Today', 'This Week', 'All Time'].map((option) => (
                    <button 
                      key={option}
                      onClick={() => { setTimeRange(option); setShowTimeDropdown(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-card text-sub"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:opacity-90"
            >
              <FaPlus />
              New Task
            </button>
          </div>
        </div>


        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl bg-hair backdrop-blur-xl p-6 border border-hair">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Current Standing</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-ink">Level {userStats.currentLevel}</span>
                  <span className="text-sm font-semibold text-purple-400">{userStats.xpLevelLabel}</span>
                </div>
               
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hair border border-hair text-purple-400">
                <FaTrophy size={16} />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-xs font-medium text-muted">
                <span>Mastery Progress</span>
                <span className="text-sub">{userStats.xpInCurrentLevel} / {XP_PER_LEVEL} XP</span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-hair">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${userStats.xpProgressPercentage}%` }} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-hair pt-5">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Current Rank</p><p className="mt-1 text-lg font-bold text-ink">{userStats.rankLabel}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Next Level</p><p className="mt-1 text-lg font-bold text-ink">{userStats.xpToNext} XP</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total XP</p><p className="mt-1 text-lg font-bold text-purple-400">{userStats.totalEarnedXp} XP</p></div>
            </div>
            <p className="mt-4 text-[11px] text-muted">This is one unified progression system based on XP from tasks and focus sessions.</p>
          </div>

          <div className="flex flex-col justify-between rounded-3xl bg-hair backdrop-blur-xl p-6 text-center border border-hair">
            <div className="flex flex-col items-center pt-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-500/20 text-purple-400"><FaRobot className="text-2xl" /></div>
              <h3 className="text-lg font-bold text-ink tracking-wide">Task Flow AI</h3>
              <p className="mt-2 px-4 text-xs leading-relaxed text-muted">Get automated schedule management, real-time insights, and personalized work advice.</p>
            </div>
            <button onClick={() => navigate('/app/chatbot')} className="mt-6 w-full rounded-xl bg-hair border border-hair py-2.5 text-xs font-semibold text-ink transition hover:bg-hair">Try Now</button>
          </div>
        </div>
      </div>

  
      <div className="grid gap-4 md:grid-cols-3">
        
         {/* Hours foucesed */}
        <div className="rounded-3xl bg-hair backdrop-blur-xl p-5 border border-hair flex flex-col justify-between h-[170px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Hours Focused</p>
            <span className="text-[10px] bg-hair border border-hair text-purple-400 rounded-md px-1.5 py-0.5 inline-flex items-center gap-1">
              <FaChartLine className="text-[9px]" /> {focusMetrics.percentageChange}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-ink tracking-tight">{formatHours((gamificationStats?.focusMinutes || 0))}</span>
            <span className="text-xs text-muted">this week</span>
          </div>
          <div className="h-10 w-full mt-2 opacity-50">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{v:20},{v:30},{v:15},{v:60},{v:45},{v:30},{v:70}]}>
                <Bar dataKey="v" fill="#c084fc" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/*DEEP SESSIONS */}
        <div 
          onClick={() => navigate('/app/pomodoro', { state: { openDeepSession: true } })}
          className="rounded-3xl bg-hair backdrop-blur-xl p-5 border border-hair flex flex-col justify-between h-[170px] cursor-pointer hover:border-purple-500/30 transition-all duration-300 hover:bg-hair group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Deep Sessions</p>
            <FaChevronRight className="text-xs text-muted group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
          <div className="my-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-ink tracking-tight">
                {gamificationStats?.deepSessions ?? 0}
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider ml-1">
                sessions
              </span>
            </div>
          </div>
          <div className="w-full">
            <div className="h-1.5 w-full rounded-full bg-hair">
              <div 
                className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500 ${isDeepSession ? 'animate-pulse' : ''}`} 
                style={{ width: isDeepSession ? '100%' : '0%' }} 
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-muted mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isDeepSession ? 'bg-purple-400 animate-ping' : 'bg-slate-600'}`} />
                Deep Session Mode
              </span>
              <span className={`${isDeepSession ? 'text-purple-400 font-bold' : 'text-muted font-bold'}`}>
                {isDeepSession ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/*FLOW EFFICIENCY */}
        <div className="rounded-3xl bg-hair backdrop-blur-xl p-5 border border-hair flex items-center justify-between h-[170px]">
          <div className="relative flex h-20 w-20 items-center justify-center flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataPie} innerRadius={28} outerRadius={36} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="#a855f7" stroke="none" />
                  <Cell fill="rgba(255,255,255,0.04)" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <span className="absolute text-xs font-black text-ink">92%</span>
          </div>
          
          <div className="flex flex-col justify-center flex-1 pl-5 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Flow Efficiency</p>
              <FaInfoCircle className="text-[10px] text-faint" />
            </div>
            <h4 className="text-xs font-bold text-ink pt-1 tracking-wide">Peak focus at 11:00 AM</h4>
            <p className="text-[10px] text-muted leading-normal">Optimal environment: Dark Theme</p>
          </div>
        </div>

      </div>
      

      {/**/}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr] items-start">
        
        {/* Active Flow Tasks */}
        <div className="rounded-3xl bg-hair backdrop-blur-xl p-6 border border-hair">
          <div className="flex items-center justify-between border-b border-hair pb-4">
            <h2 className="text-base font-bold text-ink tracking-wide">Active Flow Tasks</h2>
            <button className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1">
              View All <FaChevronRight size={8} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {paginatedTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-hair bg-black/10 p-6 text-center text-sm text-muted">
                No active tasks match your current filter yet. Create a fresh focus block to start.
              </div>
            ) : paginatedTasks.map((task) => {
              const isCurrentTimer = activeTimerTaskId === task.id;
              const isExpanded = expandedTaskId === task.id;
              
              return (
                <div key={task.id} className="flex flex-col rounded-2xl bg-hair backdrop-blur-md border border-hair overflow-hidden transition-all">
                  
                  {/* Main line*/}
                  <div className={`flex items-center justify-between p-3 ${task.completed ? 'opacity-40' : ''}`}>
                    <div className="flex items-start gap-4 flex-1">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => useTaskStore.getState().toggleTask(task.id)}
                        className="mt-1 h-4 w-4 rounded-md border-hair bg-transparent text-purple-600 focus:ring-0 cursor-pointer" 
                      />
                      <div>
                        <p className={`text-sm font-medium ${task.completed ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${task.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Timer Button */}
                      {!task.completed && (
                        <button 
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 bg-hair border transition text-xs font-mono font-bold ${isCurrentTimer && isTimerRunning ? 'border-purple-500/40 text-purple-400 animate-pulse' : 'border-hair text-muted hover:bg-hair'}`}
                        >
                          <FaClock size={11} className={isCurrentTimer && isTimerRunning ? 'animate-spin' : ''} />
                          {isCurrentTimer ? formatTime(timeLeft) : "Set Timer"}
                        </button>
                      )}

                      <div className="flex items-center gap-1 border-l border-hair pl-2">
                        <button
                          onClick={() => openEditModal(task)}
                          disabled={task.completed}
                          title={task.completed ? 'Completed task — uncheck to edit' : 'Edit task'}
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-muted transition ${task.completed ? 'cursor-not-allowed opacity-40' : 'hover:bg-hair hover:text-purple-400'} `}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted hover:bg-red-500/10 hover:text-red-400 transition">
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* timer for every task (in buttom)*/}
                  <AnimatePresence>
                    {isExpanded && !task.completed && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20 border-t border-hair px-4 py-2.5 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {/* Constant Numbers */}
                          <div className="flex items-center gap-1.5">
                            {[15, 20, 30, 60].map((mins) => (
                              <button
                                key={mins}
                                disabled={isTimerRunning}
                                onClick={() => setTaskDuration(mins)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${isTimerRunning ? 'opacity-30 cursor-not-allowed border-hair bg-transparent text-faint' : 'border-hair bg-hair text-muted hover:border-purple-500/30 hover:text-ink'}`}
                              >
                                {mins}m
                              </button>
                            ))}
                          </div>

                          {/* inpu t(Manually) */}
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number"
                              disabled={isTimerRunning}
                              value={customMinutes}
                              onChange={(e) => setCustomMinutes(e.target.value)}
                              placeholder="Min"
                              className="w-12 text-center bg-hair border border-hair rounded-lg py-0.5 text-xs text-ink outline-none focus:border-purple-500/40 disabled:opacity-40"
                            />
                            <button
                              disabled={isTimerRunning}
                              onClick={() => setTaskDuration(customMinutes)}
                              className="px-2 py-1 text-[10px] font-bold bg-hair hover:bg-hair text-sub rounded-lg transition disabled:opacity-30"
                            >
                              Apply
                            </button>
                          </div>

                          {/* (Play / Pause / Stop) */}
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm font-mono font-bold text-ink mr-1">
                              {isCurrentTimer ? formatTime(timeLeft) : "Ready"}
                            </span>
                            <button
                              onClick={() => toggleTimer(task.id)}
                              className={`h-7 px-3 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold transition ${isCurrentTimer && isTimerRunning ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'}`}
                            >
                              {isCurrentTimer && isTimerRunning ? (
                                <>
                                  <FaPause size={8} /> Pause
                                </>
                              ) : (
                                <>
                                  <FaPlay size={8} /> Start
                                </>
                              )}
                            </button>

                           {/* decline  */}
                            {isCurrentTimer && (
                              <button
                                onClick={resetTimer}
                                className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition"
                                title="Cancel Timer"
                              >
                                <FaStop size={8} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-hair pt-4">
              <div className="text-xs font-semibold text-muted">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-hair bg-hair text-sub hover:bg-hair disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-hair bg-hair text-sub hover:bg-hair disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/*  FOCUS INTENSITY */}
        <div className="rounded-3xl bg-hair backdrop-blur-xl p-6 border border-hair flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Focus Intensity</h3>
              <div className="flex items-center gap-2 text-muted text-xs">
                <FaChartLine size={11} />
                <FaChartBar size={11} />
              </div>
            </div>
            
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicBarData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={14}>
                    {dynamicBarData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.day === currentDayName || entry.day === 'FRI' ? '#c084fc' : 'rgba(192, 132, 252, 0.35)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-[11px] border-t border-hair pt-4 font-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#a855f7]" />
                <span className="text-muted">Deep Focus</span>
              </div>
              <span className="font-bold text-ink tracking-wide">72%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#64748b]" />
                <span className="text-muted">Maintenance</span>
              </div>
              <span className="font-bold text-ink tracking-wide">18%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#334155]" />
                <span className="text-muted">Misc</span>
              </div>
              <span className="font-bold text-ink tracking-wide">10%</span>
            </div>
          </div>
        </div>

      </div>

      {/*mode */}
      <AnimatePresence>
        {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
  <motion.div
    initial={{ opacity: 0, scale: 0.92, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.92, y: 20 }}
    transition={{ duration: 0.25 }}
    className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-card/95 shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl"
  >
    {/* Glow */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-transparent blur-3xl" />

    {/* Close Button */}
    <button
      onClick={() => setShowModal(false)}
      className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted transition-all duration-300 hover:bg-white/10 cursor-pointer hover:text-white"
    >
      <FaTimes className="text-lg" />
    </button>

    <div className="relative p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        {/* Icon (Transparent Background) */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">
            {isEditing ? "Modify Active Task" : "Launch New Task"}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {isEditing ? "Update your task details below." : "Organize your workflow with a new task."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Name */}
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
            Task Name
          </label>
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What are you focusing on today?"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-faint focus:border-purple-500 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(168,85,247,.15)]"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
            Priority Level
          </label>
          <div className="relative">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 pr-14 text-sm font-medium text-white outline-none backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 focus:border-purple-500 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(168,85,247,.15)] cursor-pointer"
            >
              <option className="bg-[#18181b] text-white" value="low">🟢 Low Priority</option>
              <option className="bg-[#18181b] text-white" value="medium">🟡 Medium Priority</option>
              <option className="bg-[#18181b] text-white" value="high">🔴 High Priority</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 py-4 text-sm font-bold tracking-wide text-white shadow-xl shadow-purple-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]"
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100"></span>
          <span className="relative z-10">
            {isEditing ? "Save Modifications" : "+ Add to Flow Queue"}
          </span>
        </button>
      </form>
    </div>
  </motion.div>
</div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default Dashboard;