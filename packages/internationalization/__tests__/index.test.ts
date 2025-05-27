import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDictionary, locales } from '../index';

// Mock dictionary imports
vi.mock('../dictionaries/en.json', () => ({
  default: { hello: 'Hello', welcome: 'Welcome' },
}));

vi.mock('../dictionaries/es.json', () => ({
  default: { hello: 'Hola', welcome: 'Bienvenido' },
}));

vi.mock('../dictionaries/fr.json', () => ({
  default: { hello: 'Bonjour', welcome: 'Bienvenue' },
}));

vi.mock('../dictionaries/de.json', () => ({
  default: { hello: 'Hallo', welcome: 'Willkommen' },
}));

vi.mock('../dictionaries/pt.json', () => ({
  default: { hello: 'Olá', welcome: 'Bem-vindo' },
}));

vi.mock('../dictionaries/zh.json', () => ({
  default: { hello: '你好', welcome: '欢迎' },
}));

// Mock languine.json is already mocked in test-setup.ts

describe('Internationalization Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Remove references to custom console spies that don't exist
  });

  describe('locales', () => {
    it('exports all available locales', () => {
      expect(locales).toEqual(['en', 'es', 'fr', 'de', 'pt', 'zh']);
    });

    it('includes source locale and all target locales', () => {
      expect(locales).toContain('en');
      expect(locales).toContain('es');
      expect(locales).toContain('fr');
      expect(locales).toContain('de');
      expect(locales).toContain('pt');
      expect(locales).toContain('zh');
    });
  });

  describe('getDictionary', () => {
    it('returns dictionary for valid locale', async () => {
      const dictionary = await getDictionary('en');
      expect(dictionary).toEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    it('returns dictionary for supported locale', async () => {
      const dictionary = await getDictionary('es');
      expect(dictionary).toEqual({ hello: 'Hola', welcome: 'Bienvenido' });
    });

    it('handles locale with region code', async () => {
      const dictionary = await getDictionary('en-US');
      expect(dictionary).toEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    it('falls back to English for unsupported locale', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const dictionary = await getDictionary('it');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Locale "it" is not supported, defaulting to "en"',
      );
      expect(dictionary).toEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    it('returns correct dictionary for all supported locales', async () => {
      const expectedDictionaries = {
        de: { hello: 'Hallo', welcome: 'Willkommen' },
        en: { hello: 'Hello', welcome: 'Welcome' },
        es: { hello: 'Hola', welcome: 'Bienvenido' },
        fr: { hello: 'Bonjour', welcome: 'Bienvenue' },
        pt: { hello: 'Olá', welcome: 'Bem-vindo' },
        zh: { hello: '你好', welcome: '欢迎' },
      };

      for (const [locale, expected] of Object.entries(expectedDictionaries)) {
        const dictionary = await getDictionary(locale);
        expect(dictionary).toEqual(expected);
      }
    });
  });
});
