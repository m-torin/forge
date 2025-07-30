/**
 * Animation Constants
 *
 * Central configuration for all animation timing, easing, and performance settings.
 * This ensures consistency across the entire application and makes it easy to
 * adjust global animation behavior.
 */

import type { Transition } from 'framer-motion';

// =======================
// TIMING CONSTANTS
// =======================

export const ANIMATION_DURATION = {
  // Ultra-fast micro-interactions
  instant: 0.1,

  // Fast interactions (buttons, hovers)
  fast: 0.15,

  // Standard UI animations
  normal: 0.25,

  // Slower, more deliberate animations
  slow: 0.35,

  // Very slow for complex animations
  verySlow: 0.5,

  // Long animations (loading, progress)
  long: 1.0,

  // Extra long (special effects)
  extraLong: 2.0,
} as const;

// =======================
// EASING CURVES
// =======================

export const EASING_CURVES = {
  // Standard ease for most UI animations
  smooth: [0.4, 0.0, 0.2, 1] as const,

  // Smooth ease-in for entrances
  easeIn: [0.4, 0.0, 1, 1] as const,

  // Smooth ease-out for exits
  easeOut: [0.0, 0.0, 0.2, 1] as const,

  // Bouncy ease for playful animations
  bounce: [0.68, -0.55, 0.265, 1.55] as const,

  // Sharp for quick snappy animations
  sharp: [0.4, 0.0, 0.6, 1] as const,

  // Linear for continuous animations
  linear: [0, 0, 1, 1] as const,
} as const;

// =======================
// SPRING PHYSICS
// =======================

export const SPRING_CONFIGS = {
  // Default spring for most animations
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },

  // Gentle spring for subtle animations
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  // Bouncy spring for playful animations
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 1,
  },

  // Soft spring for smooth animations
  soft: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
  },

  // Stiff spring for quick snappy animations
  stiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 40,
    mass: 1,
  },

  // Wobbly spring for attention-grabbing animations
  wobbly: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 10,
    mass: 1,
  },
} as const;

// =======================
// STAGGER TIMING
// =======================

export const STAGGER_TIMING = {
  // Ultra-fast stagger for large lists
  ultraFast: 0.02,

  // Fast stagger for medium lists
  fast: 0.05,

  // Normal stagger for small lists
  normal: 0.1,

  // Slow stagger for emphasis
  slow: 0.15,

  // Very slow for dramatic effect
  verySlow: 0.2,
} as const;

// =======================
// DELAY CONSTANTS
// =======================

export const ANIMATION_DELAY = {
  none: 0,
  short: 0.1,
  medium: 0.2,
  long: 0.3,
  veryLong: 0.5,
} as const;

// =======================
// Z-INDEX LAYERS
// =======================

export const ANIMATION_Z_INDEX = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
  maximum: 2147483647,
} as const;

// =======================
// PERFORMANCE SETTINGS
// =======================

export const PERFORMANCE_CONFIG = {
  // Enable hardware acceleration for transforms
  willChange: {
    transform: 'transform',
    opacity: 'opacity',
    auto: 'auto',
  },

  // Reduced motion preferences
  reducedMotion: {
    duration: 0.01,
    scale: 0.01,
  },

  // Layout animation settings
  layout: {
    // Duration for layout animations
    duration: ANIMATION_DURATION.normal,

    // Ease for layout transitions
    ease: EASING_CURVES.smooth,
  },
} as const;

// =======================
// PRESET TRANSITIONS
// =======================

export const PRESET_TRANSITIONS: Record<string, Transition> = {
  // Standard fade transition
  fade: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING_CURVES.smooth,
  },

  // Quick fade for fast interactions
  fadeFast: {
    duration: ANIMATION_DURATION.fast,
    ease: EASING_CURVES.smooth,
  },

  // Slow fade for emphasis
  fadeSlow: {
    duration: ANIMATION_DURATION.slow,
    ease: EASING_CURVES.smooth,
  },

  // Spring transition
  spring: SPRING_CONFIGS.default,

  // Bouncy spring
  springBouncy: SPRING_CONFIGS.bouncy,

  // Gentle spring
  springGentle: SPRING_CONFIGS.gentle,

  // Layout transition
  layout: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING_CURVES.smooth,
    type: 'tween',
  },

  // Layout spring
  layoutSpring: {
    ...SPRING_CONFIGS.default,
    type: 'spring',
  },
} as const;

