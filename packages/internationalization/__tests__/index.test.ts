import { beforeEach, describe, expect, vi } from 'vitest';

import { getDictionary, locales } from '../src/index';

// Mock dictionary imports
vi.mock('../src/dictionaries/en.json', () => ({
  default: { hello: 'Hello', welcome: 'Welcome' },
}));

vi.mock('../src/dictionaries/es.json', () => ({
  default: { hello: 'Hola', welcome: 'Bienvenido' },
}));

vi.mock('../src/dictionaries/fr.json', () => ({
  default: { hello: 'Bonjour', welcome: 'Bienvenue' },
}));

vi.mock('../src/dictionaries/de.json', () => ({
  default: { hello: 'Hallo', welcome: 'Willkommen' },
}));

vi.mock('../src/dictionaries/pt.json', () => ({
  default: { hello: 'Olá', welcome: 'Bem-vindo' },
}));

// Mock languine.json is already mocked in test-setup.ts

describe('internationalization Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Remove references to custom console spies that don't exist
  });

  describe('locales', () => {
    test('exports all available locales', () => {
      expect(locales).toStrictEqual(['en', 'es', 'de', 'fr', 'pt']);
    });

    test('includes source locale and all target locales', () => {
      expect(locales).toContain('en');
      expect(locales).toContain('es');
      expect(locales).toContain('fr');
      expect(locales).toContain('de');
      expect(locales).toContain('pt');
    });
  });

  describe('getDictionary', () => {
    test('returns dictionary for valid locale', async () => {
      const dictionary = await getDictionary('en');
      expect(dictionary).toStrictEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    test('returns dictionary for supported locale', async () => {
      const dictionary = await getDictionary('es');
      expect(dictionary).toStrictEqual({ hello: 'Hola', welcome: 'Bienvenido' });
    });

    test('handles locale with region code', async () => {
      const dictionary = await getDictionary('en-US');
      expect(dictionary).toStrictEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    test('falls back to English for unsupported locale', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const dictionary = await getDictionary('it');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN] Locale "it" is not supported, defaulting to "en"',
        undefined,
      );
      expect(dictionary).toStrictEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    test('returns correct dictionary for all supported locales', async () => {
      const expectedDictionaries = {
        de: { hello: 'Hallo', welcome: 'Willkommen' },
        en: { hello: 'Hello', welcome: 'Welcome' },
        es: { hello: 'Hola', welcome: 'Bienvenido' },
        fr: { hello: 'Bonjour', welcome: 'Bienvenue' },
        pt: { hello: 'Olá', welcome: 'Bem-vindo' },
      };

      for (const [locale, expected] of Object.entries(expectedDictionaries)) {
        const dictionary = await getDictionary(locale);
        expect(dictionary).toStrictEqual(expected);
      }
    });
  });
});
