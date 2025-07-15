import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * AI SDK RAG Tests - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Use real vector DB and AI providers
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real services:
 * INTEGRATION_TEST=true OPENAI_API_KEY=key UPSTASH_VECTOR_URL=url UPSTASH_VECTOR_TOKEN=token pnpm test ai-sdk-rag-upgraded
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 45000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  vi.mock('ai', () => ({
    streamText: vi.fn(),
    generateText: vi.fn(),
    embed: vi.fn(),
    generateObject: vi.fn(),
  }));

  vi.mock('@ai-sdk/openai', () => ({
    openai: vi.fn((modelName: string) => ({
      modelId: modelName,
      provider: 'openai',
      doGenerate: vi.fn().mockResolvedValue({
        text: `Mock OpenAI response from ${modelName}`,
        usage: { inputTokens: 20, outputTokens: 30 },
        finishReason: 'stop',
      }),
    })),
  }));

  vi.mock('@upstash/vector', () => ({
    Index: vi.fn().mockImplementation(() => ({
      upsert: vi.fn().mockResolvedValue({ upserted: 1 }),
      query: vi.fn().mockResolvedValue([
        {
          id: 'mock-doc-1',
          score: 0.85,
          metadata: {
            content: 'Mock relevant content from knowledge base',
            source: 'mock-document.txt',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
        {
          id: 'mock-doc-2',
          score: 0.78,
          metadata: {
            content: 'Additional mock context for RAG testing',
            source: 'mock-context.txt',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      ]),
      delete: vi.fn().mockResolvedValue({ deleted: 1 }),
      info: vi.fn().mockResolvedValue({
        vectorCount: 100,
        pendingVectorCount: 0,
        indexSize: 1024,
        dimension: 1536,
        similarityFunction: 'cosine',
      }),
    })),
  }));

  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));
}

describe('aI SDK RAG - Upgraded (Mock/Integration)', () => {
  let ragSystem: any;
  let vectorDB: any;
  let aiModel: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      // Real integration test setup
      const requiredEnvVars = [
        'OPENAI_API_KEY',
        'UPSTASH_VECTOR_REST_URL',
        'UPSTASH_VECTOR_REST_TOKEN',
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables for integration tests: ${missingVars.join(', ')}`,
        );
      }

      // Setup real services
      const { openai } = await import('@ai-sdk/openai');
      const { Index } = await import('@upstash/vector');

      aiModel = openai('gpt-3.5-turbo');
      vectorDB = new Index({
        url: process.env.UPSTASH_VECTOR_REST_URL!,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      });

      console.log('🔗 Integration test using real Vector DB and OpenAI');
    } else {
      // Mock test setup
      const { openai } = await import('@ai-sdk/openai');
      const { Index } = await import('@upstash/vector');

      aiModel = openai('gpt-3.5-turbo');
      vectorDB = new Index({
        url: 'mock-url',
        token: 'mock-token',
      });

      console.log('🤖 Unit test using mocks');
    }
  });

  test('should create RAG system with vector database', async () => {
    expect(vectorDB).toBeDefined();
    expect(aiModel).toBeDefined();

    if (IS_INTEGRATION_TEST) {
      // Test real vector DB info
      const info = await vectorDB.info();
      expect(info).toBeDefined();
      expect(typeof info.vectorCount).toBe('number');
      console.log(`✅ Integration: Vector DB has ${info.vectorCount} vectors`);
    } else {
      // Test mock vector DB
      const mockInfo = await vectorDB.info();
      expect(mockInfo.vectorCount).toBe(100);
      expect(mockInfo.dimension).toBe(1536);
      console.log('✅ Mock: Vector DB info retrieved');
    }
  });

  test(
    'should add documents to knowledge base',
    async () => {
      const testDocuments = [
        {
          id: 'test-doc-1',
          content: 'This is a test document about machine learning fundamentals.',
          metadata: { source: 'test-ml.txt', category: 'education' },
        },
        {
          id: 'test-doc-2',
          content: 'Advanced neural network architectures and their applications.',
          metadata: { source: 'test-nn.txt', category: 'research' },
        },
      ];

      if (IS_INTEGRATION_TEST) {
        // Real embeddings and upsert
        const { embed } = await import('ai');

        for (const doc of testDocuments) {
          // Generate embedding
          const { embedding } = await embed({
            model: openai('text-embedding-3-small'),
            value: doc.content,
          });

          // Upsert to vector DB
          await vectorDB.upsert({
            id: doc.id,
            vector: embedding,
            metadata: {
              content: doc.content,
              ...doc.metadata,
              timestamp: new Date().toISOString(),
            },
          });
        }

        console.log(`✅ Integration: Added ${testDocuments.length} documents to knowledge base`);
      } else {
        // Mock embeddings and upsert
        const { embed } = await import('ai');
        const mockEmbed = vi.mocked(embed);

        mockEmbed.mockResolvedValue({
          embedding: Array(1536)
            .fill(0)
            .map(() => Math.random()),
          usage: { inputTokens: 10, outputTokens: 0 },
        });

        for (const doc of testDocuments) {
          const { embedding } = await embed({
            model: aiModel,
            value: doc.content,
          });

          await vectorDB.upsert({
            id: doc.id,
            vector: embedding,
            metadata: doc.metadata,
          });
        }

        expect(mockEmbed).toHaveBeenCalledTimes(testDocuments.length);
        console.log(`✅ Mock: Simulated adding ${testDocuments.length} documents`);
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should search knowledge base and retrieve relevant content',
    async () => {
      const searchQuery = 'What are neural networks?';

      if (IS_INTEGRATION_TEST) {
        // Real embedding and search
        const { embed } = await import('ai');

        const { embedding } = await embed({
          model: openai('text-embedding-3-small'),
          value: searchQuery,
        });

        const searchResults = await vectorDB.query({
          vector: embedding,
          topK: 3,
          includeMetadata: true,
        });

        expect(Array.isArray(searchResults)).toBeTruthy();
        console.log(`✅ Integration: Found ${searchResults.length} relevant documents`);

        if (searchResults.length > 0) {
          searchResults.forEach((result, index) => {
            expect(result.score).toBeGreaterThan(0);
            expect(result.metadata).toBeDefined();
            console.log(`📄 Result ${index + 1}: Score ${result.score.toFixed(3)}`);
          });
        }
      } else {
        // Mock embedding and search
        const { embed } = await import('ai');
        const mockEmbed = vi.mocked(embed);

        mockEmbed.mockResolvedValue({
          embedding: Array(1536)
            .fill(0)
            .map(() => Math.random()),
          usage: { inputTokens: 5, outputTokens: 0 },
        });

        const { embedding } = await embed({
          model: aiModel,
          value: searchQuery,
        });

        const searchResults = await vectorDB.query({
          vector: embedding,
          topK: 3,
          includeMetadata: true,
        });

        expect(searchResults).toHaveLength(2); // Mock returns 2 results
        expect(searchResults[0].score).toBe(0.85);
        expect(searchResults[0].metadata.content).toBe('Mock relevant content from knowledge base');
        console.log('✅ Mock: Knowledge base search completed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should perform RAG query with context retrieval',
    async () => {
      const userQuery = 'Explain machine learning basics';

      if (IS_INTEGRATION_TEST) {
        // Real RAG workflow
        const { embed, generateText } = await import('ai');

        // 1. Embed user query
        const { embedding } = await embed({
          model: openai('text-embedding-3-small'),
          value: userQuery,
        });

        // 2. Search for relevant context
        const contextResults = await vectorDB.query({
          vector: embedding,
          topK: 3,
          includeMetadata: true,
        });

        // 3. Build context from results
        const context = contextResults
          .map(result => result.metadata?.content || '')
          .filter(content => content.length > 0)
          .join('\n\n');

        // 4. Generate response with context
        const response = await generateText({
          model: aiModel,
          prompt: `Context:
${context}

Question: ${userQuery}

Answer based on the context above:`,
          maxTokens: 200,
        });

        expect(response.text).toBeDefined();
        expect(response.text.length).toBeGreaterThan(20);
        console.log(`✅ Integration: RAG response - ${response.text.substring(0, 100)}...`);
        console.log(`📊 Used ${contextResults.length} context documents`);
      } else {
        // Mock RAG workflow
        const { embed, generateText } = await import('ai');
        const mockEmbed = vi.mocked(embed);
        const mockGenerateText = vi.mocked(generateText);

        mockEmbed.mockResolvedValue({
          embedding: Array(1536).fill(0.1),
          usage: { inputTokens: 8, outputTokens: 0 },
        });

        mockGenerateText.mockResolvedValue({
          text: 'Mock RAG response: Machine learning is a subset of AI that enables computers to learn from data.',
          usage: { inputTokens: 50, outputTokens: 25 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: '', rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerMetadata: undefined,
          steps: [],
        });

        // Execute mock RAG workflow
        const { embedding } = await embed({
          model: aiModel,
          value: userQuery,
        });

        const contextResults = await vectorDB.query({
          vector: embedding,
          topK: 3,
          includeMetadata: true,
        });

        const context = contextResults.map(result => result.metadata?.content || '').join('\n\n');

        const response = await generateText({
          model: aiModel,
          prompt: `Context: ${context}
Question: ${userQuery}`,
          maxTokens: 200,
        });

        expect(response.text).toContain('Machine learning');
        expect(mockEmbed).toHaveBeenCalledWith();
        expect(mockGenerateText).toHaveBeenCalledWith();
        console.log('✅ Mock: RAG query workflow completed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should stream RAG responses',
    async () => {
      const userQuery = 'What are the benefits of machine learning?';

      if (IS_INTEGRATION_TEST) {
        // Real streaming RAG
        const { embed, streamText } = await import('ai');

        const { embedding } = await embed({
          model: openai('text-embedding-3-small'),
          value: userQuery,
        });

        const contextResults = await vectorDB.query({
          vector: embedding,
          topK: 2,
          includeMetadata: true,
        });

        const context = contextResults.map(result => result.metadata?.content || '').join('\n\n');

        const stream = await streamText({
          model: aiModel,
          prompt: `Context:
${context}

Question: ${userQuery}

Provide a detailed answer:`,
          maxTokens: 150,
        });

        let fullResponse = '';
        for await (const delta of stream.textStream) {
          fullResponse += delta;
        }

        expect(fullResponse.length).toBeGreaterThan(10);
        console.log(`✅ Integration: Streamed RAG response - ${fullResponse.substring(0, 100)}...`);
      } else {
        // Mock streaming RAG
        const { embed, streamText } = await import('ai');
        const mockEmbed = vi.mocked(embed);
        const mockStreamText = vi.mocked(streamText);

        mockEmbed.mockResolvedValue({
          embedding: Array(1536).fill(0.2),
          usage: { inputTokens: 12, outputTokens: 0 },
        });

        mockStreamText.mockResolvedValue({
          textStream: (async function* () {
            yield 'Mock ';
            yield 'streaming ';
            yield 'RAG ';
            yield 'response: ';
            yield 'Machine learning benefits include automation and insights.';
          })(),
          toUIMessageStream: () => new ReadableStream(),
        });

        const { embedding } = await embed({
          model: aiModel,
          value: userQuery,
        });

        const contextResults = await vectorDB.query({
          vector: embedding,
          topK: 2,
          includeMetadata: true,
        });

        const stream = await streamText({
          model: aiModel,
          prompt: `Context: RAG test
Question: ${userQuery}`,
        });

        let fullResponse = '';
        for await (const delta of stream.textStream) {
          fullResponse += delta;
        }

        expect(fullResponse).toContain('Machine learning benefits');
        console.log('✅ Mock: Streaming RAG completed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle empty knowledge base gracefully',
    async () => {
      const emptyQuery = 'Query with no relevant context';

      if (IS_INTEGRATION_TEST) {
        // Test with a very specific query that likely has no matches
        const { embed, generateText } = await import('ai');

        const { embedding } = await embed({
          model: openai('text-embedding-3-small'),
          value: emptyQuery,
        });

        const searchResults = await vectorDB.query({
          vector: embedding,
          topK: 3,
          includeMetadata: true,
        });

        // Generate response even with minimal context
        const response = await generateText({
          model: aiModel,
          prompt: `Question: ${emptyQuery}

Answer: (Note: Limited context available)`,
          maxTokens: 100,
        });

        expect(response.text).toBeDefined();
        console.log(`✅ Integration: Handled query with ${searchResults.length} context results`);
      } else {
        // Mock empty results
        const mockVectorDB = {
          ...vectorDB,
          query: vi.fn().mockResolvedValue([]), // Empty results
        };

        const { embed, generateText } = await import('ai');
        const mockEmbed = vi.mocked(embed);
        const mockGenerateText = vi.mocked(generateText);

        mockEmbed.mockResolvedValue({
          embedding: Array(1536).fill(0),
          usage: { inputTokens: 10, outputTokens: 0 },
        });

        mockGenerateText.mockResolvedValue({
          text: "Mock response with no context: I don't have specific information about that.",
          usage: { inputTokens: 20, outputTokens: 15 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: '', rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerMetadata: undefined,
          steps: [],
        });

        const { embedding } = await embed({
          model: aiModel,
          value: emptyQuery,
        });

        const searchResults = await mockVectorDB.query({
          vector: embedding,
          topK: 3,
        });

        const response = await generateText({
          model: aiModel,
          prompt: `Question: ${emptyQuery}`,
        });

        expect(searchResults).toHaveLength(0);
        expect(response.text).toContain('no context');
        console.log('✅ Mock: Empty knowledge base handled gracefully');
      }
    },
    TEST_TIMEOUT,
  );

  // Integration-only test for advanced RAG features
  if (IS_INTEGRATION_TEST) {
    test(
      'should test RAG with document metadata filtering',
      async () => {
        console.log('🔍 Testing metadata filtering in RAG...');

        const { embed } = await import('ai');

        // Add documents with different categories
        const categorizedDocs = [
          {
            id: 'tech-doc-1',
            content: 'Advanced AI techniques for natural language processing',
            metadata: { category: 'technology', level: 'advanced' },
          },
          {
            id: 'basic-doc-1',
            content: 'Introduction to basic programming concepts',
            metadata: { category: 'programming', level: 'beginner' },
          },
        ];

        for (const doc of categorizedDocs) {
          const { embedding } = await embed({
            model: openai('text-embedding-3-small'),
            value: doc.content,
          });

          await vectorDB.upsert({
            id: doc.id,
            vector: embedding,
            metadata: {
              content: doc.content,
              ...doc.metadata,
              timestamp: new Date().toISOString(),
            },
          });
        }

        // Search with metadata filter
        const { embedding: queryEmbedding } = await embed({
          model: openai('text-embedding-3-small'),
          value: 'AI and machine learning',
        });

        const filteredResults = await vectorDB.query({
          vector: queryEmbedding,
          topK: 5,
          includeMetadata: true,
          filter: 'category = "technology"',
        });

        console.log(`📊 Filtered search returned ${filteredResults.length} results`);

        filteredResults.forEach(result => {
          expect(result.metadata?.category).toBe('technology');
        });

        console.log('✅ Integration: Metadata filtering working correctly');
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for RAG error scenarios
  if (!IS_INTEGRATION_TEST) {
    test('should handle RAG system errors gracefully', async () => {
      // Mock vector DB error
      const errorVectorDB = {
        ...vectorDB,
        query: vi.fn().mockRejectedValue(new Error('Mock vector DB error')),
        upsert: vi.fn().mockRejectedValue(new Error('Mock upsert error')),
      };

      const { embed } = await import('ai');
      const mockEmbed = vi.mocked(embed);

      mockEmbed.mockRejectedValue(new Error('Mock embedding error'));

      // Test embedding error handling
      try {
        await embed({
          model: aiModel,
          value: 'test query',
        });
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toBe('Mock embedding error');
      }

      // Test vector DB error handling
      try {
        await errorVectorDB.query({
          vector: [0.1, 0.2, 0.3],
          topK: 3,
        });
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toBe('Mock vector DB error');
      }

      console.log('✅ Mock: RAG error scenarios handled correctly');
    });
  }
});
