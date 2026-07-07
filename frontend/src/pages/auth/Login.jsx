import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/Ui/ToastProvider';
import useUserStore from '../../store/useUserStore';
import usePageTitle from '../../hooks/usePageTitle';
import taskFlowLogo from '../../assets/reg.log.png'; // تأكد من مسار الصورة عندك
import BackgroundWrapper from '../../components/layout/BackgroundWrapper';

function Login() {
  usePageTitle('Login');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const loginUser = useUserStore((s) => s.loginUser);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(sessionStorage.getItem('reviewIntent') ? '/' : '/app/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please complete all login credentials.', 'error');
      return;
    }
    
    setIsLoading(true);
    const response = await loginUser({ email: email.trim(), password });
    setIsLoading(false);
    if (response.success) {
      showToast('Authentication approved. Welcome back!', 'success');
      navigate(sessionStorage.getItem('reviewIntent') ? '/' : '/app/dashboard');
    } else {
      showToast(response.message || 'Access denied.', 'error');
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
        
        {/* السكشن الجانبي (الصورة/اللوجو فقط - Minimalist) */}
      {/* السكشن الجانبي (الصورة تأخذ العرض والطول بالكامل) */}
{/* السكشن الجانبي - تم تصغير الارتفاع وإلغاء الخلفية */}
<motion.section
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  className="hidden lg:flex items-center justify-center rounded-[32px] h-[520px] relative overflow-hidden"
>
  {/* الصورة تغطي الكونتينر بالكامل بدون خلفية تحتها */}
  <img 
    src={taskFlowLogo} 
    alt="Background Visual" 
    className="absolute inset-0 w-full h-full object-cover opacity-40" 
  />
  
  {/* تدرج خفيف جداً لضمان تناغم أطراف الصورة مع الـ Dark Mode */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10]/60 to-transparent z-0" />
</motion.section>

        {/* كارت الفورم */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full mx-auto max-w-[440px] rounded-[32px] border border-hair bg-card p-8 shadow-2xl"
        >
          <div className="mb-8 border-b border-hair pb-6">
            <h2 className="text-xl font-black text-ink tracking-wide">Account Sign In</h2>
            <p className="text-xs text-muted mt-1">Provide encrypted credentials below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"><FaEnvelope size={12} /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card2 text-ink placeholder-faint border border-hair focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Security Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"><FaLock size={12} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-card2 text-ink placeholder-faint border border-hair focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-sub">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <><FaSpinner className="animate-spin" /> Verifying...</> : 'Initialize Session'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-hair space-y-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              <Link to="/register" className="text-purple-400 hover:text-purple-300">Create Account</Link>
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

export default Login;