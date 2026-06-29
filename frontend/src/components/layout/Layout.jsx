import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SideBar from './SideBar';
import Footer from './Footer';
import useUserStore from '../../store/useUserStore';
import useTaskStore from '../../store/useTaskStore';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const fetchCurrentUser = useUserStore((s) => s.fetchCurrentUser);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchPomodoroHistory = useTaskStore((s) => s.fetchPomodoroHistory);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchTasks();
      fetchPomodoroHistory();
    }
  }, [isAuthenticated, fetchCurrentUser, fetchTasks, fetchPomodoroHistory]);

  return (
    <div className='min-h-screen bg-midnight text-white'>
      <div className='flex min-h-screen'>
        <SideBar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <div className='flex-1 flex flex-col'>
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <main className='flex-1 overflow-y-auto'>
            <div className='mx-auto w-full max-w-[1800px] px-4 py-6 md:px-6 lg:px-8'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;

