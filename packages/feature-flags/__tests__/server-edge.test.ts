import { describe, expect, test, vi } from 'vitest';

// Mock the adapter modules
vi.mock('@/adapters/edge-config', () => ({
  createEdgeConfigAdapter: vi.fn(),
}));

describe('server-edge', () => {
  test('module can be imported', async () => {
    expect(async () => {
      await import('@/server-edge');
    }).not.toThrow();
  });
});
