import { useScrollToBottom } from '#/hooks/ui/use-scroll-to-bottom';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useElementSize, useMediaQuery, useViewportSize } from '@mantine/hooks';
import { useEffect, useState } from 'react';

export function useMessages({
  chatId,
  status,
}: {
  chatId: string;
  status: UseChatHelpers['status'];
}): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement> | ((instance: HTMLDivElement | null) => void);
  isAtBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  onViewportEnter: () => void;
  onViewportLeave: () => void;
  hasSentMessage: boolean;
  isMobile: boolean;
  containerSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  sizeRef: React.RefObject<any>;
} {
  const { containerRef, endRef, isAtBottom, scrollToBottom, onViewportEnter, onViewportLeave } =
    useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);

  // Enhanced viewport and element size tracking
  const viewportSize = useViewportSize();
  const { ref: sizeRef, width, height } = useElementSize();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Container size from Mantine hook
  const containerSize = { width: width || 0, height: height || 0 };

  useEffect(() => {
    if (chatId) {
      // Use different scroll behavior based on mobile/desktop
      scrollToBottom(isMobile ? 'smooth' : 'instant');
      setHasSentMessage(false);
    }
  }, [chatId, scrollToBottom, isMobile]);

  useEffect(() => {
    if (status === 'submitted') {
      setHasSentMessage(true);
    }
  }, [status]);

  // For now, let's use the existing containerRef and provide size info separately
  // The component using this hook can assign both refs if needed
  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
    isMobile,
    containerSize,
    viewportSize,
    sizeRef, // Provide the size ref separately for manual assignment if needed
  };
}
