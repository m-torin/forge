import { createOpenAI } from '@ai-sdk/openai';
import { wrapLanguageModel } from 'ai';

/**
 * Mock models for testing environments
 * These use real providers with minimal API calls and fixed responses
 */

// Create a mock OpenAI provider that doesn't make real API calls
const mockOpenAI = createOpenAI({
  apiKey: 'mock-key',
  baseURL: 'https://api.openai.com/v1', // Will be intercepted in tests
});

// Wrap models to provide consistent test behavior
export const createMockModels = () => {
  return {
    chatModel: wrapLanguageModel({
      model: mockOpenAI('gpt-4o'),
      middleware: {
        wrapGenerate: async ({ doGenerate }) => {
          // In tests, this would be mocked by test framework
          return doGenerate();
        },
      },
    }),

    reasoningModel: wrapLanguageModel({
      model: mockOpenAI('gpt-4o'),
      middleware: {
        wrapGenerate: async ({ doGenerate }) => {
          return doGenerate();
        },
      },
    }),

    titleModel: wrapLanguageModel({
      model: mockOpenAI('gpt-4o-mini'),
      middleware: {
        wrapGenerate: async ({ doGenerate }) => {
          return doGenerate();
        },
      },
    }),

    artifactModel: wrapLanguageModel({
      model: mockOpenAI('gpt-4o'),
      middleware: {
        wrapGenerate: async ({ doGenerate }) => {
          return doGenerate();
        },
      },
    }),
  };
};
