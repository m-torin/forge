import { describe, expect, it, vi } from 'vitest';

// Mock the entire @next/third-parties/google module
const mockGoogleAnalytics = vi.fn();
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: mockGoogleAnalytics,
}));

describe('google', () => {
  it('re-exports GoogleAnalytics from @next/third-parties/google', async () => {
    const { GoogleAnalytics } = await import('../google');

    expect(GoogleAnalytics).toBe(mockGoogleAnalytics);
  });
});
