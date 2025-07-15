import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('server-next', () => {
  test('module exports object', async () => {
    const serverNext = await import('../src/server-next');

    expect(serverNext).toBeDefined();
    expect(typeof serverNext).toBe('object');
  });
});
