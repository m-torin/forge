import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Toast, type ToastProps } from '../components/Toast';

interface ToastItem extends ToastProps {
  id: string;
  duration?: number;
}

interface ToastContextType {
  show: (toast: Omit<ToastItem, 'id'>) => void;
  hide: (id: string) => void;
  hideAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top' | 'bottom';
}

export function ToastProvider({
  children,
  maxToasts = 5,
  position = 'top',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-hide after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hide(id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(
    () => ({
      show,
      hide,
      hideAll,
    }),
    [show, hide, hideAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <View
          className={`absolute left-0 right-0 z-[9999] px-4 ${
            position === 'top' ? 'top-12' : 'bottom-12'
          }`}
          pointerEvents="box-none"
        >
          {toasts.map((toast) => (
            <View key={toast.id} className="mb-2">
              <Toast
                {...toast}
                onClose={() => hide(toast.id)}
              />
            </View>
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}