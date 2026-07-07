import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaCamera, FaUser, FaEnvelope, FaTimes } from 'react-icons/fa';
import useUserStore from '../store/useUserStore';
import { useToast } from './Ui/ToastProvider';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const overlayClass =
  'fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
const cardClass =
  'w-full max-w-sm rounded-3xl border border-hair bg-card p-6 shadow-2xl';
const inputClass =
  'w-full rounded-xl border border-hair bg-inputbg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50';
const primaryBtn =
  'flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-50';
const secondaryBtn =
  'flex-1 rounded-xl border border-hair px-4 py-3 text-[11px] font-black uppercase tracking-widest text-sub transition hover:bg-hair disabled:opacity-50';

function ModalShell({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={overlayClass}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={cardClass}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-hair hover:text-sub"
            aria-label="Close"
          >
            <FaTimes size={12} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function ProfileEditMenu() {
  const userName = useUserStore((s) => s.userName);
  const userEmail = useUserStore((s) => s.userEmail);
  const updateProfileName = useUserStore((s) => s.updateProfileName);
  const updateProfileEmail = useUserStore((s) => s.updateProfileEmail);
  const updateProfileAvatar = useUserStore((s) => s.updateProfileAvatar);
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'picture' | 'name' | 'email'
  const [saving, setSaving] = useState(false);

  const [nameValue, setNameValue] = useState(userName || '');
  const [emailValue, setEmailValue] = useState(userEmail || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const openModal = (modal) => {
    setMenuOpen(false);
    setNameValue(userName || '');
    setEmailValue(userEmail || '');
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    setActiveModal(modal);
  };

  const closeModal = () => {
    if (saving) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    setFile(null);
    setActiveModal(null);
  };

  // Close menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  // Close modal on Escape
  useEffect(() => {
    if (!activeModal) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activeModal]);

  // Revoke object URLs to avoid leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      showToast('Please select a valid image (JPEG, PNG, WEBP, GIF).', 'error');
      return;
    }
    if (selected.size > MAX_SIZE) {
      showToast('Image must be 2MB or smaller.', 'error');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return showToast('Please enter your name!', 'error');
    if (/\d/.test(trimmed)) return showToast('Please enter a valid name!', 'error');
    if (/[^؀-ۿa-zA-Z\s]/.test(trimmed)) {
      return showToast('Name can only contain Arabic or English letters and spaces!', 'error');
    }
    if (trimmed.length < 3) return showToast('Name must be at least 3 characters long!', 'error');

    setSaving(true);
    const result = await updateProfileName(trimmed);
    setSaving(false);
    if (result.success) {
      showToast('Name updated successfully!', 'success');
      setActiveModal(null);
    } else {
      showToast(result.message || 'Failed to update name.', 'error');
    }
  };

  const handleSaveEmail = async () => {
    const trimmed = emailValue.trim();
    if (!trimmed) return showToast('Please enter your email!', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return showToast('Please enter a valid email address!', 'error');
    }

    setSaving(true);
    const result = await updateProfileEmail(trimmed);
    setSaving(false);
    if (result.success) {
      showToast('Email updated successfully!', 'success');
      setActiveModal(null);
    } else {
      showToast(result.message || 'Failed to update email.', 'error');
    }
  };

  const handleSaveAvatar = async () => {
    if (!file) return showToast('Please choose an image first.', 'error');

    setSaving(true);
    const result = await updateProfileAvatar(file);
    setSaving(false);
    if (result.success) {
      showToast('Profile picture updated!', 'success');
      closeModal();
    } else {
      showToast(result.message || 'Failed to update profile picture.', 'error');
    }
  };

  const menuItems = [
    { key: 'picture', label: 'Change Profile Picture', icon: FaCamera },
    { key: 'name', label: 'Change Name', icon: FaUser },
    { key: 'email', label: 'Change Email', icon: FaEnvelope },
  ];

  return (
    <div className="absolute bottom-0 right-0" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="p-2.5 bg-card2 border border-hair rounded-full text-purple-400 shadow-lg hover:text-purple-300 transition-colors"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Edit profile"
      >
        <FaEdit size={12} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-hair bg-card p-1.5 shadow-2xl"
          >
            {menuItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="menuitem"
                onClick={() => openModal(key)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-sub transition hover:bg-purple-500/10 hover:text-purple-300 focus:bg-purple-500/10 focus:text-purple-300 focus:outline-none"
              >
                <Icon size={12} className="text-purple-400" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'picture' && (
          <ModalShell title="Change Profile Picture" onClose={closeModal}>
            <div className="flex flex-col items-center">
              <div className="mb-5 h-28 w-28 overflow-hidden rounded-full border border-hair bg-inputbg">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-faint">
                    <FaCamera size={24} />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-2 w-full rounded-xl border border-hair px-4 py-3 text-[11px] font-black uppercase tracking-widest text-sub transition hover:bg-hair"
              >
                {file ? 'Choose Another' : 'Select Image'}
              </button>
              <p className="mb-5 text-[10px] text-muted">JPEG, PNG, WEBP or GIF · max 2MB</p>

              <div className="flex w-full gap-3">
                <button onClick={closeModal} disabled={saving} className={secondaryBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveAvatar} disabled={saving || !file} className={primaryBtn}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </ModalShell>
        )}

        {activeModal === 'name' && (
          <ModalShell title="Change Name" onClose={closeModal}>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted">
              Display name
            </label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Enter your name"
              className={inputClass}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !saving && handleSaveName()}
            />
            <div className="mt-5 flex gap-3">
              <button onClick={closeModal} disabled={saving} className={secondaryBtn}>
                Cancel
              </button>
              <button onClick={handleSaveName} disabled={saving} className={primaryBtn}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </ModalShell>
        )}

        {activeModal === 'email' && (
          <ModalShell title="Change Email" onClose={closeModal}>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted">
              Email address
            </label>
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="Enter your email"
              className={inputClass}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !saving && handleSaveEmail()}
            />
            <div className="mt-5 flex gap-3">
              <button onClick={closeModal} disabled={saving} className={secondaryBtn}>
                Cancel
              </button>
              <button onClick={handleSaveEmail} disabled={saving} className={primaryBtn}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
