import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import usePageTitle from "../hooks/usePageTitle";

function NotFound() {
  const navigate = useNavigate();
  usePageTitle("404 Not Found");

  return (
    <div className="min-h-screen bg-[var(--c-appbg)] flex flex-col items-center justify-center p-6 text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-[var(--c-hair)] bg-[var(--c-card)] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-[var(--c-ink)] mb-3">
          Page Not Found
        </h2>
        <p className="text-xs text-[var(--c-muted)] leading-relaxed mb-8 max-w-sm mx-auto">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--c-hair)] border border-[var(--c-hair)] hover:border-purple-500/20 px-6 py-3 text-xs font-bold text-[var(--c-sub)] hover:text-[var(--c-ink)] transition-all duration-300 w-full"
        >
          <FaArrowLeft className="text-[10px]" />
          Return Home
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFound;