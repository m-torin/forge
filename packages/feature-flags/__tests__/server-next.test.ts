import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock the server module
vi.mock('#/server', () => ({
  createFeatureFlagManager: vi.fn(),
}));

describe('server-next', () => {
  test('module can be imported', async () => {
    expect(async () => {
      await import('#/server-next');
    }).not.toThrow();
  });
});
