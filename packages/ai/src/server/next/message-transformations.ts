import { appendResponseMessages, type UIMessage } from 'ai';

export interface MessageContentPart {
  type: string;
  content?: unknown;
  reasoning?: string;
  [key: string]: any;
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
  message: { role: string; content: MessageContentPart[] },
  config: MessageRankingConfig = {},
): number {
  const { toolCallRank = 0, toolResultRank = 1, assistantRank = 2, defaultRank = 3 } = config;

  if (message.role === 'assistant' && message.content?.some(part => part.type === 'tool-call')) {
    return toolCallRank;
  }

  if (message.role === 'tool' && message.content?.some(part => part.type === 'tool-result')) {
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
  return parts.filter(part => !(part.type === 'reasoning' && part.reasoning === 'undefined'));
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
 * Transforms a conversation section using appendResponseMessages
 */
export function transformConversationSection(
  section: UIMessage[],
  config: { currentDate?: () => Date } = {},
): UIMessage[] {
  const [userMessage, ...assistantMessages] = section;
  const [firstAssistantMessage] = assistantMessages;

  // Filter to only assistant messages for responseMessages
  const responseMessages = assistantMessages.filter(
    (msg): msg is UIMessage & { role: 'assistant' } => msg.role === 'assistant',
  );

  // Use type assertion for appendResponseMessages due to AI SDK type constraints
  const result = appendResponseMessages({
    messages: [userMessage] as any,
    responseMessages: responseMessages as any,
    _internal: {
      currentDate: config.currentDate || (() => firstAssistantMessage?.createdAt ?? new Date()),
    },
  });

  return result as UIMessage[];
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
  T extends { createdAt: Date; role: string; content: MessageContentPart[] },
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
export function convertUIMessageToStorageFormat(
  message: UIMessage,
  chatId: string,
  config: MessageTransformationConfig = {},
): {
  id: string;
  chatId: string;
  parts: MessageContentPart[];
  role: string;
  attachments: any[];
  createdAt: Date;
} | null {
  if (message.role === 'user') {
    return {
      id: message.id,
      chatId,
      parts: [{ type: 'text', text: message.content }],
      role: message.role,
      createdAt: message.createdAt ?? new Date(),
      attachments: [],
    };
  }

  if (message.role === 'assistant') {
    const cleanParts = processMessageParts(message.parts, config);

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
