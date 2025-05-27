import { describe, expect, it, vi } from 'vitest';

// Mock the entire @vercel/analytics/react module
const mockVercelAnalytics = vi.fn();
vi.mock('@vercel/analytics/react', () => ({
  Analytics: mockVercelAnalytics,
}));

describe('vercel', () => {
  it('re-exports Analytics as VercelAnalytics from @vercel/analytics/react', async () => {
    const { VercelAnalytics } = await import('../vercel');

    expect(VercelAnalytics).toBe(mockVercelAnalytics);
  });
});
