import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
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
    // 1. Ensure the parent container is transparent so the background shows through
    <div className="min-h-screen bg-transparent text-white relative">
      <BackgroundWrapper />
      
      {/* 2. Changed z-0 to z-10 to ensure layout sits above the fixed background */}
      <div className="flex min-h-screen relative z-10">
        <SideBar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <div className="flex-1 flex flex-col">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          
          <main className="flex-1 overflow-y-auto">
            {/* 3. Container styling remains the same, but ensure individual pages use bg-white/[0.03] */}
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