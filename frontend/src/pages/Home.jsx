import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import useUserStore from '../store/useUserStore';
import usePageTitle from '../hooks/usePageTitle';

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  usePageTitle('Home');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#07070f] text-slate-300 px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <section className="rounded-[32px] border border-white/[0.05] bg-[#13131a] p-8 shadow-lg shadow-purple-500/5">
          <span className="inline-flex rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-purple-300">
            Task Flow Secure
          </span>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">Premium productivity, focused workflow.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Create a full account, track your sessions, and manage tasks with a professional dark dashboard built for concentration and speed.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/login"
              className="rounded-3xl border border-white/[0.05] bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-4 text-center text-sm font-bold text-white transition hover:opacity-95"
            >
              <span className="flex items-center justify-center gap-2">
                <FaSignInAlt /> Login
              </span>
            </Link>
            <Link
              to="/register"
              className="rounded-3xl border border-white/[0.05] bg-[#111118] px-6 py-4 text-center text-sm font-bold text-slate-200 transition hover:bg-[#1a1a2d]"
            >
              <span className="flex items-center justify-center gap-2">
                <FaUserPlus /> Register
              </span>
            </Link>
          </div>
        </section>

        <aside className="rounded-[32px] border border-white/[0.05] bg-[#13131a] p-8 shadow-xl shadow-[#6d28d9]/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-purple-400">Fast access</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Everything starts with secure login.</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] text-purple-400">
              <FaShieldAlt />
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-400">
            <div className="rounded-3xl border border-white/[0.03] bg-white/[0.03] p-4">
              <p className="font-semibold text-white">Full auth flow</p>
              <p>Login and registration are now full-featured with protected app routes.</p>
            </div>
            <div className="rounded-3xl border border-white/[0.03] bg-white/[0.03] p-4">
              <p className="font-semibold text-white">Mobile optimized</p>
              <p>The layout fits small screens with responsive spacing and card sizes.</p>
            </div>
            <div className="rounded-3xl border border-white/[0.03] bg-white/[0.03] p-4">
              <p className="font-semibold text-white">Ready to go</p>
              <p>Register now and start using the premium dashboard instantly.</p>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

export default Home;
