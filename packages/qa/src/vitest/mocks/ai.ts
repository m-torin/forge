// Centralized AI package mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock ai package
vi.mock('ai', () => ({
  streamText: vi.fn().mockResolvedValue({
    textStream: {
      [Symbol.asyncIterator]: async function* () {
        yield 'Mock streamed text';
      },
    },
    text: 'Mock response text',
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  generateText: vi.fn().mockResolvedValue({
    text: 'Mock generated text',
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  generateObject: vi.fn().mockResolvedValue({
    object: { key: 'value' },
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  embed: vi.fn().mockResolvedValue({
    embedding: [0.1, 0.2, 0.3],
    usage: { promptTokens: 10 },
  }),
  embedMany: vi.fn().mockResolvedValue({
    embeddings: [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ],
    usage: { promptTokens: 20 },
  }),
  createStreamableUI: vi.fn(),
  createStreamableValue: vi.fn(),
  readStreamableValue: vi.fn(),
  createAI: vi.fn(),
  getMutableAIState: vi.fn(),
  getAIState: vi.fn(),
  render: vi.fn(),
}));

// Mock ai/react
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

// Mock ai/mcp-stdio
vi.mock('ai/mcp-stdio', () => ({
  createMCPStdioProvider: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    execute: vi.fn(),
    getTools: vi.fn(() => []),
    getTool: vi.fn(),
  })),
}));

// Mock AI SDK providers
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
  createOpenAI: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
  createGoogleGenerativeAI: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
}));

vi.mock('@ai-sdk/perplexity', () => ({
  perplexity: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
  })),
  createPerplexity: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
  })),
}));

// Mock Stripe AI SDK
vi.mock('@stripe/agent-toolkit/ai-sdk', () => ({
  createStripeToolkit: vi.fn(() => ({
    tools: [],
    execute: vi.fn(),
  })),
}));

// Export helper functions for test setup
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
