// animations.ts

import { Variants } from 'framer-motion';

// Common animation variants with default stagger and delay handling
export const commonVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

export const staggerContainer: Variants = {
  initial: { opacity: 1 },
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Enhanced function to include delay for individual items
export const createCommonVariants = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
});
