import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUserPlus, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/Ui/ToastProvider';
import useUserStore from '../../store/useUserStore';
import usePageTitle from '../../hooks/usePageTitle';
import taskFlowLogo from '../../assets/reg.log.png';
import BackgroundWrapper from '../../components/layout/BackgroundWrapper';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

function Register() {
  usePageTitle('Register');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const registerUser = useUserStore((s) => s.registerUser);
  const googleLogin = useUserStore((s) => s.googleLogin);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast('Please complete all registration fields.', 'error');
      return false;
    }
     // restrections for email and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return false;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return false;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const response = await registerUser({ name: name.trim(), email: email.trim(), password });
    setIsLoading(false);
    if (response.success) {
      showToast(response.message || 'Account created. Verification code sent.', 'success');
      navigate('/verify-email', { state: { email: response.email || email.trim() } });
    } else {
      showToast(response.message || 'Registration failed. Try again.', 'error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      showToast('Google sign-in was cancelled.', 'error');
      return;
    }

    setIsLoading(true);
    const response = await googleLogin({ credential: credentialResponse.credential });
    setIsLoading(false);

    if (response.success) {
      showToast('Signed in with Google successfully.', 'success');
      navigate(sessionStorage.getItem('reviewIntent') ? '/' : '/app/dashboard');
    } else {
      showToast(response.message || 'Google sign-in failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-sub flex items-center justify-center p-4 md:p-8 relative overflow-hidden antialiased font-sans select-none">
      <BackgroundWrapper />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.06] blur-[140px] rounded-full pointer-events-none" />

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 rounded-2xl bg-hair border border-hair px-4 py-2.5 text-xs font-bold text-sub hover:bg-hair hover:border-purple-500/30 transition-all duration-300 z-50 shadow-lg"
      >
        <FaArrowLeft size={10} className="text-purple-400 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
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

        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full mx-auto max-w-[440px] rounded-[32px] border border-hair bg-card p-8 shadow-2xl"
        >
          <div className="mb-8 border-b border-hair pb-6">
            <h2 className="text-xl font-black text-ink tracking-wide">Create Account</h2>
            <p className="text-xs text-muted mt-1">Setup your account credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
          
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"><FaUser size={12} /></span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g.,Kamal Abou eid"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card2 text-ink placeholder-faint border border-hair focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"><FaEnvelope size={12} /></span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamal@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card2 text-ink placeholder-faint border border-hair focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Security Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"><FaLock size={12} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-card2 text-ink placeholder-faint border border-hair focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-sub">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            {/* confirm password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"><FaLock size={12} /></span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-card2 text-ink placeholder-faint border border-hair focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <><FaSpinner className="animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-2 pt-2 space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-2xlpx-3 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                <span className="h-px w-8 bg-hair" />
                Or
                <span className="h-px w-8 bg-hair" />
              </div>
              <GoogleLoginButton onSuccess={handleGoogleSuccess} disabled={isLoading} />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              <div>
                <span className="text-muted mr-1.5">Already have an account?</span>
                <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign In</Link>
              </div>
              <Link to="/forgot-password" className="text-muted hover:text-purple-300 transition-colors">Forgot Password?</Link>
            </div>
            
            <div className="flex justify-center pt-3 border-t border-hair">
              <Link to="/" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted hover:text-purple-400 transition-colors">
                <FaArrowLeft size={10} /> Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;