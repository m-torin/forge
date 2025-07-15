import type { LanguageModel } from 'ai';

/**
 * Vercel AI SDK test model factory
 * Creates standardized test models for consistent testing across apps
 */

/**
 * Mock language model for testing that follows AI SDK LanguageModel interface
 * Provides consistent behavior for unit and integration tests
 */
export function createMockLanguageModel(modelId: string): LanguageModel {
  return {
    modelId,
    provider: 'mock',
    // Mock implementation that satisfies the LanguageModel interface
    // The actual implementation would be filled by the AI SDK's test utilities
  } as LanguageModel;
}

/**
 * Standard test model registry following AI SDK patterns
 * Provides consistent model names and behaviors for testing
 */
export interface TestModelRegistry {
  chat: LanguageModel;
  reasoning: LanguageModel;
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
export function testModelsToMap(registry: TestModelRegistry): Record<string, LanguageModel> {
  return {
    'chat-model': registry.chat,
    'chat-model-reasoning': registry.reasoning,
    'title-model': registry.title,
    'artifact-model': registry.artifact,
  };
}
