/**
 * AI Test Factory
 *
 * Centralized factory for creating consistent AI SDK tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for AI testing.
 *
 * Following analytics package emitter-test-factory.ts pattern:
 * - Single consolidated factory file
 * - Clear exports and test data generators
 * - Integration with @repo/qa mocks
 */

import type { LanguageModel } from 'ai';
import { expect, vi } from 'vitest';

// Import types from AI package
import type { StreamHandler } from '#/server';

// Common test data generators
export const createTestData = {
  /**
   * Creates a standard mock model for testing
   */
  model: (overrides: Partial<LanguageModel> = {}): LanguageModel =>
    ({
      specificationVersion: 'v1',
      provider: 'openai',
      modelId: 'gpt-4-turbo',
      defaultObjectGenerationMode: 'tool',
      ...overrides,
    }) as any,

  /**
   * Creates test messages for conversations
   */
  messages: (count: number = 3): any[] =>
    Array.from({ length: count }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: i % 2 === 0 ? `User message ${i}` : `Assistant response ${i}`,
    })),

  /**
   * Creates test stream handler with spy functions
   */
  streamHandler: (): StreamHandler & { spies: Record<string, any> } => {
    const spies = {
      onTextDelta: vi.fn(),
      onObjectDelta: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    return {
      ...spies,
      spies,
    };
  },

  /**
   * Creates test RAG documents
   */
  documents: (count: number = 5): any[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `doc-${i}`,
      content: `Document ${i} content about topic ${i % 3}`,
      metadata: {
        title: `Document ${i}`,
        topic: `topic-${i % 3}`,
        score: Math.random(),
      },
    })),

  /**
   * Creates test vector embeddings
   */
  embeddings: (dimension: number = 1536): number[] =>
    Array.from({ length: dimension }, (_, i) => Math.sin(i / 100)),

  /**
   * Creates test tool configurations
   */
  tools: {
    weather: () => ({
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
        },
        required: ['location'],
      },
      sampleResult: { temperature: 22, condition: 'sunny' },
    }),

    calculator: () => ({
      description: 'Perform mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string' },
        },
        required: ['expression'],
      },
      sampleResult: { result: 42 },
    }),

    search: () => ({
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          maxResults: { type: 'number', default: 5 },
        },
        required: ['query'],
      },
      sampleResult: { results: ['Result 1', 'Result 2'] },
    }),
  },

  /**
   * Creates test telemetry metadata
   */
  telemetry: (overrides: Record<string, any> = {}) => ({
    feature: 'test-feature',
    environment: 'test',
    userId: 'test-user',
    sessionId: 'test-session',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Creates test usage data
   */
  usage: () => ({
    promptTokens: 100,
    completionTokens: 50,
    totalTokens: 150,
  }),

  /**
   * Creates test error scenarios
   */
  errors: {
    api: () => ({
      type: 'APIError',
      message: 'API request failed',
      statusCode: 500,
      details: 'Internal server error',
    }),

    tool: () => ({
      type: 'ToolError',
      message: 'Tool execution failed',
      toolName: 'weather',
      error: 'Unable to fetch weather data',
    }),

    stream: () => ({
      type: 'StreamError',
      message: 'Stream interrupted',
      bytesReceived: 1024,
      lastChunk: 'partial data...',
    }),
  },
};

/**
 * Test scenario factory for structured test creation
 */
export interface TestScenario<TResult = any> {
  name: string;
  description: string;
  arrange: () => any;
  act: () => TResult | Promise<TResult>;
  assert: (result: TResult) => void | Promise<void>;
  cleanup?: () => void;
}

/**
 * Create a test scenario runner
 */
export function createTestScenarioRunner() {
  const scenarios: TestScenario[] = [];
  const results: Map<string, any> = new Map();

  const runner = {
    addScenario: (scenario: TestScenario) => {
      scenarios.push(scenario);
    },

    runScenario: async (scenario: TestScenario) => {
      const setup = scenario.arrange();
      const result = await scenario.act();
      await scenario.assert(result);

      if (scenario.cleanup) {
        scenario.cleanup();
      }

      results.set(scenario.name, { success: true, result });
      return result;
    },

    runAll: async () => {
      for (const scenario of scenarios) {
        try {
          await runner.runScenario(scenario);
        } catch (error) {
          results.set(scenario.name, { success: false, error });
        }
      }
      return results;
    },

    getResults: () => results,
  };

  return runner;
}

/**
 * Common test configuration factory
 */
export function createAITestConfig(overrides: any = {}) {
  return {
    model: createTestData.model(),
    messages: createTestData.messages(),
    streamHandler: createTestData.streamHandler(),
    maxRetries: 3,
    temperature: 0.7,
    ...overrides,
  };
}

/**
 * Mock factories for different AI SDK features
 */
export const MockFactories = {
  /**
   * Create a mock for text generation
   */
  createTextGenerationMock: (responses: string[] = ['Mock response']) => {
    let responseIndex = 0;
    return vi.fn(async () => ({
      text: responses[responseIndex++ % responses.length],
      usage: createTestData.usage(),
      finishReason: 'stop',
    }));
  },

  /**
   * Create a mock for streaming
   */
  createStreamMock: (chunks: string[] = ['Hello', ' world']) => {
    return vi.fn(() => ({
      textStream: {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of chunks) {
            yield chunk;
          }
        },
      },
      usage: createTestData.usage(),
    }));
  },

  /**
   * Create a mock for object generation
   */
  createObjectGenerationMock: (object: any = { result: 'mock' }) => {
    return vi.fn(async () => ({
      object,
      usage: createTestData.usage(),
      finishReason: 'stop',
    }));
  },

  /**
   * Create a mock for tool calling
   */
  createToolCallMock: (toolResults: Record<string, any> = {}) => {
    return vi.fn(async ({ tools }) => ({
      toolCalls: Object.entries(tools).map(([name, tool]) => ({
        toolName: name,
        args: {},
        result: toolResults[name] || { success: true },
      })),
      usage: createTestData.usage(),
    }));
  },
};

