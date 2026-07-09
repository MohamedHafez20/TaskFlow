import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useTaskStore from '../store/useTaskStore';
import { useToast } from '../components/Ui/ToastProvider';

/**
 * Hook to prevent navigation when Deep Session is active
 * Shows a modal warning and only allows navigation if user closes the session
 */
function useDeepSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDeepSession = useTaskStore((s) => s.isDeepSession);
  const [showWarning, setShowWarning] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const { showToast } = useToast();

  const handleNavigate = (path) => {
    // If Deep Session is active and trying to leave Pomodoro page, show warning
    if (
      isDeepSession &&
      location.pathname === '/app/pomodoro' &&
      path !== '/app/pomodoro'
    ) {
      showToast('⏸ Focus Mode is protecting your session — you\'re about to leave', 'warning');
      setTargetPath(path);
      setShowWarning(true);
      return false; // Prevent navigation
    }

    // Otherwise, navigate normally
    navigate(path);
    return true;
  };

  const handleWarningResponse = (shouldNavigate, newPath) => {
    setShowWarning(false);
    if (shouldNavigate && newPath) {
      navigate(newPath);
    }
    setTargetPath(null);
  };

  return {
    handleNavigate,
    showWarning,
    targetPath,
    handleWarningResponse,
  };
}

export default useDeepSessionGuard;
