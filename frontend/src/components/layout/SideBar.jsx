import { FaHome, FaHistory, FaChartLine, FaCalendar, FaCog, FaSignOutAlt, FaTrophy, FaGamepad, FaClock, FaRocket } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import { useToast } from '../Ui/ToastProvider';

function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = useUserStore((s) => s.userName) || 'Kamal Abou Eid'; // سحب الاسم ديناميكياً
  const setUserName = useUserStore((s) => s.setUserName);
  const { showToast } = useToast();

  // 🎯 الحفاظ على نفس الصفحات القديمة بالملي كما هي
  const menuItems = [
    { label: 'Dashboard', icon: FaHome, path: '/app/dashboard' },
    { label: 'Timer', icon: FaClock, path: '/app/pomodoro' },
    { label: 'Tasks', icon: FaTrophy, path: '/app/productivity' },
    { label: 'Analytics', icon: FaChartLine, path: '/app/analytics' },
    { label: 'Calendar', icon: FaCalendar, path: '/app/calendar' },
    { label: 'Games', icon: FaGamepad, path: '/app/games' },
    { label: 'History', icon: FaHistory, path: '/app/history' },
    { label: 'Settings', icon: FaCog, path: '/app/settings' },
  ];

  const handleLogout = () => {
    setUserName('');
    navigate('/');
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
      {/* الـ Overlay للموبايل */}
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

      {/* 🌌 الـ Sidebar بالديزاين الجديد الأنيق بالملي */}
      <motion.aside
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        className={`w-full max-w-[260px] bg-[#0b0b10] border-r border-white/[0.03] p-6 flex flex-col justify-between transition-all ${
          isMobileMenuOpen
            ? 'fixed inset-y-0 left-0 z-50 shadow-2xl'
            : 'hidden md:flex'
        }`}
      >
        <div className="space-y-7 flex flex-col flex-1 overflow-hidden">
          {/* 🚀 العلوي: الحفاظ على اسم السيستم Task Flow وأيقونة الصاروخ مع ستايل فخم */}
          <div className="flex items-center gap-3 px-2 flex-shrink-0">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <FaRocket className="text-sm" />
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

          {/* 🧭 المنتصف: قائمة التنقل الأنيقة مع الـ Icons المدمجة بنعومة والـ Active Indicator الرايق */}
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
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md shadow-purple-500/10">
              {userName.substring(0, 2)}
            </div>
            <div className="max-w-[120px] truncate">
              <p className="text-xs font-bold text-white tracking-wide truncate">{userName}</p>
              <p className="text-[10px] font-medium text-slate-500">Free Tier</p>
            </div>
          </div>

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