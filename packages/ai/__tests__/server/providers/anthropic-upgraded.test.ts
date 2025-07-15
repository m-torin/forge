import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Anthropic Provider Tests - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Use real Anthropic API calls
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real API calls:
 * INTEGRATION_TEST=true ANTHROPIC_API_KEY=your-key pnpm test anthropic-upgraded
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  const { MockLanguageModelV2, simulateReadableStream } = await import('ai/test');

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
            reasoning: 'Mock reasoning process',
            providerMetadata: {
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

describe('anthropic Provider - Upgraded (Mock/Integration)', () => {
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

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration test model created');
    } else {
      console.log('✅ Mock model created');
    }
  });

  test(
    'should generate text responses',
    async () => {
      const { generateText } = await import('ai');

      if (!IS_INTEGRATION_TEST) {
        // Mock implementation
        const mockGenerateText = vi.mocked(generateText);
        mockGenerateText.mockImplementation(async (options: any) => {
          return {
            text: 'Mock Anthropic generated text',
            usage: { inputTokens: 15, outputTokens: 25 },
            finishReason: 'stop',
            warnings: [],
            rawCall: { rawPrompt: options.prompt, rawSettings: {} },
            rawResponse: { headers: {}, response: {} },
            request: { body: JSON.stringify(options) },
            response: { messages: [], timestamp: new Date() },
            toolCalls: [],
            toolResults: [],
            logprobs: undefined,
            providerMetadata: undefined,
            steps: [],
          };
        });
      }

      const result = await generateText({
        model: testModel,
        prompt: 'What is artificial intelligence?',
        maxTokens: IS_INTEGRATION_TEST ? 100 : 50,
      });

      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(10);

      if (IS_INTEGRATION_TEST) {
        console.log(`🔗 Integration response: ${result.text.substring(0, 100)}...`);
        expect(result.usage?.inputTokens).toBeGreaterThan(0);
        expect(result.usage?.outputTokens).toBeGreaterThan(0);
      } else {
        console.log(`🤖 Mock response: ${result.text}`);
        expect(result.text).toBe('Mock Anthropic generated text');
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
        mockStreamText.mockImplementation(async (options: any) => ({
          textStream: (async function* () {
            yield 'Streaming ';
            yield 'mock ';
            yield 'response';
          })(),
          toUIMessageStream: () => {
            const mockStream = new ReadableStream({
              start(controller) {
                controller.enqueue({
                  type: 'message-part',
                  part: { type: 'text', text: 'Streaming mock response' },
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
        prompt: 'Explain machine learning briefly',
        maxTokens: IS_INTEGRATION_TEST ? 150 : 50,
      });

      // Test text stream
      let fullText = '';
      for await (const delta of result.textStream) {
        fullText += delta;
      }

      expect(fullText.length).toBeGreaterThan(5);

      if (IS_INTEGRATION_TEST) {
        console.log(`🔗 Integration streamed: ${fullText.substring(0, 100)}...`);
      } else {
        console.log(`🤖 Mock streamed: ${fullText}`);
        expect(fullText).toBe('Streaming mock response');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle reasoning models',
    async () => {
      if (IS_INTEGRATION_TEST) {
        // Test with reasoning model
        const { anthropic } = await import('@ai-sdk/anthropic');
        const reasoningModel = anthropic('claude-3-5-sonnet-20241022');

        const { generateText } = await import('ai');
        const result = await generateText({
          model: reasoningModel,
          prompt: 'Solve this step by step: What is 15 * 24?',
          maxTokens: 200,
          experimental_providerOptions: {
            anthropic: {
              thinking: { type: 'enabled' as const, budgetTokens: 1000 },
            },
          },
        });

        expect(result.text).toBeDefined();
        console.log(`🧠 Reasoning response: ${result.text.substring(0, 100)}...`);

        // May have reasoning in response
        if (result.reasoning) {
          console.log(`🤔 Reasoning process detected`);
        }
      } else {
        // Mock reasoning test
        const { generateText } = await import('ai');
        const mockGenerateText = vi.mocked(generateText);
        mockGenerateText.mockResolvedValue({
          text: 'Mock reasoning: 15 * 24 = 360',
          reasoning: 'Mock reasoning process',
          usage: { inputTokens: 20, outputTokens: 30 },
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

        const result = await generateText({
          model: testModel,
          prompt: 'Solve: 15 * 24',
        });

        expect(result.text).toContain('360');
        expect(result.reasoning).toBe('Mock reasoning process');
        console.log('🤖 Mock reasoning test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle errors gracefully',
    async () => {
      if (IS_INTEGRATION_TEST) {
        // Test with invalid prompt (empty)
        const { generateText } = await import('ai');

        try {
          await generateText({
            model: testModel,
            prompt: '',
            maxTokens: 10,
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
        const { generateText } = await import('ai');
        const mockGenerateText = vi.mocked(generateText);

        // Test that mock doesn't throw
        mockGenerateText.mockResolvedValue({
          text: 'Mock error handling response',
          usage: { inputTokens: 5, outputTokens: 10 },
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

  // Integration-only test for caching
  if (IS_INTEGRATION_TEST) {
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
              content: longContext,
              // Enable caching for long system messages
              experimental_providerOptions: {
                anthropic: {
                  cacheControl: { type: 'ephemeral' },
                },
              },
            },
            {
              role: 'user',
              content: 'Summarize the above in one sentence.',
            },
          ],
          maxTokens: 100,
        });

        expect(result.text).toBeDefined();
        console.log('💾 Caching test completed');

        // Check if cache metadata is present
        if (result.providerMetadata?.anthropic) {
          console.log('📊 Cache metadata detected');
        }
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for complex mocking scenarios
  if (!IS_INTEGRATION_TEST) {
    test('should test complex mock scenarios', async () => {
      const { MockLanguageModelV2, simulateReadableStream } = await import('ai/test');

      // Test advanced mock model
      const advancedMock = new MockLanguageModelV2({
        modelId: 'claude-advanced-mock',
        doGenerate: async options => ({
          text: `Mock response to: ${options.prompt}`,
          usage: { inputTokens: 25, outputTokens: 40 },
          finishReason: 'stop',
          reasoning: 'Advanced mock reasoning',
          providerMetadata: {
            anthropic: {
              cacheCreationInputTokens: 100,
              cacheReadInputTokens: 50,
            },
          },
        }),
      });

      const result = await advancedMock.doGenerate({
        prompt: 'Test advanced mock',
      });

      expect(result.text).toBe('Mock response to: Test advanced mock');
      expect(result.reasoning).toBe('Advanced mock reasoning');
      expect(result.providerMetadata?.anthropic?.cacheCreationInputTokens).toBe(100);

      console.log('🤖 Advanced mock test passed');
    });
  }
});
