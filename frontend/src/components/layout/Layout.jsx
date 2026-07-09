import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import SideBar from './SideBar';
import Footer from './Footer';
import BackgroundWrapper from './BackgroundWrapper';
import useUserStore from '../../store/useUserStore';
import useTaskStore from '../../store/useTaskStore';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const fetchCurrentUser = useUserStore((s) => s.fetchCurrentUser);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchPomodoroHistory = useTaskStore((s) => s.fetchPomodoroHistory);
  const fetchGamificationStats = useTaskStore((s) => s.fetchGamificationStats);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchTasks();
      fetchPomodoroHistory();
      fetchGamificationStats();
    }
  }, [isAuthenticated, fetchCurrentUser, fetchTasks, fetchPomodoroHistory, fetchGamificationStats]);

  return (
    <div className="min-h-screen bg-transparent text-ink relative">
      <BackgroundWrapper />

      <div className="relative z-10 flex min-h-screen">
        <SideBar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex flex-1 flex-col">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

          <main className="flex-1 overflow-y-auto min-h-0">
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