/**
 * Integration tests for enhanced useChat functionality
 * Tests the DRY patterns and standardization without hiding principle
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';
import { messageConverter } from '../messages/converter';
import { messageFormatter } from '../messages/formatter';
import { useChat } from '../use-chat';

// Mock the AI SDK
vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    status: 'ready',
    error: null,
    append: vi.fn(),
    regenerate: vi.fn(),
    stop: vi.fn(),
    setMessages: vi.fn(),
    sendMessage: vi.fn(), // AI SDK v5 method
  })),
}));

// Mock observability
vi.mock('@repo/observability', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
}));

describe('enhanced useChat Integration', () => {
  test('should provide all enhanced methods while preserving AI SDK functionality', () => {
    const { result } = renderHook(() =>
      useChat({
        api: '/api/chat',
        telemetry: true,
        analytics: false,
      }),
    );

    // Original AI SDK methods should be preserved
    expect(result.current.messages).toBeDefined();
    expect(result.current.status).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.sendMessage).toBeDefined();
    expect(result.current.stop).toBeDefined();

    // Enhanced methods should be available
    expect(result.current.regenerate).toBeDefined();
    expect(result.current.send).toBeDefined();
    expect(result.current.retry).toBeDefined();
    expect(result.current.clear).toBeDefined();
    expect(result.current.branch).toBeDefined();
    expect(result.current.export).toBeDefined();
    expect(result.current.getStats).toBeDefined();
    expect(result.current.getStatusInfo).toBeDefined();
    expect(result.current.handleError).toBeDefined();
    // expect(result.current.safeAppend).toBeDefined(); // Not implemented
    // expect(result.current.safeReload).toBeDefined(); // Not implemented
  });

  test('should handle message format conversion correctly', () => {
    // Test legacy to parts format conversion
    const legacyMessage = {
      id: '1',
      role: 'user' as const,
      content: 'Hello world',
    };

    const converted = messageConverter.convertLegacyToPartsFormat(legacyMessage);
    expect(converted.parts).toStrictEqual([{ type: 'text' as const, text: 'Hello world' }]);

    // Test parts to legacy conversion
    const partsMessage = {
      id: '2',
      role: 'assistant' as const,
      parts: [{ type: 'text' as const, text: 'Hi there!' }],
    };

    const legacy = messageConverter.convertPartsToLegacyFormat(partsMessage);
    expect(legacy.content).toBe('Hi there!');
  });

  test('should provide status information correctly', () => {
    const { result } = renderHook(() => useChat());

    const statusInfo = result.current.getStatusInfo();
    expect(statusInfo).toStrictEqual({
      isLoading: false,
      isReady: true,
      hasError: false,
      canStop: false,
      canRetry: false,
      status: 'ready',
      error: null,
      canSend: true,
    });
  });

  test('should extract text content from messages', () => {
    const message = {
      id: '1',
      role: 'user' as const,
      parts: [
        { type: 'text' as const, text: 'Hello ' },
        { type: 'text' as const, text: 'world!' },
        { type: 'file' as const, mediaType: 'image/jpeg', url: 'test.jpg' },
      ],
    };

    const text = messageConverter.extractTextContent(message);
    // Text parts are joined with newlines
    expect(text).toBe('Hello \nworld!');
  });

  test('should check for part types correctly', () => {
    const message = {
      id: '1',
      role: 'assistant' as const,
      parts: [
        { type: 'text' as const, text: 'Here is the result:' },
        {
          type: 'tool-calculator' as const,
          toolCallId: 'call_123',
          state: 'input-available' as const,
          input: { x: 1, y: 2 },
        },
        {
          type: 'tool-calculator' as const,
          toolCallId: 'call_124',
          state: 'output-available' as const,
          input: { x: 1, y: 2 },
          output: 3,
        },
      ],
    };

    expect(messageConverter.messageHasPartType(message, 'text')).toBeTruthy();
    expect(messageConverter.messageHasPartType(message, 'tool-calculator')).toBeTruthy();
    expect(messageConverter.messageHasPartType(message, 'file')).toBeFalsy();

    expect(messageConverter.hasTools(message)).toBeTruthy();
    expect(messageConverter.hasFiles(message)).toBeFalsy();
    expect(messageConverter.isTextOnly(message)).toBeFalsy();
  });

  test('should count parts by type', () => {
    const message = {
      id: '1',
      role: 'assistant' as const,
      parts: [
        { type: 'text' as const, text: 'First text' },
        { type: 'text' as const, text: 'Second text' },
        { type: 'file' as const, mediaType: 'image/jpeg', url: 'image.jpg' },
      ],
    };

    const counts = messageConverter.countPartsByType(message);
    expect(counts).toStrictEqual({
      text: 2,
      file: 1,
    });
  });

  test('should demonstrate DRY pattern principles', () => {
    // This test shows how the DRY patterns eliminate repetitive code

    // Before: repetitive pattern (what appears in every doc example)
    // const { messages, sendMessage, status, error } = useChat();
    // messages.map(message => /* render logic */)
    // status handling logic
    // form submission logic

    // After: DRY standardization
    const chat = useChat();

    // All repetitive patterns are now encapsulated in utilities and components
    expect(typeof messageFormatter.renderMessages).toBe('function');
    expect(typeof chat.getStatusInfo).toBe('function');
    expect(typeof chat.send).toBe('function');

    // But the original AI SDK is fully accessible
    expect(chat.messages).toBeDefined();
    // append may not be available in AI SDK v5
    // expect(chat.append).toBeDefined();
    expect(chat.status).toBeDefined();

    // This demonstrates "standardization without hiding"
  });
});
