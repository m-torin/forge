import type { LanguageModelV2 } from '@ai-sdk/provider';
import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';
import { vi } from 'vitest';
import { safeEnv } from '../../env';

/**
 * Testing utilities for @repo/ai
 * Uses official AI SDK v5 testing utilities
 */

/**
 * Create mock language model using AI SDK's official MockLanguageModelV2
 */
export function createMockLanguageModel(config?: Partial<MockLanguageModelV2>): LanguageModelV2 {
  return new MockLanguageModelV2({
    doGenerate: async () =>
      ({
        finishReason: 'stop',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        content: [{ type: 'text', text: 'Mock response' }],
        warnings: [],
      }) as any,
    doStream: async () =>
      ({
        stream: simulateReadableStream({
          chunks: [
            { type: 'text', text: 'Mock' },
            { type: 'text', text: ' streaming' },
            { type: 'text', text: ' response' },
            {
              type: 'finish',
              finishReason: 'stop',
              logprobs: undefined,
              usage: { inputTokens: 10, outputTokens: 3, totalTokens: 13 },
            },
          ],
        }),
      }) as any,
    ...config,
  });
}

/**
 * Pre-configured mock models for common scenarios
 */
export const mockModels = {
  /**
   * Basic text generation mock
   */
  textGeneration: () =>
    new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: 'stop',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        content: [{ type: 'text', text: 'Mock generated text' }],
        warnings: [],
      }),
    }),

  /**
   * Object generation mock (returns JSON string)
   */
  objectGeneration: <T = any>(object: T) =>
    new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: 'stop',
        usage: { inputTokens: 15, outputTokens: 25, totalTokens: 40 },
        content: [{ type: 'text', text: JSON.stringify(object) }],
        warnings: [],
      }),
    }),

  /**
   * Streaming text mock
   */
  streamingText: (chunks: string[]) =>
    new MockLanguageModelV2({
      doStream: async () =>
        ({
          stream: simulateReadableStream({
            chunks: [
              ...chunks.map(chunk => ({ type: 'text' as const, text: chunk })),
              {
                type: 'finish',
                finishReason: 'stop',
                logprobs: undefined,
                usage: {
                  inputTokens: 10,
                  outputTokens: chunks.length,
                  totalTokens: 10 + chunks.length,
                },
              },
            ],
          }),
        }) as any,
    }),

  /**
   * Tool calling mock
   */
  toolCalling: (toolName: string, toolInput: any, toolResult: any) =>
    new MockLanguageModelV2({
      doGenerate: async () =>
        ({
          finishReason: 'tool-calls',
          usage: { inputTokens: 20, outputTokens: 5, totalTokens: 25 },
          toolCalls: [
            {
              toolCallId: `call-${toolName}-123`,
              toolName,
              input: toolInput,
            },
          ],
          toolResults: [
            {
              toolCallId: `call-${toolName}-123`,
              toolName,
              output: toolResult,
            },
          ],
          text: 'Tool execution completed.',
          warnings: [],
        }) as any,
    }),

  /**
   * Error mock
   */
  error: (error: Error) =>
    new MockLanguageModelV2({
      doGenerate: async () => {
        throw error;
      },
      doStream: async () => {
        throw error;
      },
    }),

  /**
   * High token usage mock
   */
  highTokenUsage: () =>
    new MockLanguageModelV2({
      doGenerate: async () => ({
        finishReason: 'stop',
        usage: { inputTokens: 1000, outputTokens: 2000, totalTokens: 3000 },
        content: [{ type: 'text', text: 'Very long response '.repeat(50) }],
        warnings: [],
      }),
    }),
};

/**
 * Mock environment for consistent testing
 */
export function createMockEnvironment(overrides: Record<string, any> = {}) {
  const mockEnv = {
    OPENAI_API_KEY: 'mock-openai-key',
    ANTHROPIC_API_KEY: 'mock-anthropic-key',
    DEFAULT_AI_MODEL: 'mock/model',
    AI_TELEMETRY: true,
    AI_COST_TRACKING: false,
    AI_RETRY_ATTEMPTS: 2,
    ...overrides,
  };

  // Mock the safeEnv function
  vi.mocked(safeEnv).mockReturnValue(mockEnv as ReturnType<typeof safeEnv>);

  return mockEnv;
}

/**
 * Mock vector store for RAG testing
 */
export function createMockVectorStore() {
  return {
    query: vi.fn().mockResolvedValue({
      matches: [
        {
          id: 'doc-1',
          score: 0.95,
          metadata: { title: 'Test Document 1', content: 'Mock content 1' },
          vector: Array.from({ length: 1536 }, () => Math.random()),
        },
        {
          id: 'doc-2',
          score: 0.87,
          metadata: { title: 'Test Document 2', content: 'Mock content 2' },
          vector: Array.from({ length: 1536 }, () => Math.random()),
        },
      ],
    }),
    upsert: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
    delete: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  };
}

/**
 * Mock tool for testing
 */
export function createMockTool(name = 'mockTool', result: any = 'Mock tool result') {
  return {
    description: `Mock tool: ${name}`,
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Mock input parameter',
        },
      },
      required: ['input'],
    },
    execute: vi.fn().mockResolvedValue(result),
    toModelOutput: (output: any) => ({
      type: 'content',
      value: [
        {
          type: 'text',
          text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
        },
      ],
    }),
  };
}

/**
 * Mock database operations for testing
 */
