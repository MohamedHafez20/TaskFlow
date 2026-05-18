// ⏱️ Pomodoro Timer Page — أرساني's task
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MODES = {
  work:       { label: 'Focus',       minutes: 25, color: '#3b82f6' },
  shortBreak: { label: 'Short Break', minutes: 5,  color: '#10b981' },
  longBreak:  { label: 'Long Break',  minutes: 15, color: '#8b5cf6' },
};

export default function Pomodoro() {
  const [mode, setMode]         = useState('work');
  const [seconds, setSeconds]   = useState(MODES.work.minutes * 60);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const total   = current.minutes * 60;
  const pct     = ((total - seconds) / total) * 100;
  const mm      = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss      = String(seconds % 60).padStart(2, '0');

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = async () => {
    if (!running && seconds === total) {
      try {
        const { data } = await api.post('/pomodoro/start', { duration: current.minutes });
        setSessionId(data._id);
      } catch (_) {}
    }
    setRunning(true);
  };

  const handleComplete = async () => {
    if (mode === 'work') {
      setSessions((s) => s + 1);
      toast.success('🎉 Focus session done! +10 points');
      if (sessionId) {
        try { await api.put(`/pomodoro/${sessionId}/complete`); } catch (_) {}
        setSessionId(null);
      }
    } else {
      toast.success('Break over! Ready to focus?');
    }
  };

  const switchMode = (m) => {
    setMode(m); setRunning(false); setSeconds(MODES[m].minutes * 60);
  };

  const reset = () => { setRunning(false); setSeconds(current.minutes * 60); };

  // SVG circle
  const r = 110; const circ = 2 * Math.PI * r;

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-white mb-2">Pomodoro Timer</h1>
      <p className="text-slate-400 mb-8">Stay focused, take breaks</p>

      {/* Mode tabs */}
      <div className="flex gap-2 bg-slate-800 p-1 rounded-xl mb-10 border border-slate-700">
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${mode === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <motion.div className="relative flex items-center justify-center mb-10"
        animate={{ scale: running ? [1, 1.01, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 2 }}>
        <svg width="280" height="280" className="-rotate-90">
          <circle cx="140" cy="140" r={r} stroke="#1e293b" strokeWidth="12" fill="none" />
          <circle cx="140" cy="140" r={r} stroke={current.color} strokeWidth="12" fill="none"
            strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="absolute text-center">
          <p className="text-6xl font-bold text-white tabular-nums">{mm}:{ss}</p>
          <p className="text-slate-400 text-sm mt-1">{current.label}</p>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={reset} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700 transition-colors">
          <RotateCcw size={20} />
        </button>
        <button onClick={running ? () => setRunning(false) : handleStart}
          className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors">
          {running ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
        </button>
        <button onClick={() => switchMode('shortBreak')}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700 transition-colors">
          <Coffee size={20} />
        </button>
      </div>

      {/* Sessions counter */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${i < sessions % 4 ? 'bg-blue-500' : 'bg-slate-700'}`} />
        ))}
      </div>
      <p className="text-slate-500 text-sm mt-2">{sessions} sessions completed today</p>
    </div>
  );
}
