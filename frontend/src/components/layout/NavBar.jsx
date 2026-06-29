import { useState } from 'react';
import useTaskStore from '../../store/useTaskStore';
import useUserStore from '../../store/useUserStore';
import { 
  FaBars, 
  FaBell, 
  FaBellSlash, 
  FaMoon, 
  FaSearch, 
  FaTimes, 
  FaUserCircle, 
  FaSun 
} from 'react-icons/fa';

function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const userName = useUserStore((s) => s.userName);
  const tasks = useTaskStore((s) => s.tasks);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // 🔔 الـ State السحرية للتحكم في وضع الجرس (شغال / صامت)
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false);

  // حساب الـ Completion Rate ديناميك
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c12]/80 backdrop-blur-md border-b border-white/[0.04] px-4 py-4 md:px-8">
      <div className="mx-auto flex items-center justify-between gap-4">
        
        {/* 1. الناحية الشمال: اسمك واللقب */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-slate-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>

          <div className="flex flex-col">
            <h1 className="text-base font-bold text-white tracking-wide">
              {userName || 'Kamal Abou Eid'}
            </h1>
            <span className="text-[10px] font-semibold text-purple-400 tracking-wider mt-0.5">
              ⚡ Deep Worker
            </span>
          </div>
        </div>

        {/* 2. المنتصف: شريط البحث */}
        <div className="hidden md:block flex-1 max-w-md relative mx-8">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search tasks, analytics, or shortcuts..."
            className="w-full rounded-full bg-white/[0.03] border border-white/[0.06] py-2.5 pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-white/[0.05] focus:ring-0"
          />
        </div>

        {/* 3. الناحية اليمين: الأزرار والتفاعل */}
        <div className="flex items-center gap-3">
          
          <span className="hidden sm:inline-flex items-center rounded-full bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-slate-400">
            Efficiency: <strong className="text-purple-400 ml-1">{completionRate}%</strong>
          </span>

          {/* 🔕 زر الجرس التفاعلي (شغال / صامت) */}
          <button 
            onClick={() => setIsNotificationsMuted(!isNotificationsMuted)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition relative duration-200 ${
              isNotificationsMuted 
                ? 'border-white/[0.04] bg-white/[0.01] text-slate-600 hover:text-slate-400' 
                : 'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
            }`}
            title={isNotificationsMuted ? "Unmute Notifications" : "Mute Notifications"}
          >
            {isNotificationsMuted ? <FaBellSlash size={13} /> : <FaBell size={13} />}
            
            {/* نقطة الإشعار الحمراء/البنفسجية بتختفي تماماً لو الوضع صامت */}
            {!isNotificationsMuted && (
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
            )}
          </button>
          
          {/* زرار الثيم */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            {isDarkMode ? <FaMoon size={13} /> : <FaSun size={13} />}
          </button>

          <div className="h-6 w-[1px] bg-white/[0.08] hidden sm:block" />

          {/* الأفاتار */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 text-purple-400">
            <FaUserCircle className="h-5 w-5" />
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;