import { myProvider } from '#/lib/ai/providers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock environment variables
const mockEnv = {
  XAI_API_KEY: 'test-xai-key',
  OPENAI_API_KEY: 'test-openai-key',
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  GOOGLE_AI_API_KEY: 'test-google-key',
  PERPLEXITY_API_KEY: 'test-perplexity-key',
};

describe('aI Provider Registry', () => {
  beforeEach(() => {
    // Clear all environment variables before each test
    vi.unstubAllEnvs();
  });

  describe('languageModel', () => {
    test('should return xAI model for chat-model', () => {
      vi.stubEnv('XAI_API_KEY', mockEnv.XAI_API_KEY);

      const model = myProvider.languageModel('chat-model');
      expect(model).toBeDefined();
    });

    test('should return OpenAI model for gpt-4o', () => {
      vi.stubEnv('OPENAI_API_KEY', mockEnv.OPENAI_API_KEY);

      const model = myProvider.languageModel('gpt-4o');
      expect(model).toBeDefined();
    });

    test('should return Anthropic model for claude-sonnet', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', mockEnv.ANTHROPIC_API_KEY);

      const model = myProvider.languageModel('claude-sonnet');
      expect(model).toBeDefined();
    });

    test('should return Google model for gemini-pro', () => {
      vi.stubEnv('GOOGLE_AI_API_KEY', mockEnv.GOOGLE_AI_API_KEY);

      const model = myProvider.languageModel('gemini-pro');
      expect(model).toBeDefined();
    });

    test('should return Perplexity model for perplexity-sonar', () => {
      vi.stubEnv('PERPLEXITY_API_KEY', mockEnv.PERPLEXITY_API_KEY);

      const model = myProvider.languageModel('perplexity-sonar');
      expect(model).toBeDefined();
    });

    test('should fallback to original modelId if not in map', () => {
      const model = myProvider.languageModel('unknown-model');
      expect(model).toBeDefined();
    });
  });

  describe('imageModel', () => {
    test('should return xAI image model for small-model', () => {
      vi.stubEnv('XAI_API_KEY', mockEnv.XAI_API_KEY);

      const model = myProvider.imageModel('small-model');
      expect(model).toBeDefined();
    });

    test('should fallback to original modelId if not in map', () => {
      const model = myProvider.imageModel('unknown-image-model');
      expect(model).toBeDefined();
    });
  });

  describe('getAvailableModels', () => {
    test('should return xAI models when XAI_API_KEY is available', () => {
      vi.stubEnv('XAI_API_KEY', mockEnv.XAI_API_KEY);

      const models = myProvider.getAvailableModels();
      const xaiModels = models.filter(m => m.provider === 'xAI');

      expect(xaiModels).toHaveLength(4);
      expect(xaiModels[0].id).toBe('chat-model');
      expect(xaiModels[0].name).toBe('Grok Vision');
    });

    test('should return OpenAI models when OPENAI_API_KEY is available', () => {
      vi.stubEnv('OPENAI_API_KEY', mockEnv.OPENAI_API_KEY);

      const models = myProvider.getAvailableModels();
      const openaiModels = models.filter(m => m.provider === 'OpenAI');

      expect(openaiModels).toHaveLength(3);
      expect(openaiModels[0].id).toBe('gpt-4o');
      expect(openaiModels[0].name).toBe('GPT-4o');
    });

    test('should return Anthropic models when ANTHROPIC_API_KEY is available', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', mockEnv.ANTHROPIC_API_KEY);

      const models = myProvider.getAvailableModels();
      const anthropicModels = models.filter(m => m.provider === 'Anthropic');

      expect(anthropicModels).toHaveLength(3);
      expect(anthropicModels[0].id).toBe('claude-sonnet');
      expect(anthropicModels[0].name).toBe('Claude Sonnet');
    });

    test('should return Google models when GOOGLE_AI_API_KEY is available', () => {
      vi.stubEnv('GOOGLE_AI_API_KEY', mockEnv.GOOGLE_AI_API_KEY);

      const models = myProvider.getAvailableModels();
      const googleModels = models.filter(m => m.provider === 'Google');

      expect(googleModels).toHaveLength(2);
      expect(googleModels[0].id).toBe('gemini-pro');
      expect(googleModels[0].name).toBe('Gemini Pro');
    });

    test('should return Perplexity models when PERPLEXITY_API_KEY is available', () => {
      vi.stubEnv('PERPLEXITY_API_KEY', mockEnv.PERPLEXITY_API_KEY);

      const models = myProvider.getAvailableModels();
      const perplexityModels = models.filter(m => m.provider === 'Perplexity');

      expect(perplexityModels).toHaveLength(2);
      expect(perplexityModels[0].id).toBe('perplexity-sonar');
      expect(perplexityModels[0].name).toBe('Perplexity Sonar');
    });

    test('should return empty array when no API keys are available', () => {
      const models = myProvider.getAvailableModels();
      expect(models).toHaveLength(0);
    });

    test('should return models from multiple providers when multiple API keys are available', () => {
      vi.stubEnv('XAI_API_KEY', mockEnv.XAI_API_KEY);
      vi.stubEnv('OPENAI_API_KEY', mockEnv.OPENAI_API_KEY);

      const models = myProvider.getAvailableModels();
      const xaiModels = models.filter(m => m.provider === 'xAI');
      const openaiModels = models.filter(m => m.provider === 'OpenAI');

      expect(xaiModels).toHaveLength(4);
      expect(openaiModels).toHaveLength(3);
      expect(models).toHaveLength(7);
    });
  });

  describe('getDefaultModel', () => {
    test('should return chat-model when XAI_API_KEY is available', () => {
      vi.stubEnv('XAI_API_KEY', mockEnv.XAI_API_KEY);

      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('chat-model');
    });

    test('should return gpt-4o when only OPENAI_API_KEY is available', () => {
      vi.stubEnv('OPENAI_API_KEY', mockEnv.OPENAI_API_KEY);

      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('gpt-4o');
    });

    test('should return claude-sonnet when only ANTHROPIC_API_KEY is available', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', mockEnv.ANTHROPIC_API_KEY);

      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('claude-sonnet');
    });

    test('should return gemini-pro when only GOOGLE_AI_API_KEY is available', () => {
      vi.stubEnv('GOOGLE_AI_API_KEY', mockEnv.GOOGLE_AI_API_KEY);

      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('gemini-pro');
    });

    test('should return perplexity-sonar when only PERPLEXITY_API_KEY is available', () => {
      vi.stubEnv('PERPLEXITY_API_KEY', mockEnv.PERPLEXITY_API_KEY);

      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('perplexity-sonar');
    });

    test('should follow priority order when multiple API keys are available', () => {
      vi.stubEnv('OPENAI_API_KEY', mockEnv.OPENAI_API_KEY);
      vi.stubEnv('ANTHROPIC_API_KEY', mockEnv.ANTHROPIC_API_KEY);
      vi.stubEnv('GOOGLE_AI_API_KEY', mockEnv.GOOGLE_AI_API_KEY);

      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('gpt-4o'); // OpenAI has higher priority than Anthropic
    });

    test('should return chat-model as fallback when no API keys are available', () => {
      const defaultModel = myProvider.getDefaultModel();
      expect(defaultModel).toBe('chat-model');
    });
  });
});
