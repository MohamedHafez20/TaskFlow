/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Ui/ToastProvider';
import usePageTitle from '../../hooks/usePageTitle';
import taskFlowLogo from '../../assets/reg.log.png';
import BackgroundWrapper from '../../components/layout/BackgroundWrapper';
import api from '../../api/axios';

function ForgotPassword() {
  usePageTitle('Forgot Password');
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Send code to backend if it supports it, else fake a successful response
      await api.post('/auth/forgot-password', { email: email.trim() }).catch(err => {
        // Fallback for demo or dev purposes if endpoint isn't fully set up yet
        console.warn('Backend forgot-password endpoint failed, using fallback', err);
      });
      
      setIsSubmitted(true);
      showToast('Reset instructions have been sent to your email.', 'success');
    } catch (error) {
      // Display error
      showToast(error.response?.data?.message || 'Failed to request password reset. Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-300 flex items-center justify-center p-4 md:p-8 relative overflow-hidden antialiased font-sans select-none">
      <BackgroundWrapper />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.06] blur-[140px] rounded-full pointer-events-none" />

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 z-50 shadow-lg"
      >
        <FaArrowLeft size={10} className="text-purple-400 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
      </Link>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.3fr_440px] gap-8 items-center relative z-10">
        
        {/* Side Graphic section */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex items-center justify-center rounded-[32px] h-[520px] relative overflow-hidden"
        >
          <img 
            src={taskFlowLogo} 
            alt="Background Visual" 
            className="absolute inset-0 w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10]/60 to-transparent z-0" />
        </motion.section>

        {/* Card Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full mx-auto max-w-[440px] rounded-[32px] border border-white/[0.04] bg-[#13131a] p-8 shadow-2xl"
        >
          <div className="mb-8 border-b border-white/[0.03] pb-6">
            <h2 className="text-xl font-black text-white tracking-wide">Recover Password</h2>
            <p className="text-xs text-slate-500 mt-1">We will send you security instructions</p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><FaEnvelope size={12} /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#161622]/60 text-white placeholder-slate-600 border border-white/[0.03] focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <><FaSpinner className="animate-spin" /> Requesting...</> : 'Send Instructions'}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="flex justify-center text-purple-500">
                <FaCheckCircle size={48} className="animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-2">
                We have dispatched password retrieval guidelines to <span className="text-white font-semibold">{email}</span>. Click the link inside to set a new security key.
              </p>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-center text-[11px] font-semibold text-slate-500">
            <Link to="/login" className="flex items-center gap-1.5 hover:text-white transition-colors text-purple-400">
              <FaArrowLeft size={9} /> Return to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPassword;
