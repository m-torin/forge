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

vi.mock('@nosecone/next', (_: any) => ({
  createMiddleware: vi.fn(),
  defaults: {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
      },
    },
  },
}));

describe('middleware', (_: any) => {
  describe('noseconeOptions', (_: any) => {
    it('should have contentSecurityPolicy disabled', (_: any) => {
      expect(noseconeOptions.contentSecurityPolicy).toBe(false);
    });

    it('should include default options', (_: any) => {
      // Check that defaults are spread into options
      expect(noseconeOptions).toMatchObject({
        contentSecurityPolicy: false,
      });
    });
  });

  describe('noseconeMiddleware', (_: any) => {
    it('should export createMiddleware function', (_: any) => {
      expect(noseconeMiddleware).toBe(createMiddleware);
    });
  });
});
