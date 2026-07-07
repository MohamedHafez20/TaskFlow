/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignInAlt, FaArrowRight, FaBars, FaTimes } from 'react-icons/fa';
import useUserStore from '../../store/useUserStore';
import taskFlowLogo from '../../assets/Logo.webp';

function Navbar() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'Stats', id: 'stats' },
    { name: 'Reviews', id: 'testimonials' },
    { name: 'FAQ', id: 'faq' }
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div className={`max-w-6xl mx-auto rounded-2xl backdrop-blur-2xl px-5 py-3 flex items-center justify-between shadow-2xl transition-all duration-300 ${scrolled ? 'bg-appbg shadow-purple-900/10' : ''}`}>
        
        {/* Logo */}
        <Link to="/" onClick={() => scrollToSection('home')} className="flex items-center gap-3 group">
          <div className="h-10 w-12 rounded-xl overflow-hidden ring-1transition-all">
            <img src={taskFlowLogo} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-ink tracking-wide">Task Flow</h2>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollToSection(link.id)} className="hover:text-purple-400 transition-colors">
              {link.name}
            </button>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/app/dashboard" className="px-5 py-2 rounded-xl bg-purple-600 text-[11px] font-bold text-white hover:bg-purple-700 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[11px] font-bold text-muted hover:text-ink transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2 rounded-xl bg-hair text-[11px] font-bold text-ink hover:bg-hair transition-all">Register</Link>
              </>
            )}
          </div>
          
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-ink p-2">
            {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
           className="md:hidden mt-2 mx-auto max-w-6xl overflow-hidden rounded-2xl bg-appbg backdrop-blur-xl border border-hair"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-sm font-bold text-sub py-3 border-b border-hair text-left">
                  {link.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;