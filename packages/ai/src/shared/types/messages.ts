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
 * Covers common streaming data patterns (AI SDK v5)
 */
export type StandardUIDataTypes = {
  delta: string; // AI SDK v5: text-delta chunks use 'delta' property
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
 * Standardized chat message type using AI SDK v5
 * This is the primary message type for chat applications
 */
export type StandardChatMessage = UIMessage & {
  metadata?: StandardMessageMetadata;
};

/**
 * Standard useChat helpers type
 * Avoids circular type references
 */
export type StandardUseChatHelpers = UseChatHelpers<any>;

/**
 * Helper type for components that accept chat helpers
 * Provides clean prop typing without circular references
 */
export interface ChatHelperProps {
  messages: StandardChatMessage[];
  setMessages: StandardUseChatHelpers['setMessages'];
  sendMessage?: StandardUseChatHelpers['sendMessage'];
  regenerate?: StandardUseChatHelpers['regenerate'];
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
