import { useState } from 'react';
import { ToastNotification, ToastType } from '../components/LetterOfCredit/types';

export const useToastNotification = () => {
  const [toast, setToast] = useState<ToastNotification>({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
};