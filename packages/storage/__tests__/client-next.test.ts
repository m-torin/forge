import { describe, expect, test } from 'vitest';

describe('client-next module', () => {
  test('should export empty object', async () => {
    const clientNext = await import('../src/client-next');

    // The client-next module is currently empty, so we just verify it can be imported
    expect(clientNext).toBeDefined();
    expect(typeof clientNext).toBe('object');
  });
});
