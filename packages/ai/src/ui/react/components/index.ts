/**
 * UI Components exports
 * Standardized components that eliminate repetitive patterns from AI SDK documentation
 */

// Core components (existing)
export {
  ChatContainer,
  ChatContainerVariants,
  useChatComponents,
  type ChatContainerProps,
} from './ChatContainer';
export { ChatForm, ChatFormVariants, type ChatFormProps } from './ChatForm';
export { MessageList, MessageListVariants, type MessageListProps } from './MessageList';
export {
  StatusIndicator,
  StatusIndicatorVariants,
  useStatusInfo,
  type StatusIndicatorProps,
} from './StatusIndicator';

// AI Elements - Client components (interactive)
export { Action, ActionVariants, Actions, type ActionProps, type ActionsProps } from './actions';

export {
  Input,
  PromptInputForm,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputVariants,
  type InputProps,
  type PromptInputFormProps,
  type PromptInputSubmitProps,
  type PromptInputTextareaProps,
} from './prompt-input';

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageVariants,
  Response,
  type MessageAvatarProps,
  type MessageContentProps,
  type MessageProps,
  type MessageRole,
  type ResponseProps,
} from './message';

export {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationVariants,
  ConversationWithFeatures,
  type ConversationContentProps,
  type ConversationProps,
  type ConversationScrollButtonProps,
  type ConversationWithFeaturesProps,
} from './conversation';

// Conversation demo and examples
export {
  ConversationDemo,
  ConversationDemoVariants,
  type ConversationDemoProps,
  type DemoMessage,
} from './ConversationDemo';

// Branch components - AI Elements Integration
export {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector,
  BranchVariants,
  type BranchButtonProps,
  type BranchMessagesProps,
  type BranchPageProps,
  type BranchProps,
  type BranchSelectorProps,
} from './branch';

// Error Boundary components
export {
  ConversationErrorBoundary,
  DefaultErrorFallback,
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  type ConversationErrorBoundaryProps,
  type ErrorBoundaryProps,
  type ErrorFallbackProps,
} from './error-boundary';

// Re-export types for convenience;
