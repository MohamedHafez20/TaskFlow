import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useToast } from '../../components/Ui/ToastProvider';
import useUserStore from '../../store/useUserStore';
import BackgroundWrapper from '../../components/layout/BackgroundWrapper';

function CheckYourEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const resendVerification = useUserStore((s) => s.resendVerification);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stateEmail = location.state?.email || '';
    setEmail(stateEmail);
  }, [location.state]);

  const handleResend = async () => {
    if (!email) {
      showToast('Email address is missing.', 'error');
      return;
    }

    setLoading(true);
    const response = await resendVerification(email);
    setLoading(false);

    if (response.success) {
      showToast(response.message || 'Verification email sent.', 'success');
    } else {
      showToast(response.message || 'Unable to resend verification email.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-sub flex items-center justify-center p-4 md:p-8 relative overflow-hidden antialiased font-sans select-none">
      <BackgroundWrapper />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <Link to="/login" className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 rounded-2xl bg-hair border border-hair px-4 py-2.5 text-xs font-bold text-sub hover:bg-hair hover:border-purple-500/30 transition-all duration-300 z-50 shadow-lg">
        <FaArrowLeft size={10} className="text-purple-400" /> Back to Login
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[480px] rounded-[32px] border border-hair bg-card p-8 shadow-2xl relative z-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
          <FaEnvelope size={28} />
        </div>
        <h2 className="text-center text-2xl font-black text-ink">Check your email</h2>
        <p className="mt-3 text-center text-sm leading-7 text-muted">
          We sent a 6-digit verification code to <span className="font-semibold text-purple-400">{email || 'your inbox'}</span>. Enter it on the verification page to activate your account.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => navigate('/verify-email', { state: { email } })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:opacity-90"
          >
            Enter Verification Code
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-hair bg-card2 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-sub transition-all hover:border-purple-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <><FaSpinner className="animate-spin" /> Sending...</> : 'Resend Code'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center rounded-2xl border border-hair bg-card2 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-sub transition-all hover:border-purple-500/40"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default CheckYourEmail;
