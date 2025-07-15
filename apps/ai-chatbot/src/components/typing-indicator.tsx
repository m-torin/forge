'use client';

import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useInterval } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

/**
 * Props for character count indicator
 */
interface CharacterCountIndicatorProps {
  current: number;
  max: number;
  className?: string;
}

/**
 * Character count indicator with visual feedback
 * @param current - Current character count
 * @param max - Maximum allowed characters
 * @param className - Additional CSS classes
 */
export function CharacterCountIndicator({ current, max, className }: CharacterCountIndicatorProps) {
  const { variants } = useAnimationSystem();
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <motion.div
      variants={variants.scaleVariants}
      initial="hidden"
      animate="visible"
      className={cx(
        'text-xs',
        isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-muted-foreground',
        className,
      )}
    >
      {current}/{max}
    </motion.div>
  );
}

/**
 * Props for smart typing detector
 */
interface SmartTypingDetectorProps {
  isTyping: boolean;
  onTypingChange?: (isTyping: boolean) => void;
  className?: string;
}

/**
 * Smart typing detector component
 * @param isTyping - Whether typing is active
 * @param _onTypingChange - Callback for typing changes (unused)
 * @param className - Additional CSS classes
 */
export function SmartTypingDetector({
  isTyping,
  onTypingChange: _onTypingChange,
  className,
}: SmartTypingDetectorProps) {
  const { variants } = useAnimationSystem();

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          variants={variants.typingContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cx('flex items-center gap-1', className)}
        >
          <motion.div
            className="flex gap-1"
            variants={variants.staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                variants={variants.typingDotVariants}
                className="h-1 w-1 rounded-full bg-primary"
              />
            ))}
          </motion.div>
          <span className="text-xs text-muted-foreground">Typing...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface UserActivityIndicatorProps {
  isActive: boolean;
  lastActivity?: Date;
  className?: string;
}

export function UserActivityIndicator({
  isActive,
  lastActivity,
  className,
}: UserActivityIndicatorProps) {
  const { variants } = useAnimationSystem();
  const [timeAgo, setTimeAgo] = useState<string>('');

  const updateTimeAgo = useCallback(() => {
    if (!lastActivity) return;

    const now = new Date();
    const diff = now.getTime() - lastActivity.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      setTimeAgo('just now');
    } else if (minutes < 60) {
      setTimeAgo(`${minutes}m ago`);
    } else if (hours < 24) {
      setTimeAgo(`${hours}h ago`);
    } else {
      setTimeAgo('inactive');
    }
  }, [lastActivity]);

  useEffect(() => {
    updateTimeAgo(); // Initial update
  }, [updateTimeAgo]);

  // Use useInterval for periodic updates
  useInterval(updateTimeAgo, 30000); // Update every 30 seconds

  return (
    <div className={cx('flex items-center gap-2 text-xs', className)}>
      <motion.div
        variants={isActive ? variants.pulseVariants : variants.fadeVariants}
        animate={isActive ? 'pulse' : 'visible'}
        className={cx('h-2 w-2 rounded-full', isActive ? 'bg-green-500' : 'bg-gray-500')}
      />
      <span className="text-muted-foreground">{isActive ? 'Active' : timeAgo || 'Inactive'}</span>
    </div>
  );
}

// Default export with all components
export const TypingIndicator = {
  CharacterCount: CharacterCountIndicator,
  SmartTyping: SmartTypingDetector,
  UserActivity: UserActivityIndicator,
};
