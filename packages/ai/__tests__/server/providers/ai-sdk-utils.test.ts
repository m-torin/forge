import { beforeEach, describe, expect, vi } from 'vitest';

// CRITICAL: Mock AI SDK providers BEFORE any imports that use them
// This prevents real API calls from being made during tests

// Mock all AI SDK providers to prevent real API calls
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn((modelName: string = 'claude-3-5-sonnet-20241022') => ({
    modelId: modelName,
    doGenerate: vi.fn().mockResolvedValue({
      text: 'Mock generated text',
      usage: { inputTokens: 10, outputTokens: 20 },
      finishReason: 'stop',
    }),
  })),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn((modelName: string = 'gpt-4') => ({
    modelId: modelName,
    doGenerate: vi.fn().mockResolvedValue({
      text: 'Mock generated text',
      usage: { inputTokens: 10, outputTokens: 20 },
      finishReason: 'stop',
    }),
  })),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelName: string = 'gemini-1.5-pro', options?: any) => ({
    modelId: modelName,
    doGenerate: vi.fn().mockResolvedValue({
      text: 'Mock generated text',
      usage: { inputTokens: 10, outputTokens: 20 },
      finishReason: 'stop',
    }),
  })),
}));

vi.mock('@ai-sdk/perplexity', () => ({
  perplexity: vi.fn((modelName: string = 'sonar-pro') => ({
    modelId: modelName,
    doGenerate: vi.fn().mockResolvedValue({
      text: 'Mock generated text',
      usage: { inputTokens: 10, outputTokens: 20 },
      finishReason: 'stop',
    }),
  })),
}));

vi.mock('@ai-sdk/deepinfra', () => ({
  deepinfra: vi.fn((modelName: string = 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B') => ({
    modelId: modelName,
    doGenerate: vi.fn().mockResolvedValue({
      text: 'Mock generated text',
      usage: { inputTokens: 10, outputTokens: 20 },
      finishReason: 'stop',
    }),
  })),
}));

// Mock core AI functions to prevent real API calls
vi.mock('ai', () => ({
  generateText: vi.fn(async (options: any) => ({
    text: 'Mock generated text',
    usage: { inputTokens: 10, outputTokens: 20 },
    finishReason: 'stop',
  })),
  generateObject: vi.fn(async (options: any) => ({
    object: { key: 'value' },
    usage: { inputTokens: 10, outputTokens: 20 },
    finishReason: 'stop',
  })),
  streamText: vi.fn(async (options: any) => ({
    textStream: {
      [Symbol.asyncIterator]: async function* () {
        yield 'Mock ';
        yield 'streamed ';
        yield 'text';
      },
    },
    text: 'Mock streamed text',
    usage: { inputTokens: 10, outputTokens: 20 },
    finishReason: 'stop',
  })),
  // Export types that might be used
  CoreMessage: vi.fn(),
}));

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

