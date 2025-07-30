import { describe, expect, test } from 'vitest';

describe('client', () => {
  test('exports client functionality', async () => {
    const client = await import('#/client');

    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
  });
});
