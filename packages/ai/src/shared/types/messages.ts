/**
 * Standard message types for AI SDK v5 compatibility
 * Provides consistent typing across all applications using the AI package
 */

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { z } from 'zod/v4';

/**
 * Standard metadata schema for messages
 * Can be extended by applications as needed
 */
export const messageMetadataSchema = z.object({
  createdAt: z.string(),
  model: z.string().optional(),
  totalTokens: z.number().optional(),
  duration: z.number().optional(),
});

export type StandardMessageMetadata = z.infer<typeof messageMetadataSchema>;

/**
 * Standard UI data types for streaming
 * Covers common streaming data patterns
 */
export type StandardUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: any;
  appendMessage: string;
  id: string;
  title: string;
  kind: string;
  clear: null;
  finish: null;
};

/**
 * Standardized chat message type using AI SDK v5 generics
 * This is the primary message type for chat applications
 */
export type StandardChatMessage = UIMessage<StandardMessageMetadata, StandardUIDataTypes>;

/**
 * Standard useChat helpers type with proper generics
 * Avoids circular type references
 */
export type StandardUseChatHelpers = UseChatHelpers<StandardMessageMetadata, StandardUIDataTypes>;

/**
 * Helper type for components that accept chat helpers
 * Provides clean prop typing without circular references
 */
export interface ChatHelperProps {
  messages: StandardChatMessage[];
  setMessages: StandardUseChatHelpers['setMessages'];
  append: StandardUseChatHelpers['append'];
  reload: StandardUseChatHelpers['reload'];
  stop: StandardUseChatHelpers['stop'];
  status: StandardUseChatHelpers['status'];
  error?: StandardUseChatHelpers['error'];
}

/**
 * Attachment type for file uploads
 * Common across chat applications
 */
export interface StandardAttachment {
  name: string;
  url: string;
  contentType: string;
  size?: number;
}
