import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Timer, Gamepad2, Bot, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pomodoro',  icon: Timer,           label: 'Pomodoro'  },
  { to: '/games',     icon: Gamepad2,         label: 'Games Zone'},
  { to: '/chatbot',   icon: Bot,              label: 'Chatbot'   },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 flex flex-col border-r border-slate-700">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">⚡ TaskFlow</h1>
          <p className="text-slate-400 text-sm mt-1">DEPI Project</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
