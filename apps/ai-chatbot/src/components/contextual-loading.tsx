'use client';

import { BACKDROP_STYLES, RESPONSIVE, Z_INDEX } from '#/lib/ui-constants';
import { useCounter, useInterval, useTimeout, useToggle } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Loading State Types
export type LoadingContext =
  | 'sending-message'
  | 'uploading-file'
  | 'processing-ai'
  | 'connecting'
  | 'saving-draft'
  | 'loading-history'
  | 'thinking'
  | 'generating-response';

interface ContextualLoadingProps {
  context: LoadingContext;
  isLoading: boolean;
  progress?: number;
  message?: string;
  className?: string;
  onCancel?: () => void;
}

export function ContextualLoading({
  context,
  isLoading,
  progress,
  message,
  className,
  onCancel,
}: ContextualLoadingProps) {
  const [stage, setStage] = useState(0);
  const [showCancel, setShowCancel] = useToggle();
  const [elapsedTime, { increment: incrementTime, reset: resetTime }] = useCounter(0);

  // Auto-show cancel button after 3 seconds
  const { start: startCancelTimer, clear: clearCancelTimer } = useTimeout(() => {
    setShowCancel(true);
  }, 3000);

  // Track elapsed time with useInterval
  const timeInterval = useInterval(() => {
    incrementTime();
  }, 1000);

  useEffect(() => {
    if (isLoading) {
      resetTime();
      startCancelTimer();
      timeInterval.start();
    } else {
      timeInterval.stop();
      clearCancelTimer();
      setShowCancel(false);
    }
  }, [isLoading, resetTime, startCancelTimer, timeInterval, clearCancelTimer, setShowCancel]);

  // Context-specific stage progression with useInterval
  const stageInterval = useInterval(() => {
    const stages = getStagesForContext(context);
    setStage(prev => (prev + 1) % stages.length);
  }, 2000);

  useEffect(() => {
    if (!isLoading) {
      setStage(0);
      stageInterval.stop();
      return;
    }

    const stages = getStagesForContext(context);
    if (stages.length <= 1) {
      stageInterval.stop();
      return;
    }

    stageInterval.start();
  }, [isLoading, context, stageInterval]);

  if (!isLoading) return null;

  const contextConfig = getContextConfig(context);
  const stages = getStagesForContext(context);
  const currentMessage = message || stages[stage];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cx(
          'flex items-center gap-3 rounded-lg p-4',
          'border border-border bg-muted/50 backdrop-blur-sm',
          className,
        )}
        data-testid={`loading-${context}`}
      >
        {/* Animated Icon */}
        <motion.div
          animate={contextConfig.animation}
          transition={contextConfig.transition}
          className="text-2xl"
        >
          {contextConfig.icon}
        </motion.div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <motion.h4
              key={currentMessage}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-medium ${RESPONSIVE.TYPOGRAPHY.BODY.MD}`}
            >
              {currentMessage}
            </motion.h4>

            {elapsedTime > 5 && (
              <span className={`${RESPONSIVE.TYPOGRAPHY.BODY.SM} text-muted-foreground`}>
                {elapsedTime}s
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {typeof progress === 'number' && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="h-full bg-primary"
              />
            </div>
          )}

          {/* Indeterminate Progress */}
          {typeof progress !== 'number' && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="h-full w-1/3 rounded-full bg-primary"
                style={{ transformOrigin: 'left' }}
              />
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <AnimatePresence>
          {showCancel && onCancel && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className={cx(
                'rounded px-3 py-1 text-xs font-medium',
                'bg-destructive/10 text-destructive hover:bg-destructive/20',
                'transition-colors duration-200',
              )}
            >
              Cancel
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// Context configurations
function getContextConfig(context: LoadingContext) {
  const configs = {
    'sending-message': {
      icon: '📤',
      animation: {
        x: [0, 10, 0],
        scale: [1, 1.1, 1],
      },
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    'uploading-file': {
      icon: '📎',
      animation: {
        y: [0, -10, 0],
        rotate: [0, 10, -10, 0],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
    'processing-ai': {
      icon: '🤖',
      animation: {
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
    connecting: {
      icon: '🔌',
      animation: {
        rotate: [0, 180, 360],
        scale: [1, 0.9, 1],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    'saving-draft': {
      icon: '💾',
      animation: {
        scale: [1, 1.1, 1],
        y: [0, -2, 0],
      },
      transition: {
        duration: 0.8,
        repeat: Infinity,
      },
    },
    'loading-history': {
      icon: '📚',
      animation: {
        rotateY: [0, 180, 360],
        scale: [1, 1.05, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
    thinking: {
      icon: '🤔',
      animation: {
        rotate: [-5, 5, -5],
        scale: [1, 1.1, 1],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
    'generating-response': {
      icon: '✨',
      animation: {
        scale: [1, 1.3, 1],
        rotate: [0, 360],
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  return configs[context];
}

// Context-specific stage messages
function getStagesForContext(context: LoadingContext): string[] {
  const stages = {
    'sending-message': ['Sending message...', 'Processing...', 'Almost done...'],
    'uploading-file': ['Uploading file...', 'Processing upload...', 'Finalizing...'],
    'processing-ai': [
      'AI is thinking...',
      'Analyzing context...',
      'Generating response...',
      'Finalizing answer...',
    ],
    connecting: ['Connecting...', 'Establishing connection...', 'Syncing...'],
    'saving-draft': ['Saving draft...', 'Syncing changes...'],
    'loading-history': ['Loading chat history...', 'Retrieving messages...', 'Processing data...'],
    thinking: ['Thinking...', 'Considering options...', 'Analyzing...'],
    'generating-response': [
      'Generating response...',
      'Crafting answer...',
      'Adding final touches...',
    ],
  };

  return stages[context] || ['Loading...'];
}

// Smart Loading Hook
export function useSmartLoading() {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingContext>>(new Map());

  const startLoading = (id: string, context: LoadingContext) => {
    setLoadingStates(prev => new Map(prev).set(id, context));
  };

  const stopLoading = (id: string) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const isLoading = (id?: string) => {
    if (id) return loadingStates.has(id);
    return loadingStates.size > 0;
  };

  const getLoadingContext = (id: string) => {
    return loadingStates.get(id);
  };

  return {
    startLoading,
    stopLoading,
    isLoading,
    getLoadingContext,
    activeLoadings: Array.from(loadingStates.entries()),
  };
}

// Skeleton Loading Components
interface SkeletonProps {
  className?: string;
  animated?: boolean;
}

export function MessageSkeleton({ className, animated = true }: SkeletonProps) {
  return (
    <div className={cx('space-y-3', className)}>
      <div className="flex items-start gap-3">
        <motion.div
          animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-8 w-8 rounded-full bg-muted"
        />
        <div className="flex-1 space-y-2">
          <motion.div
            animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            className="h-4 w-3/4 rounded bg-muted"
          />
          <motion.div
            animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-4 w-1/2 rounded bg-muted"
          />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton({ className, animated = true }: SkeletonProps) {
  return (
    <div className={cx('space-y-6', className)}>
      {[1, 2, 3].map(i => (
        <MessageSkeleton key={i} animated={animated} />
      ))}
    </div>
  );
}

// Loading Overlay Component
interface LoadingOverlayProps {
  visible: boolean;
  context: LoadingContext;
  className?: string;
}

export function LoadingOverlay({ visible, context, className }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cx(
          `fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center`,
          // Mobile-safe positioning
          RESPONSIVE.SAFE_AREA.INSET,
          BACKDROP_STYLES.LIGHT,
          className,
        )}
        data-testid="loading-overlay"
      >
        <ContextualLoading context={context} isLoading={true} className="bg-background shadow-lg" />
      </motion.div>
    </AnimatePresence>
  );
}
