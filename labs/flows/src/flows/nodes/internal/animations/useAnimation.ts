import { useCallback, useMemo, useRef } from 'react';
import { useStore, useReactFlow, ReactFlowState } from '@xyflow/react';
import {
  Variants,
  Target,
  Transition,
  TargetAndTransition,
} from 'framer-motion';
import {
  nodeVariants,
  handleVariants,
  createEdgeAnimations,
  defaultEdgeTransition,
  useNodeAnimation as useRFNodeAnimation,
} from './rfAnimations';
import {
  ANIMATION_DURATION,
  EASING,
  createPerformanceAnimation,
  createStaggeredAnimation,
  createCoordinatedAnimation,
  createCustomAnimation,
  useReducedMotion,
  createDebugAnimation,
  createGestureAnimation,
  combineVariants,
} from './animationUtils';
import {
  FbNode,
  FbEdge,
  FbConnection,
  FbFitViewOptions,
} from '#/flows/types';

// Define the structure of a single handle
interface Handle {
  animation?: Variants;
  // Add other properties related to the handle if necessary
}

// Define the structure of the handles object
type _Handles = Record<string, Handle>;

// Type guard to check if data.handles is of type Handles
function isHandles(data: any): data is Record<string, any> {
  return data && typeof data === 'object' && !Array.isArray(data);
}

type AnimationPreset = {
  id: string;
  animation: TargetAndTransition;
};

type AnimationSequence = {
  id: string;
  animations: { target: string; animation: string }[];
};

interface UseAnimationReturn {
  animateNode: (id: string, variant: string) => void;
  animateEdge: (id: string, variant: string) => void;
  animateHandle: (nodeId: string, handleId: string, variant: string) => void;
  animateViewport: (viewport: any) => void;
  createPerformanceBasedAnimation: (processingTime: number) => any;
  createStaggered: (elementIds: string[], staggerDuration: number) => Variants;
  createCoordinated: (elementIds: string[], animation: Target) => (animateNode: (id: string, animation: Target) => void) => void;
  createCustom: (keyframes: any[], options: any) => any;
  createDebug: (animation: any) => any;
  batchAnimate: (animations: { id: string; variant: string; type: 'node' | 'edge' | 'handle' }[]) => void;
  createGesture: (gesture: string, animation: any) => any;
  saveCustomPreset: (name: string, animation: any) => void;
  getCustomPreset: (name: string) => any;
  createSequence: (id: string, animations: { target: string; animation: string }[]) => void;
  playSequence: (sequence: any) => Promise<void>;
  nodeControls: any;
  reducedMotionVariants: any;
  memoizedAnimations: any;
  measurePerformance: (callback: () => void) => void;
  lazyLoadAnimation: (animation: any) => any;
  applyBouncyAnimation: (nodeId: string) => void;
  combineAnimationVariants: (...variants: Variants[]) => Variants;
  handleReconnect: (oldEdge: FbEdge, newConnection: FbConnection) => void;
  ANIMATION_DURATION: any;
  EASING: string;
  defaultEdgeTransition: any;
}