// =======================
// ANIMATION PRESETS
// =======================

export const ANIMATION_PRESETS = {
  // Button interactions
  button: {
    hover: {
      scale: 1.02,
      transition: {
        duration: ANIMATION_DURATION.fast,
        ease: EASING_CURVES.smooth,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: ANIMATION_DURATION.instant,
        ease: EASING_CURVES.smooth,
      },
    },
  },

  // Card interactions
  card: {
    hover: {
      y: -2,
      scale: 1.02,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transition: {
        duration: ANIMATION_DURATION.normal,
        ease: EASING_CURVES.smooth,
      },
    },
  },

  // Loading states
  loading: {
    rotate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: EASING_CURVES.smooth,
      },
    },
  },
} as const;

// =======================
// UTILITY FUNCTIONS
// =======================

/**
 * Get reduced motion settings if user prefers reduced motion
 */
export const getReducedMotionSettings = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return {
        duration: PERFORMANCE_CONFIG.reducedMotion.duration,
        scale: PERFORMANCE_CONFIG.reducedMotion.scale,
      };
    }
  }

  return null;
};

/**
 * Create a transition with reduced motion support
 */
export const createTransition = (transition: Transition): Transition => {
  const reducedMotion = getReducedMotionSettings();

  if (reducedMotion) {
    return {
      ...transition,
      duration: reducedMotion.duration,
    };
  }

  return transition;
};

/**
 * Create stagger children configuration
 */
export const createStaggerChildren = (
  delay: number = STAGGER_TIMING.normal,
  delayChildren: number = ANIMATION_DELAY.short,
) => ({
  staggerChildren: delay,
  delayChildren,
});

/**
 * Create optimized appear animation configuration
 */
export const createOptimizedAppear = (
  property: string,
  from: string | number,
  to: string | number,
  duration: number = ANIMATION_DURATION.normal,
) => ({
  property,
  keyframes: [from, to],
  options: {
    duration: duration * 1000, // Convert to milliseconds
    ease: 'linear',
  },
});

// =======================
// BREAKPOINT-AWARE ANIMATIONS
// =======================

export const RESPONSIVE_ANIMATIONS = {
  // Different animation speeds for different screen sizes
  mobile: {
    duration: ANIMATION_DURATION.fast,
    stagger: STAGGER_TIMING.fast,
  },
  tablet: {
    duration: ANIMATION_DURATION.normal,
    stagger: STAGGER_TIMING.normal,
  },
  desktop: {
    duration: ANIMATION_DURATION.normal,
    stagger: STAGGER_TIMING.normal,
  },
} as const;

/**
 * Get animation settings based on screen size
 */
export const getResponsiveAnimationSettings = () => {
  if (typeof window === 'undefined') {
    return RESPONSIVE_ANIMATIONS.desktop;
  }

  const width = window.innerWidth;

  if (width < 768) {
    return RESPONSIVE_ANIMATIONS.mobile;
  } else if (width < 1024) {
    return RESPONSIVE_ANIMATIONS.tablet;
  } else {
    return RESPONSIVE_ANIMATIONS.desktop;
  }
};

// =======================
// EXPORTS
// =======================

export type AnimationDuration = typeof ANIMATION_DURATION;
export type EasingCurve = typeof EASING_CURVES;
export type SpringConfig = typeof SPRING_CONFIGS;
export type StaggerTiming = typeof STAGGER_TIMING;
export type AnimationDelay = typeof ANIMATION_DELAY;
export type PresetTransition = typeof PRESET_TRANSITIONS;
export type AnimationPreset = typeof ANIMATION_PRESETS;
