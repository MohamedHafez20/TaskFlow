import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaSpinner } from 'react-icons/fa';

function GoogleLoginButton({ onSuccess, disabled = false, loading = false, onError }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
  const hasGoogleClientId = Boolean(clientId);

  const handleError = (error) => {
    if (typeof onError === 'function') {
      onError(error);
      return;
    }

    if (typeof onSuccess === 'function') {
      onSuccess({ credential: null, error });
    }
  };

  useEffect(() => {
    if (!hasGoogleClientId || typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (typeof onSuccess === 'function') {
          onSuccess(response);
        }
      },
      ux_mode: 'popup',
      auto_select: false,
    });
  }, [clientId, hasGoogleClientId, onSuccess]);

  const handleClick = () => {
    if (!hasGoogleClientId) {
      handleError(new Error('Google client ID not configured'));
      return;
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      handleError(new Error('Google authentication is unavailable'));
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        handleError(new Error('Google sign-in could not be started.'));
      }
    });
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      type="button"
      disabled={disabled || loading}
      onClick={handleClick}
      className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 mt-2 text-xs font-black  tracking-widest text-slate-900 shadow-lg transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
        {loading ? <FaSpinner className="animate-spin text-slate-700 text-sm" /> : <FcGoogle className="text-lg" />}
      </div>
      <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
    </motion.button>
  );
}

export default GoogleLoginButton;