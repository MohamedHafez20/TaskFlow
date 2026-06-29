import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/Ui/ToastProvider';
import useUserStore from '../../store/useUserStore';
import usePageTitle from '../../hooks/usePageTitle';
import taskFlowLogo from '../../assets/reg.log.png'; // تأكد من مسار الصورة عندك

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
    if (isAuthenticated) navigate('/app/dashboard');
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
      navigate('/app/dashboard');
    } else {
      showToast(response.message || 'Access denied.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b10] text-slate-300 flex items-center justify-center p-4 md:p-8 relative overflow-hidden antialiased font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.06] blur-[140px] rounded-full pointer-events-none" />

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
          className="w-full mx-auto max-w-[440px] rounded-[32px] border border-white/[0.04] bg-[#13131a] p-8 shadow-2xl"
        >
          <div className="mb-8 border-b border-white/[0.03] pb-6">
            <h2 className="text-xl font-black text-white tracking-wide">Account Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Provide encrypted credentials below</p>
          </div>

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
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Security Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><FaLock size={12} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#161622]/60 text-white placeholder-slate-600 border border-white/[0.03] focus:border-purple-500/50 outline-none text-xs font-semibold transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
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

          <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <Link to="/register" className="text-purple-400 hover:text-purple-300">Create Account</Link>
            <Link to="/" className="flex items-center gap-1.5 hover:text-white transition-colors"><FaArrowLeft size={9} /> Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;