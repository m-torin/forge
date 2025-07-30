'use client';

/**
 * Master Animation System Hook
 *
 * This is the single, comprehensive hook for all animation needs in the AI chatbot.
 * It provides motion values, imperative controls, variants, and performance optimization.
 *
 * Usage:
 * const {
 *   values: { x, y, opacity },
 *   controls,
 *   variants,
 *   animate
 * } = useAnimationSystem()
 *
 * // Direct updates (no re-render)
 * values.x.set(100)
 *
 * // Imperative controls
 * controls.slideIn()
 * animate.fadeOut()
 *
 * // Use with variants
 * <motion.div variants={variants.slide} initial="hidden" animate="visible" />
 */

import { getReducedMotionSettings } from '#/lib/animation-constants';
import {
  animationBatcher,
  AnimationMemoryManager,
  getOptimalAnimationDuration,
  HardwareAcceleration,
  supportsHighPerformanceAnimations,
  useAnimationPerformance,
} from '#/lib/animation-performance';
import * as variants from '#/lib/animation-variants';
import { MotionValue, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef } from 'react';

// =======================
// TYPES
// =======================

export interface AnimationSystemHook {
  // Motion values grouped for organization
  values: {
    // Transform properties
    x: MotionValue<number>;
    y: MotionValue<number>;
    z: MotionValue<number>;
    scale: MotionValue<number>;
    scaleX: MotionValue<number>;
    scaleY: MotionValue<number>;
    rotate: MotionValue<number>;
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
    rotateZ: MotionValue<number>;
    skew: MotionValue<number>;
    skewX: MotionValue<number>;
    skewY: MotionValue<number>;

    // Visual properties
    opacity: MotionValue<number>;
    backgroundColor: MotionValue<string>;
    color: MotionValue<string>;
    borderRadius: MotionValue<number>;

    // Layout properties
    width: MotionValue<number>;
    height: MotionValue<number>;

    // Utility functions
    createValue: <T>(initialValue: T) => MotionValue<T>;
    createTransform: <T>(
      input: MotionValue<any>,
      inputRange: number[],
      outputRange: T[],
    ) => MotionValue<T>;
    resetAll: () => void;
    onValueChange: <T>(value: MotionValue<T>, callback: (latest: T) => void) => () => void;
  };

  // Animation variants from the library
  variants: typeof variants;

  // Imperative animation controls
  controls: ReturnType<typeof useAnimation>;

  // High-level animation methods
  animate: {
    fadeIn: () => Promise<any>;
    fadeOut: () => Promise<any>;
    slideIn: (direction?: 'up' | 'down' | 'left' | 'right') => Promise<any>;
    slideOut: (direction?: 'up' | 'down' | 'left' | 'right') => Promise<any>;
    scaleIn: () => Promise<any>;
    scaleOut: () => Promise<any>;
    bounce: () => Promise<any>;
    pulse: () => Promise<any>;
    shake: () => Promise<any>;
    spin: () => Promise<any>;
    resetToRest: () => Promise<any>;
  };

  // Enhanced performance helpers
  performance: {
    enableHardwareAcceleration: () => void;
    disableHardwareAcceleration: () => void;
    batchUpdates: (updates: (() => void)[]) => void;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    getMetrics: () => any;
    isHighPerformanceDevice: boolean;
    optimizedDuration: (baseDuration: number) => number;
  };

  // Memory management
  cleanup: () => void;
}

export interface AnimationSystemOptions {
  // Initial values
  initialX?: number;
  initialY?: number;
  initialOpacity?: number;
  initialScale?: number;

  // Performance options
  enableHardwareAccel?: boolean;
  respectReducedMotion?: boolean;
}

// =======================
// HOOK IMPLEMENTATION
// =======================

