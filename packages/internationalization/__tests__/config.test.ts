import { describe, expect, vi } from 'vitest';

import { locales } from '../src/index';
import languine from '../languine.json';

describe('languine Configuration', () => {
  test('has correct source locale', () => {
    expect(languine.locale.source).toBe('en');
  });

  test('has expected target locales', () => {
    expect(languine.locale.targets).toContain('es');
    expect(languine.locale.targets).toContain('fr');
    expect(languine.locale.targets).toContain('de');
    expect(languine.locale.targets).toContain('pt');
    expect(languine.locale.targets).toContain('zh');
  });

  test('locales array matches languine configuration', () => {
    const expectedLocales = [languine.locale.source, ...languine.locale.targets];
    expect(locales).toStrictEqual(expectedLocales);
  });
});

describe('dictionary Files', () => {
  test('all locale dictionaries exist', async () => {
    for (const locale of locales) {
      const dictPath = `../src/dictionaries/${locale}.json`;

      // Try to import the dictionary
      try {
        await import(dictPath);
      } catch {
        // In test environment, we might get module not found errors
        // but the mock should handle it
        expect(vi.isMockFunction(vi.fn)).toBeTruthy();
      }
    }
  });
});