export const useAnimation = (): UseAnimationReturn => {
  const _store = useStore((state: ReactFlowState) => state);
  const { getNode, getEdge, setNodes, setEdges, fitView } = useReactFlow<
    FbNode,
    any
  >();
  const { reducedMotionVariants } = useReducedMotion();
  const customPresetsRef = useRef<AnimationPreset[]>([]);
  const sequencesRef = useRef<AnimationSequence[]>([]);
  const { controls: nodeControls, animateNode: animateRFNode } =
    useRFNodeAnimation();

  const animateNode = useCallback(
    (nodeId: string, variant: string) => {
      const node = getNode(nodeId);
      if (node) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              const animation = nodeVariants[variant];
              const width = n.width;
              const height = n.height;
              return {
                ...n,
                animation,
                style: { ...n.style, width, height },
              } as FbNode;
            }
            return n;
          }),
        );
        animateRFNode(variant);
      }
    },
    [getNode, setNodes, animateRFNode],
  );

  const animateEdge = useCallback(
    (edgeId: string, variant: string) => {
      const edge = getEdge(edgeId);
      if (edge) {
        setEdges((eds) =>
          eds.map((e) =>
            e.id === edgeId
              ? ({
                  ...e,
                  animation: createEdgeAnimations(edge.type)[variant],
                } as FbEdge)
              : e,
          ),
        );
      }
    },
    [getEdge, setEdges],
  );

  const animateHandle = useCallback(
    (nodeId: string, handleId: string, variant: string) => {
      const node = getNode(nodeId);
      if (node && isHandles(node.data.handles)) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId && isHandles(n.data.handles)) {
              return {
                ...n,
                data: {
                  ...n.data,
                  handles: {
                    ...n.data.handles,
                    [handleId]: {
                      ...n.data.handles[handleId],
                      animation: handleVariants[variant],
                    },
                  },
                },
              } as FbNode;
            }
            return n;
          }),
        );
      }
    },
    [getNode, setNodes],
  );

  const animateViewport = useCallback(
    (options: FbFitViewOptions) => {
      fitView(options);
    },
    [fitView],
  );

  const createPerformanceBasedAnimation = useCallback(
    (processingTime: number) => {
      return createPerformanceAnimation(processingTime);
    },
    [],
  );

  const createStaggered = useCallback(
    (elementIds: string[], staggerDuration: number) => {
      return createStaggeredAnimation(elementIds.length, staggerDuration);
    },
    [],
  );

  const createCoordinated = useCallback(
    (elementIds: string[], animation: Target) => {
      return createCoordinatedAnimation(elementIds, animation);
    },
    [],
  );

  const createCustom = useCallback(
    (keyframes: Target[], options: Transition) => {
      return createCustomAnimation(keyframes, options);
    },
    [],
  );

  const createDebug = useCallback((animation: TargetAndTransition) => {
    return createDebugAnimation(animation);
  }, []);

  const batchAnimate = useCallback(
    (
      animations: {
        id: string;
        variant: string;
        type: 'node' | 'edge' | 'handle';
      }[],
    ) => {
      const nodeUpdates = animations.filter((a) => a.type === 'node');
      const edgeUpdates = animations.filter((a) => a.type === 'edge');
      const handleUpdates = animations.filter((a) => a.type === 'handle');

      setNodes((nds) =>
        nds.map((n) => {
          const animation = nodeUpdates.find((a) => a.id === n.id);
          const handleAnimation = handleUpdates.find((a) =>
            a.id.startsWith(`${n.id}-`),
          );

          if (animation) {
            animateRFNode(animation.variant);
            const width = n.width;
            const height = n.height;
            return {
              ...n,
              animation: nodeVariants[animation.variant],
              style: { ...n.style, width, height },
            } as FbNode;
          } else if (handleAnimation && isHandles(n.data.handles)) {
            // Type guard applied here
            const [, handleId] = handleAnimation.id.split('-');
            return {
              ...n,
              data: {
                ...n.data,
                handles: {
                  ...n.data.handles, // Correctly typed
                  [handleId]: {
                    ...n.data.handles[handleId], // Accessing with correct type
                    animation: handleVariants[handleAnimation.variant],
                  },
                },
              },
            } as FbNode;
          }
          return n;
        }),
      );

      setEdges((eds) =>
        eds.map((e) => {
          const animation = edgeUpdates.find((a) => a.id === e.id);
          return animation
            ? ({
                ...e,
                animation: createEdgeAnimations(e.type)[animation.variant],
              } as FbEdge)
            : e;
        }),
      );
    },
    [setNodes, setEdges, animateRFNode],
  );

  const createGesture = useCallback((gesture: string, animation: Target) => {
    return createGestureAnimation(gesture, animation);
  }, []);

  const saveCustomPreset = useCallback(
    (id: string, animation: TargetAndTransition) => {
      customPresetsRef.current = [
        ...customPresetsRef.current.filter((preset) => preset.id !== id),
        { id, animation },
      ];
    },
    [],
  );

  const getCustomPreset = useCallback((id: string) => {
    return customPresetsRef.current.find((preset) => preset.id === id)
      ?.animation;
  }, []);

  const createSequence = useCallback(
    (id: string, animations: { target: string; animation: string }[]) => {
      sequencesRef.current = [
        ...sequencesRef.current.filter((seq) => seq.id !== id),
        { id, animations },
      ];
    },
    [],
  );

  const playSequence = useCallback(
    async (sequenceId: string) => {
      const sequence = sequencesRef.current.find(
        (seq) => seq.id === sequenceId,
      );
      if (sequence) {
        for (const anim of sequence.animations) {
          if (anim.target.startsWith('node-')) {
            await animateNode(anim.target.slice(5), anim.animation);
          } else if (anim.target.startsWith('edge-')) {
            await animateEdge(anim.target.slice(5), anim.animation);
          } else if (anim.target.startsWith('handle-')) {
            const [, nodeId, handleId] = anim.target.split('-');
            await animateHandle(nodeId, handleId, anim.animation);
          }
        }
      }
    },
    [animateNode, animateEdge, animateHandle],
  );

  const memoizedAnimations = useMemo(
    () => ({
      nodeVariants,
      handleVariants,
      edgeAnimations: createEdgeAnimations('default'),
    }),
    [],
  );

  const measurePerformance = useCallback((animationFn: () => void) => {
    const start = performance.now();
    animationFn();
    const end = performance.now();
    return end - start;
  }, []);

  const lazyLoadAnimation = useCallback(
    async (
      animationModule: () => Promise<{ default: TargetAndTransition }>,
    ) => {
      const { default: animation } = await animationModule();
      return animation;
    },
    [],
  );

  const applyBouncyAnimation = useCallback(
    (target: string) => {
      if (target.startsWith('node-')) {
        animateNode(target.slice(5), 'bouncy');
      } else if (target.startsWith('edge-')) {
        animateEdge(target.slice(5), 'bouncy');
      }
    },
    [animateNode, animateEdge],
  );

  const combineAnimationVariants = useCallback((...variants: Variants[]) => {
    return combineVariants(...variants);
  }, []);

  const handleReconnect = useCallback(
    (oldEdge: FbEdge, newConnection: FbConnection) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === oldEdge.id ? ({ ...e, ...newConnection } as FbEdge) : e,
        ),
      );
    },
    [setEdges],
  );

  return {
    animateNode,
    animateEdge,
    animateHandle,
    animateViewport,
    createPerformanceBasedAnimation,
    createStaggered,
    createCoordinated,
    createCustom,
    createDebug,
    batchAnimate,
    createGesture,
    saveCustomPreset,
    getCustomPreset,
    createSequence,
    playSequence,
    nodeControls,
    reducedMotionVariants,
    memoizedAnimations,
    measurePerformance,
    lazyLoadAnimation,
    applyBouncyAnimation,
    combineAnimationVariants,
    handleReconnect,
    ANIMATION_DURATION,
    EASING,
    defaultEdgeTransition,
  };
};

export default useAnimation;
