/**
 * Centralized AI SDK v5 test factories for the entire monorepo
 * Combines provider mocks and model factories for comprehensive AI testing
 *
 * Previously located in:
 * - packages/ai/__tests__/test-utils/providers.ts
 * - packages/ai/__tests__/test-utils/models.ts
 * Now centralized for consistency across all packages
 */

import { expect } from 'vitest';

// Type definitions for AI SDK components - avoiding direct imports
type LanguageModelV2Usage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
};

type LanguageModelV2FinishReason = 'stop' | 'tool-calls' | 'length' | 'content-filter' | 'error';

type MockLanguageModelV2Config = {
  modelId: string;
  doGenerate?: (params: any) => Promise<any>;
  doStream?: (params: any) => Promise<any>;
  doEmbed?: (params: any) => Promise<any>;
};

// Conditional imports to handle cases where AI SDK might not be available
let MockLanguageModelV2: new (config: MockLanguageModelV2Config) => any;
let simulateReadableStream: (config: any) => any;

try {
  ({ MockLanguageModelV2, simulateReadableStream } = require('ai/test'));
} catch (error) {
  // Fallback mocks when AI SDK is not available
  MockLanguageModelV2 = class {
    constructor(config: MockLanguageModelV2Config) {
      Object.assign(this, config);
    }
  } as any;
  simulateReadableStream = (config: any) => config as any;
}

// =============================================================================
// AI SDK v5 Model Factories
// =============================================================================

/**
 * Basic text generation model - returns simple text response
 */
export const createBasicTextModel = (text = 'Mock generated text') =>
  new MockLanguageModelV2({
    modelId: 'test-basic-model',
    doGenerate: async () => ({
      finishReason: 'stop' as const,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      content: [{ type: 'text', text }],
      warnings: [],
    }),
  });

/**
 * Streaming text model - uses simulateReadableStream for deterministic streaming
 */
export const createStreamingTextModel = (textParts = ['Hello', ' ', 'world!']) =>
  new MockLanguageModelV2({
    modelId: 'test-streaming-model',
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: 0,
        chunkDelayInMs: 10,
        chunks: [
          { type: 'text-start', id: 'text-1' },
          ...textParts.map((delta, index) => ({
            type: 'text-delta' as const,
            id: 'text-1',
            delta,
          })),
          { type: 'text-end', id: 'text-1' },
          {
            type: 'finish' as const,
            finishReason: 'stop' as const,
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          },
        ],
      }),
    }),
  });

/**
 * Tool-calling model - generates tool calls for testing multi-step workflows
 */
export const createToolCallingModel = (
  textParts: string[] = ['Calling tool...'],
  toolCalls: any[] = [],
) =>
  new MockLanguageModelV2({
    modelId: 'test-tool-model',
    doGenerate: async () => ({
      finishReason: toolCalls.length > 0 ? ('tool-calls' as const) : ('stop' as const),
      usage: { inputTokens: 15, outputTokens: 25, totalTokens: 40 },
      content: [
        { type: 'text', text: textParts.join('') },
        ...toolCalls.map(call => ({
          type: 'tool-call' as const,
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          input: call.input,
        })),
      ],
      warnings: [],
    }),
  });

/**
 * Multi-step tool model - for testing maxSteps and step-based stop conditions
 */
export const createMultiStepToolModel = (
  textParts: string[] = ['Step by step...'],
  toolCalls: any[] = [],
  maxSteps = 1,
) =>
  new MockLanguageModelV2({
    modelId: 'test-multistep-model',
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: 0,
        chunkDelayInMs: 10,
        chunks: [
          { type: 'text-start', id: 'text-1' },
          ...textParts.map(delta => ({
            type: 'text-delta' as const,
            id: 'text-1',
            delta,
          })),
          { type: 'text-end', id: 'text-1' },
          // Distribute tool calls across steps based on maxSteps
          ...toolCalls.slice(0, maxSteps).map(call => ({
            type: 'tool-call' as const,
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            input: call.input,
          })),
          {
            type: 'finish' as const,
            finishReason: toolCalls.length > 0 ? ('tool-calls' as const) : ('stop' as const),
            usage: { inputTokens: 20, outputTokens: 30, totalTokens: 50 },
          },
        ],
      }),
    }),
  });

/**
 * Streaming tool model - combines streaming text with tool calls
 */
