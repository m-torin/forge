import type { LanguageModel } from 'ai';
import { simulateReadableStream } from 'ai';

/**
 * AI SDK v5 Test Factory (v5 Pattern)
 * Uses official MockLanguageModel for standardized testing
 * Following v5 validated testing patterns
 */

/**
 * Mock language model using official AI SDK v5 test utilities
 * Uses MockLanguageModel from 'ai/test' for v5 compliance
 *
 * @param modelId - Identifier for the mock model
 * @param options - Optional configuration for mock behavior
 * @returns Configured MockLanguageModel instance
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
  // This will be replaced with actual MockLanguageModel in implementation
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
    // v5 MockLanguageModel pattern
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
  } as LanguageModel;
}

/**
 * Standard test model registry following AI SDK patterns
 * Provides consistent model names and behaviors for testing
 */
export interface TestModelRegistry {
  chat: LanguageModel;
  reasoningText: LanguageModel;
  title: LanguageModel;
  artifact: LanguageModel;
}

/**
 * Create a standardized set of test models for AI applications
 * Following Vercel AI SDK testing patterns
 */
export function createTestModelRegistry(): TestModelRegistry {
  return {
    chat: createMockLanguageModel('test-chat-model'),
    reasoningText: createMockLanguageModel('test-reasoning-model'),
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
    reasoningText: 'test-reasoning-model',
    title: 'test-title-model',
    artifact: 'test-artifact-model',
  };

  return {
    chat: createMockLanguageModel(modelIds.chat ?? defaults.chat),
    reasoningText: createMockLanguageModel(modelIds.reasoningText ?? defaults.reasoningText),
    title: createMockLanguageModel(modelIds.title ?? defaults.title),
    artifact: createMockLanguageModel(modelIds.artifact ?? defaults.artifact),
  };
}

/**
 * Convert test model registry to model map for provider configuration
 * Follows AI SDK patterns for provider setup
 */
export function testModelsToMap(registry: TestModelRegistry): Record<string, LanguageModel> {
  return {
    'chat-model': registry.chat,
    'chat-model-reasoning': registry.reasoningText,
    'title-model': registry.title,
    'artifact-model': registry.artifact,
  };
}
