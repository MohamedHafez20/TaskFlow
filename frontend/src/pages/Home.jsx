import { useEffect, useState } from 'react';
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

  // Capture at render time: child effects (WhatPeoplesSay) run before this
  // component's effect and clear the flag, so we must read it during render.
  const [pendingReview] = useState(() => Boolean(sessionStorage.getItem('reviewIntent')));

  usePageTitle('Welcome to TaskFlow');

  useEffect(() => {
    // If a review submission is pending (user just logged in to leave a review),
    // stay on the landing page so the reviews section can open the modal.
    if (pendingReview) return;
    // Otherwise, if already authenticated, take them directly to the dashboard.
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate, pendingReview]);

  return (
    <div className="min-h-screen bg-transparent text-sub relative overflow-hidden font-sans scroll-smooth">
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
