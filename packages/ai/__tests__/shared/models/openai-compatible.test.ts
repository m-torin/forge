/**
 * Tests for OpenAI compatible model utilities
 * Testing createCustomOpenAICompatibleProvider and related helpers
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createAnyscaleProvider,
  createCustomOpenAICompatibleProvider,
  createDeepInfraProvider,
  createOpenAICompatibleModel,
  createPerplexityProvider,
  createXAIProvider,
  estimateTokenCount,
  formatOpenAIMessages,
  mapOpenAICompatibleResponse,
  validateOpenAICompatibleEndpoint,
} from '#/shared/models/openai-compatible';

// Mock AI SDK OpenAI provider
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(config => (modelId: string) => ({
    modelId,
    providerId: 'openai-compatible',
    config,
    doGenerate: vi.fn(),
    doStream: vi.fn(),
  })),
}));

// Mock provider validation
vi.mock('#/shared/config/providers', () => ({
  validateOpenAICompatibleConfig: vi.fn(config => {
    if (!config.baseURL) throw new Error('Base URL required');
    if (!config.apiKey && !config.apiKeyProvider) throw new Error('API key required');
    return true;
  }),

  normalizeOpenAIConfig: vi.fn(config => ({
    ...config,
    baseURL: config.baseURL?.replace(/\/$/, ''), // Remove trailing slash
    headers: {
      'User-Agent': 'AI-Package/1.0',
      ...config.headers,
    },
    timeout: config.timeout || 30000,
  })),
}));

// Mock model metadata
vi.mock('#/shared/models/metadata', () => ({
  getOpenAICompatibleModels: vi.fn((providerId: string) => {
    const modelSets = {
      openai: [
        { id: 'gpt-4', contextWindow: 8192, maxTokens: 4096 },
        { id: 'gpt-3.5-turbo', contextWindow: 4096, maxTokens: 2048 },
      ],
      xai: [{ id: 'grok-beta', contextWindow: 131072, maxTokens: 4096, reasoningSupported: true }],
      perplexity: [
        { id: 'sonar-pro', contextWindow: 28000, maxTokens: 4000, webSearchEnabled: true },
      ],
      deepinfra: [
        { id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', contextWindow: 32768, maxTokens: 8192 },
      ],
    };
    return modelSets[providerId as keyof typeof modelSets] || [];
  }),

  inferModelCapabilities: vi.fn((modelId: string, config: any) => {
    const capabilities: any = {
      streaming: true,
      functionCalling: true,
      multimodal: false,
    };

    if (modelId.includes('gpt-4')) capabilities.multimodal = true;
    if (modelId.includes('grok') || modelId.includes('deepseek'))
      capabilities.reasoningSupported = true;
    if (config.webSearchEnabled) capabilities.webSearch = true;

    return capabilities;
  }),
}));

describe('openAI Compatible Models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCustomOpenAICompatibleProvider', () => {
    test('should create provider with basic configuration', () => {
      const config = {
        providerId: 'custom-openai',
        baseURL: 'https://api.custom.com/v1',
        apiKey: 'custom-key',
        models: ['custom-gpt-4', 'custom-gpt-3.5'],
      };

      const provider = createCustomOpenAICompatibleProvider(config);

      expect(provider).toBeDefined();
      expect(provider.providerId).toBe('custom-openai');
      expect(provider.models).toHaveProperty('custom-gpt-4');
      expect(provider.models).toHaveProperty('custom-gpt-3.5');
      expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith({
        baseURL: 'https://api.custom.com/v1',
        apiKey: 'custom-key',
        headers: expect.objectContaining({
          'User-Agent': 'AI-Package/1.0',
        }),
        timeout: 30000,
      });
    });

    test('should support environment variable API key', () => {
      process.env.CUSTOM_API_KEY = 'env-key';

      const config = {
        providerId: 'custom-env',
        baseURL: 'https://api.custom.com/v1',
        apiKeyProvider: () => process.env.CUSTOM_API_KEY,
        models: ['model-1'],
      };

      const provider = createCustomOpenAICompatibleProvider(config);

      expect(provider).toBeDefined();
      expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'env-key',
        }),
      );

      delete process.env.CUSTOM_API_KEY;
    });

    test('should support custom headers', () => {
      const config = {
        providerId: 'custom-headers',
        baseURL: 'https://api.custom.com/v1',
        apiKey: 'test-key',
        models: ['model-1'],
        headers: {
          'X-Custom-Header': 'custom-value',
          Authorization: 'Bearer override',
        },
      };

      const provider = createCustomOpenAICompatibleProvider(config);

      expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            Authorization: 'Bearer override',
            'User-Agent': 'AI-Package/1.0',
          }),
        }),
      );
    });

    test('should validate configuration', () => {
      const invalidConfig = {
        providerId: 'invalid',
        // Missing baseURL and apiKey
        models: ['model-1'],
      };

      expect(() => {
        createCustomOpenAICompatibleProvider(invalidConfig as any);
      }).toThrow('Base URL required');
    });

    test('should normalize base URL', () => {
      const config = {
        providerId: 'normalize-url',
        baseURL: 'https://api.custom.com/v1/', // With trailing slash
        apiKey: 'test-key',
        models: ['model-1'],
      };

      const provider = createCustomOpenAICompatibleProvider(config);

      expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.custom.com/v1', // Without trailing slash
        }),
      );
    });
  });

  describe('specific Provider Factories', () => {
    describe('createXAIProvider', () => {
      test('should create XAI provider with default configuration', () => {
        const provider = createXAIProvider({
          apiKey: 'xai-key',
        });

        expect(provider.providerId).toBe('xai');
        expect(provider.models).toHaveProperty('grok-beta');
        expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
          expect.objectContaining({
            baseURL: 'https://api.x.ai/v1',
            apiKey: 'xai-key',
          }),
        );
      });

      test('should support custom XAI configuration', () => {
        const provider = createXAIProvider({
          apiKey: 'xai-key',
          enableReasoning: true,
          reasoningBudget: 1024,
        });

        expect(provider.config.enableReasoning).toBeTruthy();
        expect(provider.config.reasoningBudget).toBe(1024);
      });
    });

    describe('createPerplexityProvider', () => {
      test('should create Perplexity provider with web search enabled', () => {
        const provider = createPerplexityProvider({
          apiKey: 'pplx-key',
        });

        expect(provider.providerId).toBe('perplexity');
        expect(provider.models).toHaveProperty('sonar-pro');
        expect(provider.config.webSearchEnabled).toBeTruthy();
        expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
          expect.objectContaining({
            baseURL: 'https://api.perplexity.ai',
            apiKey: 'pplx-key',
          }),
        );
      });

      test('should support web search configuration', () => {
        const provider = createPerplexityProvider({
          apiKey: 'pplx-key',
          webSearchEnabled: false,
          searchDepth: 'basic',
        });

        expect(provider.config.webSearchEnabled).toBeFalsy();
        expect(provider.config.searchDepth).toBe('basic');
      });
    });

    describe('createDeepInfraProvider', () => {
      test('should create DeepInfra provider', () => {
        const provider = createDeepInfraProvider({
          apiKey: 'deepinfra-key',
        });

        expect(provider.providerId).toBe('deepinfra');
        expect(provider.models).toHaveProperty('deepseek-ai/DeepSeek-R1-Distill-Llama-70B');
        expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
          expect.objectContaining({
            baseURL: 'https://api.deepinfra.com/v1/openai',
            apiKey: 'deepinfra-key',
          }),
        );
      });

      test('should support model selection', () => {
        const provider = createDeepInfraProvider({
          apiKey: 'deepinfra-key',
          models: ['custom-model-1', 'custom-model-2'],
        });

        expect(provider.models).toHaveProperty('custom-model-1');
        expect(provider.models).toHaveProperty('custom-model-2');
      });
    });

    describe('createAnyscaleProvider', () => {
      test('should create Anyscale provider', () => {
        const provider = createAnyscaleProvider({
          apiKey: 'anyscale-key',
        });

        expect(provider.providerId).toBe('anyscale');
        expect(vi.mocked(vi.importMock('@ai-sdk/openai')).createOpenAI).toHaveBeenCalledWith(
          expect.objectContaining({
            baseURL: 'https://api.endpoints.anyscale.com/v1',
            apiKey: 'anyscale-key',
          }),
        );
      });
    });
  });

  describe('utility Functions', () => {
    describe('validateOpenAICompatibleEndpoint', () => {
      test('should validate working endpoint', async () => {
        vi.spyOn(global, 'fetch')
          .mockImplementation()
          .mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
              data: [{ id: 'test-model' }],
            }),
          });

        const isValid = await validateOpenAICompatibleEndpoint({
          baseURL: 'https://api.test.com/v1',
          apiKey: 'test-key',
        });

        expect(isValid).toBeTruthy();
        expect(fetch).toHaveBeenCalledWith(
          'https://api.test.com/v1/models',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-key',
            }),
          }),
        );
      });

      test('should handle endpoint failure', async () => {
        vi.spyOn(global, 'fetch').mockImplementation().mockResolvedValue({
          ok: false,
          status: 401,
        });

        const isValid = await validateOpenAICompatibleEndpoint({
          baseURL: 'https://api.invalid.com/v1',
          apiKey: 'invalid-key',
        });

        expect(isValid).toBeFalsy();
      });

      test('should handle network errors', async () => {
        vi.spyOn(global, 'fetch')
          .mockImplementation()
          .mockRejectedValue(new Error('Network error'));

        const isValid = await validateOpenAICompatibleEndpoint({
          baseURL: 'https://api.unreachable.com/v1',
          apiKey: 'test-key',
        });

        expect(isValid).toBeFalsy();
      });
    });

    describe('mapOpenAICompatibleResponse', () => {
      test('should map standard OpenAI response', () => {
        const openaiResponse = {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1677652288,
          model: 'gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'Hello! How can I help you?',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 56,
            completion_tokens: 31,
            total_tokens: 87,
          },
        };

        const mapped = mapOpenAICompatibleResponse(openaiResponse);

        expect(mapped).toMatchObject({
          text: 'Hello! How can I help you?',
          usage: {
            inputTokens: 56,
            outputTokens: 31,
            totalTokens: 87,
          },
          finishReason: 'stop',
          response: {
            id: 'chatcmpl-123',
            model: 'gpt-3.5-turbo',
          },
        });
      });

      test('should handle streaming response chunks', () => {
        const streamChunk = {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1677652288,
          model: 'gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              delta: {
                content: 'Hello',
              },
              finish_reason: null,
            },
          ],
        };

        const mapped = mapOpenAICompatibleResponse(streamChunk, { streaming: true });

        expect(mapped).toMatchObject({
          type: 'text-delta',
          textDelta: 'Hello',
          finishReason: null,
        });
      });

      test('should handle tool calls', () => {
        const toolCallResponse = {
          id: 'chatcmpl-tool',
          object: 'chat.completion',
          created: 1677652288,
          model: 'gpt-4',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    id: 'call_123',
                    type: 'function',
                    function: {
                      name: 'get_weather',
                      arguments: '{"location": "San Francisco"}',
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
          usage: {
            prompt_tokens: 82,
            completion_tokens: 18,
            total_tokens: 100,
          },
        };

        const mapped = mapOpenAICompatibleResponse(toolCallResponse);

        expect(mapped).toMatchObject({
          toolCalls: [
            {
              id: 'call_123',
              type: 'function',
              function: {
                name: 'get_weather',
                arguments: { location: 'San Francisco' },
              },
            },
          ],
          finishReason: 'tool_calls',
        });
      });
    });

    describe('createOpenAICompatibleModel', () => {
      test('should create model with inferred capabilities', () => {
        const model = createOpenAICompatibleModel({
          modelId: 'gpt-4',
          baseURL: 'https://api.openai.com/v1',
          apiKey: 'test-key',
        });

        expect(model).toMatchObject({
          modelId: 'gpt-4',
          providerId: 'openai-compatible',
          capabilities: expect.objectContaining({
            streaming: true,
            functionCalling: true,
            multimodal: true,
          }),
        });
      });

      test('should override capabilities', () => {
        const model = createOpenAICompatibleModel({
          modelId: 'custom-model',
          baseURL: 'https://api.custom.com/v1',
          apiKey: 'test-key',
          capabilities: {
            streaming: false,
            functionCalling: true,
            multimodal: false,
            reasoningSupported: true,
          },
        });

        expect(model.capabilities).toMatchObject({
          streaming: false,
          functionCalling: true,
          multimodal: false,
          reasoningSupported: true,
        });
      });
    });

    describe('estimateTokenCount', () => {
      test('should estimate token count for text', () => {
        const text = 'This is a sample text with multiple words that should be tokenized.';
        const estimated = estimateTokenCount(text);

        expect(estimated).toBeGreaterThan(0);
        expect(estimated).toBeLessThan(text.length); // Should be less than character count
      });

      test('should handle empty text', () => {
        const estimated = estimateTokenCount('');
        expect(estimated).toBe(0);
      });

      test('should estimate for different languages', () => {
        const english = estimateTokenCount('Hello world');
        const chinese = estimateTokenCount('你好世界');
        const code = estimateTokenCount('function test() { return "hello"; }');

        expect(english).toBeGreaterThan(0);
        expect(chinese).toBeGreaterThan(0);
        expect(code).toBeGreaterThan(0);
      });

      test('should estimate for messages array', () => {
        const messages = [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is the weather like?' },
          { role: 'assistant', content: 'I cannot access weather data.' },
        ];

        const estimated = estimateTokenCount(messages);
        expect(estimated).toBeGreaterThan(0);
      });
    });

    describe('formatOpenAIMessages', () => {
      test('should format standard messages', () => {
        const messages = [
          { role: 'system', content: 'System prompt' },
          { role: 'user', content: 'User message' },
          { role: 'assistant', content: 'Assistant response' },
        ];

        const formatted = formatOpenAIMessages(messages);

        expect(formatted).toEqual([
          { role: 'system', content: 'System prompt' },
          { role: 'user', content: 'User message' },
          { role: 'assistant', content: 'Assistant response' },
        ]);
      });

      test('should handle multimodal messages', () => {
        const messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What is in this image?' },
              { type: 'image', url: 'data:image/jpeg;base64,/9j/4AA...' },
            ],
          },
        ];

        const formatted = formatOpenAIMessages(messages);

        expect(formatted[0]).toMatchObject({
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,/9j/4AA...' } },
          ],
        });
      });

      test('should handle tool messages', () => {
        const messages = [
          {
            role: 'assistant',
            content: null,
            tool_calls: [
              {
                id: 'call_123',
                type: 'function',
                function: { name: 'get_weather', arguments: '{"location": "SF"}' },
              },
            ],
          },
          {
            role: 'tool',
            tool_call_id: 'call_123',
            content: 'Weather: Sunny, 72°F',
          },
        ];

        const formatted = formatOpenAIMessages(messages);

        expect(formatted).toEqual(messages); // Should pass through unchanged
      });
    });
  });

  describe('error Handling', () => {
    test('should handle invalid model configuration', () => {
      expect(() => {
        createOpenAICompatibleModel({
          modelId: '',
          baseURL: '',
          apiKey: '',
        });
      }).toThrow();
    });

    test('should handle API response errors', () => {
      const errorResponse = {
        error: {
          message: 'Invalid API key',
          type: 'invalid_request_error',
          code: 'invalid_api_key',
        },
      };

      expect(() => {
        mapOpenAICompatibleResponse(errorResponse);
      }).toThrow(/Invalid API key/);
    });

    test('should handle malformed responses', () => {
      const malformedResponse = {
        // Missing required fields
        choices: null,
      };

      expect(() => {
        mapOpenAICompatibleResponse(malformedResponse as any);
      }).toThrow();
    });
  });
});