export const createStreamingToolModel = (
  textParts: string[] = ['Let me check the weather...'],
  toolCalls: any[] = [],
) =>
  new MockLanguageModelV2({
    modelId: 'test-streaming-tool-model',
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: 0,
        chunkDelayInMs: 15,
        chunks: [
          { type: 'text-start', id: 'text-1' },
          ...textParts.map(delta => ({
            type: 'text-delta' as const,
            id: 'text-1',
            delta,
          })),
          { type: 'text-end', id: 'text-1' },
          ...toolCalls.map(call => ({
            type: 'tool-call' as const,
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            input: call.input,
          })),
          {
            type: 'finish' as const,
            finishReason: 'tool-calls' as const,
            usage: { inputTokens: 20, outputTokens: 30, totalTokens: 50 },
          },
        ],
      }),
    }),
  });

/**
 * Embedding model - for testing vector operations
 */
export const createEmbeddingModel = (embeddingDim = 3) =>
  new MockLanguageModelV2({
    modelId: 'test-embedding-model',
    doEmbed: async ({ values }: { values: any[] }) => ({
      embeddings: values.map(() => Array.from({ length: embeddingDim }, (_, i) => (i + 1) * 0.1)),
      usage: { inputTokens: 10 * values.length },
    }),
  });

/**
 * Error model - throws specific errors for error handling tests
 */
export const createErrorModel = (error: Error) =>
  new MockLanguageModelV2({
    modelId: 'test-error-model',
    doGenerate: async () => {
      throw error;
    },
  });

/**
 * Reasoning model - includes reasoning in output for testing reasoning extraction
 */
export const createReasoningModel = (
  reasoning = 'Let me think about this...',
  answer = 'The answer is 42.',
) =>
  new MockLanguageModelV2({
    modelId: 'test-reasoning-model',
    doGenerate: async () => ({
      finishReason: 'stop' as const,
      usage: { inputTokens: 15, outputTokens: 25, totalTokens: 40 },
      content: [
        {
          type: 'text',
          text: `<think>${reasoning}</think>${answer}`,
        },
      ],
      warnings: [],
    }),
  });

/**
 * Multi-modal model - handles images and text content
 */
export const createMultiModalModel = (response = 'I can see the image contains...') =>
  new MockLanguageModelV2({
    modelId: 'test-multimodal-model',
    doGenerate: async ({ messages }: { messages: any[] }) => {
      const hasImageContent = messages.some((msg: any) =>
        msg.content.some((content: any) => content.type === 'media'),
      );

      return {
        finishReason: 'stop' as const,
        usage: {
          inputTokens: hasImageContent ? 50 : 10,
          outputTokens: 30,
          totalTokens: hasImageContent ? 80 : 40,
        },
        content: [{ type: 'text', text: response }],
        warnings: [],
      };
    },
  });

/**
 * Telemetry-enabled model - for testing experimental_telemetry features
 */
export const createTelemetryModel = (text = 'Telemetry test response') =>
  new MockLanguageModelV2({
    modelId: 'test-telemetry-model',
    doGenerate: async (params: any) => ({
      finishReason: 'stop' as const,
      usage: {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
        // Include reasoning tokens if applicable
        reasoningTokens: params.experimental_telemetry?.isEnabled ? 5 : undefined,
      },
      content: [{ type: 'text', text }],
      warnings: [],
    }),
  });

/**
 * High token usage model - for testing token limits and cost tracking
 */
export const createHighUsageModel = (inputTokens = 1000, outputTokens = 2000) =>
  new MockLanguageModelV2({
    modelId: 'test-high-usage-model',
    doGenerate: async () => ({
      finishReason: 'stop' as const,
      usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      content: [{ type: 'text', text: 'High token usage response' }],
      warnings: [{ type: 'other', message: 'High token usage detected' }],
    }),
  });

/**
 * Helper to create a model with custom doGenerate behavior
 */
export const createCustomModel = (
  doGenerateOverride: (params: any) => Promise<any>,
  modelId = 'test-custom-model',
) =>
  new MockLanguageModelV2({
    modelId,
    doGenerate: doGenerateOverride,
  });

/**
 * Helper to create a model with custom doStream behavior
 */
export const createCustomStreamingModel = (
  doStreamOverride: (params: any) => Promise<any>,
  modelId = 'test-custom-streaming-model',
) =>
  new MockLanguageModelV2({
    modelId,
    doStream: doStreamOverride,
  });

// =============================================================================
// AI Provider Factories
// =============================================================================

/**
 * Mock OpenAI provider factory
 */
