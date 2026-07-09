import React, { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import useTaskStore from '../store/useTaskStore';
import { useToast } from '../components/Ui/ToastProvider';
import ProfileEditMenu from '../components/ProfileEditMenu';

function Profile() {
  const userName = useUserStore((s) => s.userName);
  const userEmail = useUserStore((s) => s.userEmail);
  const avatarUrl = useUserStore((s) => s.avatarUrl);
  const preferences = useUserStore((s) => s.preferences);
  const logout = useUserStore((s) => s.logout);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const tasks = useTaskStore((s) => s.tasks);
  const gamificationStats = useTaskStore((s) => s.gamificationStats);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalPomodoroSessions = tasks.reduce((sum, task) => sum + (task.pomodoroSessions || 0), 0);

  const handleTaskActivityClick = () => {
    navigate('/app/task-activity');
  };

  const handleSettingsClick = () => {
    navigate('/app/settings');
  };

  const handleSignOut = () => {
    logout();
    showToast("Logged out successfully.", "success");
    navigate('/login');
  };

  // Calculate stats dynamically
  const completedCount = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const focusMinutes = gamificationStats?.focusMinutes || 0;
  const focusHours = Math.floor(focusMinutes / 60);
  const remainingMins = focusMinutes % 60;
  const focusTimeLabel = `${focusHours}h ${remainingMins}m`;

  return (
    <div className="bg-transparent text-sub p-8 select-none antialiased font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-ink tracking-wide mb-1">Profile & Settings</h1>
        <p className="text-xs text-muted mb-8 uppercase tracking-widest">Manage your account preferences and productivity tools.</p>

        {/* Tabs - Navigation */}
        <div className="flex gap-8 border-b border-hair mb-8">
          {['Account', 'Appearance', 'Notifications'].map((tab) => (
            <button key={tab} className={`pb-3 text-[11px] font-black uppercase tracking-widest ${tab === 'Account' ? 'text-ink border-b-2 border-purple-500' : 'text-faint hover:text-sub transition-colors'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          
          {/* Left Column: Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Information Card */}
            <section className="bg-card rounded-[32px] p-8 border border-hair shadow-2xl flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-[3px]">
                  <img src={avatarUrl || 'https://i.pravatar.cc/150?u=julian'} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-card" />
                </div>
                <ProfileEditMenu />
              </div>
              <h2 className="text-lg font-black text-ink tracking-tight">{userName || 'TaskFlow User'}</h2>
              <p className="text-[11px] text-purple-400 mb-8 font-medium">{userEmail || 'user@taskflow.io'}</p>
              <div className="w-full space-y-3">
                <button
                  onClick={handleTaskActivityClick}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/10 hover:opacity-95 transition"
                >
                  View Task Activity
                </button>
                <button onClick={handleSettingsClick} className="w-full py-3 rounded-2xl border border-hair text-[11px] font-black uppercase tracking-widest hover:bg-hair transition-all text-sub">
                  Account Settings
                </button>
                <button onClick={handleSignOut} className="w-full py-3 rounded-2xl text-red-400/80 border border-red-500/[0.05] text-[11px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">
                  Sign Out
                </button>
              </div>
            </section>

            {/* Usage Stats Card */}
            <section className="bg-card rounded-[32px] p-8 border border-hair">
              <h3 className="text-xs font-black text-muted uppercase tracking-widest mb-6">Usage Stats</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-2"><span>Tasks Completed</span><span>{taskCompletionRate}%</span></div>
                  <div className="h-1.5 w-full bg-card2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${taskCompletionRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-2"><span>Focus Time</span><span>{focusTimeLabel}</span></div>
                  <div className="h-1.5 w-full bg-card2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (focusMinutes / 3000) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-2"><span>Pomodoro Sessions</span><span>{totalPomodoroSessions}</span></div>
                  <div className="h-1.5 w-full bg-card2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (totalPomodoroSessions / 20) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Profile Links */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-hair bg-card p-8">
              <h2 className="text-lg font-semibold text-ink mb-4">Profile summary</h2>
              <div className="space-y-4 text-sm text-muted">
                <div className="rounded-2xl border border-hair bg-hair/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Total tasks</p>
                  <p className="mt-2 text-2xl font-bold text-ink">{totalTasks}</p>
                </div>
                <div className="rounded-2xl border border-hair bg-hair/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Completed tasks</p>
                  <p className="mt-2 text-2xl font-bold text-ink">{completedTasks}</p>
                </div>
                <div className="rounded-2xl border border-hair bg-hair/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Pomodoro sessions</p>
                  <p className="mt-2 text-2xl font-bold text-ink">{totalPomodoroSessions}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;