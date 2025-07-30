import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('server', () => {
  test('exports server functionality', async () => {
    const server = await import('#/server');

    expect(server).toBeDefined();
    expect(typeof server).toBe('object');
  });
});
