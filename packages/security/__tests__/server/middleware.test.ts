import { createMiddleware } from '@nosecone/next';
import { describe, expect, vi } from 'vitest';

// Import after mocks
import { noseconeMiddleware, noseconeOptions } from '../../middleware';

vi.mock('@nosecone/next', () => ({
  createMiddleware: vi.fn(),
  defaults: {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
      },
    },
  },
}));

describe('middleware', () => {
  describe('noseconeOptions', () => {
    test('should have contentSecurityPolicy disabled', () => {
      expect(noseconeOptions.contentSecurityPolicy).toBeFalsy();
    });

    test('should include default options', () => {
      // Check that defaults are spread into options
      expect(noseconeOptions).toMatchObject({
        contentSecurityPolicy: false,
      });
    });
  });

  describe('noseconeMiddleware', () => {
    test('should export createMiddleware function', () => {
      expect(noseconeMiddleware).toBe(createMiddleware);
    });
  });
});
