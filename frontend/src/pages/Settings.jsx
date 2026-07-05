import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";
import useUserStore from "../store/useUserStore";
import { useToast } from "../components/Ui/ToastProvider";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";

function Settings() {
  const userName = useUserStore((s) => s.userName);
  const updateName = useUserStore((s) => s.updateName);
  const { showToast } = useToast();
  const [newName, setNewName] = useState(userName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
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

    const result = await updateName(newName.trim());
    if (result.success) {
      showToast("Name updated successfully!", "success");
      setTimeout(() => navigate("/app/dashboard"), 800);
    } else {
      showToast(result.message || "Failed to update name.", "error");
    }
  };

  const handlePasswordSave = () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showToast("Please fill all password fields.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Password confirmation does not match.", "error");
      return;
    }

    showToast("Password change form is ready for submission.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  usePageTitle("Settings");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-transparent p-3 text-slate-300 sm:p-6"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-white/[0.05] bg-[#161622] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Account preferences</h1>
          <p className="mt-2 text-sm text-slate-400">Update your profile details and manage your account security from one place.</p>
        </div>

        <section className="rounded-2xl border border-white/[0.05] bg-[#12121a] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <FaUser className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">User profile</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Your name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-white/[0.06] bg-[#0f1117] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Change your name
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.05] bg-[#12121a] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <FaLock className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>

          <div className="mt-5 space-y-4 rounded-xl border border-white/[0.05] bg-[#0f1117] p-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full rounded-xl border border-white/[0.06] bg-[#0f1117] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                className="w-full rounded-xl border border-white/[0.06] bg-[#0f1117] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full rounded-xl border border-white/[0.06] bg-[#0f1117] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50"
              />
            </div>

            <button
              onClick={handlePasswordSave}
              className="w-full rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
            >
              Update password
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export default Settings;