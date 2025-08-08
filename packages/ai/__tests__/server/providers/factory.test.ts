/**
 * Tests for provider factory functions
 * Testing createOpenAICompatibleProvider, applyReasoningConfig, and related functions
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  applyReasoningConfig,
  createCustomSDKProvider,
  createOpenAICompatibleProvider,
  createPerplexityProvider,
  validateProviderConfig,
} from '#/server/providers/factory';
import { defaultSettingsMiddleware, wrapLanguageModel } from 'ai';

// Mock AI SDK functions
vi.mock('ai', () => ({
  customProvider: vi.fn((id, options) => (modelId: string) => ({
    modelId,
    providerId: id,
    ...options,
  })),
  defaultSettingsMiddleware: vi.fn(settings => ({
    middleware: 'defaultSettings',
    settings,
  })),
  wrapLanguageModel: vi.fn(({ model, middleware }) => ({
    ...model,
    wrapped: true,
    middleware,
  })),
}));

// Mock OpenAI SDK
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(config => (modelId: string) => ({
    modelId,
    provider: 'openai-compatible',
    config,
  })),
}));

// Mock model registry
vi.mock('#/shared/models', () => ({
  getModelsByProvider: vi.fn((providerId: string) => {
    const modelMocks = {
      openai: [
        {
          id: 'gpt-4',
          actualModelId: 'gpt-4',
          provider: 'openai',
          metadata: {
            reasoningText: { supported: false },
            contextWindow: 8192,
          },
        },
      ],
      xai: [
        {
          id: 'grok-reasoning',
          actualModelId: 'grok-beta',
          provider: 'xai',
          metadata: {
            reasoningText: { supported: true, budgetTokens: 512 },
            contextWindow: 131072,
          },
        },
      ],
      anthropic: [
        {
          id: 'claude-reasoning',
          actualModelId: 'claude-3-5-sonnet-20241022',
          provider: 'anthropic',
          metadata: {
            reasoningText: { supported: true, budgetTokens: 1024 },
            contextWindow: 200000,
          },
        },
      ],
    };
    return modelMocks[providerId] || [];
  }),
}));

// Mock provider configs
vi.mock('#/shared/config/providers', () => ({
  getProviderConfig: vi.fn((providerId: string) => ({
    apiKey: `mock-${providerId}-key`,
    baseURL: `https://api.${providerId}.com`,
    defaultModel: 'default-model',
  })),
}));

describe('provider Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOpenAICompatibleProvider', () => {
    test('should create provider with basic configuration', () => {
      const result = createOpenAICompatibleProvider('openai', {
        apiKey: 'test-key',
        baseURL: 'https://api.openai.com/v1',
      });

      expect(result).toBeDefined();
      expect(result.models).toBeDefined();
      expect(result.providerId).toBe('openai');
      expect(result.models['gpt-4']).toBeDefined();
    });

    test('should apply reasoning configuration for supported models', () => {
      const result = createOpenAICompatibleProvider('xai', {
        apiKey: 'test-key',
      });

      expect(result.models['grok-reasoning']).toBeDefined();
      expect(wrapLanguageModel).toHaveBeenCalledWith();
      expect(defaultSettingsMiddleware).toHaveBeenCalledWith();
    });

    test('should handle provider without reasoning support', () => {
      const result = createOpenAICompatibleProvider('openai', {
        apiKey: 'test-key',
      });

      expect(result.models['gpt-4']).toBeDefined();
      // Should still work but without reasoning wrapping
      expect(result.models['gpt-4'].wrapped).toBeFalsy();
    });

    test('should validate required configuration', () => {
      expect(() => {
        createOpenAICompatibleProvider('openai', {} as any);
      }).toThrow(/apiKey.*required/i);
    });
  });

  describe('createCustomSDKProvider', () => {
    test('should create custom provider with factory function', () => {
      const mockFactory = vi.fn((modelId: string) => ({
        modelId,
        custom: true,
      }));

      const result = createCustomSDKProvider('custom', {
        factory: mockFactory,
        models: ['model1', 'model2'],
      });

      expect(result).toBeDefined();
      expect(result.providerId).toBe('custom');
      expect(result.models['model1']).toBeDefined();
      expect(result.models['model2']).toBeDefined();
      expect(mockFactory).toHaveBeenCalledWith('model1');
      expect(mockFactory).toHaveBeenCalledWith('model2');
    });

    test('should apply custom middleware', () => {
      const mockFactory = vi.fn((modelId: string) => ({ modelId }));
      const mockMiddleware = vi.fn(model => ({ ...model, customMiddleware: true }));

      const result = createCustomSDKProvider('custom', {
        factory: mockFactory,
        models: ['test-model'],
        middleware: mockMiddleware,
      });

      expect(result.models['test-model']).toBeDefined();
      expect(wrapLanguageModel).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(Object),
          middleware: mockMiddleware,
        }),
      );
    });
  });

  describe('createPerplexityProvider', () => {
    test('should create Perplexity provider with web search capabilities', () => {
      const result = createPerplexityProvider({
        apiKey: 'test-perplexity-key',
      });

      expect(result).toBeDefined();
      expect(result.providerId).toBe('perplexity');
      expect(result.webSearchEnabled).toBeTruthy();
    });

    test('should configure Perplexity-specific settings', () => {
      const result = createPerplexityProvider({
        apiKey: 'test-key',
        enableWebSearch: false,
        searchDepth: 'basic',
      });

      expect(result.webSearchEnabled).toBeFalsy();
      expect(result.config.searchDepth).toBe('basic');
    });
  });

  describe('validateProviderConfig', () => {
    test('should validate OpenAI compatible config', () => {
      const validConfig = {
        type: 'openai-compatible' as const,
        apiKey: 'test-key',
        baseURL: 'https://api.test.com/v1',
      };

      expect(() => validateProviderConfig(validConfig)).not.toThrow();
    });

    test('should reject invalid config', () => {
      const invalidConfig = {
        type: 'openai-compatible' as const,
        // Missing required apiKey
      };

      expect(() => validateProviderConfig(invalidConfig)).toThrow(/apiKey.*required/i);
    });

    test('should validate custom provider config', () => {
      const validConfig = {
        type: 'custom' as const,
        factory: vi.fn(),
        models: ['model1'],
      };

      expect(() => validateProviderConfig(validConfig)).not.toThrow();
    });

    test('should validate Perplexity config', () => {
      const validConfig = {
        type: 'perplexity' as const,
        apiKey: 'test-key',
      };

      expect(() => validateProviderConfig(validConfig)).not.toThrow();
    });
  });

  describe('applyReasoningConfig', () => {
    test('should wrap models with reasoning support', () => {
      const mockModel = { modelId: 'test-model' };
      const options = {
        model: mockModel,
        reasoningConfig: {
          enabled: true,
          budgetTokens: 512,
          debugMode: false,
        },
      };

      const result = applyReasoningConfig(options);

      expect(wrapLanguageModel).toHaveBeenCalledWith({
        model: mockModel,
        middleware: expect.any(Object),
      });
      expect(result.wrapped).toBeTruthy();
    });

    test('should configure reasoning budget tokens', () => {
      const mockModel = { modelId: 'reasoning-model' };
      const options = {
        model: mockModel,
        reasoningConfig: {
          enabled: true,
          budgetTokens: 1024,
          debugMode: true,
        },
      };

      applyReasoningConfig(options);

      expect(defaultSettingsMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          experimental_reasoningBudgetTokens: 1024,
        }),
      );
    });

    test('should handle disabled reasoning', () => {
      const mockModel = { modelId: 'non-reasoning-model' };
      const options = {
        model: mockModel,
        reasoningConfig: {
          enabled: false,
        },
      };

      const result = applyReasoningConfig(options);

      // Should return original model without wrapping
      expect(result).toBe(mockModel);
      expect(wrapLanguageModel).not.toHaveBeenCalled();
    });

    test('should apply debug settings when enabled', () => {
      const mockModel = { modelId: 'debug-model' };
      const options = {
        model: mockModel,
        reasoningConfig: {
          enabled: true,
          debugMode: true,
          logReasoningTrace: true,
        },
      };

      applyReasoningConfig(options);

      expect(defaultSettingsMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          experimental_reasoningDebug: true,
          experimental_logReasoningTrace: true,
        }),
      );
    });
  });

  describe('error Handling', () => {
    test('should handle factory creation errors gracefully', () => {
      const errorFactory = vi.fn(() => {
        throw new Error('Factory creation failed');
      });

      expect(() => {
        createCustomSDKProvider('error-provider', {
          factory: errorFactory,
          models: ['test-model'],
        });
      }).toThrow('Factory creation failed');
    });

    test('should validate model metadata requirements', () => {
      // Mock a model without required metadata
      vi.mocked(vi.importMock('#/shared/models')).getModelsByProvider.mockReturnValue([
        {
          id: 'incomplete-model',
          actualModelId: 'incomplete',
          provider: 'test',
          // Missing metadata
        },
      ] as any);

      const result = createOpenAICompatibleProvider('test', { apiKey: 'key' });

      // Should handle missing metadata gracefully
      expect(result.models['incomplete-model']).toBeDefined();
    });
  });

  describe('integration Tests', () => {
    test('should create fully functional provider with all features', () => {
      const result = createOpenAICompatibleProvider('anthropic', {
        apiKey: 'test-key',
        baseURL: 'https://api.anthropic.com',
        enableReasoning: true,
        debugMode: false,
      });

      expect(result).toMatchObject({
        providerId: 'anthropic',
        models: expect.objectContaining({
          'claude-reasoning': expect.any(Object),
        }),
        config: expect.objectContaining({
          apiKey: 'test-key',
          baseURL: 'https://api.anthropic.com',
        }),
      });

      // Should have applied reasoning configuration
      expect(wrapLanguageModel).toHaveBeenCalledWith();
      expect(defaultSettingsMiddleware).toHaveBeenCalledWith();
    });
  });
});
