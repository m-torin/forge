import { AnimationControls, useAnimation, Variants } from 'framer-motion';

/**
 * Animation variants for nodes
 */
export const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  selected: { boxShadow: '0 0 0 2px #4299e1' },
  hovered: { scale: 1.05 },
  dragging: { scale: 1.05, opacity: 0.7 },
  error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
};

/**
 * Animation variants for handles
 */
export const handleVariants: Variants = {
  connected: { scale: 1.2 },
  disconnected: { scale: 1 },
  hovered: { scale: 1.1 },
};

/**
 * Creates animation variants for edge animations
 * @param edgeType - Type of the edge (e.g., 'bezier', 'straight')
 * @returns Variants object for edge animations
 */
export const createEdgeAnimations = (_edgeType: string): Variants => ({
  hidden: { opacity: 0, pathLength: 0 },
  visible: { opacity: 1, pathLength: 1 },
  selected: { strokeWidth: 3 },
});

/**
 * Default transition for edge animations
 */
export const defaultEdgeTransition = {
  duration: 0.5,
  ease: 'easeInOut',
};

/**
 * Hook for managing complex node animations
 * @returns Object containing animation controls and helper functions
 */
export const useNodeAnimation = () => {
  const controls: AnimationControls = useAnimation();

  const animateNode = async (variant: string) => {
    await controls.start(variant);
  };

  const animateExpand = async () => {
    await controls.start('expanded');
  };

  const animateCollapse = async () => {
    await controls.start('collapsed');
  };

  return { controls, animateNode, animateExpand, animateCollapse };
};

export default {
  useNodeAnimation,
  nodeVariants,
  handleVariants,
  createEdgeAnimations,
  defaultEdgeTransition,
};
