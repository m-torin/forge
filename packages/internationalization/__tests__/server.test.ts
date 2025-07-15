import { describe, expect, test, vi } from 'vitest';

// Mock server-only - it's important to mock this before importing anything else
vi.mock('server-only', () => ({}));

// Mock shared dictionary loader
vi.mock('../src/shared/dictionary-loader', () => ({
  createDictionaryLoader: vi.fn().mockReturnValue({
    getLocales: vi.fn().mockReturnValue(['en', 'es', 'fr', 'de', 'pt']),
    getDictionary: vi.fn().mockResolvedValue({ hello: 'Hello', welcome: 'Welcome' }),
    isLocaleSupported: vi.fn().mockReturnValue(true),
  }),
}));

describe('server', () => {
  test('exports expected functions and variables', async () => {
    const serverModule = await import('../src/server');

    expect(serverModule.locales).toBeDefined();
    expect(serverModule.getDictionary).toBeDefined();
    expect(serverModule.isLocaleSupported).toBeDefined();
    expect(typeof serverModule.getDictionary).toBe('function');
    expect(typeof serverModule.isLocaleSupported).toBe('function');
  });
});
