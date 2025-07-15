'use client';

import { Button } from '#/components/ui/button';
import { APPLE_BREAKPOINTS, Z_INDEX } from '#/lib/ui-constants';
import { useDisclosure, useLocalStorage, useTimeout, useViewportSize } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Lightbulb, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface FeatureTooltipProps {
  featureId: string;
  title: string;
  description: string;
  trigger: 'hover' | 'click' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FeatureTooltip({
  featureId,
  title,
  description,
  trigger = 'hover',
  position = 'top',
  children,
  delay = 0,
  className,
}: FeatureTooltipProps) {
  const [isVisible, { open: showTooltip, close: hideTooltip, toggle: toggleTooltip }] =
    useDisclosure();
  const [hasBeenSeen, setHasBeenSeen] = useLocalStorage({
    key: `feature-tooltip-${featureId}`,
    defaultValue: false,
  });
  const _timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useViewportSize();
  const isMobile = useMemo(() => windowWidth < APPLE_BREAKPOINTS.IPAD_MINI, [windowWidth]);

  const { start: startAutoShow, clear: clearAutoShow } = useTimeout(showTooltip, delay);

  useEffect(() => {
    if (trigger === 'auto' && !hasBeenSeen) {
      startAutoShow();
    } else {
      clearAutoShow();
    }
  }, [trigger, hasBeenSeen, startAutoShow, clearAutoShow]);

  // Memoize event handlers to prevent recreation on every render
  const { start: startHoverShow, clear: clearHoverShow } = useTimeout(showTooltip, 500);

  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover' && !hasBeenSeen && !isMobile) {
      startHoverShow();
    }
  }, [trigger, hasBeenSeen, isMobile, startHoverShow]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      clearHoverShow();
      hideTooltip();
    }
  }, [trigger, clearHoverShow, hideTooltip]);

  const handleClick = useCallback(() => {
    if (trigger === 'click' && !hasBeenSeen) {
      toggleTooltip();
    }
  }, [trigger, hasBeenSeen, toggleTooltip]);

  const handleDismiss = useCallback(() => {
    hideTooltip();
    setHasBeenSeen(true);
  }, [hideTooltip, setHasBeenSeen]);

  // Memoize position classes to prevent recalculation
  const positionClasses = useMemo(() => {
    if (isMobile) {
      // On mobile, always position tooltips at bottom for better visibility
      return 'top-full mt-2 left-1/2 -translate-x-1/2';
    }

    switch (position) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
    }
  }, [isMobile, position]);

  // Memoize learn more handler to prevent recreation
  const handleLearnMore = useCallback(() => {
    handleDismiss();
    window.open('/?showcase=true', '_blank');
  }, [handleDismiss]);

  return (
    <div
      ref={containerRef}
      className={cx('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Feature tooltip trigger"
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cx(
              `absolute z-[${Z_INDEX.TOOLTIP}] w-72 rounded-lg border bg-background p-4 shadow-lg`,
              positionClasses,
            )}
          >
            {/* Header */}
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 flex-shrink-0 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="link"
                size="sm"
                onClick={handleDismiss}
                className="h-auto p-0 text-xs"
              >
                Got it!
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleLearnMore}
                className="h-auto gap-1 p-0 text-xs"
              >
                Learn more
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Arrow */}
            <div
              className={cx(
                'absolute h-2 w-2 rotate-45 border bg-background',
                position === 'top' &&
                  'left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0',
                position === 'bottom' &&
                  'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l-0 border-t-0',
                position === 'left' &&
                  'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-l-0 border-t-0',
                position === 'right' &&
                  'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-b-0 border-r-0',
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
