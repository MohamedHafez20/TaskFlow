import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

const Toast = ({ message, type = 'error', isVisible, onClose, position = "top-right" }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 2000);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [isVisible, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-400" />;
      case "error":
        return <FaExclamationTriangle className="text-red-400" />;
      case "info":
        return <FaInfoCircle className="text-blue-400" />;
      default:
        return <FaInfoCircle className="text-gray-400" />;
    }
  };

  const getPositionClasses = () => {
    const isMobile = window.innerWidth < 768;
    switch (position) {
      case "top-right":
        return isMobile ? "bottom-4 right-4" : "top-[5.5rem] right-4";
      case "top-left":
        return isMobile ? "bottom-4 left-4" : "top-[5.5rem] left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return isMobile ? "bottom-4 right-4" : "top-[5.5rem] right-4";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.3 }}
          transition={{ duration: 0.3 }}
          className={`fixed ${getPositionClasses()} z-50`}
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;