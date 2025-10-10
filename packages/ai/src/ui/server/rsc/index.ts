/**
 * AI Elements - React Server Components (RSC)
 * Server-optimized components for static rendering
 */

// Response components
export {
  CodeResponse,
  Response,
  ResponseVariants,
  ResponseWithMetadata,
  StreamingResponse,
  type CodeResponseProps,
  type ResponseProps,
  type ResponseWithMetadataProps,
  type StreamingResponseProps,
} from './response';

// Message server components
export {
  MessageAvatarServer,
  MessageListServer,
  MessageServer,
  MessageServerVariants,
  type MessageAvatarServerProps,
  type MessageListServerProps,
  type MessageServerProps,
} from './message-server';

// Conversation RSC components
export {
  ConversationContentRSC,
  ConversationLayout,
  ConversationRSC,
  ConversationRSCVariants,
  EmptyConversation,
  StaticConversation,
  type ConversationContentRSCProps,
  type ConversationLayoutProps,
  type ConversationRSCProps,
  type EmptyConversationProps,
  type StaticConversationProps,
} from './conversation-rsc';

// Re-export common types
export type { MessageRole as ServerMessageRole } from './message-server';
