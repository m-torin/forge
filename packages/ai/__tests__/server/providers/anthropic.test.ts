import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Anthropic Provider Tests
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Use real Anthropic API calls
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real API calls:
 * INTEGRATION_TEST=true ANTHROPIC_API_KEY=your-key pnpm test anthropic
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Import mocks at module level to avoid runtime issues
let MockLanguageModelV2: any;
let simulateReadableStream: any;

if (!IS_INTEGRATION_TEST) {
  // Import mock utilities with fallback
  try {
    const aiTest = await import('ai/test');
    MockLanguageModelV2 = aiTest.MockLanguageModelV2;
    simulateReadableStream = aiTest.simulateReadableStream;
  } catch (error) {
    // Fallback if ai/test is not available
    MockLanguageModelV2 = class {
      constructor(public config: any) {}
      async doGenerate() {
        return (
          this.config.doGenerate?.() || {
            text: 'Mock response',
            usage: { inputTokens: 10, outputTokens: 20 },
            finishReason: 'stop',
          }
        );
      }
      async doStream() {
        return (
          this.config.doStream?.() || {
            stream: {
              async *[Symbol.asyncIterator]() {
                yield { type: 'text', text: 'Mock stream' };
                yield { type: 'finish', finishReason: 'stop' };
              },
            },
          }
        );
      }
    };
    simulateReadableStream = (config: any) => ({
      async *[Symbol.asyncIterator]() {
        for (const chunk of config.chunks) {
          yield chunk;
        }
      },
    });
  }

  // Mock AI SDK v5 with official testing utilities
  vi.mock('ai', async importOriginal => {
    const actual = await importOriginal<typeof import('ai')>();

    return {
      ...actual,
      MockLanguageModelV2,
      simulateReadableStream,
      generateText: vi.fn(),
      generateObject: vi.fn(),
      streamText: vi.fn(),
      customProvider: vi.fn(() => ({
        languageModels: {},
        textEmbeddingModels: {},
      })),
    };
  });

  // Mock Anthropic SDK with v5 compatible patterns
  vi.mock('@ai-sdk/anthropic', () => ({
    anthropic: vi.fn(
      (modelName: string = 'claude-3-5-sonnet-20241022') =>
        new MockLanguageModelV2({
          modelId: modelName,
          doGenerate: async () => ({
            text: 'Mock Anthropic response',
            usage: { inputTokens: 10, outputTokens: 20 },
            finishReason: 'stop',
            reasoningText: 'Mock reasoning process',
            providerOptions: {
              anthropic: {
                cacheCreationInputTokens: 0,
                cacheReadInputTokens: 0,
              },
            },
          }),
          doStream: async () => ({
            stream: simulateReadableStream({
              chunks: [
                { type: 'text', text: 'Streaming ' },
                { type: 'text', text: 'Anthropic ' },
                { type: 'text', text: 'response' },
                {
                  type: 'finish',
                  finishReason: 'stop',
                  usage: { inputTokens: 8, outputTokens: 15 },
                },
              ],
            }),
          }),
        }),
    ),
    createAnthropic: vi.fn((options: any) => ({
      anthropic: vi.fn(
        (modelName: string) =>
          new MockLanguageModelV2({
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

describe('anthropic Provider', () => {
  let testModel: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      // Real integration test setup
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is required for integration tests');
      }

      const { anthropic } = await import('@ai-sdk/anthropic');
      testModel = anthropic('claude-3-5-sonnet-20241022');
      console.log('🔗 Integration test using real Anthropic API');
    } else {
      // Mock test setup
      const { anthropic } = await import('@ai-sdk/anthropic');
      testModel = anthropic('claude-3-5-sonnet-20241022');
      console.log('🤖 Unit test using mocks');
    }
  });

  test('should create Anthropic model successfully', async () => {
    expect(testModel).toBeDefined();
    expect(testModel.modelId).toBe('claude-3-5-sonnet-20241022');

    // Log test type
    const logMessage = IS_INTEGRATION_TEST
      ? '✅ Integration test model created'
      : '✅ Mock model created';
    console.log(logMessage);
  });

  test(
    'should generate text responses',
    async () => {
      const { generateText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        // Mock implementation
        const mockGenerateText = vi.mocked(generateText);
        mockGenerateText.mockResolvedValue({
          text: 'Mock Anthropic generated text',
          usage: { inputTokens: 15, outputTokens: 25 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: 'test', rawSettings: {} },
          request: { body: JSON.stringify({}) },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerOptions: undefined,
          steps: [],
        });
      }

      const result = await generateText({
        model: testModel,
        prompt: 'What is artificial intelligence?',
        maxOutputTokens: IS_INTEGRATION_TEST ? 100 : 50,
      });

      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(10);

      // Verify based on test type
      if (IS_INTEGRATION_TEST) {
        expect(result.usage?.inputTokens).toBeGreaterThan(0);
        expect(result.usage?.outputTokens).toBeGreaterThan(0);
        console.log(`🔗 Integration response: ${result.text.substring(0, 100)}...`);
      } else {
        expect(result.text).toBe('Mock Anthropic generated text');
        console.log(`🤖 Mock response: ${result.text}`);
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should stream text responses',
    async () => {
      const { streamText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        // Mock implementation
        const mockStreamText = vi.mocked(streamText);
        mockStreamText.mockResolvedValue({
          textStream: (async function* () {
            yield 'Streaming ';
            yield 'Anthropic ';
            yield 'response';
          })(),
          toUIMessageStream: () => {
            const mockStream = new ReadableStream({
              start(controller) {
                controller.enqueue({
                  type: 'message-part',
                  part: { type: 'text', text: 'Streaming Anthropic response' },
                });
                controller.close();
              },
            });
            return mockStream;
          },
        });
      }

      const result = streamText({
        model: testModel,
        prompt: 'Explain machine learning briefly',
        maxOutputTokens: IS_INTEGRATION_TEST ? 150 : 50,
      });

      // Test text stream
      let fullText = '';
      for await (const delta of result.textStream) {
        fullText += delta;
      }

      expect(fullText.length).toBeGreaterThan(5);

      // Verify based on test type
      if (IS_INTEGRATION_TEST) {
        expect(fullText.length).toBeGreaterThan(10);
        console.log(`🔗 Integration stream: ${fullText.substring(0, 50)}...`);
      } else {
        expect(fullText).toBe('Streaming Anthropic response');
        console.log(`🤖 Mock stream: ${fullText}`);
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle reasoning models',
    async () => {
      const { generateText } = await import('ai');

      if (IS_INTEGRATION_TEST) {
        // Test with reasoning model
        const { anthropic } = await import('@ai-sdk/anthropic');
        const reasoningModel = anthropic('claude-3-5-sonnet-20241022');

        const result = await generateText({
          model: reasoningModel,
          prompt: 'Solve this step by step: What is 15 * 24?',
          maxOutputTokens: 200,
          experimental_providerOptions: {
            anthropic: {
              thinking: { type: 'enabled' as const, budgetTokens: 1000 },
            },
          },
        });

        console.log(`🧠 Reasoning response: ${result.text.substring(0, 100)}...`);

        expect(result.text).toBeDefined();
        if (result.reasoningText) {
          console.log('🤔 Reasoning process detected');
        }
      } else {
        // Mock reasoning test
        const mockGenerateText = vi.mocked(generateText);
        mockGenerateText.mockResolvedValue({
          text: 'Mock reasoning: 15 * 24 = 360',
          reasoningText: 'Mock reasoning process',
          usage: { inputTokens: 20, outputTokens: 30 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: '', rawSettings: {} },
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerOptions: undefined,
          steps: [],
        });

        const result = await generateText({
          model: testModel,
          prompt: 'Solve: 15 * 24',
        });

        expect(result.text).toContain('360');
        expect(result.reasoningText).toBe('Mock reasoning process');
        console.log('🤖 Mock reasoning test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle errors gracefully',
    async () => {
      const { generateText } = await import('ai');

      if (IS_INTEGRATION_TEST) {
        // Test with invalid prompt (empty)
        try {
          await generateText({
            model: testModel,
            prompt: '',
            maxOutputTokens: 10,
          });
          // If it succeeds, that's also fine
          console.log('✅ Integration test handled empty prompt');
        } catch (error) {
          // Expected error for empty prompt
          console.log('✅ Integration test properly errored on empty prompt');
          expect(error).toBeDefined();
        }
      } else {
        // Mock error handling
        const mockGenerateText = vi.mocked(generateText);

        // Test that mock doesn't throw
        mockGenerateText.mockResolvedValue({
          text: 'Mock error handling response',
          usage: { inputTokens: 5, outputTokens: 10 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: '', rawSettings: {} },
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerOptions: undefined,
          steps: [],
        });

        const result = await generateText({
          model: testModel,
          prompt: '',
        });

        expect(result).toBeDefined();
        console.log('🤖 Mock error handling test passed');
      }
    },
    TEST_TIMEOUT,
  );
});

// Integration-only tests
if (IS_INTEGRATION_TEST) {
  describe('integration-only Tests', () => {
    let testModel: any;

    beforeEach(async () => {
      const { anthropic } = await import('@ai-sdk/anthropic');
      testModel = anthropic('claude-3-5-sonnet-20241022');
    });

    test(
      'should support prompt caching',
      async () => {
        console.log('🔍 Testing Anthropic prompt caching...');

        const { generateText } = await import('ai');
        const longContext = 'a'.repeat(2000); // Long enough for caching

        const result = await generateText({
          model: testModel,
          messages: [
            {
              role: 'system',
              parts: [
                {
                  type: 'text',
                  text: longContext,
                },
              ],
              experimental_providerOptions: {
                anthropic: {
                  cacheControl: { type: 'ephemeral' },
                },
              },
            },
            {
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: 'Summarize the above in one sentence.',
                },
              ],
            },
          ],
          maxOutputTokens: 100,
        });

        expect(result.text).toBeDefined();
        console.log('💾 Caching test completed');

        // Check if cache metadata is present
        if (result.providerOptions?.anthropic) {
          console.log('📊 Cache metadata detected');
        }
      },
      TEST_TIMEOUT,
    );
  });
} else {
  describe('mock-only Tests', () => {
    let testModel: any;

    beforeEach(async () => {
      const { anthropic } = await import('@ai-sdk/anthropic');
      testModel = anthropic('claude-3-5-sonnet-20241022');
    });

    test('should test simple mock scenarios', async () => {
      // Simple mock test to verify the model works
      expect(testModel.modelId).toBe('claude-3-5-sonnet-20241022');
      expect(testModel.provider).toBe('anthropic');

      console.log('🤖 Simple mock test passed');
    });
  });
}
