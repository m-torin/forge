'use client';

import { clsx } from 'clsx';
import { AnimatePresence, motion, useDragControls, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useMobileDetection } from '../hooks/use-mobile-detection';

// Create cn utility function for this package
const cn = (...classes: (string | undefined | null | boolean)[]) => clsx(classes);

// Simple icon components as placeholders - can be overridden via UI components
const CrossIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// Simple Button component
const Button = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  onClick,
  ...props
}: {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: any;
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'hover:bg-gray-100 text-gray-900',
  };
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 py-1 text-sm',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile-optimized drawer component
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  defaultSnapPoint?: number;
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.2, 0.5, 0.9],
  defaultSnapPoint = 0.5,
}: MobileDrawerProps) {
  const [snapPoint, setSnapPoint] = useState(defaultSnapPoint);
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  const handleDragEnd = (event: any, info: any) => {
    const velocity = info.velocity.y;
    const currentY = info.point.y;
    const windowHeight = window.innerHeight;
    const relativeY = currentY / windowHeight;

    // Determine closest snap point
    let closestSnapPoint = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - relativeY) < Math.abs(prev - relativeY) ? curr : prev,
    );

    // If dragging down with velocity, close or go to lower snap point
    if (velocity > 500) {
      const currentIndex = snapPoints.indexOf(snapPoint);
      if (currentIndex > 0) {
        closestSnapPoint = snapPoints[currentIndex - 1];
      } else {
        onClose();
        return;
      }
    }

    // If dragging up with velocity, go to higher snap point
    if (velocity < -500) {
      const currentIndex = snapPoints.indexOf(snapPoint);
      if (currentIndex < snapPoints.length - 1) {
        closestSnapPoint = snapPoints[currentIndex + 1];
      }
    }

    // Close if dragged to bottom
    if (closestSnapPoint <= 0.1) {
      onClose();
    } else {
      setSnapPoint(closestSnapPoint);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="bg-background fixed inset-x-0 bottom-0 z-50 rounded-t-xl shadow-xl"
            style={{ y }}
            initial={{ y: '100%' }}
            animate={{ y: `${(1 - snapPoint) * 100}%` }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-center pb-2 pt-3">
              <div className="bg-muted-foreground/30 h-1 w-12 rounded-full" />
            </div>

            {title && (
              <div className="flex items-center justify-between border-b px-4 pb-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <CrossIcon size={16} />
                </Button>
              </div>
            )}

            <div className="overflow-y-auto" style={{ height: `${snapPoint * 80}vh` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile-optimized input with improved touch targets
interface MobileInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MobileOptimizedInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
  className,
}: MobileInputProps) {
  const { isMobile, isTouchDevice } = useMobileDetection();
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={cn(
        'bg-background relative flex items-end gap-2 rounded-xl border p-3',
        isFocused && 'ring-primary ring-2 ring-opacity-50',
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none border-0 bg-transparent outline-none',
          'placeholder:text-muted-foreground',
          isTouchDevice && 'text-16px', // Prevent zoom on iOS
        )}
        style={{
          fontSize: isTouchDevice ? '16px' : '14px', // Prevent zoom on iOS
          lineHeight: '1.5',
          maxHeight: '120px',
        }}
      />

      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size={isMobile ? 'default' : 'sm'}
        className={cn(
          'shrink-0',
          isMobile && 'min-h-[44px] min-w-[44px]', // Better touch target
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </Button>
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 100 }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const scrollElement = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollElement.current) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    const isAtTop = scrollElement.current.scrollTop === 0;

    if (isAtTop && distance > 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldRefresh = pullDistance >= threshold;

  return (
    <div
      ref={scrollElement}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="bg-background/90 absolute left-0 right-0 top-0 z-10 flex items-center justify-center py-4 backdrop-blur-sm"
            initial={{ y: -60, opacity: 0 }}
            animate={{
              y: isPulling ? Math.min(pullDistance - 60, 0) : -60,
              opacity: isPulling ? 1 : 0,
            }}
            exit={{ y: -60, opacity: 0 }}
          >
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : pullProgress * 180,
                  scale: shouldRefresh ? 1.1 : 1,
                }}
                transition={{
                  rotate: isRefreshing ? { repeat: Infinity, duration: 1 } : undefined,
                }}
              >
                <ChevronDownIcon size={16} />
              </motion.div>
              <span>
                {isRefreshing
                  ? 'Refreshing...'
                  : shouldRefresh
                    ? 'Release to refresh'
                    : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

// Haptic feedback hook
export function useHapticFeedback() {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        selection: [5],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { triggerHaptic };
}

// Mobile-optimized scroll area with overscroll behavior
export function MobileScrollArea({
  children,
  className,
  showScrollbar = false,
}: {
  children: React.ReactNode;
  className?: string;
  showScrollbar?: boolean;
}) {
  return (
    <div
      className={cn(
        'overscroll-behavior-contain overflow-auto',
        'scrollbar-thin scrollbar-track-transparent',
        !showScrollbar && 'scrollbar-none',
        // iOS momentum scrolling
        'webkit-overflow-scrolling-touch',
        className,
      )}
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </div>
  );
}

// Safe area provider for notched devices
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set CSS custom properties for safe area insets
    const updateSafeArea = () => {
      const safeAreaTop =
        getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
      const safeAreaBottom =
        getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
      const safeAreaLeft =
        getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0px';
      const safeAreaRight =
        getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0px';

      document.documentElement.style.setProperty('--safe-area-inset-top', safeAreaTop);
      document.documentElement.style.setProperty('--safe-area-inset-bottom', safeAreaBottom);
      document.documentElement.style.setProperty('--safe-area-inset-left', safeAreaLeft);
      document.documentElement.style.setProperty('--safe-area-inset-right', safeAreaRight);
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return (
    <div
      className="safe-area-provider"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {children}
    </div>
  );
}
