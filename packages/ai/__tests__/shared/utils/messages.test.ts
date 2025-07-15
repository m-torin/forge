import {
  countMessagesByRole,
  filterMessagesByRole,
  getTrailingMessageId,
  isAssistantMessage,
  isSystemMessage,
  isToolMessage,
  isUserMessage,
  prepareMessagesForUI,
} from '#/shared/utils/messages';
import { describe, expect } from 'vitest';

describe('message Utilities', () => {
  const mockMessages = [
    { id: '1', role: 'user', content: 'Hello' },
    { id: '2', role: 'assistant', content: 'Hi there' },
    { id: '3', role: 'user', content: 'How are you?' },
    { id: '4', role: 'assistant', content: 'I am doing well' },
  ];

  describe('getTrailingMessageId', () => {
    test('should get the last message ID', () => {
      const result = getTrailingMessageId({ messages: mockMessages });
      expect(result).toBe('4');
    });

    test('should get the last message ID by role', () => {
      const result = getTrailingMessageId({
        messages: mockMessages,
        role: 'user',
      });
      expect(result).toBe('3');
    });

    test('should return undefined for empty messages', () => {
      const result = getTrailingMessageId({ messages: [] });
      expect(result).toBeUndefined();
    });

    test('should return undefined when no message matches role', () => {
      const result = getTrailingMessageId({
        messages: mockMessages,
        role: 'system' as any,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('filterMessagesByRole', () => {
    test('should filter messages by role', () => {
      const userMessages = filterMessagesByRole(mockMessages, 'user');
      expect(userMessages).toHaveLength(2);
      expect(userMessages.every(msg => msg.role === 'user')).toBeTruthy();
    });

    test('should return empty array when no matches', () => {
      const systemMessages = filterMessagesByRole(mockMessages, 'system');
      expect(systemMessages).toHaveLength(0);
    });
  });

  describe('countMessagesByRole', () => {
    test('should count messages by role', () => {
      const counts = countMessagesByRole(mockMessages);
      expect(counts).toStrictEqual({
        user: 2,
        assistant: 2,
      });
    });

    test('should handle empty messages', () => {
      const counts = countMessagesByRole([]);
      expect(counts).toStrictEqual({});
    });
  });

  describe('prepareMessagesForUI', () => {
    test('should prepare messages for UI display', () => {
      const coreMessages = [
        { role: 'user' as const, content: 'Hello', id: '1' },
        { role: 'assistant' as const, content: 'Hi', id: '2' },
      ];

      const uiMessages = prepareMessagesForUI(coreMessages);

      expect(uiMessages).toHaveLength(2);
      expect(uiMessages[0]).toStrictEqual({
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: undefined,
      });
    });

    test('should generate IDs when missing', () => {
      const coreMessages = [{ role: 'user' as const, content: 'Hello' }];

      const uiMessages = prepareMessagesForUI(coreMessages);

      expect(uiMessages[0].id).toBe('msg-0');
    });
  });

  describe('type Guards', () => {
    test('should identify assistant messages', () => {
      const assistantMsg = { role: 'assistant' as const, content: 'Hi' };
      const userMsg = { role: 'user' as const, content: 'Hello' };

      expect(isAssistantMessage(assistantMsg)).toBeTruthy();
      expect(isAssistantMessage(userMsg)).toBeFalsy();
    });

    test('should identify user messages', () => {
      const userMsg = { role: 'user' as const, content: 'Hello' };
      const assistantMsg = { role: 'assistant' as const, content: 'Hi' };

      expect(isUserMessage(userMsg)).toBeTruthy();
      expect(isUserMessage(assistantMsg)).toBeFalsy();
    });

    test('should identify system messages', () => {
      const systemMsg = { role: 'system' as const, content: 'System prompt' };
      const userMsg = { role: 'user' as const, content: 'Hello' };

      expect(isSystemMessage(systemMsg)).toBeTruthy();
      expect(isSystemMessage(userMsg)).toBeFalsy();
    });

    test('should identify tool messages', () => {
      const toolMsg = {
        role: 'tool' as const,
        content: [
          {
            type: 'tool-result' as const,
            text: 'Tool result',
            toolCallId: 'call-123',
            toolName: 'test-tool',
            result: 'success',
          },
        ],
        toolCallId: 'call-123',
      };
      const userMsg = { role: 'user' as const, content: 'Hello' };

      expect(isToolMessage(toolMsg)).toBeTruthy();
      expect(isToolMessage(userMsg)).toBeFalsy();
    });
  });
});
