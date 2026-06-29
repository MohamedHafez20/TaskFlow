import { useState, useRef } from 'react';

const useToast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', position: 'top-right' });
  const timeoutRef = useRef(null);

  const showToast = (message, type = "error", position = "top-right") => {
    setToast({ show: true, message, type, position });

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "error", position: "top-right" });
    }, 1000);
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "error", position: "top-right" });
  };

  return { toast, showToast, hideToast };
};

export default useToast;