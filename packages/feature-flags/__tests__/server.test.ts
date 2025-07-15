import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock the adapter module
vi.mock('#/adapters/posthog-server', () => ({
  createPostHogServerAdapter: vi.fn(),
}));

describe('server', () => {
  test('module can be imported', async () => {
    expect(async () => {
      await import('#/server');
    }).not.toThrow();
  });
});