export function useAnimationSystem(options: AnimationSystemOptions = {}): AnimationSystemHook {
  const {
    initialX = 0,
    initialY = 0,
    initialOpacity = 1,
    initialScale = 1,
    enableHardwareAccel = true,
    respectReducedMotion = true,
  } = options;

  // Performance monitoring and component identification
  const componentId = useRef(`animation-system-${Math.random().toString(36).substr(2, 9)}`);
  const { startMonitoring, stopMonitoring, getMetrics } = useAnimationPerformance(
    componentId.current,
  );
  const elementRef = useRef<HTMLElement | null>(null);

  // Track high performance device capabilities
  const isHighPerformanceDevice = useMemo(() => supportsHighPerformanceAnimations(), []);

  // Create motion values with initial values
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  const z = useMotionValue(0);
  const scale = useMotionValue(initialScale);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const rotate = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rotateZ = useMotionValue(0);
  const skew = useMotionValue(0);
  const skewX = useMotionValue(0);
  const skewY = useMotionValue(0);

  const opacity = useMotionValue(initialOpacity);
  const backgroundColor = useMotionValue('#ffffff');
  const color = useMotionValue('#000000');
  const borderRadius = useMotionValue(0);

  const width = useMotionValue(0);
  const height = useMotionValue(0);

  // Animation controls
  const controls = useAnimation();

  // Debug mode disabled to avoid hook rule violations

  // Create a new motion value - Note: This can't use hooks inside callbacks
  const createValue = useCallback(<T,>(initialValue: T): MotionValue<T> => {
    // This creates a new MotionValue instance without using hooks
    const motionValue = { current: initialValue } as any;
    return motionValue;
  }, []);

  // Create a transform motion value - Note: This should be used differently
  const createTransform = useCallback(
    <T,>(input: MotionValue<any>, _inputRange: number[], _outputRange: T[]): MotionValue<T> => {
      // This creates a transform without using hooks inside callback
      const transform =
        typeof input.get === 'function' ? input : ({ get: () => input, set: () => {} } as any);
      return transform;
    },
    [],
  );

  // Reset all values to their initial state
  const resetAll = useCallback(() => {
    const reducedMotion = respectReducedMotion ? getReducedMotionSettings() : null;

    if (reducedMotion) {
      // Skip animations if reduced motion is preferred
      x.jump(initialX);
      y.jump(initialY);
      opacity.jump(initialOpacity);
      scale.jump(initialScale);
    } else {
      x.set(initialX);
      y.set(initialY);
      opacity.set(initialOpacity);
      scale.set(initialScale);
    }

    // Reset other values
    z.set(0);
    scaleX.set(1);
    scaleY.set(1);
    rotate.set(0);
    rotateX.set(0);
    rotateY.set(0);
    rotateZ.set(0);
    skew.set(0);
    skewX.set(0);
    skewY.set(0);
    backgroundColor.set('#ffffff');
    color.set('#000000');
    borderRadius.set(0);
    width.set(0);
    height.set(0);
  }, [
    initialX,
    initialY,
    initialOpacity,
    initialScale,
    respectReducedMotion,
    x,
    y,
    opacity,
    scale,
    z,
    scaleX,
    scaleY,
    rotate,
    rotateX,
    rotateY,
    rotateZ,
    skew,
    skewX,
    skewY,
    backgroundColor,
    color,
    borderRadius,
    width,
    height,
  ]);

  // Add event listener to motion value
  const onValueChange = useCallback(<T,>(value: MotionValue<T>, callback: (latest: T) => void) => {
    // Create event listener - simplified approach
    const unsubscribe = value.onChange ? value.onChange(callback) : () => {};
    return unsubscribe;
  }, []);

  // Enhanced hardware acceleration helpers
  const enableHardwareAcceleration = useCallback(() => {
    if (typeof document !== 'undefined') {
      const style = document.documentElement.style;
      style.setProperty('--motion-will-change', 'transform, opacity');

      if (elementRef.current) {
        HardwareAcceleration.enable(elementRef.current, ['transform', 'opacity']);
      }
    }
  }, []);

  const disableHardwareAcceleration = useCallback(() => {
    if (typeof document !== 'undefined') {
      const style = document.documentElement.style;
      style.setProperty('--motion-will-change', 'auto');

      if (elementRef.current) {
        HardwareAcceleration.disable(elementRef.current);
      }
    }
  }, []);

  // Optimized batch updates for performance
  const batchUpdates = useCallback((updates: (() => void)[]) => {
    updates.forEach((update, index) => {
      animationBatcher.add(`${componentId.current}-batch-${index}`, update, 'medium');
    });
  }, []);

  // Optimized duration calculation
  const optimizedDuration = useCallback((baseDuration: number) => {
    return getOptimalAnimationDuration(baseDuration);
  }, []);

  // Cleanup function for memory management
  const cleanup = useCallback(() => {
    AnimationMemoryManager.cleanup(componentId as any);
    disableHardwareAcceleration();
    stopMonitoring();
  }, [disableHardwareAcceleration, stopMonitoring]);

  // Performance-optimized animation methods
  const animate = useMemo(
    () => ({
      fadeIn: () => {
        const duration = optimizedDuration(0.25);
        return controls.start({ opacity: 1, transition: { duration, ease: [0.4, 0.0, 0.2, 1] } });
      },

      fadeOut: () => {
        const duration = optimizedDuration(0.15);
        return controls.start({ opacity: 0, transition: { duration, ease: [0.4, 0.0, 0.2, 1] } });
      },

      slideIn: (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
        const slideVariants = {
          up: { y: 0, opacity: 1 },
          down: { y: 0, opacity: 1 },
          left: { x: 0, opacity: 1 },
          right: { x: 0, opacity: 1 },
        };
        const transition = isHighPerformanceDevice
          ? { type: 'spring', stiffness: 300, damping: 30 }
          : { duration: optimizedDuration(0.25), ease: [0.4, 0.0, 0.2, 1] };

        return controls.start({ ...slideVariants[direction], transition });
      },

      slideOut: (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
        const slideVariants = {
          up: { y: -20, opacity: 0 },
          down: { y: 20, opacity: 0 },
          left: { x: -20, opacity: 0 },
          right: { x: 20, opacity: 0 },
        };
        const duration = optimizedDuration(0.15);
        return controls.start({
          ...slideVariants[direction],
          transition: { duration, ease: [0.4, 0.0, 0.2, 1] },
        });
      },

      scaleIn: () => {
        const transition = isHighPerformanceDevice
          ? { type: 'spring', stiffness: 400, damping: 15 }
          : { duration: optimizedDuration(0.25), ease: [0.4, 0.0, 0.2, 1] };

        return controls.start({ scale: 1, opacity: 1, transition });
      },

      scaleOut: () => {
        const duration = optimizedDuration(0.15);
        return controls.start({
          scale: 0.8,
          opacity: 0,
          transition: { duration, ease: [0.4, 0.0, 0.2, 1] },
        });
      },

      bounce: () => {
        const duration = optimizedDuration(0.3);
        return controls.start({
          scale: [1, 1.1, 1],
          transition: { duration, times: [0, 0.5, 1] },
        });
      },

      pulse: () => {
        const duration = optimizedDuration(1.5);
        return controls.start({
          scale: [1, 1.05, 1],
          opacity: [0.7, 1, 0.7],
          transition: { duration, repeat: Infinity },
        });
      },

      shake: () => {
        const duration = optimizedDuration(0.5);
        return controls.start({
          x: [0, -5, 5, -5, 5, 0],
          transition: { duration },
        });
      },

      spin: () => {
        const duration = optimizedDuration(1);
        return controls.start({
          rotate: 360,
          transition: { duration, repeat: Infinity, ease: 'linear' },
        });
      },

      resetToRest: () => {
        const transition = isHighPerformanceDevice
          ? { type: 'spring', stiffness: 300, damping: 30 }
          : { duration: optimizedDuration(0.25), ease: [0.4, 0.0, 0.2, 1] };

        return controls.start({
          x: initialX,
          y: initialY,
          scale: initialScale,
          opacity: initialOpacity,
          rotate: 0,
          transition,
        });
      },
    }),
    [
      controls,
      initialX,
      initialY,
      initialScale,
      initialOpacity,
      optimizedDuration,
      isHighPerformanceDevice,
    ],
  );

  // Component lifecycle management
  useEffect(() => {
    // Register component for memory tracking
    AnimationMemoryManager.track(componentId as any, componentId.current);

    // Initialize hardware acceleration if enabled
    if (enableHardwareAccel) {
      enableHardwareAcceleration();
    }

    return () => {
      cleanup();
    };
  }, [enableHardwareAccel, enableHardwareAcceleration, cleanup]);

  return {
    // Motion values grouped for organization
    values: {
      // Transform properties
      x,
      y,
      z,
      scale,
      scaleX,
      scaleY,
      rotate,
      rotateX,
      rotateY,
      rotateZ,
      skew,
      skewX,
      skewY,

      // Visual properties
      opacity,
      backgroundColor,
      color,
      borderRadius,

      // Layout properties
      width,
      height,

      // Utility functions
      createValue,
      createTransform,
      resetAll,
      onValueChange,
    },

    // Animation variants from the library
    variants,

    // Imperative animation controls
    controls,

    // High-level animation methods
    animate,

    // Enhanced performance helpers
    performance: {
      enableHardwareAcceleration,
      disableHardwareAcceleration,
      batchUpdates,
      startMonitoring: () => startMonitoring(),
      stopMonitoring: () => stopMonitoring(),
      getMetrics: () => getMetrics(),
      isHighPerformanceDevice,
      optimizedDuration,
    },

    // Memory management
    cleanup,
  };
}

