// Setup for AI package tests
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// AI SDK v5 Official Testing Utilities
import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

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

// AI SDK Mocks (using official v5 testing utilities)
// Mock core AI functions
vi.mock('ai', async importOriginal => {
  const actual = await importOriginal<typeof import('ai')>();

  return {
    ...actual,
    MockLanguageModelV2,
    simulateReadableStream,
    customProvider: vi.fn().mockImplementation(config => ({
      ...config,
      languageModels: Object.fromEntries(
        Object.entries(config.languageModels || {}).map(([key, value]) => [
          key,
          vi.fn().mockReturnValue({
            modelId: key,
            provider: config.id || 'custom',
            doGenerate: vi.fn().mockResolvedValue({
              text: 'Mock generated text',
              usage: { inputTokens: 10, outputTokens: 20 },
              finishReason: 'stop',
            }),
          }),
        ]),
      ),
    })),
    embed: vi.fn(async ({ model, value }) => ({
      embedding: [0.1, 0.2, 0.3],
      usage: {
        promptTokens: 10,
        completionTokens: 0,
        totalTokens: 10,
      },
    })),
    embedMany: vi.fn(async ({ model, values }) => ({
      embeddings: values.map(() => [0.1, 0.2, 0.3]),
      usage: {
        promptTokens: 10 * values.length,
        completionTokens: 0,
        totalTokens: 10 * values.length,
      },
    })),
    generateText: vi.fn(async ({ model, prompt, messages }) => ({
      text: 'Mock generated text',
      usage: { promptTokens: 10, completionTokens: 20 },
      finishReason: 'stop',
    })),
    streamText: vi.fn(({ model, prompt, messages }) => ({
      textStream: {
        [Symbol.asyncIterator]: async function* () {
          yield 'Mock ';
          yield 'streamed ';
          yield 'text';
        },
      },
      fullStream: {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'stream-start' };
          yield { type: 'text', text: 'Mock ' };
          yield { type: 'text', text: 'streamed ' };
          yield { type: 'text', text: 'text' };
          yield {
            type: 'finish',
            finishReason: 'stop',
            usage: { inputTokens: 10, outputTokens: 20 },
          };
        },
      },
      text: 'Mock streamed text',
      usage: { promptTokens: 10, completionTokens: 20 },
      finishReason: 'stop',
      toUIMessageStreamResponse: vi.fn().mockResolvedValue(new Response()),
      toDataStreamResponse: vi.fn().mockResolvedValue(new Response()),
      toUIMessageStream: vi.fn().mockImplementation(options => {
        const chunks = [
          {
            type: 'message-part',
            part: { type: 'text', text: 'Mock streamed text' },
          },
        ];

        // Add source chunks if sendSources is enabled
        if (options?.sendSources) {
          chunks.push({
            type: 'message-part',
            part: {
              type: 'source',
              url: 'https://example.com/test',
              title: 'Test Source',
              description: 'Mock source for testing',
              snippet: 'Test snippet',
              favicon: 'https://example.com/favicon.ico',
            },
          });
        }

        return {
          [Symbol.asyncIterator]: async function* () {
            for (const chunk of chunks) {
              yield chunk;
            }
          },
        };
      }),
    })),
    generateObject: vi.fn(async ({ model, schema, prompt }) => ({
      object: { key: 'value', sentiment: 'positive', confidence: 0.9 },
      usage: { promptTokens: 10, completionTokens: 20 },
      finishReason: 'stop',
    })),
    streamObject: vi.fn(({ model, schema, prompt }) => ({
      fullStream: {
        [Symbol.asyncIterator]: async function* () {
          yield {
            type: 'object',
            object: { key: 'value', sentiment: 'positive', confidence: 0.9 },
          };
        },
      },
      object: { key: 'value', sentiment: 'positive', confidence: 0.9 },
      usage: { promptTokens: 10, completionTokens: 20 },
    })),
    smoothStream: vi.fn(options => stream => stream),
    tool: vi.fn().mockImplementation(config => {
      if (!config) return null;
      return {
        description: config.description,
        parameters: config.parameters,
        execute: config.execute || (async () => ({ success: true })),
        experimental_toToolResultContent: config.experimental_toToolResultContent,
      };
    }),
    // Add missing AI SDK v5 functions
    stepCountIs: vi.fn().mockImplementation(count => ({
      evaluate: ({ steps }) => steps.length >= count,
    })),
    hasToolCall: vi.fn().mockImplementation(toolName => ({
      evaluate: ({ steps }) =>
        steps.some(step => step.toolCalls?.some(call => call.toolName === toolName)),
    })),
  };
});

// Mock @ai-sdk/react for UI components
vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    setMessages: vi.fn(),
    append: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn(),
    stop: vi.fn(),
    isLoading: false,
    error: null,
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
  })),
  useCompletion: vi.fn(() => ({
    completion: '',
    input: '',
    setInput: vi.fn(),
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    stop: vi.fn(),
    isLoading: false,
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

// Export test factories and generators
export * from './test-utils/ai-test-factory';
export {
  AIResponseGenerators,
  ErrorDataGenerators,
  TelemetryDataGenerators,
  TestDataGenerators,
  TestScenarioGenerators,
  ToolDataGenerators,
} from './test-utils/test-data-generators';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
