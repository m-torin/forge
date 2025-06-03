import { createMiddleware } from '@nosecone/next';
import { describe, expect, it, vi } from 'vitest';

// Import after mocks
import { noseconeMiddleware, noseconeOptions } from '../middleware';

// Mock dependencies before imports
const _mockDefaults = {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
    },
  },
};

const _mockCreateMiddleware = vi.fn();

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
    it('should have contentSecurityPolicy disabled', () => {
      expect(noseconeOptions.contentSecurityPolicy).toBe(false);
    });

    it('should include default options', () => {
      // Check that defaults are spread into options
      expect(noseconeOptions).toMatchObject({
        contentSecurityPolicy: false,
      });
    });
  });

  describe('noseconeMiddleware', () => {
    it('should export createMiddleware function', () => {
      expect(noseconeMiddleware).toBe(createMiddleware);
    });
  });
});
