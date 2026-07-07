/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { FaClock, FaCheckCircle, FaFire, FaRobot } from 'react-icons/fa';

function StatsSection() {
 
   const stats = [
  { 
    icon: FaClock, 
    value: '45.2k', 
    label: 'Deep Focus Hours', 
    desc: 'Time spent in high-intensity blocks, free from distractions.', 
    color: 'text-purple-400' 
  },
  { 
    icon: FaCheckCircle, 
    value: '94%', 
    label: 'Tasks Completed', 
    desc: 'Actual work finished, not just planned. Consistency starts here.', 
    color: 'text-[var(--c-accent)]' 
  },
  { 
    icon: FaFire, 
    value: '18 Days', 
    label: 'Productivity Streaks', 
    desc: 'The longest chains of daily consistency maintained by our users.', 
    color: 'text-orange-400' 
  },
  { 
    icon: FaRobot, 
    value: '2.4s', 
    label: 'AI Insights', 
    desc: 'Real-time schedule optimizations tailored to your workflow.', 
    color: 'text-fuchsia-400' 
  }
];

  return (
    <section id="stats" className="py-24 px-4 border-b border-hair">
      <div className="max-w-7xl mx-auto">
        {/* العنوان - اختياري عشان يربط القسم */}
        <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-ink mb-4">Numbers That Matter</h2>
            <p className="text-muted text-sm tracking-widest uppercase">Performance Metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative p-6 rounded-3xl bg-hair border border-hair hover:border-hair transition-all duration-300 group"
            >
              <div className={`mb-4 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <h3 className="text-3xl font-black text-ink mb-1">{s.value}</h3>
              <p className="text-xs font-bold text-sub uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-[11px] text-muted leading-relaxed">{s.desc}</p>
              
              {/* لمسة جمالية عند الهوفر */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;