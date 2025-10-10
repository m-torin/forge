import { describe, expect, test, vi } from 'vitest';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
  inject: vi.fn(),
}));

describe('3p-vercel client helpers', () => {
  test('track forwards to @vercel/analytics with and without data', async () => {
    const mod = await import('../src/client');
    const analytics = await import('@vercel/analytics');

    await mod.track('EventOnly');
    expect((analytics as any).track).toHaveBeenCalledWith('EventOnly');

    await mod.track('WithData', { a: 1 });
    expect((analytics as any).track).toHaveBeenCalledWith('WithData', { a: 1 });
  });

  test('inject forwards options to @vercel/analytics', async () => {
    const mod = await import('../src/client');
    const analytics = await import('@vercel/analytics');
    await mod.inject({ debug: true, mode: 'development' });
    expect((analytics as any).inject).toHaveBeenCalledWith({ debug: true, mode: 'development' });
  });
});
