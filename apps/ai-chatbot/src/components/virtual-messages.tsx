'use client';

import { PreviewMessage, ThinkingMessage } from '#/components/message';
import type { Vote } from '#/lib/db/schema';
import type { ChatMessage } from '#/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useDocumentVisibility, useIntersection, useViewportSize } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import { motion } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
// @ts-ignore - react-window-infinite-loader doesn't have types
import InfiniteLoader from 'react-window-infinite-loader';

/**
 * Props for VirtualMessages component
 */
interface VirtualMessagesProps {
  chatId: string;
  messages: ChatMessage[];
  votes?: Vote[];
  status: UseChatHelpers['status'];
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  scrollOnNewMessage: boolean;
}

// Estimated heights for different message types
const ESTIMATED_MESSAGE_HEIGHT = 120;
const ESTIMATED_USER_MESSAGE_HEIGHT = 80;
const ESTIMATED_ASSISTANT_MESSAGE_HEIGHT = 150;
const THINKING_MESSAGE_HEIGHT = 100;

// Performance settings
const OVERSCAN_COUNT = 5; // Number of items to render outside of the visible area
const THRESHOLD = 10; // Minimum number of items before triggering load more

/**
 * Props for MessageRow component used in virtualization
 */
interface MessageRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: ChatMessage[];
    votes: Vote[];
    chatId: string;
    setMessages: UseChatHelpers['setMessages'];
    reload: UseChatHelpers['reload'];
    isReadonly: boolean;
    status: UseChatHelpers['status'];
    isThinking: boolean;
  };
}

/**
 * Memoized message row component for virtual scrolling
 * @param index - Row index in virtual list
 * @param style - CSS styles for positioning
 * @param data - Shared data for all rows
 */
const MessageRow = memo(
  ({ index, style, data }: MessageRowProps) => {
    const { messages, votes, chatId, setMessages, reload, isReadonly, status, isThinking } = data;

    // Handle thinking message
    if (isThinking && index === messages.length) {
      return (
        <div style={style}>
          <ThinkingMessage />
        </div>
      );
    }

    const message = messages[index];
    if (!message) return null;

    const vote = votes?.find(v => v.messageId === message.id);

    return (
      <div style={style}>
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          vote={vote}
          isLoading={status === 'submitted' && index === messages.length - 1}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          requiresScrollPadding={false}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.index !== nextProps.index) return false;
    if (prevProps.style !== nextProps.style) return false;

    // Optimize data comparison by checking specific fields instead of deep equal
    const prevData = prevProps.data;
    const nextData = nextProps.data;

    if (prevData.chatId !== nextData.chatId) return false;
    if (prevData.isReadonly !== nextData.isReadonly) return false;
    if (prevData.status !== nextData.status) return false;
    if (prevData.isThinking !== nextData.isThinking) return false;
    if (prevData.messages.length !== nextData.messages.length) return false;
    if (prevData.votes?.length !== nextData.votes?.length) return false;

    // For this specific message, do shallow comparison
    const prevMessage = prevData.messages[prevProps.index];
    const nextMessage = nextData.messages[nextProps.index];
    if (prevMessage?.id !== nextMessage?.id) return false;
    if (prevMessage?.role !== nextMessage?.role) return false;

    return true;
  },
);

MessageRow.displayName = 'MessageRow';

/**
 * Virtual messages component with infinite scrolling and performance optimization
 * @param chatId - Current chat identifier
 * @param messages - Array of chat messages
 * @param votes - User votes on messages
 * @param status - Chat status
 * @param setMessages - Function to update messages
 * @param reload - Function to reload conversation
 * @param isReadonly - Whether messages are read-only
 * @param scrollOnNewMessage - Whether to auto-scroll on new messages
 */
