import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import useUserStore from '../../store/useUserStore';
import { useToast } from '../../components/Ui/ToastProvider';
import BackgroundWrapper from '../../components/layout/BackgroundWrapper';
import usePageTitle from '../../hooks/usePageTitle';
import taskFlowLogo from '../../assets/reg.log.png';

function VerifyEmail() {
  usePageTitle('Verify Email');
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const verifyEmail = useUserStore((s) => s.verifyEmail);
  const resendVerification = useUserStore((s) => s.resendVerification);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Enter your email and verification code to continue.');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputsRef = useRef([]);
// console.log(process.env.RESEND_API_KEY);
  useEffect(() => {
    const stateEmail = location.state?.email || '';
    if (stateEmail) {
      setEmail(stateEmail);
      setStatus('sent');
      setMessage(`Verification code sent to ${stateEmail}. Enter it below.`);
    }
  }, [location.state]);

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    const code = otp.join('');
    if (code.length !== 6) {
      showToast('Please enter the full 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    const response = await verifyEmail({ email: email.trim(), code });
    setLoading(false);

    if (response.success) {
      setStatus('success');
      setMessage(response.message || 'Email verified successfully.');
    } else {
      setStatus(response.message?.toLowerCase().includes('expired') || response.message?.toLowerCase().includes('invalid') ? 'expired' : 'error');
      setMessage(response.message || 'Verification failed.');
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    const response = await resendVerification(email.trim());
    setLoading(false);

    if (response.success) {
      setStatus('idle');
      setMessage(response.message || 'Verification code resent successfully.');
      showToast(response.message || 'Verification code resent successfully.', 'success');
    } else {
      showToast(response.message || 'Unable to resend verification code.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-sub flex items-center justify-center p-4 md:p-8 relative overflow-hidden antialiased font-sans select-none">
      <BackgroundWrapper />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <Link to="/login" className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 rounded-2xl bg-hair border border-hair px-4 py-2.5 text-xs font-bold text-sub hover:bg-hair hover:border-purple-500/30 transition-all duration-300 z-50 shadow-lg">
        <FaArrowLeft size={10} className="text-purple-400" /> Back to Login
      </Link>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.3fr_440px] gap-8 items-center relative z-10">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mx-auto max-w-[520px] rounded-[32px] border border-hair bg-card p-8 shadow-2xl relative z-10">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${status === 'success' ? 'bg-emerald-500' : status === 'error' || status === 'expired' ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white shadow-lg`}>
          {status === 'loading' ? (
            <FaSpinner className="animate-spin" size={24} />
          ) : status === 'success' ? (
            <FaCheckCircle size={24} />
          ) : status === 'error' || status === 'expired' ? (
            <FaTimesCircle size={24} />
          ) : (
            <FaEnvelope size={24} />
          )}
        </div>

        <h2 className="text-center text-2xl font-black text-ink">{status === 'success' ? 'Email verified' : status === 'expired' ? 'Verification expired' : status === 'error' ? 'Verification failed' : 'Verify your email'}</h2>
        <p className="mt-3 text-center text-sm leading-7 text-muted">{message}</p>

        {status !== 'success' && (
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Email Address</label>
              <div className="flex items-center gap-2 rounded-2xl border border-hair bg-card2 px-4 py-3">
                <FaEnvelope className="text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamal@example.com"
                  className="w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Verification Code</label>
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-hair bg-card2 p-4">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="h-14 w-14 rounded-2xl border border-hair bg-transparent text-center text-xl font-black text-ink outline-none placeholder:text-faint"
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <><FaSpinner className="animate-spin" /> Verifying...</> : 'Verify Account'}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-hair bg-card2 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-sub transition-all hover:border-purple-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <><FaSpinner className="animate-spin" /> Sending...</> : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => navigate('/login')} className="rounded-2xl border border-hair bg-card2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-sub transition-all hover:border-purple-500/40">
            Go to Login
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

export default VerifyEmail;
