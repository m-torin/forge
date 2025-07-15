import { describe, expect, test } from 'vitest';

describe('client', () => {
  test('module exports object', async () => {
    const client = await import('../src/client');

    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
  });
});
