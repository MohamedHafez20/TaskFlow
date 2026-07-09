import { motion } from 'framer-motion';
import { FaClock, FaTimes } from 'react-icons/fa';
import useTaskStore from '../store/useTaskStore';
import { useToast } from './Ui/ToastProvider';

function DeepSessionWarning({ isOpen, targetPath, onNavigate }) {
  const setIsDeepSession = useTaskStore((s) => s.setIsDeepSession);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCloseSession = () => {
    showToast('Focus Mode closed — timer has been reset', 'info');
    setIsDeepSession(false);
    if (onNavigate) {
      onNavigate(targetPath);
    }
  };

  const handleDismiss = () => {
    // Just close the modal, don't navigate
    showToast('Great! You\'re staying focused 💪', 'success');
    if (onNavigate) {
      onNavigate(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-hair/50 text-sub transition-all hover:bg-hair"
          aria-label="Close modal"
        >
          <FaTimes size={18} />
        </button>

        {/* Icon */}
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500">
          <FaClock className="text-white" size={24} />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-bold text-white">
          🎯 Focus Mode Active
        </h2>
        <p className="mb-6 text-xs font-semibold text-purple-300 uppercase tracking-wide">
          Deep Session in Progress
        </p>

        {/* Description */}
        <p className="mb-3 text-sm text-muted leading-relaxed">
          You're in Deep Session focus mode. Leaving now will:
        </p>
        <ul className="mb-6 space-y-2 text-sm text-muted list-disc list-inside">
          <li>Interrupt your concentration</li>
          <li>Reset your Pomodoro timer</li>
          <li>Break your session momentum</li>
        </ul>

        {/* Secondary message */}
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-xs text-emerald-200 text-center">
            ✨ <strong>You're doing great!</strong> Stay focused to complete your session
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleDismiss()}
            className="rounded-lg bg-emerald-500/15 px-4 py-3 text-center text-sm font-semibold text-emerald-300 border border-emerald-500/30 transition-all hover:bg-emerald-500/25 active:scale-95"
          >
            ✓ Stay Focused
          </button>
          <button
            onClick={handleCloseSession}
            className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-center text-sm font-semibold text-rose-300 transition-all hover:bg-rose-500/20 active:scale-95"
          >
            ✕ Close Focus Mode & Leave
          </button>
        </div>

        {/* Hint text */}
        <p className="mt-4 text-xs text-muted/70 text-center leading-relaxed">
          If you close Focus Mode now, your session will be reset and you'll lose your streak.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default DeepSessionWarning;
