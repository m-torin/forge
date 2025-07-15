/**
 * AI SDK RAG Integration Tests
 * Testing RAG patterns with AI SDK v5 and streaming
 */

import { streamText } from 'ai';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AISDKRag,
  createAISDKRagFromEnv,
  createRAGChatHandler,
  examples,
  quickRAG,
  ragQuery,
} from '../../../src/server/rag/ai-sdk-rag';
import { AITestFactory } from '../../ai-test-factory';
import { VercelAISDKTestPatterns } from '../../test-utils/ai-test-patterns';

// Mock dependencies
vi.mock('@repo/observability/server/next');
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn((modelName: string) => ({
    id: modelName,
    provider: 'openai',
  })),
}));
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn((modelName: string) => ({
    id: modelName,
    provider: 'anthropic',
  })),
}));

// Mock Upstash Vector tools with simple in-memory implementation
const createMockTools = () => ({
  addToKnowledgeBase: {
    execute: vi.fn().mockResolvedValue('Content added successfully'),
  },
  addDocument: {
    execute: vi.fn().mockResolvedValue('Document added successfully'),
  },
  searchKnowledgeBase: {
    execute: vi.fn().mockResolvedValue([
      {
        content: 'Sample relevant content',
        score: 0.85,
        metadata: { source: 'test-doc' },
      },
    ]),
  },
});

// Keep reference to current mock tools for test assertions
let mockUpstashTools = createMockTools();

vi.mock('../../../src/server/vector/ai-sdk-integration', () => ({
  createUpstashVectorTools: vi.fn(() => {
    mockUpstashTools = createMockTools();
    return mockUpstashTools;
  }),
}));

