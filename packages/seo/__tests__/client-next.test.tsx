import { describe, expect, test } from 'vitest';

describe('client-next', () => {
  test('exports client functionality', async () => {
    const clientNext = await import('../src/client-next');

    expect(clientNext).toBeDefined();
    expect(typeof clientNext).toBe('object');
  });
});
