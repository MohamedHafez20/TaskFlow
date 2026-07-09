import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        className="h-24 w-24 text-violet-400"
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
        <path
          d="M22 4 a 18 18 0 0 1 0 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
};

export default Loader;