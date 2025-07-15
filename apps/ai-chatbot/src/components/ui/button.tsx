import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { cn } from '#/lib/utils';

/**
 * Button component variant styles
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 min-h-[44px]',
        sm: 'h-9 rounded-md px-3 min-h-[44px]',
        lg: 'h-11 rounded-md px-8 min-h-[48px]',
        icon: 'h-10 w-10 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * Button component props interface
 */
export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
  disableAnimation?: boolean;
  motionProps?: Partial<HTMLMotionProps<'button'>>;
}

/**
 * Enhanced button component with animation and accessibility features
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      success = false,
      disabled,
      disableAnimation = false,
      motionProps,
      children,
      ...props
    },
    ref,
  ) => {
    const { variants, performance } = useAnimationSystem();

    // Calculate actual disabled state
    const isDisabled = disabled || loading;

    // Use slot for asChild pattern, otherwise use motion.button
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    // Enhanced motion button with micromoments
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        // Micromoment animations
        variants={!disableAnimation ? variants.hoverVariants : undefined}
        initial={!disableAnimation ? 'rest' : undefined}
        whileHover={!disableAnimation && !isDisabled ? 'hover' : undefined}
        whileTap={!disableAnimation && !isDisabled ? 'tap' : undefined}
        whileFocus={
          !disableAnimation
            ? {
                scale: 1.02,
                transition: { duration: performance.optimizedDuration(0.15) },
              }
            : undefined
        }
        // Loading state animation
        animate={
          !disableAnimation
            ? {
                opacity: isDisabled && !loading ? 0.5 : 1,
                scale: success ? [1, 1.05, 1] : 1,
                transition: {
                  duration: performance.optimizedDuration(success ? 0.3 : 0.15),
                  ease: success ? 'easeOut' : 'easeInOut',
                },
              }
            : undefined
        }
        // Hardware acceleration
        style={{
          willChange: !disableAnimation ? 'transform, opacity' : 'auto',
          ...motionProps?.style,
        }}
        // Performance optimizations
        onHoverStart={() => {
          if (!disableAnimation && !isDisabled) {
            performance.startMonitoring();
          }
        }}
        onHoverEnd={() => {
          if (!disableAnimation && !isDisabled) {
            performance.stopMonitoring();
          }
        }}
        {...motionProps}
        {...props}
      >
        {/* Content wrapper for enhanced micromoments */}
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={
            !disableAnimation && loading
              ? {
                  rotate: [0, 360],
                  transition: {
                    duration: performance.optimizedDuration(1),
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }
              : undefined
          }
        >
          {/* Loading indicator */}
          {loading && (
            <motion.div
              variants={!disableAnimation ? variants.scaleVariants : undefined}
              initial={!disableAnimation ? 'hidden' : undefined}
              animate={!disableAnimation ? 'visible' : undefined}
              className="mr-1 h-3 w-3 rounded-full border border-transparent border-t-current"
              style={{
                willChange: 'transform',
              }}
            />
          )}

          {/* Success indicator */}
          {success && !loading && (
            <motion.div
              variants={!disableAnimation ? variants.bounceScaleVariants : undefined}
              initial={!disableAnimation ? 'hidden' : undefined}
              animate={!disableAnimation ? 'visible' : undefined}
              className="mr-1 text-green-500"
              style={{
                willChange: 'transform',
              }}
            >
              ✓
            </motion.div>
          )}

          {/* Button content with subtle animation */}
          <motion.div
            animate={
              !disableAnimation && !isDisabled
                ? {
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: performance.isHighPerformanceDevice ? 300 : 200,
                      damping: 25,
                    },
                  }
                : undefined
            }
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
