import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock environment variables
vi.mock('../env', () => ({
  safeEnv: vi.fn(() => ({
    KNOCK_SECRET_API_KEY: 'test-knock-key',
  })),
}));

// Mock Knock SDK
vi.mock('@knocklabs/knock', () => ({
  Knock: vi.fn().mockImplementation(() => ({
    users: vi.fn(),
    workflows: vi.fn(),
  })),
}));

describe('server', () => {
  test('module exports without errors', async () => {
    expect(async () => {
      await import('../src/server');
    }).not.toThrow();
  });
});
