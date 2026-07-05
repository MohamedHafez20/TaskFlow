import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import useUserStore from '../store/useUserStore';
import usePageTitle from '../hooks/usePageTitle';
import BackgroundWrapper from '../components/layout/BackgroundWrapper';
import taskFlowLogo from '../assets/Logo.webp';

// Import landing sections
import Navbar from './landing/Navbar';
import HeroSection from './landing/HeroSection';
import StatsSection from './landing/StatsSection';
import DiscoverSystem from './landing/DiscoverSystem';
import WhatPeoplesSay from './landing/WhatPeoplesSay';
import FAQSection from './landing/FAQSection';
import Footer from '../components/layout/Footer';

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  usePageTitle('Welcome to TaskFlow');

  useEffect(() => {
    // If user is already authenticated, take them directly to the dashboard
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-transparent text-slate-300 relative overflow-hidden font-sans scroll-smooth">
      {/* Official background wrapper containing grid lines and soft glows */}
      <BackgroundWrapper />

      {/* Floating Header */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Statistics counters section */}
      <StatsSection />

      {/* Discover / Features Section */}
      <DiscoverSystem />

      {/* Testimonials Section */}
      <WhatPeoplesSay />

      {/* FAQ Section */}
      <FAQSection />

      {/* Unified System Footer */}
      <Footer />
    </div>
  );
}

export default Home;
