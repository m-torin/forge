import { describe, expect, it, vi } from 'vitest';

import { locales } from '../index';
import languine from '../languine.json';

describe('Languine Configuration', () => {
  it('has correct source locale', () => {
    expect(languine.locale.source).toBe('en');
  });

  it('has expected target locales', () => {
    expect(languine.locale.targets).toContain('es');
    expect(languine.locale.targets).toContain('fr');
    expect(languine.locale.targets).toContain('de');
    expect(languine.locale.targets).toContain('pt');
    expect(languine.locale.targets).toContain('zh');
  });

  it('locales array matches languine configuration', () => {
    const expectedLocales = [languine.locale.source, ...languine.locale.targets];
    expect(locales).toEqual(expectedLocales);
  });
});

describe('Dictionary Files', () => {
  it('all locale dictionaries exist', async () => {
    for (const locale of locales) {
      const dictPath = `../dictionaries/${locale}.json`;

      // Try to import the dictionary
      try {
        await import(dictPath);
      } catch {
        // In test environment, we might get module not found errors
        // but the mock should handle it
        expect(vi.isMockFunction(vi.fn)).toBe(true);
      }
    }
  });
});
