import { describe, expect, test } from 'vitest';

describe('shared-env', () => {
  test('module exports object', async () => {
    const sharedEnv = await import('../src/shared-env');

    expect(sharedEnv).toBeDefined();
    expect(typeof sharedEnv).toBe('object');
  });
});
