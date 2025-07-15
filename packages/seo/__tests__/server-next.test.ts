import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('server-next', () => {
  test('exports server functionality', async () => {
    const serverNext = await import('../src/server-next');

    expect(serverNext).toBeDefined();
    expect(typeof serverNext).toBe('object');
  });
});
