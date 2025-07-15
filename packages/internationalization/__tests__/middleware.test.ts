import { match as matchLocale } from '@formatjs/intl-localematcher';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocks are set up
import { internationalizationMiddleware } from '../src/middleware';

// Mock modules first before imports
vi.mock('next-international/middleware', () => ({
  createI18nMiddleware: vi.fn(() => vi.fn(() => ({ status: 200 }))),
}));

vi.mock('@formatjs/intl-localematcher', () => ({
  match: vi.fn(() => 'en'),
}));

vi.mock('negotiator', () => {
  return {
    default: vi.fn(() => ({
      languages: vi.fn(() => ['en']),
    })),
  };
});

describe('internationalization Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('internationalizationMiddleware', () => {
    test('exports middleware function', () => {
      // Verify the exported function exists and is callable
      expect(internationalizationMiddleware).toBeDefined();
      expect(typeof internationalizationMiddleware).toBe('function');
    });

    test('handles different Accept-Language headers', () => {
      // Mock the match function
      vi.mocked(matchLocale).mockReturnValue('es');

      // Create a request with Accept-Language header
      const headers = new Headers();
      headers.set('accept-language', 'es-ES,es;q=0.9,en;q=0.8');
      const mockRequest = new NextRequest('http://localhost:3000/', { headers });

      // Call the middleware
      const result = internationalizationMiddleware(mockRequest);

      // Verify it returns a result
      expect(result).toBeDefined();
    });

    test('works with requests without Accept-Language header', () => {
      vi.mocked(matchLocale).mockReturnValue('en');

      const mockRequest = new NextRequest('http://localhost:3000/');
      const result = internationalizationMiddleware(mockRequest);

      expect(result).toBeDefined();
    });
  });

  describe('config', () => {
    test('exports correct matcher configuration', async () => {
      // Import the config export
      const { config } = await import('../src/middleware');

      expect(config).toStrictEqual({
        matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
      });
    });

    test('matcher pattern is correct', async () => {
      const { config } = await import('../src/middleware');

      // The matcher is a negative lookahead pattern, not a regular string regex
      expect(config.matcher[0]).toBe('/((?!api|_next/static|_next/image|favicon.ico).*)');

      // The pattern should be used by Next.js middleware config
      // not directly as a regex
    });
  });
});
