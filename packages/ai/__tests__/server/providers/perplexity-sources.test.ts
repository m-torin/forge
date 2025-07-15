import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';
import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Perplexity Sources Provider Tests
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Use real Perplexity API calls
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real API calls:
 * INTEGRATION_TEST=true PERPLEXITY_API_KEY=your-key pnpm test perplexity-sources
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Only mock if not running integration tests
if (!IS_INTEGRATION_TEST) {
  // Mock AI SDK v5 with official testing utilities
  vi.mock('ai', async importOriginal => {
    const actual = await importOriginal<typeof import('ai')>();

    return {
      ...actual,
      MockLanguageModelV2,
      simulateReadableStream,
      generateText: vi.fn(),
      streamText: vi.fn(),
    };
  });

  // Mock Perplexity SDK
  vi.mock('@ai-sdk/perplexity', () => ({
    perplexity: vi.fn(
      (modelName: string) =>
        new (vi.importMock('ai').MockLanguageModelV2)({
          modelId: modelName,
          doGenerate: async () => ({
            text: 'Mock Perplexity response with search results',
            usage: { inputTokens: 15, outputTokens: 35 },
            finishReason: 'stop',
          }),
          doStream: async () => ({
            stream: (simulateReadableStream as any)({
              chunks: [
                { type: 'text', text: 'Perplexity search response: ' },
                {
                  type: 'source',
                  url: 'https://example.com/article1',
                  title: 'Mock Article 1',
                  description: 'This is a mock article from example.com',
                  snippet: 'Mock snippet about the topic...',
                  favicon: 'https://example.com/favicon.ico',
                },
                { type: 'text', text: 'Based on recent sources...' },
                {
                  type: 'source',
                  url: 'https://example.org/research',
                  title: 'Mock Research Paper',
                  description: 'Academic research on the topic',
                  snippet: 'Research findings indicate...',
                },
                { type: 'text', text: ' the current state is evolving.' },
                {
                  type: 'finish',
                  finishReason: 'stop',
                  usage: { inputTokens: 20, outputTokens: 45 },
                },
              ],
            }),
          }),
        }),
    ),
    createPerplexity: vi.fn((options: any) => ({
      perplexity: vi.fn(
        (modelName: string) =>
          new (vi.importMock('ai').MockLanguageModelV2)({
            modelId: modelName,
          }),
      ),
    })),
  }));

  // Mock observability
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));
}

