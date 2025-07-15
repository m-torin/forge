import { describe, expect, test } from 'vitest';

describe('flags', () => {
  test('exports flag definitions', async () => {
    const flags = await import('@/flags');

    expect(flags).toBeDefined();
    expect(typeof flags).toBe('object');
  });
});
