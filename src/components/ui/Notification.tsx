import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const Notification = ({ message, type, duration = 3000, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="text-white" />;
      case 'error':
        return <FiAlertTriangle className="text-white" />;
      case 'warning':
        return <FiAlertTriangle className="text-white" />;
      case 'info':
        return <FiInfo className="text-white" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className={`${getBackgroundColor()} text-white rounded-lg shadow-lg p-4 flex items-start`}>
        <div className="mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          {message}
        </div>
        <button onClick={handleClose} className="ml-4 text-white hover:text-gray-200">
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default Notification;
