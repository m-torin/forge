/**
 * State Management Exports
 * Unified exports for AiChat context, hooks, and utilities
 */

// Context and Provider
export {
  AiChatContext,
  AiChatProvider,
  type AiChatActions,
  type AiChatContextValue,
  type AiChatMessage,
  type AiChatProviderProps,
  type AiChatState,
  type MessageMetadata,
  type StreamingStatus,
} from './ai-chat-context';

// Hooks
export {
  useAiChat,
  useAiInput,
  useBranchNavigation,
  useChatOperations,
  useConversationScroll,
  useCurrentMessages,
  useMessageActions,
  type UseAiInputReturn,
  type UseBranchNavigationReturn,
  type UseChatOperationsReturn,
  type UseConversationScrollReturn,
  type UseCurrentMessagesReturn,
  type UseMessageActionsReturn,
} from './hooks';