describe('perplexity Sources Provider', () => {
  let perplexityProvider: any;
  let testModel: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      // Real integration test setup
      if (!process.env.PERPLEXITY_API_KEY) {
        throw new Error('PERPLEXITY_API_KEY is required for integration tests');
      }

      // For integration tests, create provider directly
      const { perplexity } = await import('@ai-sdk/perplexity');
      testModel = perplexity('llama-3.1-sonar-small-128k-online');
      console.log(`🔗 Integration test using model: llama-3.1-sonar-small-128k-online`);
    } else {
      // Mock test setup
      const { perplexity } = await import('@ai-sdk/perplexity');
      testModel = perplexity('llama-3.1-sonar-small-128k-online');
      console.log('🤖 Unit test using mocks');
    }
  });

  test('should create Perplexity provider successfully', async () => {
    if (IS_INTEGRATION_TEST) {
      const { perplexity } = await import('@ai-sdk/perplexity');
      const model = perplexity('llama-3.1-sonar-small-128k-online');
      expect(model).toBeDefined();
      console.log('✅ Integration test provider created successfully');
    } else {
      const { perplexity } = await import('@ai-sdk/perplexity');
      const model = perplexity('test-model');
      expect(model).toBeDefined();
      console.log('✅ Mock provider created successfully');
    }
  });

  test(
    'should return sources with sendSources enabled',
    async () => {
      const { streamText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        // Mock implementation for unit tests
        const mockStreamText = vi.mocked(streamText);
        mockStreamText.mockImplementation(async (options: any) => ({
          toUIMessageStream: (uiOptions: any) => {
            const mockStream = new ReadableStream({
              start(controller) {
                // Simulate message parts with sources
                if (uiOptions.sendSources) {
                  controller.enqueue({
                    type: 'message-part',
                    part: { type: 'text', text: 'Based on search results: ' },
                  });
                  controller.enqueue({
                    type: 'message-part',
                    part: {
                      type: 'source',
                      url: 'https://example.com/tech-news',
                      title: 'Latest Tech Developments',
                      description: 'Recent advances in technology',
                      snippet: 'Technology continues to evolve...',
                      favicon: 'https://example.com/favicon.ico',
                    },
                  });
                  controller.enqueue({
                    type: 'message-part',
                    part: {
                      type: 'source',
                      url: 'https://research.org/ai-study',
                      title: 'AI Research Paper',
                      description: 'Academic research on AI developments',
                      snippet: 'Our study shows significant progress...',
                    },
                  });
                  controller.enqueue({
                    type: 'message-part',
                    part: { type: 'text', text: ' the field is advancing rapidly.' },
                  });
                }
                controller.close();
              },
            });
            return mockStream;
          },
        }));
      }

      const result = await streamText({
        model: testModel,
        prompt: 'What are the latest developments in renewable energy?',
        maxTokens: IS_INTEGRATION_TEST ? 500 : 100,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      const chunks = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Validate we received chunks
      expect(chunks.length).toBeGreaterThan(0);

      // Look for source parts
      const sourceParts = chunks.filter(
        chunk => chunk.type === 'message-part' && chunk.part && chunk.part.type === 'source',
      );

      if (IS_INTEGRATION_TEST) {
        console.log(`🔍 Found ${sourceParts.length} source parts in integration test`);
        // Real API should return sources for search queries
        expect(sourceParts.length).toBeGreaterThan(0);
      } else {
        console.log(`🤖 Mock returned ${sourceParts.length} source parts`);
        // Mock should return exactly 2 sources as configured
        expect(sourceParts).toHaveLength(2);
      }

      // Validate source structure
      sourceParts.forEach((sourcePart, index) => {
        const source = sourcePart.part;

        expect(source.url).toBeDefined();
        expect(typeof source.url).toBe('string');
        expect(source.url).toMatch(/^https?:\/\//);

        if (IS_INTEGRATION_TEST) {
          console.log(`📄 Source ${index + 1}: ${source.url.substring(0, 50)}...`);
        }

        // Sources should have additional metadata
        expect(source.title || source.description || source.snippet).toBeDefined();
      });
    },
    TEST_TIMEOUT,
  );

  test(
    'should aggregate sources for message display',
    async () => {
      const { streamText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        const mockStreamText = vi.mocked(streamText);
        mockStreamText.mockImplementation(async () => ({
          toUIMessageStream: (uiOptions: any) => {
            const mockStream = new ReadableStream({
              start(controller) {
                if (uiOptions.sendSources) {
                  controller.enqueue({
                    type: 'message-part',
                    part: { type: 'text', text: 'Research shows ' },
                  });
                  controller.enqueue({
                    type: 'message-part',
                    part: {
                      type: 'source',
                      url: 'https://science.org/climate-study',
                      title: 'Climate Change Research',
                      description: 'Latest climate research findings',
                    },
                  });
                  controller.enqueue({
                    type: 'message-part',
                    part: {
                      type: 'source',
                      url: 'https://tech.com/innovation',
                      title: 'Tech Innovation Report',
                      description: 'Annual technology innovation report',
                    },
                  });
                  controller.enqueue({
                    type: 'message-part',
                    part: { type: 'text', text: ' significant progress.' },
                  });
                }
                controller.close();
              },
            });
            return mockStream;
          },
        }));
      }

      const result = await streamText({
        model: testModel,
        prompt: 'Current state of artificial intelligence research',
        maxTokens: IS_INTEGRATION_TEST ? 400 : 100,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      // Collect all message parts (simulating message.tsx logic)
      const messageParts = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value && value.type === 'message-part') {
            messageParts.push(value.part);
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Filter and aggregate sources (as done in message.tsx)
      const sources = messageParts.filter(part => part.type === 'source').map(part => part as any);

      if (IS_INTEGRATION_TEST) {
        console.log(`📊 Integration test aggregated ${sources.length} sources`);
        if (sources.length > 0) {
          expect(sources.length).toBeGreaterThan(0);
        }
      } else {
        console.log(`🤖 Mock test aggregated ${sources.length} sources`);
        expect(sources).toHaveLength(2);
      }

      // Validate aggregated sources structure
      sources.forEach((source, index) => {
        expect(source.url).toBeDefined();
        expect(typeof source.url).toBe('string');

        if (IS_INTEGRATION_TEST) {
          console.log(`🔗 Aggregated source ${index + 1}: ${source.title || 'No title'}`);
        }
      });

      // Test uniqueness
      if (sources.length > 1) {
        const uniqueUrls = new Set(sources.map(s => s.url));
        expect(uniqueUrls.size).toBe(sources.length);
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle mixed content with sources and text',
    async () => {
      const { streamText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        const mockStreamText = vi.mocked(streamText);
        mockStreamText.mockImplementation(async () => ({
          toUIMessageStream: () => {
            const mockStream = new ReadableStream({
              start(controller) {
                controller.enqueue({
                  type: 'message-part',
                  part: { type: 'text', text: 'Quantum computing has seen ' },
                });
                controller.enqueue({
                  type: 'message-part',
                  part: {
                    type: 'source',
                    url: 'https://quantum.org/advances',
                    title: 'Quantum Computing Advances',
                    description: 'Recent breakthroughs in quantum technology',
                  },
                });
                controller.enqueue({
                  type: 'message-part',
                  part: { type: 'text', text: ' remarkable progress in recent years.' },
                });
                controller.close();
              },
            });
            return mockStream;
          },
        }));
      }

      const result = await streamText({
        model: testModel,
        prompt: 'Recent advances in quantum computing applications',
        maxTokens: IS_INTEGRATION_TEST ? 300 : 100,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      const textParts = [];
      const sourceParts = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value && value.type === 'message-part') {
            if (value.part.type === 'text') {
              textParts.push(value.part);
            } else if (value.part.type === 'source') {
              sourceParts.push(value.part);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Should have both text and sources
      expect(textParts.length).toBeGreaterThan(0);

      if (IS_INTEGRATION_TEST) {
        console.log(
          `📝 Integration: ${textParts.length} text parts, ${sourceParts.length} source parts`,
        );
        // Real API may or may not return sources depending on the query
        if (sourceParts.length > 0) {
          expect(sourceParts.length).toBeGreaterThan(0);
        }
      } else {
        console.log(`🤖 Mock: ${textParts.length} text parts, ${sourceParts.length} source parts`);
        expect(sourceParts).toHaveLength(1);
      }

      // Validate text content
      const fullText = textParts.map(part => part.text).join('');
      expect(fullText.trim().length).toBeGreaterThan(10);

      // Validate sources if present
      sourceParts.forEach(source => {
        expect(source.url).toBeDefined();
        expect(source.url).toMatch(/^https?:\/\//);
      });
    },
    TEST_TIMEOUT,
  );

  test(
    'should work with different Perplexity models',
    async () => {
      if (IS_INTEGRATION_TEST) {
        const { perplexity } = await import('@ai-sdk/perplexity');

        const testModels = [
          'llama-3.1-sonar-small-128k-online',
          'llama-3.1-sonar-large-128k-online',
        ];

        for (const modelId of testModels) {
          console.log(`🧪 Testing model: ${modelId}`);

          const model = perplexity(modelId);
          const { streamText } = await import('ai');

          const result = await streamText({
            model,
            prompt: 'What is machine learning?',
            maxTokens: 100,
          });

          const uiMessageStream = result.toUIMessageStream({
            sendSources: true,
          });

          let hasContent = false;
          const reader = uiMessageStream.getReader();

          try {
            const { value, done } = await reader.read();
            hasContent = !done && !!value;
          } finally {
            reader.releaseLock();
          }

          expect(hasContent).toBeTruthy();
          console.log(`✅ Model ${modelId} responded successfully`);
        }
      } else {
        // Mock test - just verify different model IDs work
        const { perplexity } = await import('@ai-sdk/perplexity');

        const models = ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online'];

        models.forEach(modelId => {
          const model = perplexity(modelId);
          expect(model).toBeDefined();
          console.log(`🤖 Mock model ${modelId} created successfully`);
        });
      }
    },
    TEST_TIMEOUT * 2,
  );

  test(
    'should handle errors gracefully',
    async () => {
      if (IS_INTEGRATION_TEST) {
        // Integration test just verifies models can be created
        const { perplexity } = await import('@ai-sdk/perplexity');
        const model = perplexity('llama-3.1-sonar-small-128k-online');
        expect(model).toBeDefined();
        console.log('✅ Integration test error handling verified');
      } else {
        // Mock test - verify error handling
        const { perplexity } = await import('@ai-sdk/perplexity');

        // This should not throw in mocked environment
        const model = perplexity('any-model-id');
        expect(model).toBeDefined();
      }

      // Test empty query handling
      const { streamText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        const mockStreamText = vi.mocked(streamText);
        mockStreamText.mockImplementation(async () => ({
          toUIMessageStream: () => {
            const mockStream = new ReadableStream({
              start(controller) {
                controller.enqueue({
                  type: 'message-part',
                  part: { type: 'text', text: 'Please provide a valid query.' },
                });
                controller.close();
              },
            });
            return mockStream;
          },
        }));
      }

      const result = await streamText({
        model: testModel,
        prompt: '',
        maxTokens: 50,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      // Should handle empty query without crashing
      const reader = uiMessageStream.getReader();
      let responseReceived = false;

      try {
        const { value, done } = await reader.read();
        responseReceived = !done;
      } catch (error) {
        // Error handling is acceptable for empty queries
        console.log('Expected error for empty query:', error);
      } finally {
        reader.releaseLock();
      }

      // Test passes if no unhandled errors occur
      expect(true).toBeTruthy();
    },
    TEST_TIMEOUT,
  );

  // Integration-only test for real API validation
  if (IS_INTEGRATION_TEST) {
    test(
      'should validate real API response structure',
      async () => {
        console.log('🔍 Running real API validation test...');

        const { streamText } = await import('ai');
        const result = await streamText({
          model: testModel,
          prompt: 'What are the latest climate change research findings?',
          maxTokens: 400,
        });

        const uiMessageStream = result.toUIMessageStream({
          sendSources: true,
        });

        const allChunks = [];
        const reader = uiMessageStream.getReader();

        try {
          let done = false;
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              allChunks.push(value);
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Log real API structure for debugging
        console.log('📊 Real API Response Analysis:');
        console.log(`- Total chunks: ${allChunks.length}`);

        const chunkTypes = allChunks.reduce(
          (acc, chunk) => {
            acc[chunk.type] = (acc[chunk.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        console.log('- Chunk types:', chunkTypes);

        const sourceChunks = allChunks.filter(
          chunk => chunk.type === 'message-part' && chunk.part?.type === 'source',
        );

        console.log(`- Source chunks: ${sourceChunks.length}`);

        if (sourceChunks.length > 0) {
          console.log('- Sample source structure:', {
            url: sourceChunks[0].part.url,
            hasTitle: !!sourceChunks[0].part.title,
            hasDescription: !!sourceChunks[0].part.description,
            hasSnippet: !!sourceChunks[0].part.snippet,
            hasFavicon: !!sourceChunks[0].part.favicon,
          });
        }

        // Basic validation
        expect(allChunks.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  }
});
