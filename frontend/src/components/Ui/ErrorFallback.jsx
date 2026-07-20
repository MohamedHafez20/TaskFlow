import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSyncAlt, FaHome } from 'react-icons/fa';

function ErrorFallback() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.data?.message || error.statusText || 'Something went wrong.'
    : error instanceof Error
      ? error.message
      : 'Unexpected application error.';

  return (
    <div className="min-h-screen bg-[var(--c-appbg)] flex flex-col items-center justify-center p-6 text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg rounded-3xl border border-[var(--c-hair)] bg-[var(--c-card)] p-8 md:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />

        <h1 className="text-sm font-black uppercase tracking-[0.25em] text-red-400 mb-2">
          System Notice
        </h1>
        <h2 className="text-xl font-bold text-[var(--c-ink)] mb-3">
          Something went wrong
        </h2>
        <p className="text-xs text-[var(--c-muted)] leading-relaxed mb-6 max-w-md mx-auto">
          An unexpected error occurred while rendering this view. You can reload the page or navigate home.
        </p>

        {/* Error message detail block */}
        <div className="mb-6 rounded-2xl border border-red-500/10 bg-red-950/10 p-4 text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-red-400">Error Details</p>
          <p className="mt-1 break-words font-mono text-[11px] text-red-300 leading-normal select-text">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-xs font-bold text-white transition-all duration-200"
          >
            <FaSyncAlt className="text-[10px]" />
            Reload Page
          </motion.button>
          
          <Link
            to="/home"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--c-hair)] border border-[var(--c-hair)] hover:border-purple-500/20 px-5 py-3 text-xs font-bold text-[var(--c-sub)] hover:text-[var(--c-ink)] transition-all duration-300"
          >
            <FaHome className="text-[10px]" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorFallback;
