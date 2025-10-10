/**
 * @repo/ai server-side UI utilities
 * React Server Components (RSC) and server-side helpers
 */

// Stream helper exports (explicit for tree shaking)
export {
  batchOperationsWithUI,
  createProgressiveUI,
  createStreamableComponent,
  createStreamableText,
  streamTextWithUI,
  streamWithTools,
} from './stream-helpers';

// Server action exports (explicit for tree shaking)
export {
  analyzeContentAction,
  batchProcessAction,
  generateChatResponseAction,
  generateObjectAction,
  generateTextAction,
  generateWithToolsAction,
  streamTextAction,
} from './server-actions';

// AI Elements - React Server Components (RSC)
export {
  CodeResponse,
  ConversationContentRSC,
  ConversationLayout,
  // Conversation RSC components
  ConversationRSC,
  ConversationRSCVariants,
  EmptyConversation,
  MessageAvatarServer,
  MessageListServer,
  // Message server components
  MessageServer,
  MessageServerVariants,
  // Response components
  Response,
  ResponseVariants,
  ResponseWithMetadata,
  StaticConversation,
  StreamingResponse,
  type CodeResponseProps,
  type ConversationContentRSCProps,
  type ConversationLayoutProps,
  type ConversationRSCProps,
  type EmptyConversationProps,
  type MessageAvatarServerProps,
  type MessageListServerProps,
  type MessageServerProps,
  // Types
  type ResponseProps,
  type ResponseWithMetadataProps,
  type ServerMessageRole,
  type StaticConversationProps,
  type StreamingResponseProps,
} from './rsc';
