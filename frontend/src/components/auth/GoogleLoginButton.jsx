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
        className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
              {loading ? <FaSpinner className="animate-spin text-gray-700 text-lg" /> : <FcGoogle className="text-2xl" />}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">{loading ? 'Signing in...' : 'Continue with Google'}</h3>
              <p className="mt-0.5 text-[11px] text-gray-400">Google Client ID is not configured yet</p>
            </div>
          </div>
          <FaArrowRight className="text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-400" />
        </div>
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
          className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                {loading ? <FaSpinner className="animate-spin text-gray-700 text-lg" /> : <FcGoogle className="text-2xl" />}
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">{loading ? 'Signing in...' : 'Continue with Google'}</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">Secure Google Authentication</p>
              </div>
            </div>
            <FaArrowRight className="text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-400" />
          </div>
        </motion.button>
      )}
    />
  );
}

export default GoogleLoginButton;