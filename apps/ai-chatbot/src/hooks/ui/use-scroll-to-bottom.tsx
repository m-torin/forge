import { useInViewport, useScrollIntoView } from '@mantine/hooks';
import { useRef } from 'react';

/**
 * Hook for managing scroll-to-bottom behavior with viewport detection
 * @returns Object with scroll controls and refs
 */
export function useScrollToBottom(): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement> | ((instance: HTMLDivElement | null) => void);
  isAtBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  onViewportEnter: () => void;
  onViewportLeave: () => void;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollIntoView } = useScrollIntoView<HTMLDivElement>();
  const { ref: endRef, inViewport: isAtBottom } = useInViewport<HTMLDivElement>();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    scrollIntoView({
      alignment: 'end',
      // Map ScrollBehavior to easing (smooth -> default easing, instant -> no duration)
      ...(behavior === 'instant' && { duration: 0 }),
    });
  };

  // For backward compatibility with existing components that expect these handlers
  const onViewportEnter = () => {};
  const onViewportLeave = () => {};

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  };
}
