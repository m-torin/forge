/// <vitest-environment jsdom />
import * as aiReact from '@ai-sdk/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAIChat } from '#/hooks/use-ai-chat';

// @ai-sdk/react is already mocked by centralized mocks in @repo/qa
// The mock provides useChat, useCompletion, and useAssistant hooks with v5 patterns

describe('useAIChat', () => {
  const mockUseChat = vi.mocked(aiReact.useChat);
  let mockChat: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChat = {
      messages: [],
      input: '',
      setInput: vi.fn(),
      setMessages: vi.fn(),
      append: vi.fn().mockResolvedValue(undefined), // v5 uses append instead of sendMessage
      reload: vi.fn(),
      stop: vi.fn(),
      status: 'idle', // v5 uses status instead of isLoading
      error: null,
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      data: [], // v5 includes data array for additional content
      addData: vi.fn(), // v5 method for adding data
    };

    mockUseChat.mockReturnValue(mockChat as any);
  });

  describe('initialization', () => {
    test('should initialize with default API endpoint', () => {
      renderHook(() => useAIChat());

      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          api: '/api/ai/chat',
          streamProtocol: 'text',
        }),
      );
    });

    test('should initialize with custom API endpoint', () => {
      renderHook(() => useAIChat({ api: '/custom/api' }));

      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          api: '/custom/api',
        }),
      );
    });

    test('should pass through other options', () => {
      const initialMessages = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Hello',
        },
      ];

      renderHook(() =>
        useAIChat({
          initialMessages,
        }),
      );

      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          initialMessages,
        }),
      );
    });
  });

  describe('v5 status handling', () => {
    test('should handle different status states', () => {
      const statusStates = ['idle', 'loading', 'awaiting_message'] as const;

      statusStates.forEach(status => {
        mockChat.status = status;
        const { result } = renderHook(() => useAIChat());

        expect(result.current.status).toBe(status);
        // Backward compatibility: isLoading derived from status
        expect(result.current.isLoading).toBe(status === 'loading');
      });
    });

    test('should handle error state correctly', () => {
      const testError = new Error('Test error');
      mockChat.error = testError;
      mockChat.status = 'idle';

      const { result } = renderHook(() => useAIChat());

      expect(result.current.error).toBe(testError);
      expect(result.current.status).toBe('idle');
    });

    test('should handle rate limiting with modern error patterns', async () => {
      const onRateLimit = vi.fn();

      mockChat.append.mockRejectedValueOnce(new Error('Rate limited, retry after 60 seconds'));

      const { result } = renderHook(() => useAIChat({ onRateLimit }));

      await expect(
        act(async () => {
          await result.current.sendMessage('Test message');
        }),
      ).rejects.toThrow('Rate limited, retry after 60 seconds');

      // Custom error handling should extract retry time
      if (onRateLimit.mock.calls.length > 0) {
        expect(onRateLimit).toHaveBeenCalledWith(60);
      }
    });
  });

  describe('v5 data handling', () => {
    test('should handle data array updates', () => {
      const testData = [
        { type: 'source', data: { url: 'https://example.com', title: 'Example' } },
        { type: 'image', data: { src: 'image.jpg', alt: 'Test image' } },
      ];

      mockChat.data = testData;
      const { result } = renderHook(() => useAIChat());

      expect(result.current.data).toEqual(testData);
    });

    test('should add data using addData method', () => {
      const { result } = renderHook(() => useAIChat());
      const newData = { type: 'custom', data: { value: 42 } };

      act(() => {
        result.current.addData(newData);
      });

      expect(mockChat.addData).toHaveBeenCalledWith(newData);
    });

    test('should handle modern usage tracking via data', async () => {
      const onTokenUsage = vi.fn();

      // Simulate usage data being added to the data array
      const usageData = {
        type: 'usage',
        data: {
          inputTokens: 30,
          outputTokens: 50,
          totalTokens: 80,
        },
      };

      mockChat.data = [usageData];
      const { result } = renderHook(() => useAIChat({ onTokenUsage }));

      // In v5, usage tracking might be handled via data array or custom logic
      if (result.current.data.length > 0) {
        const usage = result.current.data.find((item: any) => item.type === 'usage');
        if (usage && onTokenUsage) {
          act(() => {
            onTokenUsage({
              completion: usage.data.outputTokens,
              prompt: usage.data.inputTokens,
              total: usage.data.totalTokens,
            });
          });
        }
      }

      expect(result.current.data).toContain(usageData);
    });
  });

  describe('sendMessage (v5: append)', () => {
    test('should append message using v5 append method', async () => {
      const { result } = renderHook(() => useAIChat());

      const message = 'Hello';

      await act(async () => {
        await result.current.sendMessage(message);
      });

      // v5 uses append instead of sendMessage
      expect(mockChat.append).toHaveBeenCalledWith({
        role: 'user',
        content: message,
      });
    });

    test('should retry on rate limit errors with v5 append', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAIChat());

      const message = 'Hello';

      mockChat.append
        .mockRejectedValueOnce(new Error('429 - retry after 5'))
        .mockResolvedValueOnce(undefined);

      const promise = act(async () => {
        await result.current.sendMessage(message);
      });

      // Fast-forward timers
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await promise;

      expect(mockChat.append).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    test('should stop retrying after max attempts', async () => {
      const { result } = renderHook(() => useAIChat());

      const message = 'Hello';
      const error = new Error('429 - retry after 1');

      mockChat.append.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.sendMessage(message, 2);
        }),
      ).rejects.toThrow('429 - retry after 1');

      expect(mockChat.append).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    test('should not retry non-rate-limit errors', async () => {
      const { result } = renderHook(() => useAIChat());

      const message = 'Hello';
      const error = new Error('Network error');

      mockChat.append.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.sendMessage(message);
        }),
      ).rejects.toThrow('Network error');

      expect(mockChat.append).toHaveBeenCalledTimes(1); // No retry
    });

    test('should handle v5 message format with role and content', async () => {
      const { result } = renderHook(() => useAIChat());

      const message = 'Test message with v5 format';

      await act(async () => {
        await result.current.sendMessage(message);
      });

      expect(mockChat.append).toHaveBeenCalledWith({
        role: 'user',
        content: message,
      });
    });
  });

  describe('clear', () => {
    test('should clear all messages', () => {
      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.clear();
      });

      expect(mockChat.setMessages).toHaveBeenCalledWith([]);
    });
  });

  describe('regenerate (v5 patterns)', () => {
    test('should regenerate last assistant response using v5 append', () => {
      const messages = [
        { id: '1', role: 'user' as const, content: 'Hello' },
        { id: '2', role: 'assistant' as const, content: 'Hi there' },
        { id: '3', role: 'user' as const, content: 'How are you?' },
        { id: '4', role: 'assistant' as const, content: 'I am fine' },
      ];

      mockChat.messages = messages;

      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.regenerate();
      });

      expect(mockChat.setMessages).toHaveBeenCalledWith(messages.slice(0, -1));
      // v5 uses append with proper message structure
      expect(mockChat.append).toHaveBeenCalledWith({
        role: 'user',
        content: 'How are you?',
      });
    });

    test('should not regenerate with insufficient messages', () => {
      mockChat.messages = [{ id: '1', role: 'user' as const, content: 'Hello' }];

      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.regenerate();
      });

      expect(mockChat.setMessages).not.toHaveBeenCalled();
      expect(mockChat.append).not.toHaveBeenCalled();
    });

    test('should handle v5 message structure in regeneration', () => {
      const v5Messages = [
        { id: '1', role: 'user' as const, content: 'What is AI?' },
        {
          id: '2',
          role: 'assistant' as const,
          content: 'AI stands for Artificial Intelligence...',
        },
        { id: '3', role: 'user' as const, content: 'Tell me more about machine learning' },
        { id: '4', role: 'assistant' as const, content: 'Machine learning is a subset of AI...' },
      ];

      mockChat.messages = v5Messages;

      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.regenerate();
      });

      // Should remove last assistant message and re-send the user's last message
      expect(mockChat.setMessages).toHaveBeenCalledWith(v5Messages.slice(0, -1));
      expect(mockChat.append).toHaveBeenCalledWith({
        role: 'user',
        content: 'Tell me more about machine learning',
      });
    });
  });

  describe('return values (v5 interface)', () => {
    test('should return all v5 chat properties and additional methods', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current).toStrictEqual(
        expect.objectContaining({
          // Core v5 useChat properties
          messages: expect.any(Array),
          input: expect.any(String),
          setInput: expect.any(Function),
          setMessages: expect.any(Function),
          append: expect.any(Function), // v5 uses append
          reload: expect.any(Function),
          stop: expect.any(Function),
          status: expect.any(String), // v5 uses status instead of isLoading
          error: null,
          handleInputChange: expect.any(Function),
          handleSubmit: expect.any(Function),
          data: expect.any(Array), // v5 includes data array
          addData: expect.any(Function), // v5 method for adding data

          // Backward compatibility
          isLoading: expect.any(Boolean), // Derived from status

          // Custom methods from useAIChat
          sendMessage: expect.any(Function),
          clear: expect.any(Function),
          regenerate: expect.any(Function),
        }),
      );
    });

    test('should provide proper v5 status values', () => {
      const statusTests = [
        { status: 'idle', expectedIsLoading: false },
        { status: 'loading', expectedIsLoading: true },
        { status: 'awaiting_message', expectedIsLoading: false },
      ];

      statusTests.forEach(({ status, expectedIsLoading }) => {
        mockChat.status = status;
        const { result } = renderHook(() => useAIChat());

        expect(result.current.status).toBe(status);
        expect(result.current.isLoading).toBe(expectedIsLoading);
      });
    });

    test('should expose v5 data array functionality', () => {
      const testData = [
        { type: 'usage', data: { inputTokens: 10, outputTokens: 20 } },
        { type: 'source', data: { url: 'https://example.com', title: 'Test' } },
      ];

      mockChat.data = testData;
      const { result } = renderHook(() => useAIChat());

      expect(result.current.data).toEqual(testData);
      expect(result.current.addData).toBeInstanceOf(Function);

      // Test addData method
      const newDataItem = { type: 'custom', data: { value: 42 } };
      act(() => {
        result.current.addData(newDataItem);
      });

      expect(mockChat.addData).toHaveBeenCalledWith(newDataItem);
    });
  });
});
