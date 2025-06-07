import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientAIManager } from '../../client/manager';

import type { CompletionOptions, StreamOptions } from '../../shared/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ClientAIManager', () => {
  let clientManager: ClientAIManager;
  const baseUrl = 'https://api.example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    clientManager = new ClientAIManager({ baseUrl });
  });

  describe('constructor', () => {
    it('should initialize with default baseUrl when not provided', () => {
      const manager = new ClientAIManager();
      expect(manager).toBeInstanceOf(ClientAIManager);
    });

    it('should initialize with provided baseUrl', () => {
      const manager = new ClientAIManager({ baseUrl });
      expect(manager).toBeInstanceOf(ClientAIManager);
    });

    it('should initialize with config options', () => {
      const config = {
        baseUrl,
        maxRetries: 3,
        timeout: 5000,
      };
      const manager = new ClientAIManager(config);
      expect(manager).toBeInstanceOf(ClientAIManager);
    });
  });

  describe('complete', () => {
    const mockOptions: CompletionOptions = {
      model: 'gpt-3.5-turbo',
      prompt: 'Test prompt',
      temperature: 0.7,
    };

    it('should make successful completion request', async () => {
      const mockResponse = {
        id: 'completion-123',
        choices: [{ index: 0, text: 'Generated text' }],
        usage: { total_tokens: 100 },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await clientManager.complete(mockOptions);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/ai/complete`, {
        body: JSON.stringify(mockOptions),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(clientManager.complete(mockOptions)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(clientManager.complete(mockOptions)).rejects.toThrow('Network error');
    });

    it('should send correct headers and body', async () => {
      const mockResponse = { id: 'completion-123' };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      await clientManager.complete(mockOptions);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/complete'),
        expect.objectContaining({
          body: JSON.stringify(mockOptions),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          method: 'POST',
        }),
      );
    });
  });

  describe('stream', () => {
    const mockOptions: StreamOptions = {
      model: 'gpt-3.5-turbo',
      prompt: 'Test streaming prompt',
    };

    it('should handle successful streaming response', async () => {
      const mockChunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: [DONE]\n\n',
      ];

      const mockResponse = {
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockChunks[0]),
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockChunks[1]),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            releaseLock: vi.fn(),
          }),
        },
        ok: true,
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const chunks = [];
      for await (const chunk of clientManager.stream(mockOptions)) {
        chunks.push(chunk);
      }

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/ai/stream`, {
        body: JSON.stringify(mockOptions),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    });

    it('should handle streaming HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const generator = clientManager.stream(mockOptions);
      await expect(generator.next()).rejects.toThrow('HTTP error! status: 400');
    });

    it('should handle streaming network errors', async () => {
      const networkError = new Error('Streaming network error');
      mockFetch.mockRejectedValueOnce(networkError);

      const generator = clientManager.stream(mockOptions);
      await expect(generator.next()).rejects.toThrow('Streaming network error');
    });
  });

  describe('classify', () => {
    const mockText = 'This is a test message';

    it('should make successful classification request', async () => {
      const mockResponse = {
        confidence: 0.95,
        categories: ['sentiment'],
        classification: 'positive',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await clientManager.classify(mockText);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/ai/classify`, {
        body: JSON.stringify({ text: mockText }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle classification errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
      });

      await expect(clientManager.classify(mockText)).rejects.toThrow('HTTP error! status: 422');
    });
  });

  describe('extractEntities', () => {
    const mockText = 'John Doe works at Acme Corp in New York';

    it('should make successful entity extraction request', async () => {
      const mockResponse = {
        entities: [
          { confidence: 0.99, type: 'person', text: 'John Doe' },
          { confidence: 0.95, type: 'organization', text: 'Acme Corp' },
          { confidence: 0.92, type: 'location', text: 'New York' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await clientManager.extractEntities(mockText);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/ai/extract`, {
        body: JSON.stringify({ text: mockText }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('analyzeSentiment', () => {
    const mockText = 'I love this product!';

    it('should make successful sentiment analysis request', async () => {
      const mockResponse = {
        confidence: 0.98,
        score: 0.85,
        sentiment: 'positive',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await clientManager.analyzeSentiment(mockText);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/ai/sentiment`, {
        body: JSON.stringify({ text: mockText }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('moderate', () => {
    const mockText = 'This is a test message for moderation';

    it('should make successful moderation request', async () => {
      const mockResponse = {
        categories: {
          harassment: false,
          hate: false,
          violence: false,
        },
        flagged: false,
        scores: {
          harassment: 0.02,
          hate: 0.01,
          violence: 0.01,
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await clientManager.moderate(mockText);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/ai/moderate`, {
        body: JSON.stringify({ content: mockText }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle moderation with flagged content', async () => {
      const mockResponse = {
        confidence: 0.95,
        explanation: 'Content contains hate speech',
        safe: false,
        violations: ['hate', 'harassment'],
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await clientManager.moderate(mockText);

      expect(result.safe).toBe(false);
      expect(result.violations).toContain('hate');
      expect(result.confidence).toBe(0.95);
    });
  });
});
