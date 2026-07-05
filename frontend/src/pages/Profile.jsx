import React, { useState } from 'react';
import { FaEdit, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [autoStart, setAutoStart] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [deepFocusMood, setDeepFocusMood] = useState(false);
  const navigate = useNavigate();

  const handlePasswordClick = () => {
    navigate('/app/settings');
  };

  return (
    <div className="bg-transparent text-slate-300 p-8 select-none antialiased font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-white tracking-wide mb-1">Profile & Settings</h1>
        <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Manage your account preferences and productivity tools.</p>

        {/* Tabs - Navigation */}
        <div className="flex gap-8 border-b border-white/[0.03] mb-8">
          {['Account', 'Appearance', 'Notifications'].map((tab) => (
            <button key={tab} className={`pb-3 text-[11px] font-black uppercase tracking-widest ${tab === 'Account' ? 'text-white border-b-2 border-purple-500' : 'text-slate-600 hover:text-slate-300 transition-colors'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          
          {/* Left Column: Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Information Card */}
            <section className="bg-[#13131a] rounded-[32px] p-8 border border-white/[0.04] shadow-2xl flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-[3px]">
                  <img src="https://i.pravatar.cc/150?u=julian" alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-[#13131a]" />
                </div>
                <button className="absolute bottom-0 right-0 p-2.5 bg-[#161622] border border-white/[0.05] rounded-full text-purple-400 shadow-lg hover:text-purple-300 transition-colors">
                  <FaEdit size={12} />
                </button>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">Julian Sterling</h2>
              <p className="text-[11px] text-purple-400 mb-8 font-medium">julian.s@taskflow.io</p>
              <div className="w-full space-y-3">
                <button
                  onClick={handlePasswordClick}
                  className="w-full py-3 rounded-2xl border border-white/[0.03] text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.02] transition-all text-slate-300"
                >
                  Change Password
                </button>
                <button className="w-full py-3 rounded-2xl text-red-400/80 border border-red-500/[0.05] text-[11px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">
                  Sign Out
                </button>
              </div>
            </section>

            {/* Usage Stats Card */}
            <section className="bg-[#13131a] rounded-[32px] p-8 border border-white/[0.04]">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Usage Stats</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-2"><span>Tasks Completed</span><span>84%</span></div>
                  <div className="h-1.5 w-full bg-[#161622] rounded-full overflow-hidden">
                    <div className="h-full w-[84%] bg-purple-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-2"><span>Focus Time</span><span>12h 40m</span></div>
                  <div className="h-1.5 w-full bg-[#161622] rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Settings Panel */}
          <div className="space-y-6">
            {/* Automation & Alerts */}
            <section className="bg-[#13131a] rounded-[32px] p-8 border border-white/[0.04]">
              <h3 className="text-sm font-black text-white mb-6">Automation & Alerts</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Auto-start breaks</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Automatically begin break timer when work ends.</p>
                  </div>
                  <button onClick={() => setAutoStart(!autoStart)} className={`w-10 h-5 rounded-full transition-colors ${autoStart ? 'bg-purple-600' : 'bg-[#161622]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoStart ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Sound Notifications</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Play sounds for focus and break changes.</p>
                  </div>
                  <button onClick={() => setSoundNotifications(!soundNotifications)} className={`w-10 h-5 rounded-full transition-colors ${soundNotifications ? 'bg-purple-600' : 'bg-[#161622]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${soundNotifications ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Deep Focus Mood</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Reduce distractions with a calmer focus mode.</p>
                  </div>
                  <button onClick={() => setDeepFocusMood(!deepFocusMood)} className={`w-10 h-5 rounded-full transition-colors ${deepFocusMood ? 'bg-purple-600' : 'bg-[#161622]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${deepFocusMood ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Action Buttons Footer */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/[0.03] mt-8">
              <button className="px-8 py-3.5 rounded-2xl border border-white/[0.03] text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.02] transition-colors text-slate-300">
                Reset Defaults
              </button>
              <button className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-[0_4px_20px_rgba(139,92,246,0.2)] hover:opacity-90 transition-opacity">
                <FaSave size={13} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;