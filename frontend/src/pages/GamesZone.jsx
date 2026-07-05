// 🎮 Games Zone / Gamification Page — أرساني's task
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Award } from 'lucide-react';
import api from '../api/axios';

const BADGE_ICONS = {
  first_task:   '🎯',
  ten_tasks:    '🔥',
  pomodoro_pro: '⏱️',
  level_5:      '👑',
};

export default function GamesZone() {
  const [myStats,     setMyStats]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, l] = await Promise.all([
          api.get('/gamification/my-stats'),
          api.get('/gamification/leaderboard'),
        ]);
        setMyStats(s.data);
        setLeaderboard(l.data);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-slate-400">Loading...</p></div>;

  const xpToNext = myStats ? 100 - (myStats.xp % 100) : 100;
  const xpPct    = myStats ? myStats.xp % 100 : 0;
  const levelName = myStats?.levelName || 'Beginner';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">🎮 Games Zone</h1>
      <p className="text-slate-400 mb-8">Complete tasks and earn rewards</p>

      <div className="grid grid-cols-3 gap-6">
        {/* My stats card */}
        <div className="col-span-2 space-y-6">
          {/* Level & XP */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Current Level</p>
                  <p className="text-2xl font-bold text-white">Level {myStats?.level}</p>
                  <p className="text-xs text-slate-400 mt-1">{levelName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Total Points</p>
                <p className="text-2xl font-bold text-yellow-400">{myStats?.points} XP</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{myStats?.points % 100} XP</span>
                <span>{xpToNext} XP to next level</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-2xl bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Current Streak</p>
                <p className="mt-2 text-lg font-bold text-white">{myStats?.currentStreak ?? 0} days</p>
              </div>
              <div className="rounded-2xl bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Best Streak</p>
                <p className="mt-2 text-lg font-bold text-white">{myStats?.longestStreak ?? 0} days</p>
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Award size={18} /> Badges</h3>
            <div className="grid grid-cols-4 gap-4">
              {myStats?.allBadges?.map((badge) => {
                const earned = myStats.badges.includes(badge.id);
                return (
                  <div key={badge.id} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${earned ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-700/30 border-slate-700 opacity-40'}`}>
                    <span className="text-3xl mb-2">{BADGE_ICONS[badge.id]}</span>
                    <p className="text-xs font-medium text-center text-white">{badge.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{badge.points} pts</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Leaderboard</h3>
          <div className="space-y-3">
            {leaderboard.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-slate-400 text-xs">Level {u.level}</p>
                </div>
                <span className="text-yellow-400 text-sm font-semibold">{u.points}</span>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No players yet</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
