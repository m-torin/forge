/**
 * Tests for client navigation helpers
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Next.js router
const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

describe('client navigation helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuthRedirect', () => {
    it('should return navigation functions', async () => {
      const navigationModule = await import('@/client/navigation');

      const { result } = renderHook(() => navigationModule.useAuthRedirect());

      expect(result.current).toHaveProperty('redirectAfterLogin');
      expect(result.current).toHaveProperty('redirectToLogin');
      expect(result.current).toHaveProperty('redirectToSignUp');
      expect(typeof result.current.redirectAfterLogin).toBe('function');
      expect(typeof result.current.redirectToLogin).toBe('function');
      expect(typeof result.current.redirectToSignUp).toBe('function');
    });

    describe('redirectAfterLogin', () => {
      it('should redirect to dashboard by default', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin();

        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });

      it('should redirect to provided returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin('/profile');

        expect(mockRouter.replace).toHaveBeenCalledWith('/profile');
      });

      it('should redirect to custom URL', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin('/admin/users');

        expect(mockRouter.replace).toHaveBeenCalledWith('/admin/users');
      });

      it('should handle empty string returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin('');

        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });
    });

    describe('redirectToLogin', () => {
      it('should redirect to sign-in page without returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin();

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
      });

      it('should redirect to sign-in page with returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin('/protected-page');

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in?returnUrl=%2Fprotected-page');
      });

      it('should encode returnUrl properly', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin('/admin/settings?tab=security');

        expect(mockRouter.push).toHaveBeenCalledWith(
          '/sign-in?returnUrl=%2Fadmin%2Fsettings%3Ftab%3Dsecurity',
        );
      });

      it('should handle complex URLs with special characters', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin('/search?q=test&sort=date');

        expect(mockRouter.push).toHaveBeenCalledWith(
          '/sign-in?returnUrl=%2Fsearch%3Fq%3Dtest%26sort%3Ddate',
        );
      });

      it('should handle empty string returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin('');

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
      });
    });

    describe('redirectToSignUp', () => {
      it('should redirect to sign-up page without returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp();

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-up');
      });

      it('should redirect to sign-up page with returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp('/onboarding');

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-up?returnUrl=%2Fonboarding');
      });

      it('should encode returnUrl properly', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp('/welcome?new=true');

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-up?returnUrl=%2Fwelcome%3Fnew%3Dtrue');
      });

      it('should handle paths with fragments', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp('/docs#getting-started');

        expect(mockRouter.push).toHaveBeenCalledWith(
          '/sign-up?returnUrl=%2Fdocs%23getting-started',
        );
      });

      it('should handle empty string returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp('');

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-up');
      });
    });

    describe('multiple calls', () => {
      it('should handle multiple redirect calls', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin('/page1');
        result.current.redirectToSignUp('/page2');
        result.current.redirectAfterLogin('/page3');

        expect(mockRouter.push).toHaveBeenCalledTimes(2);
        expect(mockRouter.replace).toHaveBeenCalledTimes(1);
        expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/sign-in?returnUrl=%2Fpage1');
        expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/sign-up?returnUrl=%2Fpage2');
        expect(mockRouter.replace).toHaveBeenCalledWith('/page3');
      });
    });

    describe('edge cases', () => {
      it('should handle undefined returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin(undefined);
        result.current.redirectToLogin(undefined);
        result.current.redirectToSignUp(undefined);

        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
        expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/sign-in');
        expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/sign-up');
      });

      it('should handle null returnUrl', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        // @ts-expect-error - testing null input
        result.current.redirectAfterLogin(null);
        // @ts-expect-error - testing null input
        result.current.redirectToLogin(null);
        // @ts-expect-error - testing null input
        result.current.redirectToSignUp(null);

        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
        expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/sign-in');
        expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/sign-up');
      });

      it('should handle very long URLs', async () => {
        const navigationModule = await import('@/client/navigation');

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        const longUrl = '/very-long-path/' + 'segment/'.repeat(50) + '?param=' + 'value'.repeat(20);

        result.current.redirectToLogin(longUrl);

        expect(mockRouter.push).toHaveBeenCalledWith(
          `/sign-in?returnUrl=${encodeURIComponent(longUrl)}`,
        );
      });
    });
  });
});