/**
 * Test assertion helpers
 */
export const TestAssertions = {
  /**
   * Assert basic text generation result
   */
  assertTextGeneration: (result: any, expectedText: string) => {
    expect(result).toBeDefined();
    expect(result.text).toBe(expectedText);
    expect(result.usage).toBeDefined();
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  },

  /**
   * Assert streaming result
   */
  assertStreamResult: async (stream: any, expectedChunks: string[]) => {
    const chunks: string[] = [];

    for await (const chunk of stream.textStream) {
      chunks.push(chunk);
    }

    expect(chunks).toStrictEqual(expectedChunks);
  },

  /**
   * Assert tool execution
   */
  assertToolExecution: (result: any, toolName: string) => {
    if (!result.toolCalls) {
      throw new Error('result.toolCalls is not defined');
    }
    const toolCall = result.toolCalls.find((tc: any) => tc.toolName === toolName);
    if (!toolCall) {
      throw new Error(`Tool call with name "${toolName}" not found`);
    }
    if (!toolCall.result) {
      throw new Error(`Tool call result for "${toolName}" is not defined`);
    }
  },

  /**
   * Assert error handling
   */
  assertErrorHandling: (error: any, expectedType: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(expectedType);
  },
};

/**
 * Quick setup helpers for common test scenarios
 */
