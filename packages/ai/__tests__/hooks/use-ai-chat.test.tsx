/// <vitest-environment jsdom />
import { act, renderHook } from '@testing-library/react';
import * as aiReact from 'ai/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAIChat } from '@/hooks/use-ai-chat';

// ai/react is already mocked by centralized mocks in @repo/qa
// The mock provides useChat, useCompletion, and useAssistant hooks

describe.todo('useAIChat', () => {
  const mockUseChat = vi.mocked(aiReact.useChat);
  let mockChat: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChat = {
      messages: [],
      input: '',
      setInput: vi.fn(),
      setMessages: vi.fn(),
      append: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn(),
      stop: vi.fn(),
      isLoading: false,
      error: null,
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
      const initialMessages = [{ id: '1', role: 'user' as const, content: 'Hello' }];

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

  describe('error handling', () => {
    test('should handle rate limiting errors', () => {
      const onRateLimit = vi.fn();
      const onError = vi.fn();

      let errorHandler: any;
      mockUseChat.mockImplementation(options => {
        errorHandler = options.onError;
        return mockChat;
      });

      renderHook(() => useAIChat({ onRateLimit, onError }));

      const rateLimitError = new Error('Rate limited, retry after 60 seconds');
      act(() => {
        errorHandler(rateLimitError);
      });

      expect(onRateLimit).toHaveBeenCalledWith(60);
      expect(onError).toHaveBeenCalledWith(rateLimitError);
    });

    test('should extract retry time from error message', () => {
      const onRateLimit = vi.fn();

      let errorHandler: any;
      mockUseChat.mockImplementation(options => {
        errorHandler = options.onError;
        return mockChat;
      });

      renderHook(() => useAIChat({ onRateLimit }));

      const rateLimitError = new Error('429 - retry after 120');
      act(() => {
        errorHandler(rateLimitError);
      });

      expect(onRateLimit).toHaveBeenCalledWith(120);
    });

    test('should use default retry time when not specified', () => {
      const onRateLimit = vi.fn();

      let errorHandler: any;
      mockUseChat.mockImplementation(options => {
        errorHandler = options.onError;
        return mockChat;
      });

      renderHook(() => useAIChat({ onRateLimit }));

      const rateLimitError = new Error('429 error');
      act(() => {
        errorHandler(rateLimitError);
      });

      expect(onRateLimit).toHaveBeenCalledWith(60);
    });
  });

  describe('token usage tracking', () => {
    test('should extract token usage from finish callback', () => {
      const onTokenUsage = vi.fn();

      let finishHandler: any;
      mockUseChat.mockImplementation(options => {
        finishHandler = options.onFinish;
        return mockChat;
      });

      renderHook(() => useAIChat({ onTokenUsage }));

      const message = { id: '1', role: 'assistant' as const, content: 'Response' };
      const options = {
        usage: {
          completionTokens: 50,
          promptTokens: 30,
          totalTokens: 80,
        },
      };

      act(() => {
        finishHandler(message, options);
      });

      expect(onTokenUsage).toHaveBeenCalledWith({
        completion: 50,
        prompt: 30,
        total: 80,
      });
    });

    test('should handle missing usage data gracefully', () => {
      const onTokenUsage = vi.fn();

      let finishHandler: any;
      mockUseChat.mockImplementation(options => {
        finishHandler = options.onFinish;
        return mockChat;
      });

      renderHook(() => useAIChat({ onTokenUsage }));

      const message = { id: '1', role: 'assistant' as const, content: 'Response' };

      act(() => {
        finishHandler(message, {});
      });

      expect(onTokenUsage).not.toHaveBeenCalled();
    });
  });

  describe('appendWithRetry', () => {
    test('should append message successfully', async () => {
      const { result } = renderHook(() => useAIChat());

      const message = { role: 'user' as const, content: 'Hello' };

      await act(async () => {
        await result.current.appendWithRetry(message);
      });

      expect(mockChat.append).toHaveBeenCalledWith(message);
    });

    test('should retry on rate limit errors', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAIChat());

      const message = { role: 'user' as const, content: 'Hello' };

      mockChat.append
        .mockRejectedValueOnce(new Error('429 - retry after 5'))
        .mockResolvedValueOnce(undefined);

      const promise = act(async () => {
        await result.current.appendWithRetry(message);
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

      const message = { role: 'user' as const, content: 'Hello' };
      const error = new Error('429 - retry after 1');

      mockChat.append.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.appendWithRetry(message, 2);
        }),
      ).rejects.toThrow('429 - retry after 1');

      expect(mockChat.append).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    test('should not retry non-rate-limit errors', async () => {
      const { result } = renderHook(() => useAIChat());

      const message = { role: 'user' as const, content: 'Hello' };
      const error = new Error('Network error');

      mockChat.append.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.appendWithRetry(message);
        }),
      ).rejects.toThrow('Network error');

      expect(mockChat.append).toHaveBeenCalledTimes(1); // No retry
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

  describe('regenerate', () => {
    test('should regenerate last assistant response', () => {
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
      expect(mockChat.append).toHaveBeenCalledWith(
        messages[2], // Last user message
      );
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
  });

  describe('return values', () => {
    test('should return all chat properties and additional methods', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current).toStrictEqual(
        expect.objectContaining({
          ...mockChat,
          appendWithRetry: expect.any(Function),
          clear: expect.any(Function),
          regenerate: expect.any(Function),
        }),
      );
    });
  });
});
