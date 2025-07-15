import { describe, expect, test } from 'vitest';

describe('shared/utils/index', () => {
  test('module exports object', async () => {
    const utils = await import('../../../src/shared/utils/index');

    expect(utils).toBeDefined();
    expect(typeof utils).toBe('object');
  });
});
