/**
 * AiChat Custom Hooks - Specialized hooks for AI Elements functionality
 * Provides focused hooks for specific features while maintaining access to unified context
 */

'use client';

import { logError, logWarn } from '@repo/observability';
import { useCallback, useContext, useMemo } from 'react';
import {
  AiChatContext,
  type AiChatContextValue,
  type AiChatMessage,
  type StreamingStatus,
} from './ai-chat-context';

/**
 * Main hook for accessing AiChat context
 * @throws Error if used outside AiChatProvider
 */
export function useAiChat(): AiChatContextValue {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error('useAiChat must be used within an AiChatProvider');
  }
  return context;
}

/**
 * Hook for branch navigation functionality
 */
export interface UseBranchNavigationReturn {
  currentBranch: number;
  totalBranches: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goNext: () => void;
  goPrevious: () => void;
  goToBranch: (index: number) => void;
  currentMessages: AiChatMessage[];
  addNewBranch: (messages: AiChatMessage[]) => void;
}

export function useBranchNavigation(): UseBranchNavigationReturn {
  const context = useAiChat();

  const canGoNext = context.currentBranch < context.totalBranches - 1;
  const canGoPrevious = context.currentBranch > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      context.setBranch(context.currentBranch + 1);
    }
  }, [context, canGoNext]);

  const goPrevious = useCallback(() => {
    if (canGoPrevious) {
      context.setBranch(context.currentBranch - 1);
    }
  }, [context, canGoPrevious]);

  const goToBranch = useCallback(
    (index: number) => {
      context.setBranch(index);
    },
    [context],
  );

  const currentMessages = useMemo(() => {
    return context.branches[context.currentBranch] || [];
  }, [context.branches, context.currentBranch]);

  const addNewBranch = useCallback(
    (messages: AiChatMessage[]) => {
      context.addBranch(messages);
      // Automatically switch to the new branch
      context.setBranch(context.totalBranches); // Will be totalBranches after addBranch
    },
    [context],
  );

  return {
    currentBranch: context.currentBranch,
    totalBranches: context.totalBranches,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    goToBranch,
    currentMessages,
    addNewBranch,
  };
}

/**
 * Hook for message actions functionality
 */
export interface UseMessageActionsReturn {
  isLiked: (messageId: string) => boolean;
  isCopied: (messageId: string) => boolean;
  toggleLike: (messageId: string) => void;
  copyMessage: (messageId: string, content: string) => Promise<void>;
  getMessageMetadata: (messageId: string) => any;
  setMessageMetadata: (messageId: string, metadata: any) => void;
}

export function useMessageActions(): UseMessageActionsReturn {
  const context = useAiChat();

  const isLiked = useCallback(
    (messageId: string) => {
      return context.likedMessages.has(messageId);
    },
    [context.likedMessages],
  );

  const isCopied = useCallback(
    (messageId: string) => {
      return context.copiedMessages.has(messageId);
    },
    [context.copiedMessages],
  );

  const copyMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        context.setCopied(messageId);
      } catch (error) {
        logWarn('Failed to copy message', { error });
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          context.setCopied(messageId);
        } catch (fallbackError) {
          logError('Clipboard fallback failed', fallbackError as Error);
        }
        document.body.removeChild(textArea);
      }
    },
    [context],
  );

  const getMessageMetadata = useCallback(
    (messageId: string) => {
      return context.messageMetadata.get(messageId);
    },
    [context.messageMetadata],
  );

  return {
    isLiked,
    isCopied,
    toggleLike: context.toggleLike,
    copyMessage,
    getMessageMetadata,
    setMessageMetadata: context.setMessageMetadata,
  };
}

/**
 * Hook for conversation scroll functionality
 */
export interface UseConversationScrollReturn {
  isAtBottom: boolean;
  scrollToBottom: () => void;
  setIsAtBottom: (isAtBottom: boolean) => void;
}

export function useConversationScroll(): UseConversationScrollReturn {
  const context = useAiChat();

  return {
    isAtBottom: context.isAtBottom,
    scrollToBottom: context.scrollToBottom,
    setIsAtBottom: context.setIsAtBottom,
  };
}

/**
 * Hook for input and streaming functionality
 */
export interface UseAiInputReturn {
  inputValue: string;
  setInputValue: (value: string) => void;
  streamingStatus: StreamingStatus;
  setStreamingStatus: (status: StreamingStatus) => void;
  isStreaming: boolean;
  isLoading: boolean;
  isReady: boolean;
  canSubmit: boolean;
}

export function useAiInput(): UseAiInputReturn {
  const context = useAiChat();

  const isStreaming = context.streamingStatus === 'streaming';
  const isLoading = context.streamingStatus === 'loading';
  const isReady = context.streamingStatus === 'ready';
  const canSubmit = isReady && context.inputValue.trim().length > 0;

  return {
    inputValue: context.inputValue,
    setInputValue: context.setInputValue,
    streamingStatus: context.streamingStatus,
    setStreamingStatus: context.setStreamingStatus,
    isStreaming,
    isLoading,
    isReady,
    canSubmit,
  };
}

/**
 * Hook for current branch messages with reactive updates
 */
export interface UseCurrentMessagesReturn {
  messages: AiChatMessage[];
  addMessage: (message: AiChatMessage) => void;
  updateMessages: (messages: AiChatMessage[]) => void;
  hasMessages: boolean;
  messageCount: number;
}

export function useCurrentMessages(): UseCurrentMessagesReturn {
  const context = useAiChat();

  const messages = useMemo(() => {
    return context.branches[context.currentBranch] || [];
  }, [context.branches, context.currentBranch]);

  const addMessage = useCallback(
    (message: AiChatMessage) => {
      const currentMessages = context.branches[context.currentBranch] || [];
      context.updateCurrentBranch([...currentMessages, message]);
    },
    [context],
  );

  const updateMessages = useCallback(
    (newMessages: AiChatMessage[]) => {
      context.updateCurrentBranch(newMessages);
    },
    [context],
  );

  return {
    messages,
    addMessage,
    updateMessages,
    hasMessages: messages.length > 0,
    messageCount: messages.length,
  };
}

/**
 * Combined hook for common chat operations
 */
export interface UseChatOperationsReturn {
  // Branch operations
  branch: UseBranchNavigationReturn;

  // Message operations
  actions: UseMessageActionsReturn;

  // Current messages
  messages: UseCurrentMessagesReturn;

  // Input operations
  input: UseAiInputReturn;

  // Scroll operations
  scroll: UseConversationScrollReturn;
}

export function useChatOperations(): UseChatOperationsReturn {
  const branch = useBranchNavigation();
  const actions = useMessageActions();
  const messages = useCurrentMessages();
  const input = useAiInput();
  const scroll = useConversationScroll();

  return {
    branch,
    actions,
    messages,
    input,
    scroll,
  };
}
