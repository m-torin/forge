/**
 * Tests for Next.js message transformations
 * Testing message processing and transformation utilities
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  convertToModelMessages,
  convertToUIMessages,
  convertUIMessageToStorageFormat,
  dedupeParts,
  getMessageRank,
  groupMessagesIntoSections,
  processMessageParts,
  sanitizeParts,
  sortMessagesByPriority,
  transformConversationSection,
  type MessageContentPart,
  type MessageRankingConfig,
} from '../../../src/server/core/next/message-transformations';

// Mock appendResponseMessages from AI SDK
vi.mock('ai', () => ({
  appendResponseMessages: vi.fn(({ messages, responseMessages, _internal }) => {
    // Simple mock that combines messages
    return [...messages, ...responseMessages];
  }),
}));

describe('next.js Message Transformations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMessageRank', () => {
    test('should rank tool call messages highest', () => {
      const message = {
        role: 'assistant',
        content: [{ type: 'tool-call', content: 'search' }],
      };

      expect(getMessageRank(message)).toBe(0);
    });

    test('should rank tool result messages second', () => {
      const message = {
        role: 'tool',
        content: [{ type: 'tool-result', content: 'result' }],
      };

      expect(getMessageRank(message)).toBe(1);
    });

    test('should rank assistant messages third', () => {
      const message = {
        role: 'assistant',
        content: [{ type: 'text', content: 'Hello' }],
      };

      expect(getMessageRank(message)).toBe(2);
    });

    test('should rank other messages lowest', () => {
      const message = {
        role: 'user',
        content: [{ type: 'text', content: 'Hi' }],
      };

      expect(getMessageRank(message)).toBe(3);
    });

    test('should use custom ranking config', () => {
      const config: MessageRankingConfig = {
        toolCallRank: 10,
        toolResultRank: 20,
        assistantRank: 30,
        defaultRank: 40,
      };

      const toolCallMessage = {
        role: 'assistant',
        content: [{ type: 'tool-call', content: 'search' }],
      };

      expect(getMessageRank(toolCallMessage, config)).toBe(10);
    });
  });

  describe('dedupeParts', () => {
    test('should remove duplicate parts', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'Hello' },
        { type: 'text', content: 'Hello' },
        { type: 'text', content: 'World' },
      ];

      const result = dedupeParts(parts);

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual({ type: 'text', content: 'Hello' });
      expect(result[1]).toStrictEqual({ type: 'text', content: 'World' });
    });

    test('should preserve order of first occurrence', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'A' },
        { type: 'text', content: 'B' },
        { type: 'text', content: 'A' },
        { type: 'text', content: 'C' },
      ];

      const result = dedupeParts(parts);

      expect(result).toStrictEqual([
        { type: 'text', content: 'A' },
        { type: 'text', content: 'B' },
        { type: 'text', content: 'C' },
      ]);
    });

    test('should consider type and content for uniqueness', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'same' },
        { type: 'tool-call', content: 'same' },
        { type: 'text', content: 'same' },
      ];

      const result = dedupeParts(parts);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('text');
      expect(result[1].type).toBe('tool-call');
    });
  });

  describe('sanitizeParts', () => {
    test('should remove reasoning parts with undefined content', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'Keep this' },
        { type: 'reasoning', reasoningText: 'undefined' },
        { type: 'reasoning', reasoningText: 'Valid reasoning' },
        { type: 'reasoning', reasoningText: 'undefined' },
      ];

      const result = sanitizeParts(parts);

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual({ type: 'text', content: 'Keep this' });
      expect(result[1]).toStrictEqual({ type: 'reasoning', reasoningText: 'Valid reasoning' });
    });

    test('should keep all parts if none match filter criteria', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'Text' },
        { type: 'tool-call', content: 'search' },
        { type: 'tool-result', content: 'result' },
      ];

      const result = sanitizeParts(parts);

      expect(result).toStrictEqual(parts);
    });
  });

  describe('groupMessagesIntoSections', () => {
    test('should group messages by user message boundaries', () => {
      const messages = [
        { id: '1', role: 'user', content: 'First question' },
        { id: '2', role: 'assistant', content: 'First answer' },
        { id: '3', role: 'user', content: 'Second question' },
        { id: '4', role: 'assistant', content: 'Second answer' },
        { id: '5', role: 'tool', content: 'Tool result' },
      ];

      const sections = groupMessagesIntoSections(messages);

      expect(sections).toHaveLength(2);
      expect(sections[0]).toHaveLength(2);
      expect(sections[0][0].id).toBe('1');
      expect(sections[0][1].id).toBe('2');
      expect(sections[1]).toHaveLength(3);
      expect(sections[1][0].id).toBe('3');
      expect(sections[1][1].id).toBe('4');
      expect(sections[1][2].id).toBe('5');
    });

    test('should handle conversation starting with non-user message', () => {
      const messages = [
        { id: '1', role: 'assistant', content: 'Welcome!' },
        { id: '2', role: 'user', content: 'Hi' },
        { id: '3', role: 'assistant', content: 'Hello' },
      ];

      const sections = groupMessagesIntoSections(messages);

      expect(sections).toHaveLength(2);
      expect(sections[0]).toHaveLength(1);
      expect(sections[0][0].id).toBe('1');
      expect(sections[1]).toHaveLength(2);
    });

    test('should handle empty messages array', () => {
      const sections = groupMessagesIntoSections([]);
      expect(sections).toHaveLength(0);
    });
  });

  describe('transformConversationSection', () => {
    test('should transform a conversation section', () => {
      const section = [
        { id: '1', role: 'user', content: 'Question', createdAt: new Date('2024-01-01') },
        { id: '2', role: 'assistant', content: 'Answer', createdAt: new Date('2024-01-02') },
        { id: '3', role: 'assistant', content: 'Follow-up', createdAt: new Date('2024-01-03') },
      ];

      const result = transformConversationSection(section);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    test('should filter out non-assistant messages from responseMessages', async () => {
      const { appendResponseMessages } = vi.mocked(await import('ai'));

      const section = [
        { id: '1', role: 'user', content: 'Question' },
        { id: '2', role: 'assistant', content: 'Answer' },
        { id: '3', role: 'tool', content: 'Tool result' },
        { id: '4', role: 'assistant', content: 'Final answer' },
      ];

      transformConversationSection(section);

      expect(appendResponseMessages).toHaveBeenCalledWith({
        messages: [section[0]],
        responseMessages: [section[1], section[3]], // Only assistant messages
        _internal: expect.any(Object),
      });
    });

    test('should use custom date function', () => {
      const customDate = new Date('2024-06-01');
      const currentDate = vi.fn(() => customDate);

      const section = [
        { id: '1', role: 'user', content: 'Question' },
        { id: '2', role: 'assistant', content: 'Answer' },
      ];

      transformConversationSection(section, { currentDate });

      expect(currentDate).toHaveBeenCalledWith();
    });
  });

  describe('processMessageParts', () => {
    test('should sanitize and dedupe by default', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'Hello' },
        { type: 'text', content: 'Hello' },
        { type: 'reasoning', reasoningText: 'undefined' },
        { type: 'text', content: 'World' },
      ];

      const result = processMessageParts(parts);

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual({ type: 'text', content: 'Hello' });
      expect(result[1]).toStrictEqual({ type: 'text', content: 'World' });
    });

    test('should handle undefined parts', () => {
      const result = processMessageParts(undefined);
      expect(result).toStrictEqual([]);
    });

    test('should skip sanitization when disabled', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'Hello' },
        { type: 'reasoning', reasoningText: 'undefined' },
      ];

      const result = processMessageParts(parts, { enableSanitization: false });

      expect(result).toHaveLength(2);
    });

    test('should skip deduplication when disabled', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', content: 'Hello' },
        { type: 'text', content: 'Hello' },
      ];

      const result = processMessageParts(parts, { enableDeduplication: false });

      expect(result).toHaveLength(2);
    });
  });

  describe('sortMessagesByPriority', () => {
    test('should sort by creation time first', () => {
      const messages = [
        {
          id: '2',
          createdAt: new Date('2024-01-02'),
          role: 'assistant',
          content: [{ type: 'text', content: 'Second' }],
        },
        {
          id: '1',
          createdAt: new Date('2024-01-01'),
          role: 'user',
          content: [{ type: 'text', content: 'First' }],
        },
        {
          id: '3',
          createdAt: new Date('2024-01-03'),
          role: 'assistant',
          content: [{ type: 'tool-call', content: 'Third' }],
        },
      ];

      const sorted = sortMessagesByPriority(messages);

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });

    test('should sort by rank when times are equal', () => {
      const sameTime = new Date('2024-01-01');
      const messages = [
        {
          id: '1',
          createdAt: sameTime,
          role: 'assistant',
          content: [{ type: 'text', content: 'Regular assistant' }],
        },
        {
          id: '2',
          createdAt: sameTime,
          role: 'assistant',
          content: [{ type: 'tool-call', content: 'Tool call' }],
        },
        {
          id: '3',
          createdAt: sameTime,
          role: 'tool',
          content: [{ type: 'tool-result', content: 'Tool result' }],
        },
      ];

      const sorted = sortMessagesByPriority(messages);

      expect(sorted[0].id).toBe('2'); // Tool call (rank 0)
      expect(sorted[1].id).toBe('3'); // Tool result (rank 1)
      expect(sorted[2].id).toBe('1'); // Regular assistant (rank 2)
    });
  });

  describe('convertUIMessageToStorageFormat', () => {
    test('should convert user message', () => {
      const message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello world',
        createdAt: new Date('2024-01-01'),
      };

      const result = convertUIMessageToStorageFormat(message, 'chat-1');

      expect(result).toStrictEqual({
        id: 'msg-1',
        chatId: 'chat-1',
        parts: [{ type: 'text', text: 'Hello world' }],
        role: 'user',
        createdAt: new Date('2024-01-01'),
        attachments: [],
      });
    });

    test('should convert assistant message with parts', () => {
      const message = {
        id: 'msg-2',
        role: 'assistant',
        parts: [
          { type: 'text', content: 'Response' },
          { type: 'tool-call', content: 'search' },
        ],
        createdAt: new Date('2024-01-02'),
      };

      const result = convertUIMessageToStorageFormat(message, 'chat-1');

      expect(result).toStrictEqual({
        id: 'msg-2',
        chatId: 'chat-1',
        parts: [
          { type: 'text', content: 'Response' },
          { type: 'tool-call', content: 'search' },
        ],
        role: 'assistant',
        createdAt: new Date('2024-01-02'),
        attachments: [],
      });
    });

    test('should process assistant message parts', () => {
      const message = {
        id: 'msg-3',
        role: 'assistant',
        parts: [
          { type: 'text', content: 'Hello' },
          { type: 'text', content: 'Hello' }, // Duplicate
          { type: 'reasoning', reasoningText: 'undefined' }, // Should be filtered
        ],
      };

      const result = convertUIMessageToStorageFormat(message, 'chat-1');

      expect(result?.parts).toHaveLength(1);
      expect(result?.parts[0]).toStrictEqual({ type: 'text', content: 'Hello' });
    });

    test('should return null for unsupported roles', () => {
      const message = {
        id: 'msg-4',
        role: 'system',
        content: 'System message',
      };

      const result = convertUIMessageToStorageFormat(message, 'chat-1');

      expect(result).toBeNull();
    });

    test('should use current date if createdAt is missing', () => {
      const beforeTime = new Date();

      const message = {
        id: 'msg-5',
        role: 'user',
        content: 'No date',
      };

      const result = convertUIMessageToStorageFormat(message, 'chat-1');

      const afterTime = new Date();

      expect(result?.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result?.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('convertToUIMessages', () => {
    test('should convert ModelMessage array to UIMessage array', () => {
      const modelMessages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: [{ type: 'text', text: 'How are you?' }] },
      ];

      const result = convertToUIMessages(modelMessages as any);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        role: 'user',
        content: 'Hello',
        id: expect.stringMatching(/^msg-\d+-[a-z0-9]+$/),
        createdAt: expect.any(Date),
      });
      expect(result[1]).toMatchObject({
        role: 'assistant',
        content: 'Hi there!',
        id: expect.stringMatching(/^msg-\d+-[a-z0-9]+$/),
        createdAt: expect.any(Date),
      });
      expect(result[2]).toMatchObject({
        role: 'user',
        content: [{ type: 'text', text: 'How are you?' }],
        id: expect.stringMatching(/^msg-\d+-[a-z0-9]+$/),
        createdAt: expect.any(Date),
      });
    });

    test('should generate unique IDs for each message', () => {
      const modelMessages = [
        { role: 'user', content: 'Message 1' },
        { role: 'user', content: 'Message 2' },
      ];

      const result = convertToUIMessages(modelMessages as any);

      expect(result[0].id).not.toBe(result[1].id);
    });

    test('should handle empty array', () => {
      const result = convertToUIMessages([]);
      expect(result).toEqual([]);
    });
  });

  describe('convertToModelMessages', () => {
    test('should convert UIMessage array to ModelMessage array', () => {
      const uiMessages = [
        {
          id: 'ui-1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date(),
        },
        {
          id: 'ui-2',
          role: 'assistant',
          content: [{ type: 'text', text: 'Hi there!' }],
          createdAt: new Date(),
          parts: [{ type: 'text', text: 'Hi there!' }],
        },
      ];

      const result = convertToModelMessages(uiMessages as any);

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual({
        role: 'user',
        content: 'Hello',
      });
      expect(result[1]).toStrictEqual({
        role: 'assistant',
        content: [{ type: 'text', text: 'Hi there!' }],
      });

      // Should not include UIMessage-specific properties
      expect(result[0]).not.toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('createdAt');
      expect(result[1]).not.toHaveProperty('parts');
    });

    test('should handle empty array', () => {
      const result = convertToModelMessages([]);
      expect(result).toEqual([]);
    });

    test('should preserve content types', () => {
      const uiMessages = [
        {
          id: 'ui-1',
          role: 'user',
          content: 'String content',
          createdAt: new Date(),
        },
        {
          id: 'ui-2',
          role: 'assistant',
          content: [
            { type: 'text', text: 'Array content' },
            { type: 'tool-call', toolName: 'search', args: { query: 'test' } },
          ],
          createdAt: new Date(),
        },
      ];

      const result = convertToModelMessages(uiMessages as any);

      expect(typeof result[0].content).toBe('string');
      expect(Array.isArray(result[1].content)).toBeTruthy();
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle messages with string content in getMessageRank', () => {
      const message = {
        role: 'assistant',
        content: 'Simple string content',
      };

      const rank = getMessageRank(message);

      expect(rank).toBe(2); // Assistant rank
    });

    test('should handle mixed content types in processMessageParts', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', text: 'Text part', content: 'fallback' },
        { type: 'image', image: 'base64data', content: 'image-content' },
        { type: 'tool-call', content: { toolName: 'search' } },
      ];

      const result = processMessageParts(parts);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('text');
      expect(result[1]).toHaveProperty('image');
      expect(result[2]).toHaveProperty('content');
    });

    test('should handle convertUIMessageToStorageFormat with array content for user', () => {
      const message = {
        id: 'msg-multimodal',
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image', image: 'base64data' },
        ],
        createdAt: new Date(),
      };

      const result = convertUIMessageToStorageFormat(message as any, 'chat-1');

      expect(result?.parts).toHaveLength(2);
      expect(result?.parts[0]).toMatchObject({
        type: 'text',
        text: 'Hello',
      });
      expect(result?.parts[1]).toMatchObject({
        type: 'image',
        image: 'base64data',
      });
    });

    test('should handle convertUIMessageToStorageFormat with array content for assistant', () => {
      const message = {
        id: 'msg-assistant-multimodal',
        role: 'assistant',
        content: [
          { type: 'text', text: 'Here is the answer' },
          { type: 'reasoning', reasoningText: 'Let me think...' },
        ],
        createdAt: new Date(),
      };

      const result = convertUIMessageToStorageFormat(message as any, 'chat-1');

      expect(result?.parts).toHaveLength(2);
      expect(result?.parts[0]).toMatchObject({
        type: 'text',
        text: 'Here is the answer',
      });
      expect(result?.parts[1]).toMatchObject({
        type: 'reasoning',
        reasoningText: 'Let me think...',
      });
    });
  });
});