describe('aI SDK Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should import AI SDK utils successfully', async () => {
    const aiSDKUtils = await import('#/server/providers/ai-sdk-utils');
    expect(aiSDKUtils).toBeDefined();
  });

  test('should test model creation functions', async () => {
    const {
      createAnthropicModel,
      createOpenAIModel,
      createGoogleModel,
      createPerplexityModel,
      createDeepInfraModel,
      createModel,
      createModels,
    } = await import('#/server/providers/ai-sdk-utils');

    // Test individual model creators
    const anthropicModel = createAnthropicModel();
    expect(anthropicModel).toBeDefined();
    expect(anthropicModel.modelId).toBe('claude-3-5-sonnet-20241022');

    const openaiModel = createOpenAIModel();
    expect(openaiModel).toBeDefined();
    expect(openaiModel.modelId).toBe('gpt-4');

    const googleModel = createGoogleModel();
    expect(googleModel).toBeDefined();
    expect(googleModel.modelId).toBe('gemini-1.5-pro');

    const perplexityModel = createPerplexityModel();
    expect(perplexityModel).toBeDefined();
    expect(perplexityModel.modelId).toBe('sonar-pro');

    const deepinfraModel = createDeepInfraModel();
    expect(deepinfraModel).toBeDefined();
    expect(deepinfraModel.modelId).toBe('deepseek-ai/DeepSeek-R1-Distill-Llama-70B');

    // Test generic model creator
    const genericModel = createModel('anthropic');
    expect(genericModel).toBeDefined();

    // Test batch model creation
    const models = createModels({
      anthropic: { model: 'claude-3-5-sonnet-20241022' },
      openai: { model: 'gpt-4o' },
    });
    expect(models.anthropic).toBeDefined();
    expect(models.openai).toBeDefined();
  });

  test('should test enhanced generation functions', async () => {
    const {
      enhancedGenerateText,
      enhancedStreamText,
      enhancedGenerateObject,
      createAnthropicModel,
    } = await import('#/server/providers/ai-sdk-utils');

    // Use a properly mocked model from our provider functions
    const mockModel = createAnthropicModel();
    const mockOptions = {
      model: mockModel,
      prompt: 'Test prompt',
      maxOutputTokens: 100,
      temperature: 0.7,
    };

    // Test enhanced generate text
    const textResult = await enhancedGenerateText(mockOptions);
    expect(textResult).toBeDefined();
    expect(textResult.text).toBe('Mock generated text');

    // Test enhanced stream text
    const streamResult = await enhancedStreamText(mockOptions);
    expect(streamResult).toBeDefined();

    // Test enhanced generate object
    const objectResult = await enhancedGenerateObject({
      ...mockOptions,
      schema: { type: 'object', properties: {} },
    });
    expect(objectResult).toBeDefined();
  });

  test('should test utility functions', async () => {
    const { formatProviderError, validateGenerateOptions, createAnthropicModel } = await import(
      '#/server/providers/ai-sdk-utils'
    );

    // Test error formatting
    const error = new Error('Test error');
    const formattedError = formatProviderError(error, 'test-provider', 'test-context');
    expect(formattedError).toBeInstanceOf(Error);
    expect(formattedError.message).toContain('[test-provider]');
    expect(formattedError.message).toContain('test-context');

    // Test option validation - valid options
    const testModel = createAnthropicModel();
    const validOptions = {
      model: testModel,
      prompt: 'Test prompt',
    };
    expect(() => validateGenerateOptions(validOptions)).not.toThrow();

    // Test option validation - invalid options
    const invalidOptions = {
      model: testModel,
      // Missing prompt and messages
    };
    expect(() => validateGenerateOptions(invalidOptions)).toThrow(
      'Either prompt or messages must be provided',
    );
  });

  test('should test web search functions', async () => {
    const {
      createWebSearchPerplexityModel,
      createWebSearchGoogleModel,
      webSearchWithPerplexity,
      webSearchWithGemini,
    } = await import('#/server/providers/ai-sdk-utils');

    // Test web search model creators
    const perplexityWebModel = createWebSearchPerplexityModel();
    expect(perplexityWebModel).toBeDefined();
    expect(perplexityWebModel.modelId).toBe('sonar-pro');

    const googleWebModel = createWebSearchGoogleModel();
    expect(googleWebModel).toBeDefined();
    expect(googleWebModel.modelId).toBe('gemini-1.5-pro');

    // Test web search functions
    const perplexityResult = await webSearchWithPerplexity('Test search query');
    expect(perplexityResult).toBeDefined();
    expect(perplexityResult.text).toBe('Mock generated text');

    const geminiResult = await webSearchWithGemini('Test search query');
    expect(geminiResult).toBeDefined();
    expect(geminiResult.text).toBe('Mock generated text');
  });

  test('should test configuration interfaces', async () => {
    const utils = await import('#/server/providers/ai-sdk-utils');

    // Test that interfaces are properly exported by checking function parameters
    const config = {
      model: 'test-model',
      temperature: 0.5,
      maxOutputTokens: 100,
    };

    const anthropicModel = utils.createAnthropicModel(config);
    expect(anthropicModel).toBeDefined();
  });

  test('should handle provider errors gracefully', async () => {
    const { createModel } = await import('#/server/providers/ai-sdk-utils');

    // Test unsupported provider
    expect(() => createModel('unsupported-provider')).toThrow('Unsupported provider');
  });
});
