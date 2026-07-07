import { motion } from 'framer-motion';
import { FaClock, FaRobot, FaTrophy, FaCalendarAlt } from 'react-icons/fa';

function DiscoverSystem() {
  const features = [
    {
      icon: FaClock,
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-400',
      title: 'Aesthetic Focus Engine',
      description: 'Sleek, configurable Pomodoro timers linked directly to your active task queue. Turn on Deep Sessions to track high-intensity concentration blocks.',
    },
    {
      icon: FaRobot,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-[var(--c-accent)]',
      title: 'Intelligent AI Assistant',
      description: 'An AI-powered chatbot that analyzes your work habits, organizes your checklist, and guides you dynamically when you get stuck.',
    },
    {
      icon: FaTrophy,
      color: 'from-fuchsia-500 to-pink-500',
      textColor: 'text-fuchsia-400',
      title: 'Gamified Progression',
      description: 'Earn points and level up by completing focus blocks and tasks. Build streaks, climb your standing, and unlock exclusive profile badges.',
    },
    {
      icon: FaCalendarAlt,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-400',
      title: 'Dynamic Task Calendar',
      description: 'Visualize your weekly tasks and drag-and-drop items inside an integrated timetable to plan out your future study blocks.',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden px-4 md:px-8 select-none">
      {/* Glow backgrounds */}
      <div className="absolute top-1/2 left-[-15%] w-[40%] h-[40%] bg-purple-600/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-[-15%] w-[40%] h-[40%] bg-cyan-600/[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted">How It Works</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
            Discover the unified <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Flow System</span>
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Eliminate distraction and organize your study blocks with a system engineered from the ground up for high concentration.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group rounded-3xl border border-hair bg-appbg p-6 backdrop-blur-xl hover:bg-hair hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-4">
                {/* Icon box */}
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-r ${feature.color} p-[1px] shadow-lg shadow-purple-500/5`}>
                  <div className="h-full w-full bg-appbg rounded-[15px] flex items-center justify-center text-ink">
                    <feature.icon className="text-sm text-ink" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-ink tracking-wide group-hover:text-purple-400 transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default DiscoverSystem;
