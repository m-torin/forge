import {
  Target,
  Transition,
  TargetAndTransition,
  Variants,
} from 'framer-motion';

/**
 * Animation durations
 */
export const ANIMATION_DURATION = {
  FAST: 0.2,
  MEDIUM: 0.5,
  SLOW: 1,
};

/**
 * Default easing function for animations
 */
export const EASING = 'easeInOut';

/**
 * Creates a performance animation based on processing time
 * @param processingTime - The time taken to process the operation
 * @returns Animation properties for Framer Motion
 */
export const createPerformanceAnimation = (processingTime: number) => {
  const duration = Math.min(processingTime / 1000, ANIMATION_DURATION.MEDIUM);
  return {
    scale: [1, 1.05, 1],
    transition: { duration, ease: EASING },
  };
};

/**
 * Animation for invalid input shake
 */
export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.5 },
};

/**
 * Animation for expanding/collapsing node
 */
export const expandCollapseAnimation: Variants = {
  expanded: { height: 'auto', opacity: 1 },
  collapsed: { height: 0, opacity: 0 },
};

/**
 * Creates dynamic animation variants based on node size
 * @param baseSize - The base size of the node
 * @returns Variants object with size-based animations
 */
export const createSizeBasedAnimations = (baseSize: number): Variants => ({
  small: { scale: baseSize * 0.8 },
  medium: { scale: baseSize },
  large: { scale: baseSize * 1.2 },
});

/**
 * Combines multiple animation variants
 * @param variants - Array of variant objects to combine
 * @returns Combined variants object
 */
export const combineVariants = (...variants: Variants[]): Variants => {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
};

/**
 * Creates a staggered animation for child elements
 * @param childCount - Number of child elements
 * @param staggerDuration - Duration of stagger effect (in seconds)
 * @returns Variants object for parent container
 */
export const createStaggeredAnimation = (
  childCount: number,
  staggerDuration: number,
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDuration,
      delayChildren: 0.2,
    },
  },
});

/**
 * Animation preset for a bouncy effect
 */
export const bouncyAnimation: TargetAndTransition = {
  scale: 1,
  opacity: 1,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 10,
  },
};

/**
 * Utility function to create a custom animation preset
 * @param keyframes - Array of keyframe objects
 * @param options - Animation options
 * @returns Custom animation preset
 */
export const createCustomAnimation = (
  keyframes: Target[],
  options: Transition,
): { keyframes: Target[]; transition: Transition } => ({
  keyframes,
  transition: { ...options, ease: EASING },
});

/**
 * Hook for applying reduced motion settings
 * @returns Object with reduced motion variants
 */
export const useReducedMotion = () => {
  const reducedMotionVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return { reducedMotionVariants };
};

/**
 * Utility function to create coordinated animations across multiple nodes
 * @param nodeIds - Array of node IDs to animate
 * @param animation - Animation to apply to all nodes
 * @returns Function to trigger the coordinated animation
 */
export const createCoordinatedAnimation = (
  nodeIds: string[],
  animation: Target,
) => {
  return (animateNode: (id: string, animation: Target) => void) => {
    nodeIds.forEach((id) => animateNode(id, animation));
  };
};

/**
 * Creates a gesture-based animation
 * @param gesture - The gesture type (e.g., 'drag', 'hover')
 * @param animation - The animation to apply
 * @returns Gesture animation object
 */
export const createGestureAnimation = (gesture: string, animation: Target): Record<string, Target> => ({
  [gesture]: animation,
});

/**
 * Utility function to create a debug animation that visualizes the animation process
 * @param animation - The original animation
 * @returns Debug animation with visual indicators
 */
export const createDebugAnimation = (
  animation: TargetAndTransition,
): TargetAndTransition => ({
  ...animation,
  borderColor: ['#ff0000', '#00ff00', '#0000ff', '#ff0000'],
  transition: { duration: 2, repeat: Infinity },
});

const animationUtils = {
  ANIMATION_DURATION,
  EASING,
  createPerformanceAnimation,
  shakeAnimation,
  expandCollapseAnimation,
  createSizeBasedAnimations,
  combineVariants,
  createStaggeredAnimation,
  bouncyAnimation,
  createCustomAnimation,
  useReducedMotion,
  createCoordinatedAnimation,
  createGestureAnimation,
  createDebugAnimation,
};

export default animationUtils;
