import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';

const MIN_LEN = 3;
const MAX_LEN = 500;

export default function ReviewModal({ onClose, onSubmit, saving }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  // Close on Escape (unless a save is in flight).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const handleSubmit = () => {
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    const trimmed = text.trim();
    if (trimmed.length < MIN_LEN) {
      setError(`Please write at least ${MIN_LEN} characters.`);
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setError(`Please keep it under ${MAX_LEN} characters.`);
      return;
    }
    setError('');
    onSubmit({ rating, review: trimmed });
  };

  const active = hover || rating;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={saving ? undefined : onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md rounded-3xl border border-hair bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-ink tracking-wide">Share Your Experience</h3>
            <p className="mt-1 text-xs text-muted">Tell the community what you think about TaskFlow.</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted transition hover:bg-hair hover:text-sub disabled:opacity-40"
            aria-label="Close"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Interactive rating */}
        <div className="mb-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted">
            Your rating
          </label>
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                onClick={() => { setRating(star); setError(''); }}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onFocus={() => setHover(star)}
                onBlur={() => setHover(0)}
                className="rounded p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <FaStar
                  size={26}
                  className={star <= active ? 'text-yellow-400' : 'text-muted/30'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review text */}
        <div className="mb-2">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted">
            Your review
          </label>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value.slice(0, MAX_LEN)); setError(''); }}
            placeholder="Write your experience..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-hair bg-inputbg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-purple-500/50"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] text-rose-400 min-h-[15px]">{error}</span>
            <span className="text-[11px] text-faint">{text.trim().length}/{MAX_LEN}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-hair px-4 py-3 text-[11px] font-black uppercase tracking-widest text-sub transition hover:bg-hair disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
