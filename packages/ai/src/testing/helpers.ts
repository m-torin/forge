import { simulateReadableStream } from 'ai/test';
import { vi } from 'vitest';
import { mockModels } from './mocks';

/**
 * Testing helpers for @repo/ai
 * Provides utility functions for common testing scenarios
 */

/**
 * Setup helpers for common test scenarios
 */
export const testHelpers = {
  /**
   * Setup basic AI generation test
   */
  setupGeneration: (responseText = 'Test response') => {
    const model = mockModels.textGeneration();
    model.doGenerate = vi.fn().mockResolvedValue({
      finishReason: 'stop',
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      content: [{ type: 'text', text: responseText }],
      warnings: [],
    });

    return { model };
  },

  /**
   * Setup streaming test
   */
  setupStreaming: (chunks: string[]) => {
    const model = mockModels.streamingText(chunks);
    return { model, chunks };
  },

  /**
   * Setup object generation test
   */
  setupObjectGeneration: <T>(object: T) => {
    const model = mockModels.objectGeneration(object);
    return { model, object };
  },

  /**
   * Setup tool calling test
   */
  setupToolCalling: (toolName: string, toolInput: any, toolResult: any) => {
    const model = mockModels.toolCalling(toolName, toolInput, toolResult);
    const tool = {
      description: `Mock ${toolName} tool`,
      inputSchema: {
        type: 'object',
        properties: Object.keys(toolInput).reduce(
          (acc, key) => ({
            ...acc,
            [key]: { type: 'string' },
          }),
          {},
        ),
        required: Object.keys(toolInput),
      },
      execute: vi.fn().mockResolvedValue(toolResult),
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

    return { model, tool, toolResult };
  },

  /**
   * Setup error scenario
   */
  setupError: (error: Error) => {
    const model = mockModels.error(error);
    return { model, error };
  },

  /**
   * Setup rate limit scenario
   */
  setupRateLimit: () => {
    const error = new Error('Rate limit exceeded');
    error.name = 'AI_RateLimitError';
    return testHelpers.setupError(error);
  },

  /**
   * Setup timeout scenario
   */
  setupTimeout: () => {
    const error = new Error('Request timeout');
    error.name = 'AI_TimeoutError';
    return testHelpers.setupError(error);
  },
};

/**
 * Mock stream utilities
 */
export const streamHelpers = {
  /**
   * Create a mock UI message stream for testing React hooks
   */
  createUIMessageStream: (messages: Array<{ role: string; content: string }>) => {
    const chunks = messages.flatMap((message, index) => [
      `data: {"type":"start","messageId":"msg-${index}"}\n\n`,
      `data: {"type":"text-start","id":"text-${index}"}\n\n`,
      ...message.content
        .split(' ')
        .map(word => `data: {"type":"text-delta","id":"text-${index}","delta":"${word} "}\n\n`),
      `data: {"type":"text-end","id":"text-${index}"}\n\n`,
      `data: {"type":"finish"}\n\n`,
    ]);

    chunks.push(`data: [DONE]\n\n`);

    return simulateReadableStream({
      chunks,
      initialDelayInMs: 100,
      chunkDelayInMs: 50,
    });
  },

  /**
   * Create mock data stream for testing core functions
   */
  createDataStream: (textChunks: string[]) => {
    const chunks = [
      ...textChunks.map(chunk => `0:"${chunk}"\n`),
      `e:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50},"isContinued":false}\n`,
      `d:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50}}\n`,
    ];

    return simulateReadableStream({
      chunks,
      initialDelayInMs: 50,
      chunkDelayInMs: 25,
    });
  },
};

/**
 * Async testing utilities
 */
export const asyncHelpers = {
  /**
   * Wait for next event loop tick
   */
  nextTick: () => new Promise(resolve => process.nextTick(resolve)),

  /**
   * Wait for specified milliseconds
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Wait for condition to be true with timeout
   */
  waitFor: async (condition: () => boolean | Promise<boolean>, timeout = 5000, interval = 10) => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await asyncHelpers.wait(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Create deferred promise for manual resolution
   */
  defer: <T = any>() => {
    let deferredResolve: (value: T | PromiseLike<T>) => void;
    let deferredReject: (reason?: any) => void;

    const promise = new Promise<T>((resolve, reject) => {
      deferredResolve = resolve;
      deferredReject = reject;
    });

    return { promise, resolve: deferredResolve!, reject: deferredReject! };
  },

  /**
   * Create controlled async iterator for testing streams
   */
  createControlledIterator: <T>(values: T[]) => {
    let index = 0;

    return {
      async *[Symbol.asyncIterator]() {
        while (index < values.length) {
          yield values[index++];
        }
      },
      peek: () => values[index],
      hasMore: () => index < values.length,
      reset: () => {
        index = 0;
      },
    };
  },
};

/**
 * Test data generators
 */
export const dataGenerators = {
  /**
   * Generate random message
   */
  randomMessage: (role: 'user' | 'assistant' | 'system' = 'user') => ({
    role,
    content: `Random ${role} message ${Math.random().toString(36).substring(7)}`,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  }),

  /**
   * Generate conversation thread
   */
  conversation: (length = 5) => {
    const messages = [];
    for (let i = 0; i < length; i++) {
      messages.push(dataGenerators.randomMessage(i % 2 === 0 ? 'user' : 'assistant'));
    }
    return messages;
  },

  /**
   * Generate usage statistics
   */
  usage: (scale: 'small' | 'medium' | 'large' = 'medium') => {
    const scales = {
      small: { input: 50, output: 25 },
      medium: { input: 500, output: 300 },
      large: { input: 2000, output: 1500 },
    };

    const { input, output } = scales[scale];
    return {
      inputTokens: input,
      outputTokens: output,
      totalTokens: input + output,
    };
  },

  /**
   * Generate tool call data
   */
  toolCall: (toolName = 'testTool', input: any = { input: 'test' }) => ({
    toolCallId: `call-${toolName}-${Date.now()}`,
    toolName,
    input,
  }),

  /**
   * Generate realistic error
   */
  error: (type: 'rate_limit' | 'timeout' | 'api' | 'validation' = 'api') => {
    const errors = {
      rate_limit: Object.assign(new Error('Rate limit exceeded'), {
        name: 'AI_RateLimitError',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      timeout: Object.assign(new Error('Request timeout'), {
        name: 'AI_TimeoutError',
        code: 'TIMEOUT',
      }),
      api: Object.assign(new Error('API request failed'), {
        name: 'AI_APIError',
        code: 'API_ERROR',
      }),
      validation: Object.assign(new Error('Invalid input parameters'), {
        name: 'AI_ValidationError',
        code: 'VALIDATION_ERROR',
      }),
    };

    return errors[type];
  },
};

/**
 * Mock reset utilities
 */
export const resetHelpers = {
  /**
   * Reset all vitest mocks
   */
  resetAllMocks: () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  },

  /**
   * Reset environment variables
   */
  resetEnv: () => {
    vi.unstubAllEnvs();
  },

  /**
   * Reset timers
   */
  resetTimers: () => {
    vi.useRealTimers();
  },

  /**
   * Complete reset for clean test state
   */
  resetAll: () => {
    resetHelpers.resetAllMocks();
    resetHelpers.resetEnv();
    resetHelpers.resetTimers();
  },
};

/**
 * Assertion helpers for common patterns
 */
export const assertionHelpers = {
  /**
   * Assert model was called with specific parameters
   */
  expectModelCalledWith: (model: any, expectedParams: any) => {
    expect(model.doGenerate).toHaveBeenCalledWith(expect.objectContaining(expectedParams));
  },

  /**
   * Assert tool was executed with specific arguments
   */
  expectToolCalledWith: (tool: any, expectedArgs: any) => {
    expect(tool.execute).toHaveBeenCalledWith(expect.objectContaining(expectedArgs));
  },

  /**
   * Assert usage statistics within expected ranges
   */
  expectUsageInRange: (
    usage: any,
    expectedRange: { input: [number, number]; output: [number, number] },
  ) => {
    expect(usage.inputTokens).toBeGreaterThanOrEqual(expectedRange.input[0]);
    expect(usage.inputTokens).toBeLessThanOrEqual(expectedRange.input[1]);
    expect(usage.outputTokens).toBeGreaterThanOrEqual(expectedRange.output[0]);
    expect(usage.outputTokens).toBeLessThanOrEqual(expectedRange.output[1]);
    expect(usage.totalTokens).toBe(usage.inputTokens + usage.outputTokens);
  },

  /**
   * Assert stream chunks match expected sequence
   */
  expectStreamChunks: async (stream: ReadableStream, expectedChunks: string[]) => {
    const reader = stream.getReader();
    const chunks: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }

    expect(chunks).toEqual(expectedChunks);
  },

  /**
   * Assert error has expected properties
   */
  expectErrorType: (error: any, expectedType: string, expectedCode?: string) => {
    expect(error.name).toBe(expectedType);
    if (expectedCode) {
      expect(error.code).toBe(expectedCode);
    }
  },
};

/**
 * Integration test helpers
 */
export const integrationHelpers = {
  /**
   * Setup mock database for integration tests
   */
  setupMockDatabase: () => {
    const mockDb = {
      conversation: {
        create: vi.fn().mockResolvedValue({ id: 'conv-123', messages: [] }),
        findUnique: vi.fn().mockResolvedValue({ id: 'conv-123', messages: [] }),
        update: vi.fn().mockResolvedValue({ id: 'conv-123', messages: [] }),
        delete: vi.fn().mockResolvedValue({ id: 'conv-123' }),
      },
      usage: {
        create: vi.fn().mockResolvedValue({ id: 'usage-123', cost: 0.01 }),
      },
    };

    return mockDb;
  },

  /**
   * Setup mock analytics for integration tests
   */
  setupMockAnalytics: () => {
    const mockAnalytics = {
      track: vi.fn().mockResolvedValue(undefined),
      identify: vi.fn().mockResolvedValue(undefined),
      page: vi.fn().mockResolvedValue(undefined),
    };

    // Mock global analytics if it exists
    if (typeof window !== 'undefined') {
      (window as any).analytics = mockAnalytics;
    }

    return mockAnalytics;
  },

  /**
   * Setup mock observability for integration tests
   */
  setupMockObservability: () => ({
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
  }),
};
