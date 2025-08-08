/**
 * Tests for AI SDK route factories
 * Testing createChatRoute, createGenerateRoute, createObjectRoute, etc.
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createChatRoute,
  createGenerateRoute,
  createObjectRoute,
  createStreamRoute,
  createVectorChatRoute,
} from '#/server/core/routes/ai-sdk-routes';

// Mock AI SDK functions
vi.mock('ai', () => ({
  generateText: vi.fn(async options => ({
    text: 'Generated response',
    usage: { inputTokens: 10, outputTokens: 20 },
    finishReason: 'stop',
    response: { id: 'test-response' },
  })),
  streamText: vi.fn(async options => ({
    textStream: mockAsyncIterable(['Hello ', 'world!']),
    fullStream: mockAsyncIterable([
      { type: 'text-delta', textDelta: 'Hello ' },
      { type: 'text-delta', textDelta: 'world!' },
      { type: 'finish', finishReason: 'stop' },
    ]),
    text: 'Hello world!',
    usage: { inputTokens: 5, outputTokens: 10 },
    finishReason: 'stop',
  })),
  generateObject: vi.fn(async options => ({
    object: { key: 'value', generated: true },
    usage: { inputTokens: 15, outputTokens: 25 },
    finishReason: 'stop',
  })),
  streamObject: vi.fn(async options => ({
    objectStream: mockAsyncIterable([{ key: 'partial' }, { key: 'value', generated: true }]),
    object: { key: 'value', generated: true },
    usage: { inputTokens: 8, outputTokens: 12 },
  })),
  toUIMessageStream: vi.fn(stream => ({
    getReader: () => ({
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: { type: 'text', content: 'Hello' } })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
    }),
  })),
  toUIMessageStreamResponse: vi.fn(stream => new Response('mock-stream-response')),
}));

// Mock Next.js server functions
const mockNextRequest = (body: any = {}, method = 'POST') =>
  ({
    json: vi.fn().mockResolvedValue(body),
    method,
    headers: new Headers({ 'content-type': 'application/json' }),
    url: 'https://example.com/api/test',
  }) as unknown as NextRequest;

const mockNextResponse = {
  json: vi.fn((data: any, init?: any) => new Response(JSON.stringify(data), init)),
  error: vi.fn(
    (message: string, status = 500) => new Response(JSON.stringify({ error: message }), { status }),
  ),
};

// Mock model provider
const mockModel = {
  modelId: 'test-model',
  doGenerate: vi.fn(),
  doStream: vi.fn(),
};

// Mock provider registry
vi.mock('#/server/providers/registry', () => ({
  getModel: vi.fn(() => mockModel),
  getProvider: vi.fn(() => ({
    providerId: 'test-provider',
    languageModel: () => mockModel,
  })),
}));

// Helper to create mock async iterable
function mockAsyncIterable<T>(items: T[]): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const item of items) {
        yield item;
      }
    },
  };
}

describe('aI SDK Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChatRoute', () => {
    test('should create chat route that handles POST requests', async () => {
      const route = createChatRoute({
        model: mockModel,
        systemPrompt: 'You are a helpful assistant',
      });

      const request = mockNextRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await route(request);

      expect(response).toBeInstanceOf(Response);
      expect(vi.mocked(vi.importMock('ai')).generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: mockModel,
          messages: expect.arrayContaining([
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Hello' },
          ]),
        }),
      );
    });

    test('should handle streaming chat requests', async () => {
      const route = createChatRoute({
        model: mockModel,
        streaming: true,
      });

      const request = mockNextRequest({
        messages: [{ role: 'user', content: 'Stream this' }],
      });

      const response = await route(request);

      expect(response).toBeInstanceOf(Response);
      expect(vi.mocked(vi.importMock('ai')).streamText).toHaveBeenCalledWith();
    });

    test('should validate required messages', async () => {
      const route = createChatRoute({
        model: mockModel,
      });

      const request = mockNextRequest({
        // Missing messages
      });

      const response = await route(request);

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData).toMatchObject({
        error: expect.stringMatching(/messages.*required/i),
      });
    });

    test('should handle method not allowed', async () => {
      const route = createChatRoute({
        model: mockModel,
      });

      const request = mockNextRequest({}, 'GET');

      const response = await route(request);

      expect(response.status).toBe(405);
    });
  });

  describe('createGenerateRoute', () => {
    test('should create generate route for text generation', async () => {
      const route = createGenerateRoute({
        model: mockModel,
        maxTokens: 100,
      });

      const request = mockNextRequest({
        prompt: 'Generate text about AI',
      });

      const response = await route(request);

      expect(response).toBeInstanceOf(Response);
      expect(vi.mocked(vi.importMock('ai')).generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: mockModel,
          prompt: 'Generate text about AI',
          maxTokens: 100,
        }),
      );

      const responseData = await response.json();
      expect(responseData).toMatchObject({
        text: 'Generated response',
        usage: expect.any(Object),
        finishReason: 'stop',
      });
    });

    test('should support both prompt and messages', async () => {
      const route = createGenerateRoute({
        model: mockModel,
      });

      const requestWithMessages = mockNextRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      await route(requestWithMessages);

      expect(vi.mocked(vi.importMock('ai')).generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      );
    });

    test('should validate input parameters', async () => {
      const route = createGenerateRoute({
        model: mockModel,
      });

      const request = mockNextRequest({
        // Missing both prompt and messages
      });

      const response = await route(request);

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData).toMatchObject({
        error: expect.stringMatching(/prompt.*messages.*required/i),
      });
    });
  });

  describe('createObjectRoute', () => {
    test('should create object generation route', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const route = createObjectRoute({
        model: mockModel,
        schema,
      });

      const request = mockNextRequest({
        prompt: 'Generate a person object',
      });

      const response = await route(request);

      expect(response).toBeInstanceOf(Response);
      expect(vi.mocked(vi.importMock('ai')).generateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          model: mockModel,
          prompt: 'Generate a person object',
          schema,
        }),
      );

      const responseData = await response.json();
      expect(responseData).toMatchObject({
        object: { key: 'value', generated: true },
        usage: expect.any(Object),
      });
    });

    test('should support streaming object generation', async () => {
      const route = createObjectRoute({
        model: mockModel,
        schema: { type: 'object' },
        streaming: true,
      });

      const request = mockNextRequest({
        prompt: 'Stream an object',
      });

      const response = await route(request);

      expect(vi.mocked(vi.importMock('ai')).streamObject).toHaveBeenCalledWith();
    });

    test('should require schema parameter', async () => {
      expect(() => {
        createObjectRoute({
          model: mockModel,
          // Missing schema
        } as any);
      }).toThrow(/schema.*required/i);
    });
  });

  describe('createStreamRoute', () => {
    test('should create streaming route', async () => {
      const route = createStreamRoute({
        model: mockModel,
        responseFormat: 'ui-message-stream',
      });

      const request = mockNextRequest({
        messages: [{ role: 'user', content: 'Stream response' }],
      });

      const response = await route(request);

      expect(response).toBeInstanceOf(Response);
      expect(vi.mocked(vi.importMock('ai')).streamText).toHaveBeenCalledWith();
      expect(vi.mocked(vi.importMock('ai')).toUIMessageStream).toHaveBeenCalledWith();
    });

    test('should support different response formats', async () => {
      const route = createStreamRoute({
        model: mockModel,
        responseFormat: 'text-stream',
      });

      const request = mockNextRequest({
        prompt: 'Stream text',
      });

      await route(request);

      expect(vi.mocked(vi.importMock('ai')).streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Stream text',
        }),
      );
    });

    test('should handle streaming errors gracefully', async () => {
      vi.mocked(vi.importMock('ai')).streamText.mockRejectedValueOnce(
        new Error('Streaming failed'),
      );

      const route = createStreamRoute({
        model: mockModel,
      });

      const request = mockNextRequest({
        messages: [{ role: 'user', content: 'Test' }],
      });

      const response = await route(request);

      expect(response.status).toBe(500);
      const errorData = await response.json();
      expect(errorData).toMatchObject({
        error: expect.stringContaining('Streaming failed'),
      });
    });
  });

  describe('createVectorChatRoute', () => {
    test('should create vector-enabled chat route', async () => {
      const mockVectorStore = {
        search: vi.fn().mockResolvedValue([
          { content: 'Context 1', similarity: 0.9 },
          { content: 'Context 2', similarity: 0.8 },
        ]),
      };

      const route = createVectorChatRoute({
        model: mockModel,
        vectorStore: mockVectorStore,
        contextLimit: 2,
      });

      const request = mockNextRequest({
        messages: [{ role: 'user', content: 'Question about context' }],
        query: 'search query',
      });

      const response = await route(request);

      expect(mockVectorStore.search).toHaveBeenCalledWith('search query', { limit: 2 });
      expect(vi.mocked(vi.importMock('ai')).generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Context 1'),
            }),
          ]),
        }),
      );
    });

    test('should handle missing vector store', async () => {
      expect(() => {
        createVectorChatRoute({
          model: mockModel,
          // Missing vectorStore
        } as any);
      }).toThrow(/vectorStore.*required/i);
    });

    test('should handle vector search errors', async () => {
      const mockVectorStore = {
        search: vi.fn().mockRejectedValue(new Error('Vector search failed')),
      };

      const route = createVectorChatRoute({
        model: mockModel,
        vectorStore: mockVectorStore,
      });

      const request = mockNextRequest({
        messages: [{ role: 'user', content: 'Question' }],
        query: 'search query',
      });

      // Should continue without vector context on search failure
      const response = await route(request);

      expect(response.status).not.toBe(500); // Should not fail completely
      expect(vi.mocked(vi.importMock('ai')).generateText).toHaveBeenCalledWith();
    });
  });

  describe('route Error Handling', () => {
    test('should handle model provider errors', async () => {
      vi.mocked(vi.importMock('ai')).generateText.mockRejectedValueOnce(
        new Error('Model unavailable'),
      );

      const route = createGenerateRoute({
        model: mockModel,
      });

      const request = mockNextRequest({
        prompt: 'Test prompt',
      });

      const response = await route(request);

      expect(response.status).toBe(500);
      const errorData = await response.json();
      expect(errorData).toMatchObject({
        error: expect.stringContaining('Model unavailable'),
      });
    });

    test('should handle malformed request bodies', async () => {
      const route = createChatRoute({
        model: mockModel,
      });

      // Mock malformed JSON
      const request = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        method: 'POST',
      } as unknown as NextRequest;

      const response = await route(request);

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData).toMatchObject({
        error: expect.stringContaining('Invalid JSON'),
      });
    });

    test('should handle rate limiting', async () => {
      vi.mocked(vi.importMock('ai')).generateText.mockRejectedValueOnce(
        Object.assign(new Error('Rate limited'), { status: 429 }),
      );

      const route = createGenerateRoute({
        model: mockModel,
      });

      const request = mockNextRequest({
        prompt: 'Test prompt',
      });

      const response = await route(request);

      expect(response.status).toBe(429);
      const errorData = await response.json();
      expect(errorData).toMatchObject({
        error: expect.stringContaining('Rate limited'),
        retryAfter: expect.any(Number),
      });
    });
  });
});
