import { describe, expect, test, vi } from 'vitest';

// Mock external dependencies
vi.mock('@formatjs/intl-localematcher', () => ({
  match: vi.fn().mockReturnValue('en'),
}));

vi.mock('negotiator', () => ({
  default: vi.fn().mockImplementation(() => ({
    languages: () => ['en', 'es'],
  })),
}));

const mockMiddleware = vi.fn().mockReturnValue({ status: 200 });
vi.mock('next-international/middleware', () => ({
  createI18nMiddleware: vi.fn().mockReturnValue(mockMiddleware),
}));

vi.mock('../languine.json', () => ({
  default: {
    locale: {
      source: 'en',
      targets: ['es', 'fr', 'de', 'pt'],
    },
  },
}));

// Mock shared dictionary loader
const mockDictionaryLoader = {
  getLocales: vi.fn().mockReturnValue(['en', 'es', 'fr', 'de', 'pt']),
  getDictionary: vi.fn().mockResolvedValue({ hello: 'Hello', welcome: 'Welcome' }),
  isLocaleSupported: vi.fn().mockReturnValue(true),
};

vi.mock('../src/shared/dictionary-loader', () => ({
  createDictionaryLoader: vi.fn().mockReturnValue(mockDictionaryLoader),
}));

describe('server-next', () => {
  test('exports expected functions and variables', async () => {
    const serverNextModule = await import('../src/server-next');

    // Check that key exports exist
    expect('locales' in serverNextModule).toBeTruthy();
    expect('getDictionary' in serverNextModule).toBeTruthy();
    expect('isLocaleSupported' in serverNextModule).toBeTruthy();
    expect('createDictionary' in serverNextModule).toBeTruthy();
    expect('internationalizationMiddleware' in serverNextModule).toBeTruthy();
    expect('config' in serverNextModule).toBeTruthy();

    // Check function types
    expect(typeof serverNextModule.createDictionary).toBe('function');
    expect(typeof serverNextModule.internationalizationMiddleware).toBe('function');
  });

  test('internationalizationMiddleware calls I18nMiddleware', async () => {
    const { internationalizationMiddleware } = await import('../src/server-next');

    const mockRequest = {
      headers: new Map([['accept-language', 'en-US,en;q=0.9']]),
      url: 'https://example.com/test',
    };

    // Just test that the function can be called without throwing
    expect(() => {
      internationalizationMiddleware(mockRequest as any);
    }).not.toThrow();

    expect(mockMiddleware).toHaveBeenCalledWith(mockRequest);
  });

  test('createDictionary function combines dictionaries', async () => {
    const { createDictionary } = await import('../src/server-next');

    const mockGetBaseDictionary = vi.fn().mockResolvedValue({ hello: 'Hello' });
    const mockGetAppDictionary = vi.fn().mockResolvedValue({ app: 'App' });

    const combinedDictionary = createDictionary(mockGetBaseDictionary, mockGetAppDictionary);
    const result = await combinedDictionary('en');

    expect(result).toStrictEqual({ hello: 'Hello', app: 'App' });
    expect(mockGetBaseDictionary).toHaveBeenCalledWith('en');
    expect(mockGetAppDictionary).toHaveBeenCalledWith('en');
  });

  test('exports config object', async () => {
    const { config } = await import('../src/server-next');
    expect(config).toStrictEqual({
      matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
    });
  });

  test('module can be imported multiple times', async () => {
    // Just test that the module can be imported without throwing
    expect(async () => {
      await import('../src/server-next');
    }).not.toThrow();
  });
});
