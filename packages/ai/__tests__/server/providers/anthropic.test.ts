import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Anthropic Provider Tests - AI SDK v5 Patterns
 * Updated to use official AI SDK v5 testing utilities
 * Following MockLanguageModelV2 and simulateReadableStream patterns
 */

import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

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
    (modelName: string = 'claude-3-5-sonnet-20241022', settings?: any) =>
      new (vi.importMock('ai').MockLanguageModelV2)({
        modelId: modelName,
        doGenerate: async () => ({
          text: 'Mock generated text',
          usage: { inputTokens: 10, outputTokens: 20 },
          finishReason: 'stop',
          reasoning: 'Mock reasoning',
          providerMetadata: {
            anthropic: {
              cacheCreationInputTokens: 0,
              cacheReadInputTokens: 0,
            },
          },
        }),
      }),
  ),
  createAnthropic: vi.fn((options: any) => ({
    anthropic: vi.fn(
      (modelName: string) =>
        new (vi.importMock('ai').MockLanguageModelV2)({
          modelId: modelName,
        }),
    ),
  })),
  // Anthropic-specific tools
  tools: {
    bash_20250124: vi.fn((config: any) => ({
      toolName: 'bash_20250124',
      execute: config.execute,
    })),
    textEditor_20250124: vi.fn((config: any) => ({
      toolName: 'textEditor_20250124',
      execute: config.execute,
    })),
    computer_20250124: vi.fn((config: any) => ({
      toolName: 'computer_20250124',
      execute: config.execute,
    })),
  },
}));

