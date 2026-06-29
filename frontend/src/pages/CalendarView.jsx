import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTaskStore from "../store/useTaskStore";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import usePageTitle from "../hooks/usePageTitle";

function CalendarView() {
  usePageTitle("Calendar");
  const tasks = useTaskStore((s) => s.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // جعل اليوم الحالي هو المختار تلقائياً بدلاً من ترك الكارد فارغاً بشكل غير مريح
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // حسابات أيام الشهر
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysArray = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  // فلترة المهام لليوم المحدد
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateString = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDate
    ).toDateString();
    return tasks.filter(
      (t) => new Date(t.createdAt).toDateString() === dateString
    );
  }, [selectedDate, currentDate, tasks]);

  const getTaskStatsForDay = (day) => {
    if (!day) return { total: 0, completed: 0 };
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toDateString();
    const dayTasks = tasks.filter((t) => new Date(t.createdAt).toDateString() === dateString);
    
    return {
      total: dayTasks.length,
      completed: dayTasks.filter((t) => t.completed).length,
    };
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 md:p-6 antialiased font-sans text-slate-300 min-h-screen"
    >
      {/* 🚀 الهيدر العلوي الاحترافي الموحد للـ Layout */}
      <div className="flex items-center gap-3.5 mb-8 px-2">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          <FaCalendarAlt className="text-lg" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-wide">Calendar Schedule</h1>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
            Track and oversee your production line by date
          </p>
        </div>
      </div>

      {/* الـ Grid الأساسي المتجاوب كلياً */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6 items-start">
        
        {/* سكشن النتيجة الأيسر */}
        <div className="rounded-3xl bg-[#13131a] border border-white/[0.04] p-5 md:p-7 shadow-xl">
          
          {/* التحكم في الشهور */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.03]">
            <h2 className="text-base font-black text-white tracking-wide font-mono">
              {monthNames[currentDate.getMonth()].toUpperCase()} {currentDate.getFullYear()}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <FaChevronLeft size={11} />
              </button>
              <button
                onClick={nextMonth}
                className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>

          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {dayNames.map((day) => (
              <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysArray.map((day, index) => {
              const { total, completed } = getTaskStatsForDay(day);
              const isSelected = selectedDate === day && day !== null;
              const pending = total - completed;

              return (
                <button
                  key={index}
                  disabled={day === null}
                  onClick={() => day !== null && setSelectedDate(day)}
                  className={`aspect-square rounded-2xl font-mono text-sm font-bold flex flex-col items-center justify-between p-2.5 relative transition-all duration-200 select-none ${
                    day === null
                      ? "opacity-0 pointer-events-none"
                      : isSelected
                      ? "bg-purple-600 text-white border border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.25)] z-10"
                      : total > 0
                      ? "bg-[#181824]/60 border border-purple-500/20 text-purple-300 hover:bg-[#1c1c2b] hover:border-purple-500/40"
                      : "bg-[#161622]/20 border border-white/[0.02] text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                  }`}
                >
                  {day !== null && (
                    <>
                      <span className={`self-start ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {String(day).padStart(2, '0')}
                      </span>
                      
                      {/* خطوط مؤشرات الإنجاز المودرن أسفل مربع اليوم */}
                      {total > 0 && (
                        <div className="w-full flex gap-1 h-1 mt-auto rounded-full overflow-hidden opacity-95">
                          {completed > 0 && (
                            <div className="h-full bg-emerald-400 flex-1 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.4)]" title="Completed Tasks" />
                          )}
                          {pending > 0 && (
                            <div className="h-full bg-amber-400 flex-1 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.4)]" title="Pending Tasks" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* الفوتر الإرشادي (Legend) مدمج بشكل فخم */}
          <div className="mt-6 pt-5 border-t border-white/[0.03] flex items-center gap-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-4 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
              <span>Completed Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-4 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
              <span>Pending Queue</span>
            </div>
          </div>

        </div>

        {/* سكشن عرض تفاصيل المهام الأيمن */}
        <div className="rounded-3xl bg-[#13131a] border border-white/[0.04] p-5 md:p-6 lg:sticky lg:top-6 shadow-xl flex flex-col min-h-[420px]">
          <div className="border-b border-white/[0.03] pb-4 mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Selected Focus Day</span>
            <h3 className="text-sm font-black text-white mt-1 tracking-wide font-mono">
              {selectedDate ? (
                `📅 ${monthNames[currentDate.getMonth()].toUpperCase()} ${String(selectedDate).padStart(2, '0')}, ${currentDate.getFullYear()}`
              ) : (
                "CHOOSE A TIMELINE"
              )}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
            <AnimatePresence mode="wait">
              {selectedDate ? (
                tasksForSelectedDate.length > 0 ? (
                  <motion.div
                    key="task-list"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-2.5"
                  >
                    {tasksForSelectedDate.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col gap-1.5 ${
                          task.completed
                            ? "bg-emerald-950/10 border-emerald-500/20 opacity-50"
                            : "bg-[#161622]/40 border-white/[0.02]"
                        }`}
                      >
                        <p className={`text-xs font-bold tracking-wide ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-500">
                          {task.category && <span>{task.category}</span>}
                          {task.category && <span className="text-white/10">•</span>}
                          <span className={task.priority === 'high' ? 'text-rose-400' : task.priority === 'medium' ? 'text-amber-400' : 'text-sky-400'}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-tasks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center py-16"
                  >
                    <p className="text-xs font-bold text-slate-400">✨ Blank Space On Dashboard</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1.5 max-w-[180px]">
                      No active tasks found. Perfect moment to reload or rest!
                    </p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="prompt-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16"
                >
                  <p className="text-xs font-bold text-slate-500">👈 Timeline Navigation</p>
                  <p className="text-[10px] text-slate-600 mt-1">Select a slot to fetch daily tasks</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default CalendarView;