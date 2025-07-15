import { describe, expect, test } from 'vitest';

describe('server-next module', () => {
  test('should export empty object', async () => {
    const serverNext = await import('../src/server-next');

    // The server-next module is currently empty, so we just verify it can be imported
    expect(serverNext).toBeDefined();
    expect(typeof serverNext).toBe('object');
  });
});
