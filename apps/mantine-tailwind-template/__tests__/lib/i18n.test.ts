import { describe, expect, test } from 'vitest';

describe('i18n', () => {
  test('imports getDictionary function', async () => {
    const { getDictionary } = await import('#/lib/i18n');
    expect(getDictionary).toBeDefined();
    expect(typeof getDictionary).toBe('function');
  });

  test('imports Locale type', async () => {
    const i18nModule = await import('#/lib/i18n');
    expect(i18nModule).toHaveProperty('getDictionary');
  });

  test('getDictionary returns promise', async () => {
    const { getDictionary } = await import('#/lib/i18n');
    const result = getDictionary('en');
    expect(result).toBeInstanceOf(Promise);
  });

  test('getDictionary resolves with dictionary object', async () => {
    const { getDictionary } = await import('#/lib/i18n');
    const dict = await getDictionary('en' as any);

    expect(dict).toBeDefined();
    expect(typeof dict).toBe('object');
    expect(dict).toHaveProperty('header');
    expect(dict).toHaveProperty('home');
  });
});
