import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import useUserStore from '../../store/useUserStore';
import { useToast } from '../../components/Ui/ToastProvider';
import BackgroundWrapper from '../../components/layout/BackgroundWrapper';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const verifyEmail = useUserStore((s) => s.verifyEmail);
  const resendVerification = useUserStore((s) => s.resendVerification);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      const response = await verifyEmail(token);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Email verified successfully.');
      } else {
        setStatus(response.message?.toLowerCase().includes('expired') || response.message?.toLowerCase().includes('invalid') ? 'expired' : 'error');
        setMessage(response.message || 'Verification failed.');
      }
    };

    verify();
  }, [searchParams, verifyEmail]);

  const handleResend = async () => {
    if (!email) {
      showToast('Please enter your email address.', 'error');
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
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${status === 'success' ? 'bg-emerald-500' : status === 'error' || status === 'expired' ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white shadow-lg`}>
          {status === 'loading' ? <FaSpinner className="animate-spin" size={24} /> : status === 'success' ? <FaCheckCircle size={24} /> : <FaTimesCircle size={24} />}
        </div>

        <h2 className="text-center text-2xl font-black text-ink">
          {status === 'success' ? 'Email verified' : status === 'expired' ? 'Verification expired' : status === 'error' ? 'Verification failed' : 'Verifying your email'}
        </h2>
        <p className="mt-3 text-center text-sm leading-7 text-muted">{message}</p>

        {status !== 'success' && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border border-hair bg-card2 px-4 py-3">
              <FaEnvelope className="text-purple-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              />
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <><FaSpinner className="animate-spin" /> Sending...</> : 'Resend Verification Email'}
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => navigate('/login')} className="rounded-2xl border border-hair bg-card2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-sub transition-all hover:border-purple-500/40">
            Go to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