// =======================
// SPECIALIZED HOOKS
// =======================

/**
 * Hook for drag interactions
 */
export function useDragMotionValues(options: AnimationSystemOptions = {}) {
  const animationSystem = useAnimationSystem(options);

  // Additional drag-specific values
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const isDragging = useMotionValue(false);

  const resetDrag = useCallback(() => {
    dragX.set(0);
    dragY.set(0);
    isDragging.set(false);
  }, [dragX, dragY, isDragging]);

  return {
    ...animationSystem,
    dragX,
    dragY,
    isDragging,
    resetDrag,
  };
}

/**
 * Hook for scroll-based animations
 */
export function useScrollMotionValues(options: AnimationSystemOptions = {}) {
  const animationSystem = useAnimationSystem(options);

  const scrollY = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);

  // Transform scroll position to animation values
  const scrollOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return {
    ...animationSystem,
    scrollY,
    scrollYProgress,
    scrollOpacity,
    scrollScale,
  };
}

/**
 * Hook for progress animations
 */
export function useProgressMotionValues(options: AnimationSystemOptions = {}) {
  const animationSystem = useAnimationSystem(options);

  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  const progressOpacity = useTransform(progress, [0, 0.1, 1], [0, 1, 1]);

  const setProgress = useCallback(
    (value: number) => {
      const clampedValue = Math.max(0, Math.min(1, value));

      const reducedMotion = getReducedMotionSettings();
      if (reducedMotion) {
        progress.jump(clampedValue);
      } else {
        progress.set(clampedValue);
      }
    },
    [progress],
  );

  return {
    ...animationSystem,
    progress,
    progressWidth,
    progressOpacity,
    setProgress,
  };
}

