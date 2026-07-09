import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import useUserStore from "../store/useUserStore";
import { useToast } from "../components/Ui/ToastProvider";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";

function Settings() {
  const userName = useUserStore((s) => s.userName);
  const userEmail = useUserStore((s) => s.userEmail);
  const updateName = useUserStore((s) => s.updateName);
  const updateProfileEmail = useUserStore((s) => s.updateProfileEmail);
  const logout = useUserStore((s) => s.logout);
  const { showToast } = useToast();
  const [newName, setNewName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(userEmail || "");
  }, [userEmail]);

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

  const handleEmailSave = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast("Please enter your email.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const result = await updateProfileEmail(trimmedEmail);
    if (result.success) {
      showToast("Email updated successfully!", "success");
    } else {
      showToast(result.message || "Failed to update email.", "error");
    }
  };

  const isPasswordStrong = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handlePasswordSave = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showToast("Please fill all password fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Password confirmation does not match.", "error");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      showToast(
        "New password must be at least 8 characters and include uppercase, lowercase, number, and a symbol.",
        "error"
      );
      return;
    }

    const result = await useUserStore.getState().changePassword({
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim()
    });

    if (result.success) {
      showToast(result.message || "Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      showToast(result.message || "Failed to update password.", "error");
    }
  };

  usePageTitle("Settings");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-transparent p-3 text-sub sm:p-6"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-card/95 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-muted">Settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Account preferences</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Update your profile details and manage your account settings from one clean place.</p>
        </div>

        <section className="rounded-2xl bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FaUser className="text-purple-400" />
            <h2 className="text-lg font-semibold text-ink">User profile</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">Your name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-hair bg-inputbg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Save name
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FaUser className="text-purple-400" />
            <h2 className="text-lg font-semibold text-ink">Email & contact</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-hair bg-inputbg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50"
              />
            </div>

            <button
              onClick={handleEmailSave}
              className="w-full rounded-xl bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
            >
              Update email
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FaLock className="text-purple-400" />
            <h2 className="text-lg font-semibold text-ink">Change password</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-muted">Current password</label>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full rounded-xl border border-hair bg-inputbg px-4 py-3 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-muted"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-muted">New password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                className="w-full rounded-xl border border-hair bg-inputbg px-4 py-3 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-muted"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-muted">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full rounded-xl border border-hair bg-inputbg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50"
              />
            </div>

            <button
              onClick={handlePasswordSave}
              className="w-full rounded-xl bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
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