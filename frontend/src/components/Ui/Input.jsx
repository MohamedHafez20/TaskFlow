import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUserSecret } from 'react-icons/fa';
import { useToast } from './ToastProvider';

function Input({ handleStartLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('credentials'); // 'credentials' or 'guest'
  const { showToast } = useToast();

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in all fields!', 'error');
      return false;
    }
    // Validation بسيط للإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address!', 'error');
      return false;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters!', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // محاكاة الاتصال بالـ API أو السيرفر للتأكد من البيانات
    setTimeout(() => {
      showToast("Access Granted! Welcome back to Task Flow.", "success");
      handleStartLogin(); // الانتقال للـ Dashboard
      setIsLoading(false);
    }, 1500);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    showToast('Logged in as Guest instance successfully.', 'success');
    setTimeout(() => {
      handleStartLogin();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full text-slate-300 font-sans antialiased select-none">
      
      {/* 🧭 سويتش وضع الدخول الاحترافي */}
      <div className="flex gap-1.5 mb-6 bg-[#161622]/50 border border-white/[0.02] p-1 rounded-xl">
        <button
          type="button"
          onClick={() => !isLoading && setLoginMode('credentials')}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative ${
            loginMode === 'credentials' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FaLock size={10} />
          Secure Login
          {loginMode === 'credentials' && (
            <motion.div 
              layoutId="activeTabIndicator" 
              className="absolute inset-0 bg-purple-500/10 border border-purple-500/20 rounded-lg -z-10" 
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => !isLoading && setLoginMode('guest')}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative ${
            loginMode === 'guest' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FaUserSecret size={12} />
          Guest Mode
          {loginMode === 'guest' && (
            <motion.div 
              layoutId="activeTabIndicator" 
              className="absolute inset-0 bg-purple-500/10 border border-purple-500/20 rounded-lg -z-10" 
            />
          )}
        </button>
      </div>

      {/* 🎰 الواجهات الحركية */}
      <div className="overflow-hidden relative min-h-[260px]">
        <AnimatePresence mode="wait">
          {loginMode === 'credentials' ? (
            <motion.form
              key="cred-mode"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* حقل البريد الإلكتروني */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                  <FaEnvelope size={12} />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#161622]/60 text-white placeholder-slate-600 border border-white/[0.03] focus:outline-none focus:border-purple-500/50 text-xs font-semibold tracking-wide transition-all font-mono"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* حقل كلمة المرور */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                  <FaLock size={12} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#161622]/60 text-white placeholder-slate-600 border border-white/[0.03] focus:outline-none focus:border-purple-500/50 text-xs font-semibold tracking-wide transition-all font-mono"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              {/* أدوات التحكم الإضافية (Remember me & Forgot Password) */}
              <div className="flex items-center justify-between text-[11px] px-1 font-medium">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/[0.05] bg-[#161622] text-purple-600 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 transition-all"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                  onClick={() => showToast('Password reset option coming soon!', 'info')}
                >
                  Forgot Password?
                </button>
              </div>

              {/* زر إرسال الفورم */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.15)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.25)] transition-all duration-300 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <FaRocket className="text-xs" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="guest-mode"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="bg-[#181824]/40 border border-purple-500/10 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-slate-300">
                  👋 Welcome as an <span className="text-purple-400">Anonymous Guest</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Access standard operational features instantly without a profile session.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#161622] hover:bg-[#1c1c2b] border border-white/[0.04] hover:border-purple-500/20 text-slate-300 hover:text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    Launching Instance...
                  </>
                ) : (
                  <>
                    Continue as Guest
                    <FaRocket className="text-xs text-purple-400" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Input;