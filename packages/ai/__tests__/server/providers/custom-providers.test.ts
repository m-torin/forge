import { createCustomProvider, withReasoningMiddleware } from '@/server/providers/custom-providers';
import { describe, expect, vi } from 'vitest';

// Mock the AI SDK
vi.mock('ai', () => ({
  customProvider: vi.fn(config => ({ type: 'custom', ...config })),
  wrapLanguageModel: vi.fn(({ model, middleware }) => ({ wrapped: true, model, middleware })),
  extractReasoningMiddleware: vi.fn(({ tagName }) => ({ type: 'reasoning', tagName })),
}));

describe('custom Providers', () => {
  describe('createCustomProvider', () => {
    test('should create a basic custom provider', () => {
      const mockModel = { id: 'test-model' };
      const provider = createCustomProvider({
        languageModels: {
          'test-model': mockModel,
        },
      });

      expect(provider).toStrictEqual({
        type: 'custom',
        languageModels: {
          'test-model': mockModel,
        },
      });
    });

    test('should include image models when provided', () => {
      const mockModel = { id: 'test-model' };
      const mockImageModel = { id: 'test-image-model' };

      const provider = createCustomProvider({
        languageModels: {
          'test-model': mockModel,
        },
        imageModels: {
          'image-model': mockImageModel,
        },
      });

      expect(provider).toStrictEqual({
        type: 'custom',
        languageModels: {
          'test-model': mockModel,
        },
        imageModels: {
          'image-model': mockImageModel,
        },
      });
    });
  });

  describe('withReasoningMiddleware', () => {
    test('should wrap a model with reasoning middleware', () => {
      const mockModel = { id: 'test-model' };
      const wrappedModel = withReasoningMiddleware(mockModel as any);

      expect(wrappedModel).toStrictEqual({
        wrapped: true,
        model: mockModel,
        middleware: {
          type: 'reasoning',
          tagName: 'think',
        },
      });
    });

    test('should use custom tag name', () => {
      const mockModel = { id: 'test-model' };
      const wrappedModel = withReasoningMiddleware(mockModel as any, 'reason');

      expect(wrappedModel).toStrictEqual({
        wrapped: true,
        model: mockModel,
        middleware: {
          type: 'reasoning',
          tagName: 'reason',
        },
      });
    });
  });
});