describe('aI SDK RAG Integration', () => {
  let mockStreamResult: any;
  let testConfig: any;

  beforeEach(() => {
    // Setup test configuration
    testConfig = {
      vectorUrl: 'https://test-vector.upstash.io',
      vectorToken: 'test-token',
      namespace: 'test-namespace',
      model: 'gpt-4o',
      provider: 'openai' as const,
      useUpstashEmbedding: false,
    };

    // Setup mock stream result with proper structure
    mockStreamResult = {
      toDataStreamResponse: vi.fn().mockResolvedValue(new Response()),
      textStream: {
        [Symbol.asyncIterator]: async function* () {
          yield 'Test ';
          yield 'AI ';
          yield 'response';
        },
      },
      text: 'Mock streamed text',
      usage: { promptTokens: 10, completionTokens: 20 },
      finishReason: 'stop',
    };

    // The streamText is already mocked by QA package as vi.fn()
    // It returns the expected structure already

    // Reset mock tools before each test
    mockUpstashTools = createMockTools();

    vi.clearAllMocks();
  });

  describe('aISDKRag Class', () => {
    let ragInstance: AISDKRag;

    beforeEach(() => {
      ragInstance = new AISDKRag(testConfig);
    });

    describe('content Management', () => {
      test('should add content to knowledge base', async () => {
        const content = 'Test content for knowledge base';
        const metadata = { type: 'test', priority: 'high' };

        const result = await ragInstance.addContent(content, metadata);

        expect(mockUpstashTools.addToKnowledgeBase.execute).toHaveBeenCalledWith({
          content,
          metadata,
        });
        expect(result).toBe('Content added successfully');
      });

      test('should add document with automatic chunking', async () => {
        const content = 'Document content to be chunked';
        const title = 'Test Document';
        const metadata = { author: 'test-user' };

        const result = await ragInstance.addDocument(content, title, metadata);

        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledWith({
          content,
          title,
          metadata,
        });
        expect(result).toBe('Document added successfully');
      });

      test('should handle document addition without optional parameters', async () => {
        const result = await ragInstance.addDocument('Simple content');

        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledWith({
          content: 'Simple content',
          title: undefined,
          metadata: undefined,
        });
        expect(result).toBe('Document added successfully');
      });
    });

    describe('search Functionality', () => {
      test('should search knowledge base', async () => {
        const query = 'What is machine learning?';
        const topK = 3;

        const results = await ragInstance.search(query, topK);

        expect(mockUpstashTools.searchKnowledgeBase.execute).toHaveBeenCalledWith({
          query,
          topK,
        });
        expect(results).toHaveLength(1);
        expect(results[0].content).toBe('Sample relevant content');
        expect(results[0].score).toBe(0.85);
      });

      test('should search with default topK when not specified', async () => {
        await ragInstance.search('test query');

        expect(mockUpstashTools.searchKnowledgeBase.execute).toHaveBeenCalledWith({
          query: 'test query',
          topK: undefined,
        });
      });

      test('should handle empty search results', async () => {
        mockUpstashTools.searchKnowledgeBase.execute.mockResolvedValueOnce([]);

        const results = await ragInstance.search('no results query');

        expect(results).toHaveLength(0);
      });
    });

    describe('rAG Query', () => {
      test('should perform RAG query with context', async () => {
        const question = 'Explain artificial intelligence';

        // Mock search results
        mockUpstashTools.searchKnowledgeBase.execute.mockResolvedValue([
          {
            content: 'AI is the simulation of human intelligence',
            score: 0.9,
            metadata: { source: 'ai-textbook' },
          },
          {
            content: 'Machine learning is a subset of AI',
            score: 0.8,
            metadata: { source: 'ml-guide' },
          },
        ]);

        const result = await ragInstance.query(question);

        // Verify search was performed
        expect(mockUpstashTools.searchKnowledgeBase.execute).toHaveBeenCalledWith({
          query: question,
          topK: 5,
        });

        // Verify streamText was called with proper context
        expect(streamText).toHaveBeenCalledWith({
          model: expect.any(Object), // Mock model object from QA package
          messages: [
            {
              role: 'system',
              content: expect.stringContaining('AI is the simulation of human intelligence'),
            },
            {
              role: 'user',
              content: question,
            },
          ],
        });

        expect(result).toBe('Mock streamed text');
      });

      test('should handle custom model and provider options', async () => {
        await ragInstance.query('test question', {
          model: 'claude-3-5-sonnet-20241022',
          provider: 'anthropic',
          systemPrompt: 'Custom system prompt',
        });

        expect(streamText).toHaveBeenCalledWith({
          model: expect.any(Object), // Anthropic model object from QA package
          messages: [
            {
              role: 'system',
              content: 'Custom system prompt',
            },
            {
              role: 'user',
              content: 'test question',
            },
          ],
        });
      });

      test('should work with empty context', async () => {
        mockUpstashTools.searchKnowledgeBase.execute.mockResolvedValue([]);

        const result = await ragInstance.query('query with no context');

        expect(streamText).toHaveBeenCalledWith();
        expect(result).toBe('Mock streamed text');
      });
    });
  });

  describe('rAG Chat Handler', () => {
    test('should create RAG chat handler', async () => {
      const handler = createRAGChatHandler(testConfig);

      expect(handler).toBeInstanceOf(Function);

      // Test handler execution
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Test message' }],
        }),
      } as any;

      const response = await handler(mockRequest);

      expect(mockRequest.json).toHaveBeenCalledWith();
      expect(streamText).toHaveBeenCalledWith({
        model: expect.any(Object),
        messages: [{ role: 'user', content: 'Test message' }],
        system: expect.stringContaining('RAG assistant'),
        tools: expect.any(Object),
        maxSteps: 3,
      });
      expect(mockStreamResult.toDataStreamResponse).toHaveBeenCalledWith();
    });

    test('should use custom system prompt and maxSteps', async () => {
      const customConfig = {
        ...testConfig,
        systemPrompt: 'Custom RAG assistant prompt',
        maxSteps: 5,
      };

      const handler = createRAGChatHandler(customConfig);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Test' }],
        }),
      } as any;

      await handler(mockRequest);

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'Custom RAG assistant prompt',
          maxSteps: 5,
        }),
      );
    });

    test('should handle different AI providers', async () => {
      const anthropicConfig = {
        ...testConfig,
        provider: 'anthropic' as const,
        model: 'claude-3-5-sonnet-20241022',
      };

      const handler = createRAGChatHandler(anthropicConfig);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Test' }],
        }),
      } as any;

      await handler(mockRequest);

      expect(streamText).toHaveBeenCalledWith();
      // Model selection is tested implicitly through the mock
    });
  });

  describe('factory Functions', () => {
    describe('createAISDKRagFromEnv', () => {
      test('should create RAG instance from environment variables', () => {
        // Environment variables are mocked in setup.ts
        const rag = createAISDKRagFromEnv({
          namespace: 'custom-namespace',
          useUpstashEmbedding: true,
        });

        expect(rag).toBeInstanceOf(AISDKRag);
      });

      test.todo('should return null when environment variables are missing');
    });

    describe('quickRAG', () => {
      test('should create RAG instance and add documents', async () => {
        const documents = [
          { content: 'Document 1 content', title: 'Doc 1' },
          { content: 'Document 2 content', title: 'Doc 2', metadata: { type: 'guide' } },
        ];

        const rag = await quickRAG(documents, {
          vectorUrl: testConfig.vectorUrl,
          vectorToken: testConfig.vectorToken,
          namespace: 'quick-test',
        });

        expect(rag).toBeInstanceOf(AISDKRag);
        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledTimes(2);
        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledWith({
          content: 'Document 1 content',
          title: 'Doc 1',
          metadata: undefined,
        });
        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledWith({
          content: 'Document 2 content',
          title: 'Doc 2',
          metadata: { type: 'guide' },
        });
      });

      test('should use environment variables when config not provided', async () => {
        const documents = [{ content: 'Test content' }];

        const rag = await quickRAG(documents);

        expect(rag).toBeInstanceOf(AISDKRag);
        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledWith({
          content: 'Test content',
          title: undefined,
          metadata: undefined,
        });
      });

      test.todo('should throw error when credentials are missing');
    });

    describe('ragQuery', () => {
      test('should perform one-shot RAG query', async () => {
        const question = 'What is in these documents?';
        const documents = [
          { content: 'AI is transforming industries', title: 'AI Impact' },
          { content: 'Machine learning drives automation', title: 'ML Automation' },
        ];

        const result = await ragQuery(question, documents, {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
        });

        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledTimes(2);
        expect(result).toBe('Mock streamed text');
      });

      test('should use default configuration when not provided', async () => {
        const result = await ragQuery('test question', [{ content: 'test content' }]);

        expect(result).toBe('Mock streamed text');
        expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledWith({
          content: 'test content',
          title: undefined,
          metadata: undefined,
        });
      });
    });
  });

  describe('examples', () => {
    test('should run basic example', async () => {
      const result = await examples.basic();

      expect(mockUpstashTools.addToKnowledgeBase.execute).toHaveBeenCalledWith({
        content:
          "Paris is the capital of France. It's known for the Eiffel Tower and amazing cuisine.",
        metadata: undefined,
      });
      expect(result).toBe('Mock streamed text');
    });

    test('should run documents example', async () => {
      const documents = [
        { content: 'Document 1', title: 'Title 1' },
        { content: 'Document 2', title: 'Title 2' },
      ];

      const result = await examples.documents(documents);

      expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledTimes(2);
      expect(result).toBe('Mock streamed text');
    });

    test('should run one-shot example', async () => {
      const result = await examples.oneShot('What is this about?', 'Content about AI');

      expect(result).toBe('Mock streamed text');
    });
  });

  describe('error Handling', () => {
    test('should handle Upstash Vector tool failures', async () => {
      mockUpstashTools.addDocument.execute.mockRejectedValue(new Error('Vector database error'));

      const rag = new AISDKRag(testConfig);

      await expect(rag.addDocument('test content')).rejects.toThrow('Vector database error');
    });

    test('should handle search failures gracefully', async () => {
      mockUpstashTools.searchKnowledgeBase.execute.mockRejectedValue(
        new Error('Search service unavailable'),
      );

      const rag = new AISDKRag(testConfig);

      await expect(rag.search('test query')).rejects.toThrow('Search service unavailable');
    });

    test('should handle AI model failures', async () => {
      // Temporarily override the mock to throw an error
      const originalImpl = (streamText as any).getMockImplementation();
      (streamText as any).mockImplementationOnce(() => {
        throw new Error('AI model error');
      });

      const rag = new AISDKRag(testConfig);

      await expect(rag.query('test question')).rejects.toThrow('AI model error');
    });

    test('should handle malformed chat handler requests', async () => {
      const handler = createRAGChatHandler(testConfig);

      const invalidRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any;

      await expect(handler(invalidRequest)).rejects.toThrow('Invalid JSON');
    });
  });

  describe('performance', () => {
    test('should handle multiple document additions efficiently', async () => {
      const documents = Array.from({ length: 20 }, (_, i) => ({
        content: `Document ${i} content`,
        title: `Doc ${i}`,
      }));

      const startTime = Date.now();
      const rag = await quickRAG(documents, testConfig);
      const duration = Date.now() - startTime;

      expect(rag).toBeInstanceOf(AISDKRag);
      expect(mockUpstashTools.addDocument.execute).toHaveBeenCalledTimes(20);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle concurrent queries', async () => {
      const rag = new AISDKRag(testConfig);

      const queries = Array.from({ length: 10 }, (_, i) => `Query ${i}`);
      const startTime = Date.now();

      const results = await Promise.all(queries.map(query => rag.query(query)));

      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(3000); // Should handle concurrent requests efficiently
      results.forEach(result => {
        expect(result).toBe('Mock streamed text');
      });
    });
  });

  describe('integration with Vercel AI SDK v5 Patterns', () => {
    test('should work with AI test factory patterns', async () => {
      const env = AITestFactory.createBasicTestEnvironment({
        responses: ['RAG enhanced response'],
      });

      const rag = new AISDKRag(testConfig);

      // Test with patterns from AI test factory
      const result = await VercelAISDKTestPatterns.basicTextGeneration(
        env.mockModel,
        'Test RAG query',
      );

      expect(result.text).toBeDefined();
      env.cleanup();
    });

    test('should support streaming patterns', async () => {
      const env = AITestFactory.createStreamingTestEnvironment({
        textChunks: ['Streaming', ' RAG', ' response'],
      });

      const handler = createRAGChatHandler(testConfig);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Stream test' }],
        }),
      } as any;

      const response = await handler(mockRequest);

      expect(mockStreamResult.toDataStreamResponse).toHaveBeenCalledWith();
      env.cleanup();
    });
  });
});
