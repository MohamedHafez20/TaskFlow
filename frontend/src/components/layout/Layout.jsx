import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './NavBar';
import SideBar from './SideBar';
import Footer from './Footer';
import BackgroundWrapper from './BackgroundWrapper';
import DeepSessionWarning from '../DeepSessionWarning';
import useUserStore from '../../store/useUserStore';
import useTaskStore from '../../store/useTaskStore';
import useDeepSessionGuard from '../../hooks/useDeepSessionGuard';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const fetchCurrentUser = useUserStore((s) => s.fetchCurrentUser);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchPomodoroHistory = useTaskStore((s) => s.fetchPomodoroHistory);
  const fetchGamificationStats = useTaskStore((s) => s.fetchGamificationStats);
  const { showWarning, targetPath, handleWarningResponse } = useDeepSessionGuard();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchTasks();
      fetchPomodoroHistory();
      fetchGamificationStats();
    }
  }, [isAuthenticated, fetchCurrentUser, fetchTasks, fetchPomodoroHistory, fetchGamificationStats]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-ink relative">
      <BackgroundWrapper />

      <AnimatePresence>
        <DeepSessionWarning
          isOpen={showWarning}
          targetPath={targetPath}
          onNavigate={(path) => {
            if (path) {
              handleWarningResponse(true, path);
            } else {
              handleWarningResponse(false, null);
            }
          }}
        />
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen overflow-hidden">
        <SideBar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex flex-1 flex-col min-h-0 overflow-hidden lg:pl-[260px]">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <div className="mx-auto w-full max-w-[1800px] px-4 py-6 md:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Layout;