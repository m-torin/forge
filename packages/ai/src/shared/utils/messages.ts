import type {
  CoreAssistantMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  ModelMessage,
} from 'ai';

/**
 * Helper to get the last message ID from a list of messages
 */
export function getTrailingMessageId(options: {
  messages: Array<{ id?: string; role: string }>;
  role?: 'user' | 'assistant' | 'system' | 'tool';
}): string | undefined {
  const { messages, role } = options;

  const filteredMessages = role ? messages.filter(msg => msg.role === role) : messages;

  const lastMessage = filteredMessages[filteredMessages.length - 1];
  return lastMessage?.id;
}

/**
 * Helper to filter messages by role
 */
export function filterMessagesByRole<T extends { role: string }>(messages: T[], role: string): T[] {
  return messages.filter(message => message.role === role);
}

/**
 * Helper to count messages by role
 */
export function countMessagesByRole(messages: Array<{ role: string }>): Record<string, number> {
  return messages.reduce(
    (acc, message) => {
      acc[message.role] = (acc[message.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Convert messages to a format suitable for UI display
 */
export function prepareMessagesForUI(messages: ModelMessage[]): Array<{
  id: string;
  role: string;
  content: string;
  timestamp?: Date;
}> {
  return messages.map((message, index) => ({
    id: 'id' in message && message.id ? String(message.id) : `msg-${index}`,
    role: message.role,
    content:
      typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
    timestamp: 'timestamp' in message ? (message.timestamp as Date) : undefined,
  }));
}

/**
 * Type guard for message roles
 */
export function isAssistantMessage(message: ModelMessage): message is CoreAssistantMessage {
  return message.role === 'assistant';
}

export function isUserMessage(message: ModelMessage): message is CoreUserMessage {
  return message.role === 'user';
}

export function isSystemMessage(message: ModelMessage): message is CoreSystemMessage {
  return message.role === 'system';
}

export function isToolMessage(message: ModelMessage): message is CoreToolMessage {
  return message.role === 'tool';
}
