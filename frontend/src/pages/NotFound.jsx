import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import usePageTitle from "../hooks/usePageTitle";

function NotFound() {
  const navigate = useNavigate();
  usePageTitle("404 Not Found");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-xl rounded-[2rem] bg-hair border border-hair backdrop-blur-xl p-10 text-center shadow-glow">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-violet-950/90 mx-auto mb-6 text-white shadow-xl">
          <FaShieldAlt className="text-3xl" />
        </div>
        <h1 className="text-6xl font-black text-ink tracking-tight mb-4">404</h1>
        <p className="text-sub text-lg mb-6">You’ve reached a page that doesn’t exist yet. Let’s bring you back to the productivity hub.</p>
        <button
          onClick={() => navigate("/app/dashboard")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3 text-white font-semibold shadow-lg shadow-fuchsia-500/20 hover:brightness-110 transition"
        >
          <FaArrowLeft />
          Return Home
        </button>
      </div>
    </motion.div>
  );
}

export default NotFound;