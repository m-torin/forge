import { describe, expect, test } from 'vitest';

describe('components/json-ld', () => {
  test('exports JSON-LD component', async () => {
    const jsonLd = await import('../../src/components/json-ld');

    expect(jsonLd).toBeDefined();
    expect('JsonLd' in jsonLd).toBeTruthy();
  });
});
