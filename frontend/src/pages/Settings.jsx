import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaSave, FaTimes, FaSpinner } from "react-icons/fa";
import useUserStore from "../store/useUserStore";
import { useToast } from "../components/Ui/ToastProvider";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";

function Settings() {
  const { userName, setUserName } = useUserStore();
  const { showToast } = useToast();
  const [newName, setNewName] = useState(userName || "");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = () => {
    if (!newName.trim()) {
      showToast("Please enter your name!", "error");
      return;
    }

    if (/\d/.test(newName)) {
      showToast("Please enter a valid name!", "error");
      return;
    }

    if (/[^\u0600-\u06FFa-zA-Z\s]/.test(newName)) {
      showToast("Name can only contain Arabic or English letters and spaces!", "error");
      return;
    }

    if (newName.trim().length < 3) {
      showToast("Name must be at least 3 characters long!", "error");
      return;
    }

    setIsLoading(true);
    setUserName(newName.trim());
    showToast("Name updated successfully! Redirecting to dashboard...", "success");

    setTimeout(() => {
      setIsLoading(false);
      navigate("/app/dashboard");
    }, 1200);
  };

  usePageTitle("Settings");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <FaUser className="text-purple-400" />
              Settings
            </h1>
            <p className="text-gray-300 text-lg">
              Customize your experience
            </p>
          </motion.div>

          {/* User Settings Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <FaUser className="text-purple-400" />
              User Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400/50 transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 p-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaSpinner className="w-4 h-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Change Your Name
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Placeholder for future settings */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              More Settings Coming Soon
            </h2>
            <p className="text-gray-300">
              We're working on more customization options. Stay tuned!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Settings;