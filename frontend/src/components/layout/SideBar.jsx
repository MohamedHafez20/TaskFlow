import { FaHome, FaHistory, FaChartLine, FaCalendar, FaCog, FaSignOutAlt, FaTrophy, FaGamepad, FaClock, FaRobot } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useTaskStore from '../../store/useTaskStore';
import useUserStore from '../../store/useUserStore';
import { useToast } from '../Ui/ToastProvider';
import taskFlowLogo from '../../assets/Logo.webp';

function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = useUserStore((s) => s.userName) || 'Kamal Abou Eid';
  const logout = useUserStore((s) => s.logout);
  const gamificationStats = useTaskStore((s) => s.gamificationStats);
  const { showToast } = useToast();


  const menuItems = [
    { label: 'Dashboard', icon: FaHome, path: '/app/dashboard' },
    { label: 'Pomodoro', icon: FaClock, path: '/app/pomodoro' },
    { label: 'Productivity Level', icon: FaTrophy, path: '/app/productivity' },
    { label: 'Analytics', icon: FaChartLine, path: '/app/analytics' },
    { label: 'Calendar', icon: FaCalendar, path: '/app/calendar' },
    { label: 'Games', icon: FaGamepad, path: '/app/games' },
    { label: 'Chatbot', icon: FaRobot, path: '/app/chatbot' },
    { label: 'History', icon: FaHistory, path: '/app/history' },
    { label: 'Settings', icon: FaCog, path: '/app/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast('Logged out successfully', 'success');
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  return (
    <>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        className={`w-full max-w-[260px] border-r border-white/10 p-6 backdrop-blur-2xl flex flex-col justify-between transition-all ${
          isMobileMenuOpen
            ? 'fixed inset-y-0 left-0 z-50 shadow-2xl'
            : 'hidden md:flex'
        }`}
      >
        <div className="space-y-7 flex flex-col flex-1 overflow-hidden">
    
          <div className="flex items-center gap-3 px-2 flex-shrink-0">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden">
              <img src={taskFlowLogo} alt="TaskFlow logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 leading-none">
                Task manager
              </p>
              <h2 className="text-base font-bold text-white mt-1.5 tracking-wide">
                Task Flow
              </h2>
            </div>
          </div>

      
          <motion.nav 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-none"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <motion.button
                  key={item.path}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`text-sm ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.nav>
        </div>

        {/* 👤 السفلي: كارد المستخدم النظيف وزر الخروج المدمج من الديزاين الجديد */}
        <div className="border-t border-white/[0.04] pt-4 px-2 flex items-center justify-between flex-shrink-0 mt-4">
          <button
            type="button"
            onClick={() => handleMenuClick('/app/user-profile')}
            className="flex items-center gap-3 flex-1 min-w-0 rounded-xl p-2 -m-2 hover:bg-white/[0.03] transition-all text-left"
            title="Open profile"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md shadow-purple-500/10">
              {userName.substring(0, 2)}
            </div>
            <div className="max-w-[120px] truncate">
              <p className="text-xs font-bold text-white tracking-wide truncate">{userName}</p>
              <p className="text-[10px] font-medium text-slate-500">
                {gamificationStats?.levelName ? `${gamificationStats.levelName} • Lv ${gamificationStats.level}` : 'Free Tier'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {gamificationStats ? `🔥 ${gamificationStats.currentStreak} day streak` : 'Streak not loaded'}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
            title="Logout"
          >
            <FaSignOutAlt size={12} />
          </button>
        </div>

      </motion.aside>
    </>
  );
}

export default Sidebar;