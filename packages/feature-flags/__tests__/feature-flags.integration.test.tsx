import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies
const mockCurrentUser = vi.fn();
const mockAnalytics = {
  isFeatureEnabled: vi.fn(),
};
const mockVerifyAccess = vi.fn();
const mockFlag = vi.fn();
const mockVercelToolbar = vi.fn();
const mockWithVercelToolbar = vi.fn();

vi.mock('@repo/auth/server', () => ({
  currentUser: () => mockCurrentUser(),
}));

vi.mock('@repo/analytics/posthog/server', () => ({
  analytics: mockAnalytics,
}));

vi.mock('flags', () => ({
  verifyAccess: mockVerifyAccess,
}));

vi.mock('flags/next', () => ({
  flag: mockFlag,
}));

vi.mock('@vercel/toolbar/next', () => ({
  VercelToolbar: (props: any) => {
    mockVercelToolbar(props);
    return <div data-testid="vercel-toolbar">Toolbar</div>;
  },
}));

vi.mock('@vercel/toolbar/plugins/next', () => ({
  withVercelToolbar: () => mockWithVercelToolbar,
}));

vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: () => ({
    FLAGS_SECRET: 'test_secret',
  }),
}));

describe('Feature Flags Package Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Setup default mocks
    mockFlag.mockImplementation(({ decide, defaultValue, key }) => {
      const flagFunc = async () => {
        const context = { defaultValue };
        return decide.call(context);
      };
      flagFunc.key = key;
      flagFunc.origin = 'https://app.posthog.com/my/flags';
      flagFunc.description = 'Show beta features to users';
      flagFunc.options = [
        { label: 'Off', value: false },
        { label: 'On', value: true },
      ];
      return flagFunc;
    });
    mockWithVercelToolbar.mockImplementation((config) => ({ ...config, toolbar: true }));
  });

  describe('full flow', () => {
    it('creates and evaluates a feature flag', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockResolvedValue(true);

      const module = await import('../index');
      const result = await module.showBetaFeature();

      expect(result).toBe(true);
      expect(mockCurrentUser).toHaveBeenCalled();
      expect(mockAnalytics.isFeatureEnabled).toHaveBeenCalledWith('showBetaFeature', 'user_123');
    });

    it('handles unauthorized access', async () => {
      const { getFlags } = await import('../access');

      mockVerifyAccess.mockResolvedValue(false);

      // Create a mock that matches the NextRequest interface
      const request = {
        cookies: {} as any,
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer token' : null),
        },
        nextUrl: {} as any,
        // Add other required properties as needed
      } as any; // Use any to bypass type checking in the test

      const response = await getFlags(request);
      expect(response.status).toBe(401);
    });

    it('returns flag definitions for authorized users', async () => {
      const { getFlags } = await import('../access');

      mockVerifyAccess.mockResolvedValue(true);

      // Create a mock that matches the NextRequest interface
      const request = {
        cookies: {} as any,
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer token' : null),
        },
        nextUrl: {} as any,
        // Add other required properties as needed
      } as any; // Use any to bypass type checking in the test

      const response = await getFlags(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.definitions).toHaveProperty('showBetaFeature');
    });
  });

  describe('toolbar integration', () => {
    it('renders toolbar when FLAGS_SECRET is set', async () => {
      const { Toolbar } = await import('../components/toolbar');
      const { getByTestId } = render(<Toolbar />);

      expect(getByTestId('vercel-toolbar')).toBeInTheDocument();
      expect(mockVercelToolbar).toHaveBeenCalled();
    });

    it('wraps Next.js config correctly', async () => {
      const { withToolbar } = await import('../lib/toolbar');

      const config = {
        images: { domains: ['example.com'] },
      };

      const wrapped = withToolbar(config);
      expect(mockWithVercelToolbar).toHaveBeenCalledWith(config);
      expect(wrapped).toEqual({ ...config, toolbar: true });
    });
  });

  describe('error scenarios', () => {
    it('handles missing user gracefully', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const module = await import('../index');
      const result = await module.showBetaFeature();

      expect(result).toBe(false);
      expect(mockAnalytics.isFeatureEnabled).not.toHaveBeenCalled();
    });

    it('handles analytics errors gracefully', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockRejectedValue(new Error('Analytics error'));

      const module = await import('../index');
      await expect(module.showBetaFeature()).rejects.toThrow('Analytics error');
    });

    it('handles verify access errors gracefully', async () => {
      const { getFlags } = await import('../access');

      mockVerifyAccess.mockRejectedValue(new Error('Verification error'));

      // Create a mock that matches the NextRequest interface
      const request = {
        cookies: {} as any,
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer token' : null),
        },
        nextUrl: {} as any,
        // Add other required properties as needed
      } as any; // Use any to bypass type checking in the test

      // The function should throw the error
      await expect(getFlags(request)).rejects.toThrow('Verification error');
    });
  });

  describe('type safety', () => {
    it('exports correctly typed functions', async () => {
      const module = await import('../index');

      expect(typeof module.showBetaFeature).toBe('function');

      // Verify return type is Promise<boolean>
      const result = module.showBetaFeature();
      expect(result).toBeInstanceOf(Promise);

      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockResolvedValue(true);

      const value = await result;
      expect(typeof value).toBe('boolean');
    });
  });

  describe('module exports', () => {
    it('exports expected functions and components', async () => {
      // Test main index exports
      const indexModule = await import('../index');
      expect(indexModule).toHaveProperty('showBetaFeature');

      // Test access exports
      const accessModule = await import('../access');
      expect(accessModule).toHaveProperty('getFlags');

      // Test component exports
      const toolbarModule = await import('../components/toolbar');
      expect(toolbarModule).toHaveProperty('Toolbar');

      // Test lib exports
      const libToolbarModule = await import('../lib/toolbar');
      expect(libToolbarModule).toHaveProperty('withToolbar');

      const createFlagModule = await import('../lib/create-flag');
      expect(createFlagModule).toHaveProperty('createFlag');
    });
  });
});
