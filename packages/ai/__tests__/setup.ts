// Setup for AI package tests - AI SDK v5 only
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// AI SDK v5 Official Testing Utilities
import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

// Import centralized test utilities

// Import centralized QA mocks
import '@repo/qa/vitest/mocks';
import { setupObservabilityMocks } from '@repo/qa/vitest/mocks/internal/observability';

// Note: @repo/qa/vitest/setup/react-package is automatically included by createReactPackageConfig
// No manual import needed

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

// AI SDK v5 Mocks (using official testing utilities)
vi.mock('ai', async importOriginal => {
  const actual = await importOriginal<typeof import('ai')>();

  return {
    ...actual,
    // Export testing utilities
    MockLanguageModelV2,
    simulateReadableStream,

    // Mock embed functions with v5 patterns
    embed: vi.fn().mockImplementation(async ({ model, value }) => ({
      embedding: [0.1, 0.2, 0.3],
      usage: {
        inputTokens: 10,
        outputTokens: 0,
        totalTokens: 10,
      },
    })),

    embedMany: vi.fn().mockImplementation(async ({ model, values }) => ({
      embeddings: values.map(() => [0.1, 0.2, 0.3]),
      usage: {
        inputTokens: 10 * values.length,
        outputTokens: 0,
        totalTokens: 10 * values.length,
      },
    })),

    // Mock generateText with v5 patterns
    generateText: vi.fn().mockImplementation(async ({ model, prompt, messages, tools }) => {
      const baseResponse = {
        text: 'Mock generated text',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        finishReason: 'stop',
        toolCalls: [],
        toolResults: [],
        steps: [],
      };

      if (tools && Object.keys(tools).length > 0) {
        baseResponse.finishReason = 'tool-calls';
        baseResponse.toolCalls = [
          {
            toolCallId: 'mock-call-1',
            toolName: Object.keys(tools)[0],
            input: { test: 'value' },
            dynamic: false,
          },
        ];
      }

      return baseResponse;
    }),

    // Mock streamText with v5 streaming patterns
    streamText: vi.fn().mockImplementation(({ model, prompt, messages, tools }) => ({
      textStream: {
        [Symbol.asyncIterator]: async function* () {
          yield 'Mock ';
          yield 'streamed ';
          yield 'text';
        },
      },
      fullStream: {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'text-start', id: 'text-1' };
          yield { type: 'text-delta', id: 'text-1', text: 'Mock ' }; // v5 uses 'text' not 'delta'
          yield { type: 'text-delta', id: 'text-1', text: 'streamed ' };
          yield { type: 'text-delta', id: 'text-1', text: 'text' };
          yield { type: 'text-end', id: 'text-1' };
          yield {
            type: 'finish',
            finishReason: 'stop',
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          };
        },
      },
      text: Promise.resolve('Mock streamed text'),
      usage: Promise.resolve({ inputTokens: 10, outputTokens: 20, totalTokens: 30 }),
      finishReason: Promise.resolve('stop'),
      toolCalls: Promise.resolve([]),
      toolResults: Promise.resolve([]),
      toUIMessageStreamResponse: vi.fn().mockResolvedValue(new Response()),
      toUIMessageStream: vi.fn().mockImplementation(options => ({
        [Symbol.asyncIterator]: async function* () {
          yield {
            type: 'text-delta',
            textDelta: 'Mock streamed text',
          };

          if (options?.sendSources) {
            yield {
              type: 'data',
              data: {
                type: 'source',
                id: 'test-source-1',
                url: 'https://example.com/test',
                title: 'Test Source',
              },
            };
          }
        },
      })),
    })),

    // Mock generateObject with v5 patterns
    generateObject: vi.fn().mockImplementation(async ({ model, schema, prompt }) => ({
      object: { key: 'value', sentiment: 'positive', confidence: 0.9 },
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      finishReason: 'stop',
    })),

    // Mock streamObject with v5 patterns
    streamObject: vi.fn().mockImplementation(({ model, schema, prompt }) => ({
      fullStream: {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'text-start', id: 'text-1' };
          yield { type: 'text-delta', id: 'text-1', text: '{"key":' }; // v5 uses 'text' not 'delta'
          yield { type: 'text-delta', id: 'text-1', text: '"value"}' };
          yield { type: 'object', object: { key: 'value', text: 'Hello JSON' } }; // Add object event
          yield { type: 'text-end', id: 'text-1' };
          yield {
            type: 'finish',
            finishReason: 'stop',
            usage: { inputTokens: 10, outputTokens: 15, totalTokens: 25 },
          };
        },
      },
      object: Promise.resolve({
        key: 'value',
        text: 'Hello JSON',
        sentiment: 'positive',
        confidence: 0.9,
      }),
      usage: Promise.resolve({ inputTokens: 10, outputTokens: 20, totalTokens: 30 }),
    })),

    // Mock tool function with v5 patterns (inputSchema not parameters)
    tool: vi.fn().mockImplementation(config => {
      if (!config) return null;
      return {
        description: config.description,
        inputSchema: config.inputSchema, // v5 uses inputSchema, not parameters
        execute: config.execute || (async () => ({ success: true })),
        toModelOutput: config.toModelOutput || (result => ({ type: 'json', value: result })),
      };
    }),

    // Mock dynamicTool for v5 dynamic tool patterns
    dynamicTool: vi.fn().mockImplementation(config => ({
      description: config.description,
      inputSchema: config.inputSchema,
      execute: config.execute,
      dynamic: true,
    })),

    // Mock stop conditions for multi-step workflows
    stepCountIs: vi.fn().mockImplementation(
      (count: number) =>
        ({ steps }: { steps: any[] }) =>
          steps.length >= count,
    ),

    hasToolCall: vi.fn().mockImplementation(
      (toolName: string) =>
        ({ steps }: { steps: any[] }) =>
          steps.some((step: any) =>
            step.toolCalls?.some((call: any) => call.toolName === toolName),
          ),
    ),

    // Mock middleware functions
    wrapLanguageModel: vi.fn().mockImplementation(({ model, middleware }) => model),
    extractReasoningMiddleware: vi.fn().mockImplementation(options => ({
      tagName: options?.tagName || 'think',
      process: (text: string) => ({ reasoning: 'Mock reasoning', answer: text }),
    })),
  };
});