export const mockDatabase = {
  conversation: {
    create: vi.fn().mockResolvedValue({
      id: 'conv-123',
      userId: 'user-123',
      messages: [],
      createdAt: new Date(),
    }),
    findUnique: vi.fn().mockResolvedValue({
      id: 'conv-123',
      userId: 'user-123',
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      createdAt: new Date(),
    }),
    update: vi.fn().mockResolvedValue({
      id: 'conv-123',
      userId: 'user-123',
      messages: [],
      updatedAt: new Date(),
    }),
    delete: vi.fn().mockResolvedValue({ id: 'conv-123' }),
  },
  usage: {
    create: vi.fn().mockResolvedValue({
      id: 'usage-123',
      userId: 'user-123',
      model: 'mock/model',
      tokens: 100,
      cost: 0.002,
      createdAt: new Date(),
    }),
  },
};

/**
 * Mock analytics for testing
 */
export const mockAnalytics = {
  track: vi.fn().mockResolvedValue(undefined),
  identify: vi.fn().mockResolvedValue(undefined),
  page: vi.fn().mockResolvedValue(undefined),
};

/**
 * Mock observability for testing
 */
export const mockObservability = {
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  metrics: {
    increment: vi.fn(),
    histogram: vi.fn(),
    gauge: vi.fn(),
  },
  tracing: {
    startSpan: vi.fn().mockReturnValue({
      setAttributes: vi.fn(),
      setStatus: vi.fn(),
      end: vi.fn(),
    }),
  },
};

/**
 * Helper to create test scenarios
 */
export const testScenarios = {
  /**
   * Successful AI generation
   */
  successfulGeneration: () => {
    const model = createMockLanguageModel();
    createMockEnvironment();
    return { model };
  },

  /**
   * AI generation with error
   */
  failedGeneration: (error = new Error('Mock AI error')) => {
    const model = createMockLanguageModel({
      doGenerate: vi.fn().mockRejectedValue(error),
      doStream: vi.fn().mockRejectedValue(error),
    });
    createMockEnvironment();
    return { model, error };
  },

  /**
   * Rate limited scenario
   */
  rateLimited: () => {
    const error = new Error('Rate limit exceeded');
    error.name = 'AI_RateLimitError';
    const model = createMockLanguageModel({
      doGenerate: vi.fn().mockRejectedValue(error),
    });
    createMockEnvironment();
    return { model, error };
  },

  /**
   * High token usage scenario
   */
  highTokenUsage: () => {
    const model = createMockLanguageModel({
      doGenerate: vi.fn().mockResolvedValue({
        text: 'Very long mock response'.repeat(100),
        toolCalls: [],
        toolResults: [],
        usage: {
          inputTokens: 1000,
          outputTokens: 2000,
          totalTokens: 3000,
        },
        finishReason: 'stop',
        response: {
          id: 'high-usage-response',
          timestamp: new Date(),
          modelId: 'mock-model',
        },
      }),
    });
    createMockEnvironment({ AI_COST_TRACKING: true });
    return { model };
  },

  /**
   * Multi-turn conversation
   */
  multiTurnConversation: () => {
    const messages = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi! How can I help?' },
      { role: 'user' as const, content: 'What is AI?' },
      { role: 'assistant' as const, content: 'AI is artificial intelligence...' },
    ];
    const model = createMockLanguageModel();
    createMockEnvironment();
    return { model, messages };
  },

  /**
   * Tool calling scenario
   */
  toolCalling: () => {
    const toolResult = { weather: 'sunny', temperature: 72 };
    const model = createMockLanguageModel({
      doGenerate: vi.fn().mockResolvedValue({
        text: 'Let me check the weather for you.',
        toolCalls: [
          {
            toolCallId: 'call-123',
            toolName: 'getWeather',
            input: { location: 'San Francisco' },
          },
        ],
        toolResults: [
          {
            toolCallId: 'call-123',
            toolName: 'getWeather',
            output: toolResult,
          },
        ],
        usage: { inputTokens: 20, outputTokens: 10, totalTokens: 30 },
        finishReason: 'tool-calls',
        response: {
          id: 'tool-response',
          timestamp: new Date(),
          modelId: 'mock-model',
        },
      }),
    });
    const tool = createMockTool('getWeather', toolResult);
    createMockEnvironment();
    return { model, tool, toolResult };
  },

  /**
   * RAG search scenario
   */
  ragSearch: () => {
    const vectorStore = createMockVectorStore();
    const query = 'What is machine learning?';
    const expectedDocs = [
      { title: 'ML Basics', content: 'Machine learning is...' },
      { title: 'AI Overview', content: 'Artificial intelligence includes...' },
    ];

    vectorStore.query.mockResolvedValue({
      matches: expectedDocs.map((doc, i) => ({
        id: `doc-${i}`,
        score: 0.9 - i * 0.1,
        metadata: doc,
        vector: Array.from({ length: 1536 }, () => Math.random()),
      })),
    });

    createMockEnvironment();
    return { vectorStore, query, expectedDocs };
  },
};

/**
 * Reset all mocks (call in afterEach)
 */
export function resetAllMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
}

/**
 * Utilities for async testing
 */
export const asyncUtils = {
  /**
   * Wait for next tick
   */
  nextTick: () => new Promise(resolve => process.nextTick(resolve)),

  /**
   * Wait for specified time
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Wait for condition to be true
   */
  waitFor: async (condition: () => boolean, timeout = 5000) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await asyncUtils.wait(10);
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  /**
   * Create a deferred promise
   */
  defer: <T = any>() => {
    let deferredResolve: (value: T) => void;
    let deferredReject: (error: any) => void;
    const promise = new Promise<T>((resolve, reject) => {
      deferredResolve = resolve;
      deferredReject = reject;
    });
    return { promise, resolve: deferredResolve!, reject: deferredReject! };
  },
};
