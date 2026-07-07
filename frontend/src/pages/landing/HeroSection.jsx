/* eslint-disable no-unused-vars */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaRobot, FaTrophy, FaChevronRight } from 'react-icons/fa';
import useUserStore from '../../store/useUserStore';

function HeroSection() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden px-4 md:px-8">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/[0.03] blur-[150px] rounded-full pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative z-10">
        
        {/* Left: Text & CTA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-left space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-purple-300 border border-purple-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
            Next-Gen Workflow Suite
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-black text-ink leading-[1.1] tracking-tight">
            Focus Deeper.<br />
            Work Smarter.<br />
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Level Up.</span>
          </h1>

          <p className="max-w-xl text-sm sm:text-base text-muted leading-relaxed">
            TaskFlow combines a high-performance Pomodoro engine with real-time AI schedule advice and gamified progression to reward your focus blocks.
          </p>

          <div className="pt-4 flex flex-wrap gap-3 items-center">
            <Link
              to={isAuthenticated ? "/app/dashboard" : "/login"}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3.5 sm:px-7 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-purple-500/20 hover:opacity-95 transition-all group"
            >
              Get Started Free <FaChevronRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-hair border border-hair px-5 py-3.5 sm:px-7 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sub hover:bg-hair hover:border-purple-500/20 transition-all"
            >
              Create Account
            </Link>
          </div>
        </motion.div>

        {/* Right: Stunning Glassmorphic Mockup Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          {/* Main Card */}
          <div className="rounded-[40px] border border-hair bg-appbg p-6 relative z-10 overflow-hidden">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-white/[0.04] pointer-events-none" />

            {/* Simulated app header */}
            <div className="flex items-center justify-between pb-6 border-b border-hair">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/40" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/40" />
                <span className="h-3 w-3 rounded-full bg-green-500/40" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Live Workspace Mockup</span>
            </div>

            <div className="mt-6 space-y-5">
              {/* Mock 1: Pomodoro Card */}
              <div className="rounded-3xl bg-hair border border-hair p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/10  flex items-center justify-center text-purple-400">
                    <FaPlay size={12} className="ml-0.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink tracking-wide">Focus Block Active</h3>
                    <p className="text-[9px] text-muted mt-0.5">Deep Session Mode Enabled</p>
                  </div>
                </div>
                <span className="text-xl font-bold font-mono text-purple-400 tracking-tight px-3 py-1 rounded-full ">24:59</span>
              </div>

              {/* Mock 2: Gamification Stats Card */}
              <div className="rounded-3xl bg-hair border border-hair p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink tracking-wide">
                    <FaTrophy size={11} className="text-yellow-400" />
                    Level 4 Explorer
                  </div>
                  <span className="text-[9px] font-semibold text-muted">850 / 1000 XP</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-hair overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Mock 3: AI Chatbot Box */}
              <div className="rounded-3xl bg-hair border border-hair p-4 flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-cyan-400/10 flex items-center justify-center text-[var(--c-accent)] flex-shrink-0">
                  <FaRobot size={12} />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--c-accent)]">Task Flow AI</span>
                  <p className="text-[10px] text-muted leading-normal">
                    "Awesome work. You have hit 4 streaks this week. Let's finish your 'Database Architecture' review next!"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative glowing backdrops */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-purple-500/[0.015] blur-[100px] rounded-full pointer-events-none -z-10" />
        </motion.div>

      </div>
    </section>
  );
}

export default HeroSection;
