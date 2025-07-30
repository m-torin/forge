'use client';

import {
  useDisclosure,
  useLocalStorage,
  useLongPress,
  useMediaQuery,
  useOrientation,
  useThrottledCallback,
  useTimeout,
  useViewportSize,
} from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-react';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

// Mobile Context for sharing mobile-specific states
interface MobileEnhancementContextValue {
  isPortrait: boolean;
  isLandscape: boolean;
  orientation: 'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  viewportSize: { width: number; height: number };
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}

const MobileEnhancementContext = createContext<MobileEnhancementContextValue | null>(null);

export function useMobileEnhancements() {
  const context = useContext(MobileEnhancementContext);
  if (!context) {
    throw new Error('useMobileEnhancements must be used within MobileEnhancementProvider');
  }
  return context;
}

interface MobileEnhancementProviderProps {
  children: ReactNode;
}

export function MobileEnhancementProvider({ children }: MobileEnhancementProviderProps) {
  const orientation = useOrientation();
  const { width, height } = useViewportSize();

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // Derived states
  const isPortrait = orientation.angle === 0 || orientation.angle === 180;
  const isLandscape = orientation.angle === 90 || orientation.angle === 270;

  const deviceType: 'mobile' | 'tablet' | 'desktop' = isMobile
    ? 'mobile'
    : isTablet
      ? 'tablet'
      : 'desktop';

  // Calculate safe area insets (for notched devices)
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    // Get CSS safe area inset values
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    setSafeAreaInsets({
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    });
  }, [orientation]);

  const value: MobileEnhancementContextValue = {
    isPortrait,
    isLandscape,
    orientation: (orientation.type === 'landscape-primary' ? 'landscape' : orientation.type) as
      | 'portrait'
      | 'landscape'
      | 'portrait-secondary'
      | 'landscape-secondary',
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    viewportSize: { width, height },
    safeAreaInsets,
  };

  return (
    <MobileEnhancementContext.Provider value={value}>{children}</MobileEnhancementContext.Provider>
  );
}