export const QuickSetup = {
  /**
   * Basic text generation test
   */
  basicTextGeneration: () => ({
    config: createAITestConfig(),
    mock: MockFactories.createTextGenerationMock(['Test response']),
    assert: (result: any) => TestAssertions.assertTextGeneration(result, 'Test response'),
  }),

  /**
   * Streaming test setup
   */
  streaming: (chunks: string[] = ['Stream', ' test']) => ({
    config: createAITestConfig(),
    mock: MockFactories.createStreamMock(chunks),
    assert: (stream: any) => TestAssertions.assertStreamResult(stream, chunks),
  }),

  /**
   * Tool calling test setup
   */
  toolCalling: () => {
    const tools = {
      weather: createTestData.tools.weather(),
      calculator: createTestData.tools.calculator(),
    };

    return {
      config: createAITestConfig({ tools }),
      mock: MockFactories.createToolCallMock({
        weather: { temperature: 25, condition: 'sunny' },
        calculator: { result: 42 },
      }),
      assert: (result: any) => {
        TestAssertions.assertToolExecution(result, 'weather');
        TestAssertions.assertToolExecution(result, 'calculator');
      },
    };
  },

  /**
   * RAG (Retrieval Augmented Generation) test setup
   */
  rag: () => ({
    config: createAITestConfig({
      documents: createTestData.documents(10),
      embeddings: createTestData.embeddings(),
    }),
    mock: MockFactories.createTextGenerationMock(['RAG response with context']),
    assert: (result: any) => {
      TestAssertions.assertTextGeneration(result, 'RAG response with context');
    },
  }),
};

/**
 * Export test scenario templates
 */
export const TestScenarioTemplates = {
  /**
   * Create a basic text generation scenario
   */
  textGeneration: (name: string, prompt: string, expectedResponse: string): TestScenario => ({
    name,
    description: `Test text generation with prompt: ${prompt}`,
    arrange: () => QuickSetup.basicTextGeneration(),
    act: async () => {
      const setup = QuickSetup.basicTextGeneration();
      return await setup.mock();
    },
    assert: result => TestAssertions.assertTextGeneration(result, expectedResponse),
  }),

  /**
   * Create a streaming scenario
   */
  streaming: (name: string, chunks: string[]): TestScenario => ({
    name,
    description: `Test streaming with ${chunks.length} chunks`,
    arrange: () => QuickSetup.streaming(chunks),
    act: async () => {
      const setup = QuickSetup.streaming(chunks);
      return await setup.mock();
    },
    assert: async stream => TestAssertions.assertStreamResult(stream, chunks),
  }),

  /**
   * Create an error handling scenario
   */
  errorHandling: (name: string, errorType: 'api' | 'tool' | 'stream'): TestScenario => ({
    name,
    description: `Test ${errorType} error handling`,
    arrange: () => ({
      error: createTestData.errors[errorType](),
      config: createAITestConfig(),
    }),
    act: async () => {
      const error = createTestData.errors[errorType]();
      throw new Error(error.message);
    },
    assert: error => TestAssertions.assertErrorHandling(error, `${errorType}Error`),
  }),
};

/**
 * Re-export test data generators for convenience
 */
export { createTestData as testData };

/**
 * Test environment creators (for backward compatibility with tests)
 */
export const TestEnvironments = {
  createBasicTestEnvironment: () => ({
    model: createTestData.model(),
    messages: createTestData.messages(),
    config: createAITestConfig(),
  }),

  createErrorTestEnvironment: () => ({
    model: createTestData.model(),
    error: createTestData.errors.api(),
    config: createAITestConfig(),
  }),

  createToolTestEnvironment: () => ({
    model: createTestData.model(),
    tools: createTestData.tools,
    config: createAITestConfig(),
  }),

  createStreamingTestEnvironment: () => ({
    model: createTestData.model(),
    stream: createTestData.streamHandler(),
    config: createAITestConfig(),
  }),

  createTelemetryTestEnvironment: () => ({
    model: createTestData.model(),
    telemetry: createTestData.telemetry(),
    config: createAITestConfig(),
  }),
};

/**
 * Export factory instance for backwards compatibility
 */
export const AITestFactory = {
  createTestData,
  createTestScenarioRunner,
  createAITestConfig,
  MockFactories,
  TestAssertions,
  QuickSetup,
  TestScenarioTemplates,
  // Add test environment methods
  ...TestEnvironments,
};
