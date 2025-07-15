import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('server', () => {
  test('module exports object', async () => {
    const server = await import('../src/server');

    expect(server).toBeDefined();
    expect(typeof server).toBe('object');
  });
});
