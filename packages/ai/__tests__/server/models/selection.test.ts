import { describe, expect, test, vi } from 'vitest';

// Mock AI SDK
vi.mock('ai', () => ({
  tool: vi.fn(),
  generateText: vi.fn(),
  generateObject: vi.fn(),
  streamText: vi.fn(),
}));

describe('model Selection', () => {
  test('should import model selection successfully', async () => {
    const modelSelection = await import('../../../src/server/models/selection');
    expect(modelSelection).toBeDefined();
  });

  test('should test ModelSelector class', async () => {
    const { ModelSelector, createModelSelector } = await import('@/server/models/selection');

    // Test ModelSelector
    expect(ModelSelector).toBeDefined();
    expect(typeof ModelSelector).toBe('function');

    // Test createModelSelector
    const mockModels = [
      {
        id: 'test-model',
        name: 'Test Model',
        provider: 'test',
        category: 'chat' as const,
        capabilities: {
          textGeneration: true,
          toolCalling: false,
          streamingTools: false,
          imageInput: false,
          pdfInput: false,
          videoInput: false,
          audioInput: false,
          structuredOutput: false,
          systemPrompts: true,
          reasoningText: false,
          computerUse: false,
          embeddings: false,
          maxContextTokens: 4096,
          maxOutputTokens: 1000,
          costPerInputToken: 0.001,
          costPerOutputToken: 0.002,
        },
      },
    ];

    const selector = createModelSelector(mockModels);
    expect(selector).toBeDefined();
    expect(selector).toBeInstanceOf(ModelSelector);
  });

  test('should test model selection with criteria', async () => {
    const { ModelSelector } = await import('@/server/models/selection');

    const mockModels = [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        category: 'chat' as const,
        capabilities: {
          textGeneration: true,
          toolCalling: true,
          streamingTools: true,
          imageInput: true,
          pdfInput: false,
          videoInput: false,
          audioInput: false,
          structuredOutput: true,
          systemPrompts: true,
          reasoningText: true,
          computerUse: false,
          embeddings: false,
          maxContextTokens: 8192,
          maxOutputTokens: 4096,
          costPerInputToken: 0.03,
          costPerOutputToken: 0.06,
        },
      },
    ];

    const selector = new ModelSelector(mockModels);
    const selected = selector.selectModel({
      requiredCapabilities: ['textGeneration', 'toolCalling'],
      minContextTokens: 4000,
    });

    expect(selected).toBeDefined();
    expect(selected?.id).toBe('gpt-4');
  });

  test('should test ModelFallbackStrategy class', async () => {
    const { ModelFallbackStrategy, ModelSelector } = await import('@/server/models/selection');

    const mockModels = [
      {
        id: 'primary-model',
        name: 'Primary Model',
        provider: 'test',
        category: 'chat' as const,
        capabilities: {
          textGeneration: true,
          toolCalling: false,
          streamingTools: false,
          imageInput: false,
          pdfInput: false,
          videoInput: false,
          audioInput: false,
          structuredOutput: false,
          systemPrompts: true,
          reasoningText: false,
          computerUse: false,
          embeddings: false,
          maxContextTokens: 4096,
          maxOutputTokens: 1000,
        },
      },
    ];

    const selector = new ModelSelector(mockModels);
    const fallbackStrategy = new ModelFallbackStrategy(selector);

    expect(fallbackStrategy).toBeDefined();
    expect(fallbackStrategy).toBeInstanceOf(ModelFallbackStrategy);
  });

  test('should test model capability detection', async () => {
    const { ModelCapabilityDetection } = await import('@/server/models/selection');

    expect(ModelCapabilityDetection).toBeDefined();
    expect(typeof ModelCapabilityDetection.getRequiredCapabilities).toBe('function');
    expect(typeof ModelCapabilityDetection.validateCapabilities).toBe('function');

    // Test getRequiredCapabilities
    const requiredCaps = ModelCapabilityDetection.getRequiredCapabilities({
      hasImages: true,
      needsTools: true,
      needsReasoning: true,
    });
    expect(requiredCaps).toContain('textGeneration');
    expect(requiredCaps).toContain('imageInput');
    expect(requiredCaps).toContain('toolCalling');
    expect(requiredCaps).toContain('reasoning');
  });

  test('should test model selector methods', async () => {
    const { ModelSelector } = await import('@/server/models/selection');

    const mockModels = [
      {
        id: 'vision-model',
        name: 'Vision Model',
        provider: 'test',
        category: 'vision' as const,
        capabilities: {
          textGeneration: true,
          toolCalling: false,
          streamingTools: false,
          imageInput: true,
          pdfInput: false,
          videoInput: false,
          audioInput: false,
          structuredOutput: false,
          systemPrompts: true,
          reasoningText: false,
          computerUse: false,
          embeddings: false,
          maxContextTokens: 4096,
          maxOutputTokens: 1000,
          costPerInputToken: 0.001,
          costPerOutputToken: 0.002,
        },
      },
    ];

    const selector = new ModelSelector(mockModels);

    // Test getModelsByCapability
    const visionModels = selector.getModelsByCapability('imageInput');
    expect(visionModels).toHaveLength(1);
    expect(visionModels[0].id).toBe('vision-model');

    // Test getFallbackChain
    const fallbackChain = selector.getFallbackChain('vision-model');
    expect(fallbackChain).toBeDefined();
    expect(Array.isArray(fallbackChain)).toBeTruthy();

    // Test estimateCost
    const cost = selector.estimateCost('vision-model', 1000, 500);
    expect(cost).toBeDefined();
    expect(cost?.inputCost).toBe(0.001);
    expect(cost?.outputCost).toBe(0.001);
    expect(cost?.totalCost).toBe(0.002);
  });

  test('should test capability validation', async () => {
    const { ModelCapabilityDetection } = await import('@/server/models/selection');

    const mockModel = {
      id: 'test-model',
      name: 'Test Model',
      provider: 'test',
      category: 'chat' as const,
      capabilities: {
        textGeneration: true,
        toolCalling: false,
        streamingTools: false,
        imageInput: false,
        pdfInput: false,
        videoInput: false,
        audioInput: false,
        structuredOutput: false,
        systemPrompts: true,
        reasoningText: false,
        computerUse: false,
        embeddings: false,
        maxContextTokens: 4096,
        maxOutputTokens: 1000,
      },
    };

    const validation = ModelCapabilityDetection.validateCapabilities(mockModel, [
      'textGeneration',
      'toolCalling',
    ]);
    expect(validation.valid).toBeFalsy();
    expect(validation.missing).toContain('toolCalling');
  });
});