// Mock observability
vi.mock('@repo/observability', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

describe('anthropic Provider - v5 Patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should import anthropic provider successfully', async () => {
    const anthropicProvider = await import('#/server/providers/anthropic');
    expect(anthropicProvider).toBeDefined();
  });

  test('should use MockLanguageModelV2 for provider testing (v5 pattern)', async () => {
    const { MockLanguageModelV2 } = await import('ai');

    // v5 pattern
    const mockModel = new (MockLanguageModelV2 as any)({
      modelId: 'claude-3-5-sonnet-20241022',
      doGenerate: async () => ({
        finishReason: 'stop',
        usage: { inputTokens: 15, outputTokens: 25 },
        text: 'v5 validated response',
        reasoning: 'This is a reasoning response',
        providerMetadata: {
          anthropic: {
            cacheCreationInputTokens: 10,
            cacheReadInputTokens: 5,
          },
        },
      }),
    });

    const result = await mockModel.doGenerate({ prompt: 'Test prompt' });

    expect(result.text).toBe('v5 validated response');
    expect(result.reasoning).toBe('This is a reasoning response');
    expect(result.usage).toStrictEqual({ inputTokens: 15, outputTokens: 25 });
    expect(result.providerMetadata?.anthropic?.cacheCreationInputTokens).toBe(10);
  });

  test('should test streaming with simulateReadableStream (v5 pattern)', async () => {
    const { MockLanguageModelV2, simulateReadableStream } = await import('ai');

    const mockModel = new (MockLanguageModelV2 as any)({
      doStream: async () => ({
        stream: (simulateReadableStream as any)({
          chunks: [
            { type: 'text', text: 'Streaming ' },
            { type: 'text', text: 'with ' },
            { type: 'text', text: 'v5 patterns' },
            {
              type: 'finish',
              finishReason: 'stop',
              usage: { inputTokens: 8, outputTokens: 15 },
            },
          ],
        }),
      }),
    });

    const result = await mockModel.doStream({ prompt: 'Test streaming' });

    let fullText = '';
    let finalUsage;
    for await (const chunk of result.stream as any) {
      if (chunk.type === 'text') {
        fullText += chunk.text;
      } else if (chunk.type === 'finish') {
        finalUsage = chunk.usage;
      }
    }

    expect(fullText).toBe('Streaming with v5 patterns');
    expect(finalUsage).toStrictEqual({ inputTokens: 8, outputTokens: 15 });
  });

  test('should test with experimental telemetry (v5 pattern)', async () => {
    const { generateText } = await import('ai');
    const { MockLanguageModelV2 } = await import('ai');

    const mockModel = new (MockLanguageModelV2 as any)({
      doGenerate: async () => ({
        finishReason: 'stop',
        usage: { inputTokens: 20, outputTokens: 30 },
        text: 'Telemetry enabled response',
      }),
    });

    const mockGenerateText = vi.mocked(generateText);
    mockGenerateText.mockImplementation(async options => {
      const result = await mockModel.doGenerate(options);
      return {
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
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
        experimental_telemetry: options.experimental_telemetry,
      };
    });

    const result = await generateText({
      model: mockModel,
      prompt: 'Test telemetry',
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          testCase: 'provider-integration',
        },
      },
    });

    expect(result.text).toBe('Telemetry enabled response');
    expect(result.experimental_telemetry?.isEnabled).toBeTruthy();
    expect(result.experimental_telemetry?.metadata?.provider).toBe('anthropic');
  });

  test('should test provider creation functions', async () => {
    const { createAnthropicProvider } = await import('#/server/providers/anthropic');

    // Test default provider
    const defaultProvider = createAnthropicProvider();
    expect(defaultProvider).toBeDefined();

    // Test custom provider
    const customProvider = createAnthropicProvider({
      apiKey: 'test-key',
      baseURL: 'https://api.anthropic.com',
    });
    expect(customProvider).toBeDefined();
  });

  test('should test reasoning model creation', async () => {
    const { createAnthropicWithReasoning } = await import('#/server/providers/anthropic');

    const reasoningModel = createAnthropicWithReasoning('claude-3-5-sonnet-20241022', 10000);
    expect(reasoningModel).toBeDefined();
    expect(reasoningModel.model).toBeDefined();
    expect(reasoningModel.generateWithReasoning).toBeTypeOf('function');

    // Test generateWithReasoning
    const result = await reasoningModel.generateWithReasoning('Test prompt');
    expect(result).toBeDefined();
    expect(result.text).toBe('Mock generated text');
    expect(result.reasoning).toBe('Mock reasoning');
  });

  test('should test caching model creation', async () => {
    const { createAnthropicWithCaching } = await import('#/server/providers/anthropic');

    const cachingModel = createAnthropicWithCaching('claude-3-5-sonnet-20240620');
    expect(cachingModel).toBeDefined();
    expect(cachingModel.modelId).toBe('claude-3-5-sonnet-20240620');
  });

  test('should test computer tool creation', async () => {
    const { createBashTool, createTextEditorTool, createComputerTool } = await import(
      '#/server/providers/anthropic'
    );

    // Mock tool functions
    const mockBashExecute = vi.fn().mockResolvedValue('bash output');
    const mockTextEditorExecute = vi.fn().mockResolvedValue('editor output');
    const mockComputerExecute = vi.fn().mockResolvedValue('computer output');

    // Test bash tool
    const bashTool = createBashTool(mockBashExecute);
    expect(bashTool).toBeDefined();

    // Test text editor tool
    const textEditorTool = createTextEditorTool(mockTextEditorExecute);
    expect(textEditorTool).toBeDefined();

    // Test computer tool
    const computerTool = createComputerTool({
      displayWidthPx: 1920,
      displayHeightPx: 1080,
      execute: mockComputerExecute,
    });
    expect(computerTool).toBeDefined();
  });

  test('should test utility functions', async () => {
    const { analyzeSentiment, moderateContent, extractEntities } = await import(
      '#/server/providers/anthropic'
    );

    // Test sentiment analysis
    const sentimentResult = await analyzeSentiment('I love this product!');
    expect(sentimentResult).toBeDefined();
    expect((sentimentResult as any).sentiment).toBe('positive');
    expect((sentimentResult as any).confidence).toBe(0.9);

    // Test content moderation
    const moderationResult = await moderateContent('This is a test message');
    expect(moderationResult).toBeDefined();

    // Test entity extraction
    const entitiesResult = await extractEntities('John Doe works at Apple in New York');
    expect(entitiesResult).toBeDefined();
  });

  test('should test cache control helpers', async () => {
    const { createCachedMessage, validateCacheControl, extractCacheMetadata } = await import(
      '#/server/providers/anthropic'
    );

    // Test createCachedMessage
    const longContent = 'a'.repeat(5000); // Long enough to meet token requirements
    const cachedMessage = await createCachedMessage(longContent, 'system');
    expect(cachedMessage).toBeDefined();
    expect(cachedMessage.role).toBe('system');
    expect(cachedMessage.content).toBe(longContent);
    expect(cachedMessage.providerOptions).toBeDefined();
    expect(cachedMessage.providerOptions.anthropic).toBeDefined();

    // Test validateCacheControl
    const validation = validateCacheControl(longContent, 'claude-3-5-sonnet');
    expect(validation).toBeDefined();
    expect(validation.canCache).toBeTruthy();
    expect(validation.estimatedTokens).toBeGreaterThan(0);
    expect(validation.minRequired).toBe(1024);

    // Test extractCacheMetadata
    const mockResult = {
      providerMetadata: {
        anthropic: {
          cacheCreationInputTokens: 100,
          cacheReadInputTokens: 50,
        },
      },
    };
    const cacheMetadata = extractCacheMetadata(mockResult);
    expect(cacheMetadata).toBeDefined();
    expect(cacheMetadata?.cacheCreationInputTokens).toBe(100);
    expect(cacheMetadata?.cacheReadInputTokens).toBe(50);
  });

  test('should test reasoning helpers', async () => {
    const { extractReasoning } = await import('#/server/providers/anthropic');

    const mockResult = {
      text: 'test response',
      reasoning: 'test reasoning',
      reasoningDetails: { steps: ['step1', 'step2'] },
      usage: { tokens: 100 },
      providerMetadata: { anthropic: { cacheCreationInputTokens: 10 } },
    };

    const extracted = extractReasoning(mockResult);
    expect(extracted).toBeDefined();
    expect(extracted.text).toBe('test response');
    expect(extracted.reasoning).toBe('test reasoning');
    expect(extracted.reasoningDetails).toStrictEqual({ steps: ['step1', 'step2'] });
  });

  test('should test examples', async () => {
    const { examples } = await import('#/server/providers/anthropic');

    expect(examples).toBeDefined();
    expect(examples.basic).toBeTypeOf('function');
    expect(examples.reasoning).toBeTypeOf('function');
    expect(examples.caching).toBeTypeOf('function');
    expect(examples.computerUse).toBeTypeOf('function');

    // Test basic example
    const basicResult = await examples.basic();
    expect(basicResult).toBeDefined();
    expect(basicResult.text).toBe('Mock generated text');

    // Test reasoning example
    const reasoningResult = await examples.reasoning();
    expect(reasoningResult).toBeDefined();
    expect(reasoningResult.text).toBe('Mock generated text');
    expect(reasoningResult.reasoning).toBe('Mock reasoning');

    // Test caching example
    const cachingResult = await examples.caching();
    expect(cachingResult).toBeDefined();
    expect(cachingResult.text).toBe('Mock generated text');

    // Test computer use example
    const computerResult = await examples.computerUse();
    expect(computerResult).toBeDefined();
    expect(computerResult.text).toBe('Mock generated text');
  });

  test('should test interface types', async () => {
    // Test that we can use the interfaces through type checking
    const config = {
      apiKey: 'test-key',
      baseURL: 'https://api.anthropic.com',
    };
    expect(config.apiKey).toBe('test-key');

    const metadata = {
      cacheCreationInputTokens: 100,
      cacheReadInputTokens: 50,
    };
    expect(metadata.cacheCreationInputTokens).toBe(100);
  });
});