// Setup observability mocks using QA centralized approach
setupObservabilityMocks({ entryPoints: ['server/next'] });

// Note: AI SDK providers are now mocked by QA centralized mocks
// Custom provider utilities available through test-utils/providers

// Mock @ai-sdk/react with v5 patterns
vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    setMessages: vi.fn(),
    append: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn(),
    stop: vi.fn(),
    status: 'idle', // v5 uses status instead of isLoading
    error: null,
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    data: [],
    addData: vi.fn(),
  })),
  useCompletion: vi.fn(() => ({
    completion: '',
    input: '',
    setInput: vi.fn(),
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    stop: vi.fn(),
    status: 'idle', // v5 uses status instead of isLoading
    error: null,
    complete: vi.fn(),
  })),
  useAssistant: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    submitMessage: vi.fn(),
    status: 'idle',
    error: null,
    threadId: null,
    stop: vi.fn(),
  })),
}));

// Mock environment variables for AI package
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_NODE_ENV', 'test');

// Mock API Keys for AI providers
vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test-ai-package-key');
vi.stubEnv('OPENAI_API_KEY', 'sk-test-ai-package-key');
vi.stubEnv('GOOGLE_AI_API_KEY', 'test-google-ai-key');
vi.stubEnv('DEEP_INFRA_API_KEY', 'test-deep-infra-key');
vi.stubEnv('PERPLEXITY_API_KEY', 'test-perplexity-key');

// Mock Upstash Vector Database
vi.stubEnv('UPSTASH_VECTOR_REST_URL', 'https://test-vector.upstash.io');
vi.stubEnv('UPSTASH_VECTOR_REST_TOKEN', 'test-vector-token');
vi.stubEnv('UPSTASH_VECTOR_NAMESPACE', 'test-namespace');

// Mock MCP Configuration
vi.stubEnv('MCP_SERVERS', 'test-servers');
vi.stubEnv('MCP_FILESYSTEM_PATH', '/test/path');
vi.stubEnv('MCP_SQLITE_DB', 'test.db');

// Note: Upstash Vector is now mocked by QA centralized mocks
// Use import { mockUpstashVectorClient } from '@repo/qa/vitest/mocks/providers/upstash/vector';

// Mock AI Logging Configuration
vi.stubEnv('AI_LOGGING_ENABLED', 'false');
vi.stubEnv('AI_LOG_REQUESTS', 'false');
vi.stubEnv('AI_LOG_RESPONSES', 'false');
vi.stubEnv('AI_LOG_PERFORMANCE', 'false');

// Mock public feature flags
vi.stubEnv('NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED', 'false');
vi.stubEnv('NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED', 'false');

// Additional AI-specific test configuration
vi.stubEnv('AI_MOCK_RESPONSES', 'true');
vi.stubEnv('DISABLE_AI_RATE_LIMITING', 'true');
vi.stubEnv('USE_MOCK_AI_RESPONSES', 'true');
vi.stubEnv('AI_REQUEST_TIMEOUT', '5000');

// Set up global properties for Node.js environment
if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'node.js',
      platform: 'node',
    },
    writable: true,
    configurable: true,
  });
}

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

// Common AI test configuration
export const createAITestConfig = (overrides = {}) => ({
  providers: {
    openai: { apiKey: 'sk-test-ai-package-key' },
    anthropic: { apiKey: 'sk-ant-test-ai-package-key' },
    ...overrides,
  },
});

// Common AI test creation patterns
export const createTestAI = async (config = createAITestConfig()) => {
  // Mock AI instance for testing
  return {
    config,
    providers: config.providers,
    generate: vi.fn(),
    stream: vi.fn(),
  };
};

export const createTestClientAI = async (config = createAITestConfig()) => {
  // Mock client AI instance for testing
  return {
    config,
    providers: config.providers,
    generate: vi.fn(),
    stream: vi.fn(),
  };
};

// Export centralized v5 test utilities
export * from './test-utils/models';
export * from './test-utils/providers';
export * from './test-utils/streams';
export * from './test-utils/telemetry';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
