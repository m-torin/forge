import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock the server module to avoid environment issues
vi.mock('../src/server', () => ({
  createKnockServerManager: vi.fn(),
  KnockEnvironment: vi.fn(),
}));

describe('server-next', () => {
  test('module exports without errors', async () => {
    expect(async () => {
      await import('../src/server-next');
    }).not.toThrow();
  });
});