export function createMockOpenAI() {
  return {
    provider: 'openai',
    languageModel: (modelId: string) => {
      switch (modelId) {
        case 'gpt-4':
        case 'gpt-4o':
          return new MockLanguageModelV2({
            modelId,
            doGenerate: async () => ({
              finishReason: 'stop',
              usage: { inputTokens: 15, outputTokens: 25, totalTokens: 40 },
              content: [{ type: 'text', text: `Mock ${modelId} response` }],
              warnings: [],
            }),
          });
        case 'gpt-3.5-turbo':
          return createBasicTextModel('Mock GPT-3.5 response');
        default:
          return createBasicTextModel(`Mock OpenAI ${modelId} response`);
      }
    },
    embedding: (modelId: string) => {
      switch (modelId) {
        case 'text-embedding-3-small':
          return createEmbeddingModel(1536);
        case 'text-embedding-3-large':
          return createEmbeddingModel(3072);
        default:
          return createEmbeddingModel(1536);
      }
    },
  };
}

/**
 * Mock Anthropic provider factory
 */
export function createMockAnthropic() {
  return {
    provider: 'anthropic',
    languageModel: (modelId: string) => {
      switch (modelId) {
        case 'claude-3-haiku-20240307':
          return createStreamingTextModel(['Fast ', 'Claude ', 'response']);
        case 'claude-3-sonnet-20240229':
          return new MockLanguageModelV2({
            modelId,
            doGenerate: async () => ({
              finishReason: 'stop',
              usage: { inputTokens: 20, outputTokens: 40, totalTokens: 60 },
              content: [{ type: 'text', text: 'Mock Claude Sonnet response' }],
              warnings: [],
            }),
          });
        case 'claude-3-opus-20240229':
          return new MockLanguageModelV2({
            modelId,
            doGenerate: async () => ({
              finishReason: 'stop',
              usage: { inputTokens: 25, outputTokens: 50, totalTokens: 75 },
              content: [{ type: 'text', text: 'Mock Claude Opus response' }],
              warnings: [],
            }),
          });
        default:
          return createBasicTextModel(`Mock Anthropic ${modelId} response`);
      }
    },
  };
}

/**
 * Mock Google provider factory
 */
export function createMockGoogle() {
  return {
    provider: 'google',
    languageModel: (modelId: string) => {
      switch (modelId) {
        case 'gemini-pro':
          return new MockLanguageModelV2({
            modelId,
            doGenerate: async () => ({
              finishReason: 'stop',
              usage: { inputTokens: 12, outputTokens: 28, totalTokens: 40 },
              content: [{ type: 'text', text: 'Mock Gemini Pro response' }],
              warnings: [],
            }),
          });
        case 'gemini-1.5-pro':
          return createStreamingTextModel(['Gemini ', '1.5 ', 'Pro ', 'response']);
        default:
          return createBasicTextModel(`Mock Google ${modelId} response`);
      }
    },
    embedding: (modelId: string) => {
      switch (modelId) {
        case 'text-embedding-004':
          return createEmbeddingModel(768);
        default:
          return createEmbeddingModel(768);
      }
    },
  };
}

/**
 * Mock Perplexity provider factory
 */
export function createMockPerplexity() {
  return {
    provider: 'perplexity',
    languageModel: (modelId: string) => {
      switch (modelId) {
        case 'llama-3.1-sonar-small-128k-online':
          return new MockLanguageModelV2({
            modelId,
            doGenerate: async () => ({
              finishReason: 'stop',
              usage: { inputTokens: 18, outputTokens: 32, totalTokens: 50 },
              content: [{ type: 'text', text: 'Mock Perplexity response with search results' }],
              warnings: [],
            }),
          });
        default:
          return createBasicTextModel(`Mock Perplexity ${modelId} response`);
      }
    },
  };
}

/**
 * Create a custom provider for testing
 */
export function createCustomTestProvider(providerId: string, models: Record<string, any>) {
  return {
    provider: providerId,
    languageModel: (modelId: string) => {
      return models[modelId] || createBasicTextModel(`Mock ${providerId} ${modelId} response`);
    },
  };
}

/**
 * Provider registry for testing - contains all mock providers
 */
export const mockProviderRegistry = {
  openai: createMockOpenAI(),
  anthropic: createMockAnthropic(),
  google: createMockGoogle(),
  perplexity: createMockPerplexity(),
};

/**
 * Get a mock model from any provider
 */
export function getMockModel(provider: keyof typeof mockProviderRegistry, modelId: string): any {
  const providerFactory = mockProviderRegistry[provider];
  return providerFactory.languageModel(modelId);
}

