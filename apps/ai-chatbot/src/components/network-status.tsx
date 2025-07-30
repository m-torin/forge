'use client';

import { WifiIcon, WifiOffIcon } from '#/components/icons';
import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useNetwork } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Props for NetworkStatus component
 */
interface NetworkStatusProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Network status component showing connection state and quality
 * @param className - Additional CSS classes
 * @param showDetails - Whether to show detailed connection information
 */
export function NetworkStatus({ className, showDetails = false }: NetworkStatusProps) {
  const { online, downlink, rtt, type } = useNetwork();
  const { variants, performance } = useAnimationSystem();
  const [justWentOnline, setJustWentOnline] = useState(false);
  const [justWentOffline, setJustWentOffline] = useState(false);

  // Track connection state changes for enhanced feedback
  useEffect(() => {
    if (online) {
      setJustWentOnline(true);
      setJustWentOffline(false);
      const timer = setTimeout(() => setJustWentOnline(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setJustWentOffline(true);
      setJustWentOnline(false);
      const timer = setTimeout(() => setJustWentOffline(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [online]);

  const getConnectionQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
    if (!online) return 'offline';
    if (!downlink) return 'good';
    if (downlink > 10) return 'excellent';
    if (downlink > 1) return 'good';
    return 'poor';
  };

  const getStatusText = () => {
    if (!online) return 'Offline';
    const quality = getConnectionQuality();
    const connectionType = type === 'wifi' ? 'WiFi' : type === 'cellular' ? 'Mobile' : 'Connected';

    if (showDetails && quality !== 'good') {
      return `${connectionType} (${quality})`;
    }
    return connectionType;
  };

  const quality = getConnectionQuality();

  return (
    <AnimatePresence>
      <motion.div
        data-testid="network-status"
        className={cx('flex items-center gap-2 text-sm', className)}
        variants={variants.scaleVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Enhanced Connection Icon with State Transitions */}
        <motion.div
          className={cx(
            'flex items-center justify-center',
            online ? 'text-green-600' : 'text-red-500',
          )}
          animate={
            online
              ? justWentOnline
                ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                    transition: {
                      duration: performance.optimizedDuration(0.6),
                      ease: 'easeOut',
                    },
                  }
                : {
                    scale: quality === 'poor' ? [1, 1.1, 1] : 1,
                    transition: {
                      duration: performance.optimizedDuration(2),
                      repeat: quality === 'poor' ? Infinity : 0,
                      ease: 'easeInOut',
                    },
                  }
              : justWentOffline
                ? {
                    scale: [1, 0.8, 1.1, 1],
                    rotate: [0, -5, 5, 0],
                    transition: {
                      duration: performance.optimizedDuration(0.8),
                      ease: 'easeOut',
                    },
                  }
                : {
                    opacity: [1, 0.5, 1],
                    transition: {
                      duration: performance.optimizedDuration(1.5),
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
          }
          style={{ willChange: 'transform, opacity' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={online ? 'online' : 'offline'}
              variants={variants.rotateVariants}
              initial={{ rotate: online ? -90 : 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: online ? 90 : -90, opacity: 0 }}
              transition={{
                type: performance.isHighPerformanceDevice ? 'spring' : 'tween',
                stiffness: performance.isHighPerformanceDevice ? 300 : undefined,
                damping: performance.isHighPerformanceDevice ? 20 : undefined,
                duration: performance.isHighPerformanceDevice
                  ? undefined
                  : performance.optimizedDuration(0.3),
              }}
              style={{ willChange: 'transform, opacity' }}
            >
              {online ? <WifiIcon size={16} /> : <WifiOffIcon size={16} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Status Text with Color Transitions */}
        <motion.span
          className="font-medium"
          animate={{
            color: online
              ? quality === 'excellent'
                ? '#16a34a'
                : quality === 'good'
                  ? '#059669'
                  : quality === 'poor'
                    ? '#d97706'
                    : '#374151'
              : '#dc2626',
          }}
          transition={{ duration: performance.optimizedDuration(0.3) }}
          style={{ willChange: 'color' }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={getStatusText()}
              variants={variants.slideRightVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
            >
              {getStatusText()}
            </motion.span>
          </AnimatePresence>
        </motion.span>

        {/* Enhanced Network Details */}
        <AnimatePresence>
          {showDetails && online && (
            <motion.div
              variants={variants.slideRightVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-2 text-xs text-muted-foreground"
              style={{ willChange: 'transform, opacity' }}
            >
              {downlink && (
                <motion.span
                  className={cx(
                    'rounded-full px-1.5 py-0.5 text-xs font-medium',
                    quality === 'excellent'
                      ? 'bg-green-100 text-green-700'
                      : quality === 'good'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700',
                  )}
                  animate={{
                    scale: quality === 'poor' ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: performance.optimizedDuration(1),
                    repeat: quality === 'poor' ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  style={{ willChange: 'transform' }}
                >
                  {downlink.toFixed(1)}Mbps
                </motion.span>
              )}
              {rtt && (
                <motion.span
                  className={cx(
                    'rounded-full px-1.5 py-0.5 text-xs font-medium',
                    rtt < 100
                      ? 'bg-green-100 text-green-700'
                      : rtt < 300
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700',
                  )}
                  animate={{
                    scale: rtt > 300 ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: performance.optimizedDuration(1.5),
                    repeat: rtt > 300 ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  style={{ willChange: 'transform' }}
                >
                  {rtt}ms
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Connection Quality Indicator */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={
            justWentOnline
              ? {
                  scale: [1, 1.5, 1],
                  transition: { duration: performance.optimizedDuration(0.5) },
                }
              : {}
          }
          style={{ willChange: 'transform' }}
        >
          <motion.div
            className={cx(
              'h-2 w-2 rounded-full',
              online
                ? quality === 'excellent'
                  ? 'bg-green-500'
                  : quality === 'good'
                    ? 'bg-blue-500'
                    : quality === 'poor'
                      ? 'bg-orange-500'
                      : 'bg-gray-500'
                : 'bg-red-500',
            )}
            animate={
              !online
                ? {
                    opacity: [1, 0.3, 1],
                    scale: [1, 0.8, 1],
                    transition: {
                      duration: performance.optimizedDuration(1),
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
                : quality === 'poor'
                  ? {
                      opacity: [1, 0.6, 1],
                      transition: {
                        duration: performance.optimizedDuration(0.8),
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }
                  : {}
            }
            style={{ willChange: 'transform, opacity' }}
          />

          {/* Success pulse on connection recovery */}
          <AnimatePresence>
            {justWentOnline && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400"
                variants={variants.pulseVariants}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                exit="exit"
                transition={{ duration: performance.optimizedDuration(0.6) }}
                style={{ willChange: 'transform, opacity' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Offline Message Queue Component
interface OfflineMessageQueueProps {
  queuedMessages: number;
  onRetry?: () => void;
}

export function OfflineMessageQueue({ queuedMessages, onRetry }: OfflineMessageQueueProps) {
  const { online } = useNetwork();
  const { variants, performance } = useAnimationSystem();

  if (online || queuedMessages === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-testid="offline-message-queue"
        variants={variants.slideDownVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cx(
          'mx-4 mb-4 flex items-center justify-between gap-3 p-3',
          'border border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20',
          'rounded-lg shadow-sm',
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Left content with enhanced animations */}
        <motion.div
          className="flex items-center gap-3"
          variants={variants.staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced pulsing icon */}
          <motion.div
            className="text-orange-500"
            variants={variants.pulseVariants}
            animate="pulse"
            style={{ willChange: 'transform, opacity' }}
          >
            <WifiOffIcon size={16} />
          </motion.div>

          {/* Animated message count with number transition */}
          <motion.div variants={variants.slideRightVariants} className="flex items-center gap-1">
            <motion.span
              className="text-sm font-medium text-orange-700 dark:text-orange-300"
              key={queuedMessages}
              variants={variants.scaleVariants}
              initial="hidden"
              animate="visible"
              transition={{
                type: performance.isHighPerformanceDevice ? 'spring' : 'tween',
                stiffness: performance.isHighPerformanceDevice ? 400 : undefined,
                damping: performance.isHighPerformanceDevice ? 15 : undefined,
                duration: performance.isHighPerformanceDevice
                  ? undefined
                  : performance.optimizedDuration(0.2),
              }}
              style={{ willChange: 'transform, opacity' }}
            >
              {queuedMessages}
            </motion.span>
            <span className="text-sm text-orange-700 dark:text-orange-300">
              message{queuedMessages !== 1 ? 's' : ''} queued
            </span>
          </motion.div>
        </motion.div>

        {/* Enhanced retry button */}
        {onRetry && (
          <motion.div
            variants={variants.slideLeftVariants}
            style={{ willChange: 'transform, opacity' }}
          >
            <Button
              onClick={() => {
                performance.batchUpdates([onRetry]);
              }}
              size="sm"
              className={cx(
                'px-3 py-1 text-xs font-medium',
                'bg-orange-500 text-white',
                'hover:bg-orange-600',
                'border-orange-600',
              )}
              // Use enhanced button micromoments
            >
              <motion.span
                animate={{
                  rotate: [0, 360],
                  transition: {
                    duration: performance.optimizedDuration(2),
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
                style={{ willChange: 'transform' }}
              >
                ↻
              </motion.span>
              Retry
            </Button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for network status notifications
export function useNetworkNotifications() {
  const { online } = useNetwork();
  // Would integrate with notification system
  // This is a placeholder for now

  return {
    online,
    // Integration with notification system would go here
  };
}
