'use client';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { Children, useState } from 'react';

// Breathing animation for icons
export function BreathingIcon({
  children,
  className = '',
  duration = 3,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: [1, 1.05, 1],
            }
      }
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulsing glow effect
export function PulsingGlow({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.5)',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={
        prefersReducedMotion
          ? {}
          : {
              boxShadow: [
                `0 0 10px ${glowColor}`,
                `0 0 30px ${glowColor}, 0 0 50px ${glowColor}`,
                `0 0 10px ${glowColor}`,
              ],
            }
      }
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Loading sequence with staggered elements
export function LoadingSequence({
  isLoading = true,
  children,
}: {
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className="opacity-50">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center space-x-2"
        >
          {[0, 1, 2].map(index => (
            <motion.div
              key={index}
              className="h-3 w-3 rounded-full bg-primary"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Morphing shapes
export function MorphingShape({
  className = '',
  size = 40,
  color = 'currentColor',
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={`rounded-full ${className}`}
        style={{ width: size, height: size, backgroundColor: color }}
      />
    );
  }

  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      animate={{
        borderRadius: [
          '50% 50% 50% 50%',
          '30% 70% 50% 50%',
          '50% 30% 70% 50%',
          '50% 50% 30% 70%',
          '50% 50% 50% 50%',
        ],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
    />
  );
}

// Floating action elements
export function FloatingAction({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        ...(prefersReducedMotion
          ? {}
          : {
              y: [0, -5, 0],
            }),
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: prefersReducedMotion
          ? { duration: 0.6, delay }
          : {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: delay + 0.6,
              ease: 'easeInOut',
            },
      }}
    >
      {children}
    </motion.div>
  );
}

// Cascading reveal animation
export function CascadingReveal({
  children,
  className = '',
  stagger = 0.1,
}: {
  children: React.ReactNode[];
  className?: string;
  stagger?: number;
}) {
  const childArray = Children.toArray(children);
  let fallbackKeyCounter = 0;

  const getChildKey = (child: React.ReactNode) => {
    if (typeof child === 'object' && child !== null && 'key' in child) {
      const element = child as ReactElement;
      if (element.key != null) {
        return String(element.key);
      }
    }

    fallbackKeyCounter += 1;
    return `cascading-${fallbackKeyCounter}`;
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
    >
      {childArray.map(child => (
        <motion.div
          key={getChildKey(child)}
          variants={{
            hidden: {
              opacity: 0,
              y: 20,
              scale: 0.9,
            },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.6,
                ease: [0.25, 0.4, 0.25, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Interactive ripple effect
export function RippleEffect({
  children,
  className = '',
  color = 'rgba(59, 130, 246, 0.3)',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const scheduleRemoval = (id: number) => {
    window.setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 1000);
  };

  const createRipple = (x: number, y: number) => {
    const id = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
    setRipples(prev => [...prev, { id, x, y }]);
    scheduleRemoval(id);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    createRipple(x, y);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    createRipple(rect.width / 2, rect.height / 2);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: 200,
            height: 200,
            opacity: 0,
            x: -100,
            y: -100,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
