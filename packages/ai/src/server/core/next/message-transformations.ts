// import { appendResponseMessages } from 'ai'; // Not available in current v5 beta

import type { ModelMessage } from 'ai';

// UIMessage type for UI SDK compatibility with AI SDK v5
// We define our own interface that's compatible with ModelMessage variants
interface UIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<any>;
  parts?: Array<any>;
  createdAt?: Date;
}

// AI SDK v5 Content Parts
export interface MessageContentPart {
  type: 'text' | 'image' | 'file' | 'reasoning' | 'tool-call' | 'tool-result' | string;
  text?: string;
  image?: string | Uint8Array | ArrayBuffer | Buffer | URL;
  reasoningText?: string;
  content?: unknown;
  [key: string]: unknown;
}

export interface MessageRankingConfig {
  toolCallRank?: number;
  toolResultRank?: number;
  assistantRank?: number;
  defaultRank?: number;
}

export interface MessageTransformationConfig {
  batchSize?: number;
  insertBatchSize?: number;
  enableDeduplication?: boolean;
  enableSanitization?: boolean;
}

/**
 * Gets the rank of a message for sorting purposes during transformation
 * Tool calls have highest priority (0), then tool results (1), then assistant messages (2), then others (3)
 */
export function getMessageRank(
  message: { role: string; content: unknown },
  config: MessageRankingConfig = {},
): number {
  const { toolCallRank = 0, toolResultRank = 1, assistantRank = 2, defaultRank = 3 } = config;

  // In AI SDK v5, content can be string or array of parts
  const contentArray = Array.isArray(message.content) ? message.content : [];

  if (message.role === 'assistant' && contentArray.some((part: any) => part.type === 'tool-call')) {
    return toolCallRank;
  }

  if (message.role === 'tool' && contentArray.some((part: any) => part.type === 'tool-result')) {
    return toolResultRank;
  }

  if (message.role === 'assistant') {
    return assistantRank;
  }

  return defaultRank;
}

/**
 * Removes duplicate parts from a message based on type and content
 */
export function dedupeParts<T extends MessageContentPart>(parts: T[]): T[] {
  const seen = new Set<string>();
  return parts.filter(part => {
    const key = `${part.type}|${JSON.stringify(part.content ?? part)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Removes invalid or unwanted parts from a message
 * Currently filters out reasoning parts with undefined content
 */
export function sanitizeParts<T extends MessageContentPart>(parts: T[]): T[] {
  return parts.filter(part => !(part.type === 'reasoning' && part.reasoningText === 'undefined'));
}

/**
 * Groups messages into conversation sections starting with user messages
 */
export function groupMessagesIntoSections(messages: UIMessage[]): UIMessage[][] {
  const sections: UIMessage[][] = [];
  let currentSection: UIMessage[] = [];

  for (const message of messages) {
    if (message.role === 'user' && currentSection.length > 0) {
      sections.push([...currentSection]);
      currentSection = [];
    }
    currentSection.push(message);
  }

  if (currentSection.length > 0) {
    sections.push([...currentSection]);
  }

  return sections;
}

/**
 * Transforms a conversation section for AI SDK v5
 * Ensures content is properly structured for AI SDK v5
 */
export function transformConversationSection(
  section: UIMessage[],
  _config: { currentDate?: () => Date } = {},
): UIMessage[] {
  return section.map(message => {
    // In AI SDK v5, ModelMessage.content can be string or array of parts
    // UIMessage from the UI SDK has a separate 'parts' array for rich content
    if (typeof message.content === 'string' && !Array.isArray(message.content)) {
      // Content is already a string, which is valid for ModelMessage
      return message;
    }
    return message;
  });
}

/**
 * Processes and cleans message parts for storage
 */
export function processMessageParts(
  parts: MessageContentPart[] | undefined,
  config: MessageTransformationConfig = {},
): MessageContentPart[] {
  const { enableDeduplication = true, enableSanitization = true } = config;

  if (!parts) return [];

  let processedParts = [...parts];

  if (enableSanitization) {
    processedParts = sanitizeParts(processedParts);
  }

  if (enableDeduplication) {
    processedParts = dedupeParts(processedParts);
  }

  return processedParts;
}

/**
 * Sorts messages by creation time and message rank
 */
export function sortMessagesByPriority<
  T extends { createdAt: Date; role: string; content: unknown },
>(messages: T[], config: MessageRankingConfig = {}): T[] {
  return messages.sort((a, b) => {
    const timeDifference = a.createdAt.getTime() - b.createdAt.getTime();
    if (timeDifference !== 0) return timeDifference;

    return getMessageRank(a, config) - getMessageRank(b, config);
  });
}

/**
 * Converts a UIMessage to a simplified message format for storage
 */
// Helper functions for v5 message conversion
export function convertToUIMessages(messages: ModelMessage[]): UIMessage[] {
  return messages.map(message => ({
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  }));
}

export function convertToModelMessages(messages: UIMessage[]): ModelMessage[] {
  return messages.map((message): ModelMessage => {
    // Extract only the ModelMessage properties (role and content)
    // UIMessage has additional properties like id, createdAt, parts that ModelMessage doesn't have
    const { role, content } = message;
    return { role, content } as ModelMessage;
  });
}

export function convertUIMessageToStorageFormat(
  message: UIMessage,
  chatId: string,
  config: MessageTransformationConfig = {},
): {
  id: string;
  chatId: string;
  parts: MessageContentPart[];
  role: string;
  attachments: unknown[];
  createdAt: Date;
} | null {
  if (message.role === 'user') {
    // Convert message content to parts array for storage
    let parts: MessageContentPart[] = [];

    if (typeof message.content === 'string') {
      parts = [{ type: 'text', text: message.content }];
    } else if (Array.isArray(message.content)) {
      // Content is already an array of parts (multimodal content)
      parts = message.content.map(part => {
        const basePart: MessageContentPart = {
          type: part.type || 'text',
          content: part,
        };

        // Add type-specific properties based on part type
        if ('text' in part && part.text) {
          basePart.text = part.text;
        }
        if ('image' in part && part.image) {
          basePart.image = part.image;
        }

        return basePart;
      });
    }

    return {
      id: message.id,
      chatId,
      parts,
      role: message.role,
      createdAt: message.createdAt ?? new Date(),
      attachments: [],
    };
  }

  if (message.role === 'assistant') {
    // Convert assistant content to parts array
    let parts: MessageContentPart[] = [];

    if (typeof message.content === 'string') {
      parts = [{ type: 'text', text: message.content }];
    } else if (Array.isArray(message.content)) {
      parts = message.content.map(part => {
        const basePart: MessageContentPart = {
          type: part.type || 'text',
          content: part,
        };

        // Add type-specific properties based on part type
        if ('text' in part && part.text) {
          basePart.text = part.text;
        }
        if ('reasoning' in part && typeof part.reasoningText === 'string') {
          basePart.reasoningText = part.reasoningText;
        }

        return basePart;
      });
    }

    const cleanParts = processMessageParts(parts, config);

    return {
      id: message.id,
      chatId,
      parts: cleanParts,
      role: message.role,
      createdAt: message.createdAt ?? new Date(),
      attachments: [],
    };
  }

  return null;
}
