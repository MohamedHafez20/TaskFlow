/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaRobot, FaTrophy, FaCalendarAlt, FaQuoteLeft, FaPlus, FaStar } from 'react-icons/fa';
import api from '../../api/axios';
import useUserStore from '../../store/useUserStore';
import { useToast } from '../../components/Ui/ToastProvider';
import ReviewModal from '../../components/ReviewModal';

// Avatar ring gradients, cycled by index to preserve the colorful design.
const RINGS = [
  'from-purple-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
  'from-violet-500 to-purple-600',
];

const formatDate = (iso) => {
  if (!iso) return 'Community';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return 'Community';
  }
};

function ReviewCard({ review, index }) {
  const ring = RINGS[index % RINGS.length];
  return (
    <div className="w-[320px] shrink-0 p-8 rounded-[32px] border border-hair bg-appbg backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500 group">
      <div className="flex justify-between items-start mb-6">
        <FaQuoteLeft className="text-purple-500/40" size={20} />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} size={10} className={i < review.rating ? 'text-yellow-500' : 'text-muted/30'} />
          ))}
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed mb-8 min-h-[80px]">"{review.review}"</p>

      <div className="flex items-center gap-4 border-t border-hair pt-6">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${ring} p-[2px]`}>
          {review.avatarUrl ? (
            <img src={review.avatarUrl} alt={review.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <div className="h-full w-full bg-appbg rounded-full" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-ink">{review.name}</h4>
          <p className="text-[10px] text-muted uppercase tracking-widest">{formatDate(review.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await api.get('/reviews');
      setReviews(data.reviews || []);
    } catch {
      // Landing must never break if reviews fail to load; just show empty state.
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Continue the flow after login/registration: if the user asked to review
  // before authenticating, open the modal automatically once they're back.
  useEffect(() => {
    const intent = sessionStorage.getItem('reviewIntent');
    if (!intent) return;
    sessionStorage.removeItem('reviewIntent');
    if (isAuthenticated) setShowModal(true);
  }, [isAuthenticated]);

  const handleSubmitClick = () => {
    if (isAuthenticated) {
      setShowModal(true);
    } else {
      sessionStorage.setItem('reviewIntent', '1');
      navigate('/login');
    }
  };

  const handleSubmitReview = async ({ rating, review }) => {
    setSaving(true);
    try {
      await api.post('/reviews', { rating, review });
      showToast('Thanks! Your review has been shared.', 'success');
      setShowModal(false);
      fetchReviews();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasReviews = reviews.length > 0;
  const loop = hasReviews ? [...reviews, ...reviews] : [];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden px-4 md:px-8 select-none">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-[-10%] w-[30%] h-[30%] bg-purple-600/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted">Community Voices</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-ink">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Builders</span>
          </h3>
        </div>

        {/* Moving Testimonials */}
        {hasReviews ? (
          <div className="relative flex overflow-hidden mask-fade-edges">
            <motion.div
              className="flex gap-6"
              animate={{ x: [0, -1200] }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            >
              {loop.map((review, idx) => (
                <ReviewCard key={`${review.id}-${idx}`} review={review} index={idx} />
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-muted">No reviews yet — be the first to share your experience!</p>
          </div>
        )}

        {/* Backend Ready UI */}
        <div className="mt-20 text-center">
          <p className="text-xs text-muted mb-6 uppercase tracking-widest">Share your journey with us</p>
          <button
            onClick={handleSubmitClick}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-hair border border-hair hover:border-purple-500/50 transition-all duration-300"
          >
            <FaPlus className="text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-bold text-sub">Submit your experience</span>
          </button>
        </div>
      </div>

      {showModal && (
        <ReviewModal
          onClose={() => !saving && setShowModal(false)}
          onSubmit={handleSubmitReview}
          saving={saving}
        />
      )}
    </section>
  );
}

export default TestimonialsSection;