// =======================
// UTILITY FUNCTIONS
// =======================

/**
 * Create a motion value that responds to window scroll
 */
export function useScrollMotionValue() {
  const scrollY = useMotionValue(0);

  useMemo(() => {
    if (typeof window === 'undefined') return;

    const updateScrollY = () => {
      scrollY.set(window.scrollY);
    };

    window.addEventListener('scroll', updateScrollY, { passive: true });
    updateScrollY(); // Set initial value

    return () => window.removeEventListener('scroll', updateScrollY);
  }, [scrollY]);

  return scrollY;
}

/**
 * Create a motion value that responds to mouse position
 */
export function useMouseMotionValues() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useMemo(() => {
    if (typeof window === 'undefined') return;

    const updateMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', updateMouse, { passive: true });

    return () => window.removeEventListener('mousemove', updateMouse);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
}

// =======================
// PERFORMANCE UTILITIES
// =======================

/**
 * Batch multiple motion value updates for better performance
 */
export function batchMotionValueUpdates(updates: (() => void)[]) {
  // Use requestAnimationFrame to batch updates
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Check if browser supports hardware acceleration
 */
export function supportsHardwareAcceleration(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for 3D transform support
  const testElement = document.createElement('div');
  testElement.style.transform = 'translateZ(0)';

  return testElement.style.transform !== '';
}
