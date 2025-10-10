/**
 * @repo/ai testing utilities
 *
 * Comprehensive testing support for AI SDK v5 standardization
 * Uses official AI SDK testing utilities where possible
 */

import { TEMPS } from '../providers/shared';

// Re-export official AI SDK testing utilities
export { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

// Enhanced mock utilities (explicit for tree shaking)
export {
  asyncUtils,
  createMockEnvironment,
  createMockLanguageModel,
  createMockTool,
  createMockVectorStore,
  mockAnalytics,
  mockDatabase,
  mockModels,
  mockObservability,
  resetAllMocks,
  testScenarios,
} from './mocks';

// Fixture utilities (explicit for tree shaking)
export {
  configFixtures,
  errorFixtures,
  messageFixtures,
  objectFixtures,
  ragFixtures,
  schemaFixtures,
  toolFixtures,
  usageFixtures,
} from './fixtures';

// Helper utilities (explicit for tree shaking)
export {
  assertionHelpers,
  asyncHelpers,
  dataGenerators,
  integrationHelpers,
  resetHelpers,
  streamHelpers,
  testHelpers,
} from './helpers';

// Common testing patterns
export const testPatterns = {
  /**
   * Basic generation test pattern
   */
  basicGeneration: async (model: any, prompt: string) => {
    const result = await model.doGenerate({
      prompt,
      maxOutputTokens: 100,
      temperature: TEMPS.BALANCED,
    });

    return result;
  },

  /**
   * Streaming test pattern
   */
  streamingGeneration: async (model: any, prompt: string) => {
    const result = await model.doStream({
      prompt,
      maxOutputTokens: 100,
      temperature: TEMPS.BALANCED,
    });

    return result;
  },

  /**
   * Tool calling test pattern
   */
  toolCalling: async (model: any, prompt: string, tools: any) => {
    const result = await model.doGenerate({
      prompt,
      tools,
      maxOutputTokens: 100,
      temperature: TEMPS.BALANCED,
    });

    return result;
  },
};

/**
 * Quick setup functions for common test scenarios
 */
export const quickSetup = {
  /**
   * Setup for text generation tests
   */
  textGeneration: () => {
    const { mockModels, testHelpers } = require('./mocks');
    return testHelpers.setupGeneration();
  },

  /**
   * Setup for streaming tests
   */
  streaming: (chunks = ['Hello', ' ', 'world']) => {
    const { mockModels, testHelpers } = require('./mocks');
    return testHelpers.setupStreaming(chunks);
  },

  /**
   * Setup for tool calling tests
   */
  toolCalling: (toolName = 'testTool', input = { input: 'test' }, result = 'success') => {
    const { mockModels, testHelpers } = require('./mocks');
    return testHelpers.setupToolCalling(toolName, input, result);
  },

  /**
   * Setup for error handling tests
   */
  errorHandling: (errorType: 'rate_limit' | 'timeout' | 'api' | 'validation' = 'api') => {
    const { dataGenerators } = require('./helpers');
    const error = dataGenerators.error(errorType);
    const { testHelpers } = require('./mocks');
    return testHelpers.setupError(error);
  },
};
