import type { LanguageModelV2 } from '@ai-sdk/provider';
import { simulateReadableStream } from 'ai';

/**
 * AI SDK v5 Test Factory (v5 Pattern)
 * Uses official MockLanguageModelV2 for standardized testing
 * Following v5 validated testing patterns
 */

/**
 * Mock language model using official AI SDK v5 test utilities
 * Uses MockLanguageModelV2 from 'ai/test' for v5 compliance
 *
 * @param modelId - Identifier for the mock model
 * @param options - Optional configuration for mock behavior
 * @returns Configured MockLanguageModelV2 instance
 *
 * @example v5 Pattern
 * ```typescript
 * import { createMockLanguageModel } from '@repo/ai/shared';
 * import { generateText } from 'ai';
 *
 * const mockModel = createMockLanguageModel('test-gpt-4', {
 *   responses: ['Hello, world!'],
 *   usage: { inputTokens: 10, outputTokens: 20 }
 * });
 *
 * const result = await generateText({
 *   model: mockModel,
 *   prompt: 'Hello, test!',
 * });
 * ```
 */
export function createMockLanguageModel(
  modelId: string,
  options: {
    responses?: string[];
    usage?: { inputTokens: number; outputTokens: number };
    finishReason?: 'stop' | 'length' | 'content-filter' | 'tool-calls';
    streamChunks?: Array<
      { type: 'text'; text: string } | { type: 'finish'; finishReason: string; usage?: any }
    >;
  } = {},
): any {
  // This will be replaced with actual MockLanguageModelV2 in implementation
  // Using any type temporarily for migration compatibility
  const {
    responses = ['Mock response'],
    usage = { inputTokens: 10, outputTokens: 20 },
    finishReason = 'stop',
    streamChunks = [
      { type: 'text', text: 'Mock ' },
      { type: 'text', text: 'response' },
      { type: 'finish', finishReason: 'stop', usage },
    ],
  } = options;

  return {
    modelId,
    provider: 'mock',
    specificationVersion: 'v2',
    supportedUrls: {},
    // v5 MockLanguageModelV2 pattern
    doGenerate: async () => ({
      content: [{ type: 'text', text: responses[0] || 'Mock response' }],
      finishReason,
      usage: { ...usage, totalTokens: usage.inputTokens + usage.outputTokens },
      warnings: [],
    }),
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: streamChunks,
      }),
    }),
  } as LanguageModelV2;
}

/**
 * Standard test model registry following AI SDK patterns
 * Provides consistent model names and behaviors for testing
 */
export interface TestModelRegistry {
  chat: LanguageModelV2;
  reasoning: LanguageModelV2;
  title: LanguageModelV2;
  artifact: LanguageModelV2;
}

/**
 * Create a standardized set of test models for AI applications
 * Following Vercel AI SDK testing patterns
 */
export function createTestModelRegistry(): TestModelRegistry {
  return {
    chat: createMockLanguageModel('test-chat-model'),
    reasoning: createMockLanguageModel('test-reasoning-model'),
    title: createMockLanguageModel('test-title-model'),
    artifact: createMockLanguageModel('test-artifact-model'),
  };
}

/**
 * Create test models with custom model IDs
 * Useful for testing specific model configurations
 */
export function createCustomTestModels(
  modelIds: Partial<Record<keyof TestModelRegistry, string>>,
): TestModelRegistry {
  const defaults = {
    chat: 'test-chat-model',
    reasoning: 'test-reasoning-model',
    title: 'test-title-model',
    artifact: 'test-artifact-model',
  };

  return {
    chat: createMockLanguageModel(modelIds.chat ?? defaults.chat),
    reasoning: createMockLanguageModel(modelIds.reasoning ?? defaults.reasoning),
    title: createMockLanguageModel(modelIds.title ?? defaults.title),
    artifact: createMockLanguageModel(modelIds.artifact ?? defaults.artifact),
  };
}

/**
 * Convert test model registry to model map for provider configuration
 * Follows AI SDK patterns for provider setup
 */
export function testModelsToMap(registry: TestModelRegistry): Record<string, LanguageModelV2> {
  return {
    'chat-model': registry.chat,
    'chat-model-reasoning': registry.reasoning,
    'title-model': registry.title,
    'artifact-model': registry.artifact,
  };
}
