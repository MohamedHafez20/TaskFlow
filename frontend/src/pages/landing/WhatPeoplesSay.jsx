/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { FaClock, FaRobot, FaTrophy, FaCalendarAlt, FaQuoteLeft, FaPlus, FaStar } from 'react-icons/fa';

function TestimonialsSection() {
  const testimonials = [
    { name: "Ahmed Yasser", role: "Frontend Dev", text: "TaskFlow changed how I study. The AI assistant is a game changer for my productivity.", color: "from-purple-500 to-indigo-500" },
    { name: "Sara Mohamed", role: "CS Student", text: "The pomodoro engine is beautiful and the gamification keeps me motivated every day!", color: "from-cyan-500 to-blue-500" },
    { name: "Omar Khalid", role: "Software Engineer", text: "Finally, a tool that understands developers. Clean, dark, and extremely fast.", color: "from-fuchsia-500 to-pink-500" },
    { name: "Nour Hisham", role: "UI Designer", text: "The flow system is seamless. Best dashboard I have ever used for university tasks.", color: "from-violet-500 to-purple-600" },
  ];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden px-4 md:px-8 select-none">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-[-10%] w-[30%] h-[30%] bg-purple-600/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Community Voices</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Builders</span>
          </h3>
        </div>

        {/* Moving Testimonials */}
        <div className="relative flex overflow-hidden mask-fade-edges">
          <motion.div 
            className="flex gap-6"
            animate={{ x: [0, -1200] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div 
                key={idx} 
                className="w-[320px] shrink-0 p-8 rounded-[32px] border border-white/[0.06] bg-[#0c0c12]/60 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500 group"
              >
                <div className="flex justify-between items-start mb-6">
                  <FaQuoteLeft className="text-purple-500/40" size={20} />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <FaStar key={i} size={10} className="text-yellow-500/50" />)}
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 leading-relaxed mb-8 min-h-[80px]">"{t.text}"</p>
                
                <div className="flex items-center gap-4 border-t border-white/[0.05] pt-6">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${t.color} p-[2px]`}>
                    <div className="h-full w-full bg-[#0c0c12] rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Backend Ready UI */}
        <div className="mt-20 text-center">
          <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest">Share your journey with us</p>
          <button 
            onClick={() => { /* هنا هتربط الـ Modal أو الـ API Call بتاعك */ }}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/[0.03] border border-white/[0.05] hover:border-purple-500/50 transition-all duration-300"
          >
            <FaPlus className="text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-bold text-slate-300">Submit your experience</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;