'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Create cn utility function for this package
 */
const cn = (...classes: (string | undefined | null | boolean)[]) => clsx(classes);

/**
 * Layout toggle component for switching between layout modes
 * @param className - Additional CSS classes
 */
export function LayoutToggle({ className }: { className?: string }) {
  const [enhancedLayout, setEnhancedLayout] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { variants, performance } = useAnimationSystem();

  useEffect(() => {
    setMounted(true);
    // Check current layout preference from cookie
    const saved = document.cookie
      .split('; ')
      .find(row => row.startsWith('enhanced-layout='))
      ?.split('=')[1];
    setEnhancedLayout(saved === 'true');
  }, []);

  const toggleLayout = () => {
    const newValue = !enhancedLayout;
    setEnhancedLayout(newValue);

    // Set cookie and reload to apply layout change
    document.cookie = `enhanced-layout=${newValue}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
    window.location.reload();
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={cn('h-9 w-9 p-0', className)} loading>
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            performance.batchUpdates([toggleLayout]);
          }}
          className={cn(
            'relative h-9 gap-2 px-3',
            enhancedLayout && 'border border-primary/20 bg-primary/10 text-primary',
            className,
          )}
          // Disable default button animation to control manually
          disableAnimation={true}
        >
          {/* Enhanced icon container with state-based animations */}
          <motion.div
            className="flex items-center justify-center"
            animate={{
              rotate: enhancedLayout ? [0, 10, 0] : [180, 190, 180],
              scale: enhancedLayout ? 1.1 : 1,
            }}
            transition={{
              duration: performance.optimizedDuration(0.4),
              ease: [0.4, 0.0, 0.2, 1],
              rotate: {
                duration: performance.optimizedDuration(0.6),
                ease: 'easeInOut',
              },
            }}
            style={{
              willChange: 'transform',
            }}
          >
            {/* Animated icon with smooth transitions */}
            <AnimatePresence mode="wait">
              <motion.svg
                key={enhancedLayout ? 'enhanced' : 'standard'}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={variants.scaleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{
                  type: performance.isHighPerformanceDevice ? 'spring' : 'tween',
                  stiffness: performance.isHighPerformanceDevice ? 350 : undefined,
                  damping: performance.isHighPerformanceDevice ? 20 : undefined,
                  duration: performance.isHighPerformanceDevice
                    ? undefined
                    : performance.optimizedDuration(0.25),
                }}
                style={{
                  willChange: 'transform, opacity',
                }}
              >
                {enhancedLayout ? (
                  // Enhanced layout icon - panels with stagger animation
                  <>
                    <motion.rect
                      x="3"
                      y="3"
                      width="7"
                      height="9"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.1) }}
                    />
                    <motion.rect
                      x="14"
                      y="3"
                      width="7"
                      height="5"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.15) }}
                    />
                    <motion.rect
                      x="14"
                      y="12"
                      width="7"
                      height="9"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.2) }}
                    />
                    <motion.rect
                      x="3"
                      y="16"
                      width="7"
                      height="5"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.25) }}
                    />
                  </>
                ) : (
                  // Standard layout icon - simple with subtle animation
                  <>
                    <motion.rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.1) }}
                    />
                    <motion.line
                      x1="9"
                      y1="9"
                      x2="15"
                      y2="9"
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{ opacity: 1, pathLength: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.2) }}
                    />
                    <motion.line
                      x1="9"
                      y1="15"
                      x2="15"
                      y2="15"
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{ opacity: 1, pathLength: 1 }}
                      transition={{ delay: performance.optimizedDuration(0.25) }}
                    />
                  </>
                )}
              </motion.svg>
            </AnimatePresence>
          </motion.div>

          {/* Animated text label */}
          <motion.span
            className="text-xs font-medium"
            key={enhancedLayout ? 'enhanced' : 'standard'}
            variants={variants.slideRightVariants}
            initial="hidden"
            animate="visible"
            style={{
              willChange: 'transform, opacity',
            }}
          >
            {enhancedLayout ? 'Enhanced' : 'Standard'}
          </motion.span>

          {/* Development badge with enhanced animation */}
          <AnimatePresence>
            {enhancedLayout && process.env.NODE_ENV === 'development' && (
              <motion.div
                variants={variants.bounceScaleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  willChange: 'transform, opacity',
                }}
              >
                <Badge variant="secondary" className="text-xs">
                  DEV
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <motion.div
          className="text-center"
          variants={variants.staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="font-medium" variants={variants.slideUpVariants}>
            Switch to {enhancedLayout ? 'Standard' : 'Enhanced'} Layout
          </motion.div>
          <motion.div
            className="mt-1 text-xs text-muted-foreground"
            variants={variants.slideUpVariants}
          >
            {enhancedLayout
              ? 'Simple layout with basic sidebar'
              : 'Advanced layout with resizable panels & inspector'}
          </motion.div>
        </motion.div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Component to show layout status indicator
 * @param className - Additional CSS classes
 */
export function LayoutStatusIndicator({ className }: { className?: string }) {
  const [enhancedLayout, setEnhancedLayout] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { variants, performance } = useAnimationSystem();

  useEffect(() => {
    setMounted(true);
    const saved = document.cookie
      .split('; ')
      .find(row => row.startsWith('enhanced-layout='))
      ?.split('=')[1];
    setEnhancedLayout(saved === 'true');
  }, []);

  if (!mounted) {
    return (
      <motion.div
        variants={variants.scaleVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'inline-flex animate-pulse items-center gap-1 rounded-full bg-muted/50 px-2 py-1 text-xs',
          className,
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        Loading...
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants.scaleVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs',
        enhancedLayout
          ? 'border border-primary/20 bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground',
        className,
      )}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Animated status indicator dot */}
      <motion.div
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          enhancedLayout ? 'bg-primary' : 'bg-muted-foreground',
        )}
        animate={
          enhancedLayout
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }
            : {
                scale: 1,
                opacity: 1,
              }
        }
        transition={{
          duration: performance.optimizedDuration(enhancedLayout ? 2 : 0.3),
          repeat: enhancedLayout ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Animated text with state transition */}
      <motion.span
        key={enhancedLayout ? 'enhanced' : 'standard'}
        variants={variants.slideRightVariants}
        initial="hidden"
        animate="visible"
        style={{ willChange: 'transform, opacity' }}
      >
        {enhancedLayout ? 'Enhanced Layout' : 'Standard Layout'}
      </motion.span>
    </motion.div>
  );
}
