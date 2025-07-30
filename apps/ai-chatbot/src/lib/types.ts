import type { ArtifactKind } from '#/components/artifact';
import {
  StandardAttachment,
  StandardChatMessage,
  StandardMessageMetadata,
  StandardUIDataTypes,
  messageMetadataSchema,
} from '@repo/ai/client/next';
import type { Suggestion } from './db/schema';

/**
 * Data part type for streaming messages
 */
export type DataPart = { type: 'append-message'; message: string };

/**
 * Re-export standard types for convenience
 */
export type ChatMessage = StandardChatMessage;
export type MessageMetadata = StandardMessageMetadata;
export { messageMetadataSchema };

/**
 * Simplified tool types for now - these can be expanded later when proper tools are implemented
 */
export type ChatTools = {
  getWeather: any;
  createDocument: any;
  updateDocument: any;
  requestSuggestions: any;
};

/**
 * Extend standard UI data types with app-specific types
 */
export interface CustomUIDataTypes extends StandardUIDataTypes {
  suggestion: Suggestion;
  kind: ArtifactKind;
  // Add index signature to satisfy Record<string, unknown> constraint
  [key: string]: unknown;
}

/**
 * Re-export attachment type
 */
export type Attachment = StandardAttachment;
