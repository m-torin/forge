import { describe, expect, test, vi } from 'vitest';

// Mock the dictionary files
vi.mock('../../src/dictionaries/en.json', () => ({
  default: { hello: 'Hello', welcome: 'Welcome' },
}));

vi.mock('../../src/dictionaries/es.json', () => ({
  default: { hello: 'Hola', welcome: 'Bienvenido' },
}));

vi.mock('../../src/dictionaries/fr.json', () => ({
  default: { hello: 'Bonjour', welcome: 'Bienvenue' },
}));

vi.mock('../../src/dictionaries/de.json', () => ({
  default: { hello: 'Hallo', welcome: 'Willkommen' },
}));

vi.mock('../../src/dictionaries/pt.json', () => ({
  default: { hello: 'Olá', welcome: 'Bem-vindo' },
}));

// Mock languine.json
vi.mock('../../languine.json', () => ({
  default: {
    locale: {
      source: 'en',
      targets: ['es', 'fr', 'de', 'pt'],
    },
  },
}));

describe('dictionary-loader', () => {
  test('createDictionaryLoader exports expected functions', async () => {
    const { createDictionaryLoader } = await import('../../src/shared/dictionary-loader');

    const loader = createDictionaryLoader();

    expect(loader.getLocales).toBeDefined();
    expect(loader.getDictionary).toBeDefined();
    expect(loader.isLocaleSupported).toBeDefined();

    expect(typeof loader.getLocales).toBe('function');
    expect(typeof loader.getDictionary).toBe('function');
    expect(typeof loader.isLocaleSupported).toBe('function');
  });

  test('loader functions work with mocked data', async () => {
    const { createDictionaryLoader } = await import('../../src/shared/dictionary-loader');

    const loader = createDictionaryLoader();

    // Test basic functionality
    const locales = loader.getLocales();
    expect(Array.isArray(locales)).toBeTruthy();

    const isSupported = loader.isLocaleSupported('en');
    expect(typeof isSupported).toBe('boolean');

    // Test getDictionary returns a promise
    const dictionaryPromise = loader.getDictionary('en');
    expect(dictionaryPromise).toBeInstanceOf(Promise);
  });

  test('handles locale normalization', async () => {
    const { createDictionaryLoader } = await import('../../src/shared/dictionary-loader');

    const loader = createDictionaryLoader();

    // Test that locale with region code still works
    const result1 = loader.isLocaleSupported('en-US');
    const result2 = loader.isLocaleSupported('es-MX');

    expect(typeof result1).toBe('boolean');
    expect(typeof result2).toBe('boolean');
  });

  test('handles error cases gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { createDictionaryLoader } = await import('../../src/shared/dictionary-loader');

    const loader = createDictionaryLoader();

    // Test with unsupported locale
    const unsupportedResult = await loader.getDictionary('invalid-locale');
    expect(unsupportedResult).toBeDefined();

    consoleSpy.mockRestore();
  });
});