export function VirtualMessages({
  chatId,
  messages,
  votes = [],
  status,
  setMessages,
  reload,
  isReadonly,
  scrollOnNewMessage = true,
}: VirtualMessagesProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { height: viewportHeight } = useViewportSize();
  const [hasMoreItems, _setHasMoreItems] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Enhanced performance optimizations
  const documentVisible = useDocumentVisibility();
  const { ref: intersectionRef, entry } = useIntersection({
    threshold: 0.1,
  });

  const isThinking = status === 'submitted';
  const itemCount = messages.length + (isThinking ? 1 : 0);
  const isAtBottom = entry?.isIntersecting ?? false;

  // Calculate optimal item size based on message type
  const getItemSize = useCallback(
    (index: number) => {
      if (isThinking && index === messages.length) {
        return THINKING_MESSAGE_HEIGHT;
      }

      const message = messages[index];
      if (!message) return ESTIMATED_MESSAGE_HEIGHT;

      // Estimate based on role and content length
      if (message.role === 'user') {
        return ESTIMATED_USER_MESSAGE_HEIGHT;
      } else {
        // Assistant messages tend to be longer
        const contentLength = message.parts.reduce((acc, part) => {
          if (part.type === 'text') {
            return acc + (part.text?.length || 0);
          }
          return acc;
        }, 0);

        // Rough estimation: 100 chars = 20px height
        const estimatedHeight = Math.max(
          ESTIMATED_ASSISTANT_MESSAGE_HEIGHT,
          Math.min(500, 80 + Math.floor(contentLength / 100) * 20),
        );

        return estimatedHeight;
      }
    },
    [messages, isThinking],
  );

  // Enhanced scroll to bottom with intersection observer
  useEffect(() => {
    if (scrollOnNewMessage && listRef.current && messages.length > 0 && documentVisible) {
      // Only auto-scroll if user is at the bottom or close to it
      if (isAtBottom || messages.length === 1) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          listRef.current?.scrollToItem(itemCount - 1, 'end');
        }, 100);
      }
    }
  }, [messages.length, itemCount, scrollOnNewMessage, documentVisible, isAtBottom]);

  // Handle loading more messages (for pagination) - paused when document not visible
  const loadMoreItems = useCallback(
    async (startIndex: number, stopIndex: number) => {
      if (isLoadingMore || !hasMoreItems || !documentVisible) return;

      setIsLoadingMore(true);
      // This is where you would implement loading more messages
      // For now, we'll just simulate it
      logInfo('Loading more messages', { startIndex, stopIndex });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsLoadingMore(false);
    },
    [hasMoreItems, isLoadingMore, documentVisible],
  );

  // Check if more items need to be loaded
  const isItemLoaded = useCallback(
    (index: number) => {
      return index < messages.length || (isThinking && index === messages.length);
    },
    [messages.length, isThinking],
  );

  // Calculate list height (subtract header and input area)
  const listHeight = viewportHeight - 180; // Adjust based on your layout

  const itemData = {
    messages,
    votes,
    chatId,
    setMessages,
    reload,
    isReadonly,
    status,
    isThinking,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      data-testid="virtual-messages-container"
    >
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        minimumBatchSize={THRESHOLD}
        threshold={THRESHOLD}
      >
        {({ onItemsRendered, ref }: { onItemsRendered: any; ref: any }) => (
          <List
            ref={list => {
              // @ts-ignore - react-window types issue
              ref(list);
              // @ts-ignore
              listRef.current = list;
            }}
            height={listHeight}
            itemCount={itemCount}
            itemSize={getItemSize}
            itemData={itemData}
            overscanCount={OVERSCAN_COUNT}
            onItemsRendered={onItemsRendered}
            className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
            width="100%"
          >
            {MessageRow}
          </List>
        )}
      </InfiniteLoader>

      {/* Loading indicator for pagination */}
      {isLoadingMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-0 right-0 top-0 flex h-20 items-center justify-center bg-gradient-to-b from-background to-transparent"
        >
          <div className="rounded-full bg-background/80 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            Loading more messages...
          </div>
        </motion.div>
      )}

      {/* Intersection observer target for bottom detection */}
      <div
        ref={node => {
          intersectionRef(node);
          bottomRef.current = node;
        }}
        className="absolute bottom-0 left-0 h-1 w-full"
        data-testid="bottom-detector"
      />

      {/* Enhanced performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute right-2 top-2 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          {itemCount} messages (virtualized) | {isAtBottom ? '📍' : '📜'} |{' '}
          {documentVisible ? '👁️' : '😴'}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for measuring message heights dynamically using ResizeObserver
 * @returns Methods to measure and get cached heights
 */
export function useMessageHeightCache() {
  const heightCache = useRef<Map<string, number>>(new Map());
  const observers = useRef<Map<string, ResizeObserver>>(new Map());

  const measureElement = useCallback((messageId: string, element: HTMLElement | null) => {
    if (!element) {
      // Clean up observer if element is removed
      const observer = observers.current.get(messageId);
      if (observer) {
        observer.disconnect();
        observers.current.delete(messageId);
      }
      return;
    }

    // Create resize observer for this element
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        heightCache.current.set(messageId, height);
      }
    });

    observer.observe(element);
    observers.current.set(messageId, observer);

    // Store initial height
    const height = element.getBoundingClientRect().height;
    heightCache.current.set(messageId, height);
  }, []);

  const getHeight = useCallback((messageId: string): number | undefined => {
    return heightCache.current.get(messageId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentObservers = observers.current;
    return () => {
      currentObservers.forEach(observer => observer.disconnect());
    };
  }, []);

  return { measureElement, getHeight };
}
