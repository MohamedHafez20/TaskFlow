import React, { createContext, useContext, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', position: 'top-right' });

  const showToast = (message, type = "error", position = "top-right") => {
    setToast({ show: true, message, type, position });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "error", position: "top-right" });
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
        position={toast.position}
      />
    </ToastContext.Provider>
  );
};