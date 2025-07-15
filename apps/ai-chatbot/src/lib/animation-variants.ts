/**
 * Centralized Animation Variants Library
 *
 * This file contains all standardized animation variants used throughout the AI chatbot.
 * Based on Framer Motion best practices for consistent, performant animations.
 *
 * Usage:
 * import { slideVariants, fadeVariants } from '#/lib/animation-variants'
 *
 * <motion.div variants={slideVariants} initial="hidden" animate="visible" />
 */

import type { Variants } from 'framer-motion';

// Base animation timings (in seconds)
export const TIMING = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
  verySlow: 0.5,
} as const;

// Standard easing curves
export const EASING = {
  smooth: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springSoft: { type: 'spring', stiffness: 200, damping: 20 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 15 },
} as const;

// =======================
// BASIC FADE ANIMATIONS
// =======================

export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

// =======================
// SLIDE ANIMATIONS
// =======================

export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

// =======================
// SCALE ANIMATIONS
// =======================

export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

export const bounceScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: EASING.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

// =======================
// STAGGER CONTAINER VARIANTS
// =======================

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: TIMING.fast,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMING.fast,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: TIMING.fast,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMING.fast,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// =======================
// TYPING INDICATOR VARIANTS
// =======================

export const typingDotVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0.5,
  },
  visible: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.smooth,
    },
  },
};

export const typingContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: TIMING.fast },
  },
};

// =======================
// MESSAGE VARIANTS
// =======================

export const messageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
      scale: EASING.spring,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: TIMING.fast },
  },
};

// =======================
// PROGRESS & LOADING VARIANTS
// =======================

export const progressVariants: Variants = {
  hidden: {
    width: '0%',
    transition: { duration: TIMING.fast },
  },
  visible: {
    width: '100%',
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: EASING.smooth,
    },
  },
};

// =======================
// MODAL & OVERLAY VARIANTS
// =======================

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: EASING.springSoft,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 30,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
};

// =======================
// SIDEBAR VARIANTS
// =======================

export const sidebarVariants: Variants = {
  closed: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
};

export const sidebarItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    transition: { duration: TIMING.fast },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  hover: {
    scale: 1.02,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: EASING.smooth },
  },
};

// =======================
// UTILITY VARIANTS
// =======================

export const hoverVariants = {
  rest: {
    scale: 1,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
  hover: {
    scale: 1.05,
    transition: { duration: TIMING.fast, ease: EASING.smooth },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1, ease: EASING.smooth },
  },
} as const;

export const rotateVariants: Variants = {
  rest: {
    rotate: 0,
    transition: { duration: TIMING.normal, ease: EASING.smooth },
  },
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// =======================
// HELPER FUNCTIONS
// =======================

/**
 * Create a custom variant with specified delay
 */
export const withDelay = (variants: Variants, delay: number): Variants => {
  const newVariants: Variants = {};

  Object.entries(variants).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      newVariants[key] = {
        ...value,
        transition: {
          ...(typeof value.transition === 'object' ? value.transition : {}),
          delay,
        },
      };
    } else {
      newVariants[key] = value;
    }
  });

  return newVariants;
};

/**
 * Create a custom variant with specified duration
 */
export const withDuration = (variants: Variants, duration: number): Variants => {
  const newVariants: Variants = {};

  Object.entries(variants).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      newVariants[key] = {
        ...value,
        transition: {
          ...(typeof value.transition === 'object' ? value.transition : {}),
          duration,
        },
      };
    } else {
      newVariants[key] = value;
    }
  });

  return newVariants;
};

/**
 * Combine multiple variants into one
 */
export const combineVariants = (...variantSets: Variants[]): Variants => {
  return variantSets.reduce(
    (combined, variants) => ({
      ...combined,
      ...variants,
    }),
    {},
  );
};

// =======================
// TAILWIND REPLACEMENT VARIANTS
// =======================

export const pulseSubtleVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: EASING.smooth,
    },
  },
  rest: { scale: 1 },
};

export const bounceGentleVariants: Variants = {
  bounce: {
    y: [0, -20, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: EASING.bounce,
    },
  },
  rest: { y: 0 },
};

export const thinkingDotsVariants: Variants = {
  thinking: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  rest: { opacity: 0.3 },
};

export const shakeVariants: Variants = {
  shake: {
    x: [0, -2, 2, -2, 2, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  rest: { x: 0 },
};

export const scaleInVariants: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
};

export const scaleOutVariants: Variants = {
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: TIMING.fast },
  },
  hidden: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
};