/**
 * Get a mock embedding model from any provider
 */
export function getMockEmbeddingModel(
  provider: keyof typeof mockProviderRegistry,
  modelId: string,
): any {
  const providerFactory = mockProviderRegistry[provider];
  if ('embedding' in providerFactory && providerFactory.embedding) {
    return providerFactory.embedding(modelId);
  }
  return createEmbeddingModel();
}

/**
 * Create provider-specific middleware wrapper for testing
 */
export function createProviderMiddleware(
  provider: keyof typeof mockProviderRegistry,
  middleware: any,
) {
  return {
    provider,
    middleware,
    wrap: (modelId: string) => {
      const baseModel = getMockModel(provider, modelId);
      // Apply middleware to the model
      return baseModel;
    },
  };
}

/**
 * Test multiple providers with the same prompt
 */
export async function testMultipleProviders(
  providers: (keyof typeof mockProviderRegistry)[],
  modelIds: string[],
  generateTextFn: (model: any) => Promise<any>,
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  for (const provider of providers) {
    for (const modelId of modelIds) {
      const model = getMockModel(provider, modelId);
      const key = `${provider}:${modelId}`;
      results[key] = await generateTextFn(model);
    }
  }

  return results;
}

/**
 * Assert provider compatibility with specific features
 */
export interface ProviderFeatures {
  toolCalling?: boolean;
  streaming?: boolean;
  multiModal?: boolean;
  embeddings?: boolean;
  reasoning?: boolean;
}

export function assertProviderFeatures(
  provider: keyof typeof mockProviderRegistry,
  features: ProviderFeatures,
): void {
  const providerFactory = mockProviderRegistry[provider];

  if (features.embeddings) {
    expect('embedding' in providerFactory).toBeTruthy();
  }

  // Add more feature assertions as needed
}

/**
 * Create provider-specific error scenarios for testing
 */
export function createProviderErrorScenarios(provider: keyof typeof mockProviderRegistry) {
  const baseModel = getMockModel(provider, 'test-model');

  return {
    rateLimitError: new MockLanguageModelV2({
      ...baseModel,
      doGenerate: async () => {
        throw new Error(`${provider} rate limit exceeded`);
      },
    }),
    authError: new MockLanguageModelV2({
      ...baseModel,
      doGenerate: async () => {
        throw new Error(`${provider} authentication failed`);
      },
    }),
    invalidModelError: new MockLanguageModelV2({
      ...baseModel,
      doGenerate: async () => {
        throw new Error(`${provider} model not found`);
      },
    }),
  };
}

/**
 * Pre-configured test scenarios for AI SDK testing
 */
export const aiTestScenarios = {
  // Text generation scenarios
  textGeneration: {
    basic: () => createBasicTextModel('Basic test response'),
    streaming: () => createStreamingTextModel(['Streaming ', 'test ', 'response']),
    reasoning: () => createReasoningModel('Testing reasoning...', 'Reasoning complete'),
    multiModal: () => createMultiModalModel('Analyzed image successfully'),
  },

  // Tool calling scenarios
  toolCalling: {
    simple: () =>
      createToolCallingModel(
        ['Calling tool...'],
        [
          {
            toolCallId: 'test-tool-1',
            toolName: 'testTool',
            input: { query: 'test' },
          },
        ],
      ),
    multiStep: () =>
      createMultiStepToolModel(
        ['Step 1...', 'Step 2...'],
        [
          {
            toolCallId: 'test-tool-1',
            toolName: 'stepOne',
            input: { data: 'step1' },
          },
          {
            toolCallId: 'test-tool-2',
            toolName: 'stepTwo',
            input: { data: 'step2' },
          },
        ],
        2,
      ),
  },

  // Provider-specific scenarios
  providers: {
    openai: () => getMockModel('openai', 'gpt-4'),
    anthropic: () => getMockModel('anthropic', 'claude-3-sonnet-20240229'),
    google: () => getMockModel('google', 'gemini-pro'),
    perplexity: () => getMockModel('perplexity', 'llama-3.1-sonar-small-128k-online'),
  },

  // Error scenarios
  errors: {
    rateLimitOpenAI: () => createProviderErrorScenarios('openai').rateLimitError,
    authFailureAnthropic: () => createProviderErrorScenarios('anthropic').authError,
    modelNotFoundGoogle: () => createProviderErrorScenarios('google').invalidModelError,
  },
};
