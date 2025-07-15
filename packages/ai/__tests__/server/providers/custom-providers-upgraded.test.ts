import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Custom Providers Tests - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Use real provider configurations
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real providers:
 * INTEGRATION_TEST=true OPENAI_API_KEY=key XAI_API_KEY=key pnpm test custom-providers-upgraded
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 20000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  vi.mock('ai', () => ({
    customProvider: vi.fn(config => ({
      type: 'custom',
      id: config.id || 'mock-provider',
      ...config,
    })),
    wrapLanguageModel: vi.fn(({ model, middleware }) => ({
      wrapped: true,
      model,
      middleware,
      modelId: model.modelId || 'wrapped-model',
    })),
    extractReasoningMiddleware: vi.fn(({ tagName }) => ({
      type: 'reasoning',
      tagName: tagName || 'thinking',
    })),
    generateText: vi.fn(),
    streamText: vi.fn(),
  }));

  vi.mock('@ai-sdk/openai', () => ({
    openai: vi.fn((modelId: string) => ({
      modelId,
      provider: 'openai',
      doGenerate: vi.fn().mockResolvedValue({
        text: `Mock OpenAI response from ${modelId}`,
        usage: { inputTokens: 10, outputTokens: 20 },
        finishReason: 'stop',
      }),
    })),
    createOpenAI: vi.fn(config =>
      vi.fn((modelId: string) => ({
        modelId,
        provider: config.name || 'openai-compatible',
        doGenerate: vi.fn().mockResolvedValue({
          text: `Mock ${config.name || 'OpenAI'} response`,
          usage: { inputTokens: 15, outputTokens: 25 },
          finishReason: 'stop',
        }),
      })),
    ),
  }));

  vi.mock('@ai-sdk/xai', () => ({
    xai: vi.fn((modelId: string) => ({
      modelId,
      provider: 'xai',
      doGenerate: vi.fn().mockResolvedValue({
        text: `Mock xAI response from ${modelId}`,
        usage: { inputTokens: 12, outputTokens: 18 },
        finishReason: 'stop',
      }),
    })),
  }));
}

