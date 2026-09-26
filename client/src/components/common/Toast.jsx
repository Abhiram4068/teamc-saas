import React, { useEffect } from 'react';

export default function Toast({ show, message, type, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle text-green-500"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle text-red-500"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-yellow-500"></i>;
      default:
        return <i className="fas fa-info-circle text-gray-500"></i>;
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 border rounded-md shadow-lg flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${getStyle()}`}>
      {getIcon()}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
