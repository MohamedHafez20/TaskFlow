import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useTaskStore from '../../store/useTaskStore';
import useUserStore from '../../store/useUserStore';
import useThemeStore from '../../store/useThemeStore';
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
  const navigate = useNavigate();
  const location = useLocation();
  const userName = useUserStore((s) => s.userName);
  const avatarUrl = useUserStore((s) => s.avatarUrl);
  const tasks = useTaskStore((s) => s.tasks);
  const setGlobalSearch = useTaskStore((s) => s.setGlobalSearch);
  const globalSearch = useTaskStore((s) => s.globalSearch);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDarkMode = theme === 'dark';
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false);

  // حساب الـ Completion Rate ديناميك
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleProfileClick = () => navigate('/app/user-profile');

  const searchResults = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) return [];

    return tasks
      .filter((task) => task.title?.toLowerCase().includes(query))
      .slice(0, 5)
      .map((task) => ({
        id: task.id || task._id,
        title: task.title,
        completed: task.completed,
      }));
  }, [tasks, globalSearch]);

  const showSearchMenu = isSearchFocused && globalSearch.trim().length > 0;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalSearch(value);
    if (location.pathname !== '/app/dashboard') {
      navigate('/app/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40   px-4 py-4 backdrop-blur-2xl md:px-8">
      <div className="mx-auto flex items-center justify-between gap-4">
        
        {/* 1. الناحية الشمال: اسمك واللقب */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hair bg-hair text-sub"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>

          <div className="flex flex-col">
            <h1
              className="text-base font-bold text-ink tracking-wide cursor-pointer hover:text-purple-300 transition-colors"
              onClick={handleProfileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProfileClick();
                }
              }}
            >
              {userName || 'Kamal Abou Eid'}
            </h1>
            <span className="text-[10px] font-semibold text-purple-400 tracking-wider mt-0.5">
              ⚡ Deep Worker
            </span>
          </div>
        </div>

        {/* 2. المنتصف: شريط البحث */}
        <div className="relative mx-2 flex-1 max-w-md md:mx-8">
          <div className={`pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${globalSearch.trim() ? 'text-purple-400' : 'text-muted'}`}>
            <FaSearch className="h-full w-full" />
          </div>
          <input
            type="search"
            value={globalSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 120)}
            onChange={handleSearchChange}
            placeholder="Search tasks by title..."
            className="w-full rounded-full border border-hair bg-hair py-2.5 pl-11 pr-4 text-xs text-sub outline-none transition placeholder:text-faint focus:border-purple-500/50 focus:bg-hair focus:ring-0"
          />

          {showSearchMenu && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-2xl border border-hair bg-card2 p-2 shadow-2xl backdrop-blur-xl">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      setGlobalSearch(result.title);
                      navigate('/app/dashboard');
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-sub transition hover:bg-hair"
                  >
                    <span className="truncate">{result.title}</span>
                    {result.completed ? <span className="text-[10px] uppercase text-muted">Done</span> : <span className="text-[10px] uppercase text-purple-400">Task</span>}
                  </button>
                ))
              ) : (
                <div className="rounded-xl px-3 py-2 text-sm text-muted">No matching tasks found.</div>
              )}
            </div>
          )}
        </div>

        {/* 3. الناحية اليمين: الأزرار والتفاعل */}
        <div className="flex items-center gap-3">
          
          <span className="hidden sm:inline-flex items-center rounded-full bg-hair border border-hair px-3 py-1.5 text-[11px] font-medium text-muted">
            Efficiency: <strong className="text-purple-400 ml-1">{completionRate}%</strong>
          </span>

          {/* 🔕 زر الجرس التفاعلي (شغال / صامت) */}
          <button 
            onClick={() => setIsNotificationsMuted(!isNotificationsMuted)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition relative duration-200 ${
              isNotificationsMuted 
                ? 'border-white/[0.04] bg-hair text-faint hover:text-muted' 
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
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-hair bg-hair text-muted transition hover:bg-hair hover:text-ink"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FaMoon size={13} /> : <FaSun size={13} />}
          </button>

          <div className="h-6 w-[1px] bg-hair hidden sm:block" />

          {/* الأفاتار */}
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
            aria-label="Open profile"
            title="Open profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <FaUserCircle className="h-5 w-5" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;