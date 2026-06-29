import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50">
      <div className="relative">
        {/* Main spinning container */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 relative"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 border-r-pink-400 rounded-full"></div>
          {/* Middle ring */}
          <div className="absolute inset-2 border-4 border-transparent border-t-blue-400 border-l-cyan-400 rounded-full"></div>
          {/* Inner ring */}
          <div className="absolute inset-4 border-4 border-transparent border-t-indigo-400 border-b-violet-400 rounded-full"></div>
        </motion.div>

        {/* Center pulsing dot */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"
        ></motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-40px)`
            }}
          ></motion.div>
        ))}

        {/* Loading text with glow effect */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-8 text-center"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Loading...
          </h2>
          <motion.div
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 mx-auto max-w-32"
          ></motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Loader;