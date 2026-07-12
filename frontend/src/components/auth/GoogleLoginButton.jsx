import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaArrowRight, FaSpinner } from 'react-icons/fa';

function GoogleLoginButton({ onSuccess, disabled = false, loading = false }) {
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID);

  const handleError = () => {
    if (typeof onSuccess === 'function') {
      onSuccess({ credential: null });
    }
  };

  if (!hasGoogleClientId) {
    return (
      <motion.button
        whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -2 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
        type="button"
        disabled={disabled || loading}
        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          {loading ? <FaSpinner className="animate-spin text-slate-700 text-sm" /> : <FcGoogle className="text-lg" />}
        </div>
        <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
      </motion.button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={handleError}
      useOneTap={false}
      theme="outline"
      text="continue_with"
      shape="pill"
      size="large"
      ux_mode="popup"
      width="320"
      logo_alignment="left"
      render={(renderProps) => (
        <motion.button
          whileHover={{ scale: disabled || loading || renderProps.disabled ? 1 : 1.02, y: disabled || loading || renderProps.disabled ? 0 : -2 }}
          whileTap={{ scale: disabled || loading || renderProps.disabled ? 1 : 0.98 }}
          transition={{ duration: 0.2 }}
          type="button"
          disabled={disabled || loading || renderProps.disabled}
          onClick={renderProps.onClick}
          className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            {loading ? <FaSpinner className="animate-spin text-slate-700 text-sm" /> : <FcGoogle className="text-lg" />}
          </div>
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </motion.button>
      )}
    />
  );
}

export default GoogleLoginButton;