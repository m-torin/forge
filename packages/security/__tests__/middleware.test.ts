import { createMiddleware, withVercelToolbar } from '@nosecone/next';
import { describe, expect, it, vi } from 'vitest';

// Import after mocks
import { noseconeMiddleware, noseconeOptions, noseconeOptionsWithToolbar } from '../middleware';

// Mock dependencies before imports
const _mockDefaults = {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
    },
  },
};

const _mockWithVercelToolbar = vi.fn((options) => ({
  ...options,
  withToolbar: true,
}));

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
  withVercelToolbar: vi.fn((options) => ({
    ...options,
    withToolbar: true,
  })),
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

  describe('noseconeOptionsWithToolbar', () => {
    it('should include toolbar configuration', () => {
      // The toolbar options are created at module load time
      expect(noseconeOptionsWithToolbar).toBeDefined();
      expect(noseconeOptionsWithToolbar.contentSecurityPolicy).toBe(false);
    });

    it('should call withVercelToolbar with base options', () => {
      // The call happens at module load time
      expect(withVercelToolbar).toHaveBeenCalledWith(noseconeOptions);
    });
  });

  describe('noseconeMiddleware', () => {
    it('should export createMiddleware function', () => {
      expect(noseconeMiddleware).toBe(createMiddleware);
    });
  });
});