// Orientation Change Indicator
export function OrientationIndicator() {
  const { orientation, isPortrait, isLandscape: _isLandscape } = useMobileEnhancements();
  const [showIndicator, { open: showOrientationIndicator, close: hideOrientationIndicator }] =
    useDisclosure();
  const [orientationMemory, setOrientationMemory] = useLocalStorage<string>({
    key: 'last-orientation',
    defaultValue: 'portrait-primary',
  });

  const { start: startHideTimer } = useTimeout(() => hideOrientationIndicator(), 2000);

  useEffect(() => {
    if (orientation !== orientationMemory) {
      showOrientationIndicator();
      setOrientationMemory(orientation);
      startHideTimer();
    }
  }, [
    orientation,
    orientationMemory,
    setOrientationMemory,
    showOrientationIndicator,
    hideOrientationIndicator,
    startHideTimer,
  ]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
        >
          <div
            className={cx(
              'flex items-center gap-2 rounded-full px-4 py-2 shadow-lg',
              'border border-border bg-background/90 backdrop-blur-sm',
            )}
          >
            <RotateCcw size={16} className="animate-spin" />
            <span className="text-sm font-medium">
              {isPortrait ? 'Portrait' : 'Landscape'} mode
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Long Press Menu Component
interface LongPressMenuProps {
  children: ReactNode;
  onLongPress: () => void;
  disabled?: boolean;
  className?: string;
}

export function LongPressMenu({
  children,
  onLongPress,
  disabled = false,
  className,
}: LongPressMenuProps) {
  const { isMobile } = useMobileEnhancements();
  const [isPressed, { open: startPress, close: endPress }] = useDisclosure();

  const longPressHandlers = useLongPress(
    () => {
      if (!disabled) {
        onLongPress();
        // Haptic feedback on supported devices
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    },
    {
      threshold: 500, // 500ms for long press
    },
  );

  const handlePressStart = () => {
    if (isMobile && !disabled) {
      startPress();
    }
  };

  const handlePressEnd = () => {
    endPress();
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      {...longPressHandlers}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      className={cx(
        className,
        isPressed && 'scale-95 opacity-80',
        'select-none transition-all duration-150',
      )}
      style={{ WebkitTouchCallout: 'none' }}
    >
      {children}
    </div>
  );
}

// Touch-friendly Scroll Area
interface TouchScrollAreaProps {
  children: ReactNode;
  className?: string;
  maxHeight?: number;
  showScrollIndicator?: boolean;
}

export function TouchScrollArea({
  children,
  className,
  maxHeight = 400,
  showScrollIndicator = true,
}: TouchScrollAreaProps) {
  const { isMobile, viewportSize } = useMobileEnhancements();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, { open: showScrollUp, close: hideScrollUp }] = useDisclosure();
  const [canScrollDown, { open: showScrollDown, close: hideScrollDown }] = useDisclosure();

  // Use throttled callback for scroll detection to improve performance
  const checkScrollability = useThrottledCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    if (scrollTop > 0) {
      showScrollUp();
    } else {
      hideScrollUp();
    }
    if (scrollTop < scrollHeight - clientHeight) {
      showScrollDown();
    } else {
      hideScrollDown();
    }
  }, 100); // Throttle to once every 100ms

  useEffect(() => {
    checkScrollability();
  }, [checkScrollability, children]);

  // Use conditional event listener for scroll
  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('scroll', checkScrollability);
    return () => element.removeEventListener('scroll', checkScrollability);
  }, [checkScrollability]);

  const effectiveMaxHeight = isMobile ? Math.min(maxHeight, viewportSize.height * 0.6) : maxHeight;

  return (
    <div className={cx('relative', className)}>
      {/* Scroll indicators for mobile */}
      {isMobile && showScrollIndicator && (
        <>
          <AnimatePresence>
            {canScrollUp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 right-0 top-0 z-10 flex justify-center pt-2"
              >
                <div className="rounded-full bg-background/80 p-1 shadow-sm">
                  <ChevronUp size={16} className="text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollDown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-2"
              >
                <div className="rounded-full bg-background/80 p-1 shadow-sm">
                  <ChevronDown size={16} className="text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div
        ref={scrollRef}
        className={cx(
          'overflow-y-auto',
          isMobile
            ? 'scrollbar-hide'
            : 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700',
        )}
        style={{
          maxHeight: effectiveMaxHeight,
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Modal with Scroll Lock for Mobile
interface MobileModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showHandle?: boolean;
  className?: string;
}

export function MobileModal({
  children,
  isOpen,
  onClose,
  title,
  showHandle = true,
  className,
}: MobileModalProps) {
  const { isMobile, safeAreaInsets } = useMobileEnhancements();
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock scroll when modal is open (using native CSS)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle swipe down to close on mobile
  const [dragY, setDragY] = useState(0);
  const [isDragging, { open: startDragging, close: stopDragging }] = useDisclosure();

  const handleDragStart = (event: React.TouchEvent) => {
    if (!isMobile) return;
    startDragging();
    setDragY(event.touches[0].clientY);
  };

  const handleDragMove = (event: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - dragY;

    if (deltaY > 0) {
      // Only allow dragging down
      modalRef.current?.style.setProperty('transform', `translateY(${deltaY}px)`);
    }
  };

  const handleDragEnd = (event: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    stopDragging();

    const currentY = event.changedTouches[0].clientY;
    const deltaY = currentY - dragY;

    if (deltaY > 100) {
      // Close modal if dragged down more than 100px
      onClose();
    } else {
      // Snap back to original position
      modalRef.current?.style.setProperty('transform', 'translateY(0)');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
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
      <motion.div
        ref={modalRef}
        initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
        className={cx(
          'relative w-full max-w-lg border border-border bg-background shadow-lg',
          isMobile ? 'max-h-[90vh] min-h-[50vh] rounded-t-xl' : 'mx-4 rounded-lg',
          className,
        )}
        style={
          isMobile
            ? {
                paddingBottom: safeAreaInsets.bottom,
                paddingLeft: safeAreaInsets.left,
                paddingRight: safeAreaInsets.right,
              }
            : undefined
        }
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Drag handle for mobile */}
        {isMobile && showHandle && (
          <div className="flex justify-center py-3">
            <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// Device Type Indicator (for development)
export function DeviceTypeIndicator() {
  const { deviceType, orientation, viewportSize } = useMobileEnhancements();

  if (process.env.NODE_ENV !== 'development') return null;

  const getIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone size={12} />;
      case 'tablet':
        return <Tablet size={12} />;
      default:
        return <Monitor size={12} />;
    }
  };

  return (
    <div className="fixed right-4 top-4 rounded border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {getIcon()}
        <span>{deviceType}</span>
        <span>{orientation}</span>
        <span>
          {viewportSize.width}×{viewportSize.height}
        </span>
      </div>
    </div>
  );
}