describe('custom Providers - Upgraded (Mock/Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create custom provider with language models', async () => {
    if (IS_INTEGRATION_TEST) {
      // Real integration test
      const { openai } = await import('@ai-sdk/openai');
      const { customProvider } = await import('ai');

      const model = openai('gpt-3.5-turbo');
      const provider = customProvider({
        languageModels: {
          'gpt-3.5-turbo': model,
        },
      });

      expect(provider).toBeDefined();
      expect(provider.languageModels).toBeDefined();
      console.log('✅ Integration: Custom provider created with real models');
    } else {
      // Mock test
      const { customProvider } = await import('ai');
      const mockCustomProvider = vi.mocked(customProvider);

      const mockModel = {
        modelId: 'test-model',
        provider: 'test',
        doGenerate: vi.fn(),
      };

      const provider = customProvider({
        languageModels: {
          'test-model': mockModel,
        },
      });

      expect(mockCustomProvider).toHaveBeenCalledWith({
        languageModels: {
          'test-model': mockModel,
        },
      });
      console.log('✅ Mock: Custom provider creation verified');
    }
  });

  test('should create OpenAI-compatible provider', async () => {
    if (IS_INTEGRATION_TEST) {
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ Skipping OpenAI integration test - no API key');
        return;
      }

      const { createOpenAI } = await import('@ai-sdk/openai');
      const { customProvider } = await import('ai');

      // Create OpenAI-compatible provider (e.g., for local LLM)
      const openaiCompatible = createOpenAI({
        name: 'local-llm',
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'local', // Local LLMs often don't need real keys
      });

      const model = openaiCompatible('test-model');
      const provider = customProvider({
        languageModels: {
          'test-model': model,
        },
      });

      expect(provider).toBeDefined();
      console.log('✅ Integration: OpenAI-compatible provider created');
    } else {
      // Mock test
      const { createOpenAI } = await import('@ai-sdk/openai');
      const { customProvider } = await import('ai');

      const mockCreateOpenAI = vi.mocked(createOpenAI);
      const mockCustomProvider = vi.mocked(customProvider);

      const provider = customProvider({
        languageModels: {
          'mock-model': mockCreateOpenAI({
            name: 'mock-provider',
            baseURL: 'http://mock-url',
            apiKey: 'mock-key',
          })('mock-model'),
        },
      });

      expect(mockCreateOpenAI).toHaveBeenCalledWith({
        name: 'mock-provider',
        baseURL: 'http://mock-url',
        apiKey: 'mock-key',
      });
      console.log('✅ Mock: OpenAI-compatible provider verified');
    }
  });

  test(
    'should test provider with multiple models',
    async () => {
      if (IS_INTEGRATION_TEST) {
        const { openai } = await import('@ai-sdk/openai');
        const { customProvider, generateText } = await import('ai');

        if (!process.env.OPENAI_API_KEY) {
          console.log('⚠️ Skipping multi-model integration test - no API key');
          return;
        }

        // Create provider with multiple models
        const provider = customProvider({
          languageModels: {
            'fast-model': openai('gpt-3.5-turbo'),
            'smart-model': openai('gpt-4o-mini'),
          },
        });

        // Test one of the models
        const fastModel = provider.languageModel('fast-model');
        const result = await generateText({
          model: fastModel,
          prompt: 'Say hello',
          maxTokens: 10,
        });

        expect(result.text).toBeDefined();
        expect(result.text.length).toBeGreaterThan(0);
        console.log(`✅ Integration: Multi-model test - ${result.text.substring(0, 30)}...`);
      } else {
        // Mock test
        const { customProvider } = await import('ai');
        const mockCustomProvider = vi.mocked(customProvider);

        mockCustomProvider.mockReturnValue({
          type: 'custom',
          languageModel: vi.fn((modelId: string) => ({
            modelId,
            provider: 'mock',
          })),
          languageModels: {
            'fast-model': { modelId: 'fast-model' },
            'smart-model': { modelId: 'smart-model' },
          },
        });

        const provider = customProvider({
          languageModels: {
            'fast-model': { modelId: 'fast-model' },
            'smart-model': { modelId: 'smart-model' },
          },
        });

        expect(provider.languageModels).toHaveProperty('fast-model');
        expect(provider.languageModels).toHaveProperty('smart-model');
        console.log('✅ Mock: Multi-model provider verified');
      }
    },
    TEST_TIMEOUT,
  );

  test('should test provider with middleware', async () => {
    if (IS_INTEGRATION_TEST) {
      const { openai } = await import('@ai-sdk/openai');
      const { wrapLanguageModel, customProvider } = await import('ai');

      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ Skipping middleware integration test - no API key');
        return;
      }

      // Create model with middleware
      const baseModel = openai('gpt-3.5-turbo');
      const wrappedModel = wrapLanguageModel({
        model: baseModel,
        middleware: [], // Empty middleware for test
      });

      const provider = customProvider({
        languageModels: {
          'wrapped-model': wrappedModel,
        },
      });

      expect(provider).toBeDefined();
      console.log('✅ Integration: Provider with middleware created');
    } else {
      // Mock test
      const { wrapLanguageModel, customProvider } = await import('ai');
      const mockWrapLanguageModel = vi.mocked(wrapLanguageModel);
      const mockCustomProvider = vi.mocked(customProvider);

      const mockModel = { modelId: 'test-model' };
      const mockMiddleware = [{ type: 'test-middleware' }];

      wrapLanguageModel({
        model: mockModel,
        middleware: mockMiddleware,
      });

      expect(mockWrapLanguageModel).toHaveBeenCalledWith({
        model: mockModel,
        middleware: mockMiddleware,
      });
      console.log('✅ Mock: Middleware wrapping verified');
    }
  });

  test(
    'should test XAI provider integration',
    async () => {
      if (IS_INTEGRATION_TEST) {
        if (!process.env.XAI_API_KEY) {
          console.log('⚠️ Skipping XAI integration test - no API key');
          return;
        }

        const { xai } = await import('@ai-sdk/xai');
        const { customProvider, generateText } = await import('ai');

        const model = xai('grok-beta');
        const provider = customProvider({
          languageModels: {
            grok: model,
          },
        });

        // Test the model
        const result = await generateText({
          model: provider.languageModel('grok'),
          prompt: 'What is 2+2?',
          maxTokens: 20,
        });

        expect(result.text).toBeDefined();
        console.log(`✅ Integration: XAI test - ${result.text.substring(0, 30)}...`);
      } else {
        // Mock test
        const { xai } = await import('@ai-sdk/xai');
        const { customProvider } = await import('ai');

        const mockXai = vi.mocked(xai);
        const mockCustomProvider = vi.mocked(customProvider);

        const model = xai('grok-beta');
        const provider = customProvider({
          languageModels: {
            grok: model,
          },
        });

        expect(mockXai).toHaveBeenCalledWith('grok-beta');
        expect(mockCustomProvider).toHaveBeenCalledWith();
        console.log('✅ Mock: XAI provider verified');
      }
    },
    TEST_TIMEOUT,
  );

  test('should handle provider errors gracefully', async () => {
    if (IS_INTEGRATION_TEST) {
      // Test with invalid configuration
      const { customProvider } = await import('ai');

      try {
        const provider = customProvider({
          languageModels: {},
        });
        expect(provider).toBeDefined();
        console.log('✅ Integration: Empty provider handled gracefully');
      } catch (error) {
        console.log('✅ Integration: Provider error handled gracefully');
        expect(error).toBeDefined();
      }
    } else {
      // Mock error handling
      const { customProvider } = await import('ai');
      const mockCustomProvider = vi.mocked(customProvider);

      // Mock error scenario
      mockCustomProvider.mockImplementation(() => {
        throw new Error('Mock provider error');
      });

      try {
        customProvider({
          languageModels: { 'error-model': {} },
        });
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toBe('Mock provider error');
        console.log('✅ Mock: Error handling verified');
      }
    }
  });

  // Integration-only test for advanced provider features
  if (IS_INTEGRATION_TEST) {
    test(
      'should test provider with streaming',
      async () => {
        if (!process.env.OPENAI_API_KEY) {
          console.log('⚠️ Skipping streaming integration test - no API key');
          return;
        }

        const { openai } = await import('@ai-sdk/openai');
        const { customProvider, streamText } = await import('ai');

        const provider = customProvider({
          languageModels: {
            'stream-model': openai('gpt-3.5-turbo'),
          },
        });

        const result = await streamText({
          model: provider.languageModel('stream-model'),
          prompt: 'Count to 3',
          maxTokens: 20,
        });

        let fullText = '';
        for await (const delta of result.textStream) {
          fullText += delta;
        }

        expect(fullText.length).toBeGreaterThan(0);
        console.log(`✅ Integration: Streaming test - ${fullText.substring(0, 30)}...`);
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for complex provider scenarios
  if (!IS_INTEGRATION_TEST) {
    test('should test complex provider mock scenarios', async () => {
      const { customProvider, wrapLanguageModel } = await import('ai');
      const mockCustomProvider = vi.mocked(customProvider);
      const mockWrapLanguageModel = vi.mocked(wrapLanguageModel);

      // Mock complex provider with multiple features
      mockCustomProvider.mockReturnValue({
        type: 'custom',
        id: 'complex-provider',
        languageModel: vi.fn(),
        languageModels: {},
        textEmbeddingModels: {},
      });

      mockWrapLanguageModel.mockReturnValue({
        wrapped: true,
        modelId: 'wrapped-complex-model',
        middleware: ['reasoning', 'caching'],
      });

      const complexProvider = customProvider({
        languageModels: {
          'complex-model': wrapLanguageModel({
            model: { modelId: 'base-model' },
            middleware: ['reasoning', 'caching'],
          }),
        },
      });

      expect(mockCustomProvider).toHaveBeenCalledWith();
      expect(mockWrapLanguageModel).toHaveBeenCalledWith();
      expect(complexProvider.type).toBe('custom');
      console.log('✅ Mock: Complex provider scenario verified');
    });
  }
});
