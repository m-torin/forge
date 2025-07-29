// Centralized AI package mocks using official AI SDK V5 testing utilities
//
// IMPORTANT: This codebase uses AI SDK V5 (beta) which only supports MockLanguageModelV2.
// Do NOT use MockLanguageModelV1 as it's deprecated and incompatible with V5.
// Always use MockLanguageModelV2 and simulateReadableStream for streaming tests.
//
import { vi } from 'vitest';

// Create mock language models using official AI SDK V5 testing utilities
export const createMockLanguageModel = (
  options: {
    generateText?: string;
    generateObject?: any;
    streamChunks?: string[];
    usage?: { inputTokens: number; outputTokens: number };
  } = {},
) => {
  const {
    generateText = 'Mock generated text',
    generateObject = { key: 'value', sentiment: 'positive', confidence: 0.9 },
    streamChunks = ['Mock ', 'streamed ', 'text'],
    usage = { inputTokens: 10, outputTokens: 20 },
  } = options;

  // Mock implementation compatible with MockLanguageModelV2 API
  return {
    doGenerate: vi.fn().mockResolvedValue({
      finishReason: 'stop',
      usage: { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens },
      text: generateText,
    }),
    doStream: vi.fn().mockResolvedValue({
      stream: {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of streamChunks) {
            yield { type: 'text-delta', textDelta: chunk };
          }
          yield {
            type: 'finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage,
          };
        },
      },
    }),
    doEmbed: vi.fn().mockResolvedValue({
      embeddings: [[0.1, 0.2, 0.3]],
      usage: { promptTokens: usage.inputTokens },
    }),
  };
};

// Create mock embedding model
export const createMockEmbeddingModel = (
  options: {
    embeddings?: number[][];
    usage?: { promptTokens: number };
  } = {},
) => {
  const { embeddings = [[0.1, 0.2, 0.3]], usage = { promptTokens: 10 } } = options;

  return {
    doEmbed: vi.fn().mockResolvedValue({
      embeddings,
      usage,
    }),
  };
};

// Helper to create mock models for different providers
export const createMockOpenAIModel = (modelName: string = 'gpt-4') => {
  return {
    modelId: modelName,
    ...createMockLanguageModel(),
  };
};

export const createMockOpenAIEmbeddingModel = (modelName: string = 'text-embedding-3-small') => {
  return {
    modelId: modelName,
    ...createMockEmbeddingModel(),
  };
};

export const createMockAnthropicModel = (modelName: string = 'claude-3-5-sonnet-20241022') => {
  return {
    modelId: modelName,
    ...createMockLanguageModel({
      generateText: 'Mock generated text',
      usage: { inputTokens: 10, outputTokens: 20 },
    }),
  };
};

// For backwards compatibility with existing tests that expect these functions
// These are now just utilities to create mock responses
export const mockAIStreamResponse = (chunks: string[]) => {
  return {
    textStream: {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    },
    text: chunks.join(''),
    usage: { promptTokens: 10, completionTokens: 20 },
  };
};

export const mockAIChatMessages = (messages: Array<{ role: string; content: string }>) => {
  return messages.map((msg, index) => ({
    id: `msg-${index}`,
    role: msg.role,
    content: msg.content,
    createdAt: new Date(),
  }));
};

export const resetAIMocks = () => {
  vi.clearAllMocks();
};

// Keep only essential mocks for UI components and providers
// The core AI functions will be tested using MockLanguageModelV2

// Mock core AI functions
vi.mock('ai', () => ({
  embed: vi.fn(async ({ model, value }) => ({
    embedding: [0.1, 0.2, 0.3],
    usage: { promptTokens: 10 },
  })),
  embedMany: vi.fn(async ({ model, values }) => ({
    embeddings: values.map(() => [0.1, 0.2, 0.3]),
    usage: { promptTokens: 10 * values.length },
  })),
  generateText: vi.fn(async ({ model, prompt, messages }) => ({
    text: 'Mock generated text',
    usage: { promptTokens: 10, completionTokens: 20 },
    finishReason: 'stop',
  })),
  streamText: vi.fn(async ({ model, prompt, messages }) => ({
    textStream: {
      [Symbol.asyncIterator]: async function* () {
        yield 'Mock ';
        yield 'streamed ';
        yield 'text';
      },
    },
    text: 'Mock streamed text',
    usage: { promptTokens: 10, completionTokens: 20 },
    finishReason: 'stop',
  })),
  generateObject: vi.fn(async ({ model, schema, prompt }) => ({
    object: { key: 'value', sentiment: 'positive', confidence: 0.9 },
    usage: { promptTokens: 10, completionTokens: 20 },
    finishReason: 'stop',
  })),
  tool: vi.fn().mockImplementation(config => {
    if (!config) return null;
    return {
      description: config.description,
      parameters: config.parameters,
      execute: config.execute || (async () => ({ success: true })),
    };
  }),
}));

// Mock @ai-sdk/react for UI components (V5)
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

// Mock ai/react for backward compatibility (legacy V4 imports)
vi.mock('ai/react', () => ({
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

// Mock ai/mcp-stdio for MCP functionality
vi.mock('ai/mcp-stdio', () => ({
  createMCPStdioProvider: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    execute: vi.fn(),
    getTools: vi.fn(() => []),
    getTool: vi.fn(),
  })),
}));

// Mock Stripe AI SDK
vi.mock('@stripe/agent-toolkit/ai-sdk', () => ({
  createStripeToolkit: vi.fn(() => ({
    tools: [],
    execute: vi.fn(),
  })),
}));

// Mock @ai-sdk/openai for AI SDK v5
vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embedding: vi.fn().mockImplementation(modelId => ({
      modelId: modelId || 'text-embedding-3-small',
      specificationVersion: 'v2',
      provider: 'openai',
      supportsEmbedding: true,
      doEmbed: vi.fn().mockResolvedValue({
        embeddings: [[0.1, 0.2, 0.3]],
        usage: { inputTokens: 10 },
      }),
    })),
    chat: vi.fn().mockImplementation(modelId => ({
      modelId: modelId || 'gpt-4',
      specificationVersion: 'v2',
      provider: 'openai',
      supportsCompletion: true,
      doGenerate: vi.fn().mockResolvedValue({
        finishReason: 'stop',
        usage: { inputTokens: 10, outputTokens: 20 },
        text: 'Mock generated text',
      }),
      doStream: vi.fn().mockResolvedValue({
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { type: 'text-delta', textDelta: 'Mock ' };
            yield { type: 'text-delta', textDelta: 'streamed ' };
            yield { type: 'text-delta', textDelta: 'text' };
            yield {
              type: 'finish',
              finishReason: 'stop',
              logprobs: undefined,
              usage: { inputTokens: 10, outputTokens: 20 },
            };
          },
        },
      }),
    })),
  },
}));
