/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

function FAQSection() {
  const faqs = [
    {
      q: 'Is TaskFlow free to use?',
      a: 'Yes! TaskFlow is completely free. You can create a secure account, manage checklists, use the Pomodoro timer, and earn experience points without any subscriptions.',
    },
    {
      q: 'How does the gamification system work?',
      a: 'Every completed task awards you 500 XP, and every completed focus block awards you 50 XP. Accumulating XP moves you to higher levels, updating your global rank and unlocking achievements.',
    },
    {
      q: 'Can I set a custom Pomodoro timer?',
      a: 'Yes, you can. You can select standard intervals (25-min Pomodoro, 5-min short break, 15-min long break) or choose the "Set custom time" option to insert any duration up to 180 minutes.',
    },
    {
      q: 'What is a Deep Session?',
      a: 'A Deep Session is a toggle that locks your focus block as a high-concentration period. Deep Sessions are calculated separately on your dashboard, count toward your streak, and help you build discipline.',
    },
  ];

  const [openIdx, setOpenIdx] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden px-4 md:px-8 select-none">
      <div className="absolute bottom-[-15%] left-[-15%] w-[45%] h-[45%] bg-fuchsia-600/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted">FAQ</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Questions</span>
          </h3>
        </div>

        {/* FAQs list */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl  overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm font-bold text-ink tracking-wide pr-4">
                    {faq.q}
                  </span>
                  <FaChevronDown
                    size={11}
                    className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-400' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-muted leading-relaxed border-t border-hair">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default FAQSection;
