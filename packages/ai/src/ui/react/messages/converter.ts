/**
 * Message converter utilities for AI SDK v5
 * Provides utilities for converting between message formats
 */

import type { UIMessage } from 'ai';

/**
 * Message converter singleton
 */
export const messageConverter = {
  /**
   * Convert legacy format to parts format
   */
  toLegacy: (message: UIMessage) => {
    return {
      id: message.id,
      role: message.role,
      content: extractTextContent(message),
      metadata: message.metadata,
    };
  },

  /**
   * Convert parts format to legacy format
   */
  fromLegacy: (legacy: any): UIMessage => {
    return {
      id: legacy.id || crypto.randomUUID(),
      role: legacy.role,
      parts: [
        {
          type: 'text' as const,
          text: legacy.content || '',
        },
      ],
      metadata: legacy.metadata,
    };
  },

  // Additional helper functions for tests
  convertLegacyToPartsFormat,
  convertPartsToLegacyFormat,
  extractTextContent,
  messageHasPartType,
  countPartsByType,
  hasTools,
  hasFiles,
  isTextOnly,
};

/**
 * Convert legacy message format to parts format
 */
export function convertLegacyToPartsFormat(legacy: any): UIMessage {
  return messageConverter.fromLegacy(legacy);
}

/**
 * Convert parts format to legacy format
 */
export function convertPartsToLegacyFormat(message: UIMessage) {
  return messageConverter.toLegacy(message);
}

/**
 * Extract text content from a UIMessage
 */
export function extractTextContent(message: UIMessage): string {
  if (!message.parts) return '';

  return message.parts
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('\n');
}

/**
 * Extract file attachments from a UIMessage
 */
export function extractFileAttachments(message: UIMessage): any[] {
  if (!message.parts) return [];

  return message.parts.filter((part: any) => part.type === 'file');
}

/**
 * Extract tool calls from a UIMessage (tool parts with input-available state)
 */
export function extractToolCalls(message: UIMessage): any[] {
  if (!message.parts) return [];

  return message.parts.filter(
    (part: any) =>
      (part.type?.startsWith('tool-') || part.type === 'dynamic-tool') &&
      (part.state === 'input-available' || part.state === 'input-streaming'),
  );
}

/**
 * Extract tool results from a UIMessage (tool parts with output-available state)
 */
export function extractToolResults(message: UIMessage): any[] {
  if (!message.parts) return [];

  return message.parts.filter(
    (part: any) =>
      (part.type?.startsWith('tool-') || part.type === 'dynamic-tool') &&
      part.state === 'output-available',
  );
}

/**
 * Check if message has a specific part type
 */
export function messageHasPartType(message: UIMessage, type: string): boolean {
  if (!message.parts) return false;

  return message.parts.some((part: any) => part.type === type);
}

/**
 * Count parts by type - returns an object with counts for each type
 */
export function countPartsByType(message: UIMessage): Record<string, number> {
  if (!message.parts) return {};

  const counts: Record<string, number> = {};

  message.parts.forEach((part: any) => {
    if (part.type) {
      counts[part.type] = (counts[part.type] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Check if message has tools (parts starting with 'tool-' or 'dynamic-tool')
 */
function hasTools(message: UIMessage): boolean {
  if (!message.parts) return false;

  return message.parts.some(
    (part: any) => part.type?.startsWith('tool-') || part.type === 'dynamic-tool',
  );
}

/**
 * Check if message has files
 */
function hasFiles(message: UIMessage): boolean {
  if (!message.parts) return false;

  return message.parts.some((part: any) => part.type === 'file');
}

/**
 * Check if message is text only
 */
function isTextOnly(message: UIMessage): boolean {
  if (!message.parts) return false;

  return message.parts.every((part: any) => part.type === 'text');
}
