/**
 * AI SDK v5 Model Factories
 * Centralized MockLanguageModelV2 factories for common testing scenarios
 * Using official AI SDK v5 testing utilities
 */

// Note: LanguageModelV2ToolCall may not be exported in current AI SDK version
// Using any for tool calls until proper types are available
import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

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
  toolCalls: LanguageModelV2ToolCall[] = [],
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
  toolCalls: LanguageModelV2ToolCall[] = [],
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
 * Note: Use MockEmbeddingModelV2 for embedding functionality
 */
export const createEmbeddingModel = (embeddingDim = 3) => {
  // Use the dedicated embedding model from test utils
  const { getMockEmbeddingModel } = require('./providers');
  return getMockEmbeddingModel('test', 'embedding-model', embeddingDim);
};

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
    doGenerate: async (params: any) => {
      const hasImageContent =
        params.messages?.some((msg: any) =>
          msg.content?.some?.((content: any) => content.type === 'media'),
        ) ?? false;

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
    doGenerate: async params => ({
      finishReason: 'stop' as const,
      usage: {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
        // Include reasoning tokens if applicable
        reasoningTokens: (params as any).experimental_telemetry?.isEnabled ? 5 : undefined,
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
  doGenerateOverride: MockLanguageModelV2['doGenerate'],
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
  doStreamOverride: MockLanguageModelV2['doStream'],
  modelId = 'test-custom-streaming-model',
) =>
  new MockLanguageModelV2({
    modelId,
    doStream: doStreamOverride,
  });
