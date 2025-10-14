// components/LetterOfCredit/ToastNotification.tsx
"use client";
import React from 'react';
import { CheckCircle, Warning, Clock, X } from "@phosphor-icons/react";
import { ToastNotification as ToastType } from './types';

interface ToastNotificationProps {
  toast: ToastType;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  if (!toast.visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <Warning size={20} className="text-red-500" />;
      case 'info':
        return <Clock size={20} className="text-blue-500" />;
      case 'warning':
        return <Warning size={20} className="text-yellow-500" />;
      default:
        return <CheckCircle size={20} className="text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${getBackgroundColor()} border rounded-xl shadow-lg p-4 animate-slide-in-right`}>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <span className="text-gray-800 text-sm flex-1">{toast.message}</span>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;