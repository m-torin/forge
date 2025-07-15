'use client';

import {
  useDisclosure,
  useDocumentVisibility,
  useEventListener,
  useFocusTrap,
  useIdle,
  useInterval,
  useMergedRef,
  useNetwork,
  useReducedMotion,
  useTimeout,
} from '@mantine/hooks';
import { logDebug } from '@repo/observability';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

// UX Context for sharing enhancement states
interface UXEnhancementContextValue {
  documentVisible: boolean;
  reducedMotion: boolean;
  isIdle: boolean;
  isOnline: boolean;
  shouldAnimateMotion: boolean;
  shouldPlaySound: boolean;
  shouldAutoSave: boolean;
}

const UXEnhancementContext = createContext<UXEnhancementContextValue | null>(null);

export function useUXEnhancements() {
  const context = useContext(UXEnhancementContext);
  if (!context) {
    throw new Error('useUXEnhancements must be used within UXEnhancementProvider');
  }
  return context;
}

interface UXEnhancementProviderProps {
  children: ReactNode;
  idleTimeout?: number;
}

export function UXEnhancementProvider({
  children,
  idleTimeout = 300000, // 5 minutes
}: UXEnhancementProviderProps) {
  const documentVisible = useDocumentVisibility();
  const reducedMotion = useReducedMotion();
  const isIdle = useIdle(idleTimeout);
  const { online: isOnline } = useNetwork();

  // Derived states for better UX decisions
  const shouldAnimateMotion = !reducedMotion && documentVisible === 'visible';
  const shouldPlaySound = documentVisible === 'visible' && !isIdle;
  const shouldAutoSave = documentVisible === 'visible' || isIdle;

  const value: UXEnhancementContextValue = {
    documentVisible: documentVisible === 'visible',
    reducedMotion: !!reducedMotion,
    isIdle,
    isOnline: !!isOnline,
    shouldAnimateMotion: !!shouldAnimateMotion,
    shouldPlaySound: !!shouldPlaySound,
    shouldAutoSave: !!shouldAutoSave,
  };

  return <UXEnhancementContext.Provider value={value}>{children}</UXEnhancementContext.Provider>;
}

// Enhanced Motion Component that respects user preferences
interface AccessibleMotionProps {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  fallback?: ReactNode;
  className?: string;
}

export function AccessibleMotion({
  children,
  initial,
  animate,
  exit,
  transition,
  fallback,
  className,
}: AccessibleMotionProps) {
  const { shouldAnimateMotion } = useUXEnhancements();

  if (!shouldAnimateMotion) {
    return <div className={className}>{fallback || children}</div>;
  }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Network Status Indicator
export function NetworkStatusIndicator() {
  const { isOnline, documentVisible } = useUXEnhancements();
  const [showOfflineMessage, { open: showOfflineMsg, close: hideOfflineMsg }] = useDisclosure();

  const { start: startOfflineTimer, clear: clearOfflineTimer } = useTimeout(
    () => hideOfflineMsg(),
    5000,
  );

  useEffect(() => {
    if (!isOnline && documentVisible) {
      showOfflineMsg();
      startOfflineTimer();
    } else {
      clearOfflineTimer();
    }
  }, [isOnline, documentVisible, startOfflineTimer, clearOfflineTimer, showOfflineMsg]);

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <AccessibleMotion
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed right-4 top-4 z-50"
        >
          <div
            className={cx(
              'flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg',
              'border border-red-600 bg-red-500 text-white',
            )}
          >
            <WifiOff size={16} />
            <span className="text-sm font-medium">You&apos;re offline</span>
          </div>
        </AccessibleMotion>
      )}
    </AnimatePresence>
  );
}

// Idle State Manager
interface IdleManagerProps {
  children: ReactNode;
  onIdle?: () => void;
  onActive?: () => void;
}

export function IdleManager({ children, onIdle, onActive }: IdleManagerProps) {
  const { isIdle, documentVisible } = useUXEnhancements();
  const wasIdle = useRef(false);

  useEffect(() => {
    if (isIdle && !wasIdle.current && documentVisible) {
      onIdle?.();
      wasIdle.current = true;
    } else if (!isIdle && wasIdle.current) {
      onActive?.();
      wasIdle.current = false;
    }
  }, [isIdle, documentVisible, onIdle, onActive]);

  return children;
}

// Document Title Manager
interface DocumentTitleManagerProps {
  title?: string;
  unreadCount?: number;
  isActive?: boolean;
}

export function DocumentTitleManager({
  title = 'AI Chatbot',
  unreadCount = 0,
  isActive = true,
}: DocumentTitleManagerProps) {
  const { documentVisible } = useUXEnhancements();

  useEffect(() => {
    let displayTitle = title;

    if (unreadCount > 0 && !documentVisible) {
      displayTitle = `(${unreadCount}) ${title}`;
    }

    if (!isActive && !documentVisible) {
      displayTitle = `💤 ${displayTitle}`;
    }

    document.title = displayTitle;
  }, [title, unreadCount, documentVisible, isActive]);

  return null;
}

// Focus Trap Component for Modals
interface FocusTrapModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function FocusTrapModal({ children, isOpen, onClose, className }: FocusTrapModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Enhanced focus trap with better escape handling
  const focusTrapRef = useFocusTrap(isOpen);
  const mergedRef = useMergedRef(modalRef, focusTrapRef);

  useEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <AccessibleMotion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal content */}
      <div
        ref={mergedRef}
        className={cx(
          'relative rounded-lg border border-border bg-background shadow-lg',
          'mx-4 w-full max-w-lg p-6',
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </AccessibleMotion>
  );
}

// Performance Monitor Component
export function PerformanceMonitor() {
  const { documentVisible, isIdle, isOnline } = useUXEnhancements();
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    isThrottled: false,
  });

  // Use useInterval for performance monitoring
  const performanceInterval = useInterval(() => {
    // @ts-ignore - performance.memory is available in Chrome
    const memory = (performance as any).memory;
    if (memory) {
      const usage = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
      setMetrics(prev => ({
        ...prev,
        memoryUsage: usage,
        isThrottled: usage > 80,
      }));
    }
  }, 5000);

  useEffect(() => {
    if (documentVisible && !isIdle) {
      performanceInterval.start();
    } else {
      performanceInterval.stop();
    }
  }, [documentVisible, isIdle, performanceInterval]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 rounded border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {documentVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        {isIdle && <Clock size={12} />}
        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span>Mem: {metrics.memoryUsage}%</span>
        {metrics.isThrottled && <span className="text-red-500">⚠️</span>}
      </div>
    </div>
  );
}

// Custom hook for smart notifications
export function useSmartNotifications() {
  const { documentVisible, shouldPlaySound, isIdle } = useUXEnhancements();

  const notify = async (title: string, options?: NotificationOptions) => {
    if (!documentVisible && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          ...options,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(title, options);
          }
        } catch (error) {
          logDebug('Failed to request notification permission', error);
        }
      }
    }

    // Visual notification when document is visible
    if (documentVisible && !isIdle) {
      // Could trigger toast notification here
      logDebug('Visual notification displayed', { title, documentVisible, isIdle });
    }
  };

  return { notify, canNotify: !documentVisible, shouldPlaySound };
}
