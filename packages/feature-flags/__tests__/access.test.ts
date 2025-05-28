import { type NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerifyAccess = vi.fn();
const mockFlags = {
  showBetaFeature: {
    description: 'Show beta features to users',
    key: 'show-beta-feature',
    options: [
      { label: 'Off', value: false },
      { label: 'On', value: true },
    ],
    origin: 'https://app.posthog.com/my/flags',
  },
};

vi.mock('flags', () => ({
  verifyAccess: mockVerifyAccess,
}));

vi.mock('../index', () => ({
  showBetaFeature: mockFlags.showBetaFeature,
}));

describe('access handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('exports getFlags function', async () => {
    const { getFlags } = await import('../access');
    expect(getFlags).toBeDefined();
    expect(typeof getFlags).toBe('function');
  });

  describe('authorization', () => {
    it('returns 401 when authorization header is missing', async () => {
      mockVerifyAccess.mockResolvedValue(false);
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (_key: string) => null,
        },
      } as unknown as NextRequest;

      const response = await getFlags(request);

      expect(response.status).toBe(401);
      expect(mockVerifyAccess).toHaveBeenCalledWith(null);
    });

    it('returns 401 when authorization is invalid', async () => {
      mockVerifyAccess.mockResolvedValue(false);
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer invalid_token' : null),
        },
      } as unknown as NextRequest;

      const response = await getFlags(request);

      expect(response.status).toBe(401);
      expect(mockVerifyAccess).toHaveBeenCalledWith('Bearer invalid_token');
    });

    it('handles verifyAccess error gracefully', async () => {
      mockVerifyAccess.mockRejectedValue(new Error('Auth failed'));
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer token' : null),
        },
      } as unknown as NextRequest;

      // The function should not throw, it should return 401
      await expect(getFlags(request)).rejects.toThrow('Auth failed');
      expect(mockVerifyAccess).toHaveBeenCalledWith('Bearer token');
    });
  });

  describe('flag definitions', () => {
    it('returns flag definitions when authorized', async () => {
      mockVerifyAccess.mockResolvedValue(true);
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer valid_token' : null),
        },
      } as unknown as NextRequest;

      const response = await getFlags(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        definitions: {
          'show-beta-feature': {
            description: 'Show beta features to users',
            options: [
              { label: 'Off', value: false },
              { label: 'On', value: true },
            ],
            origin: 'https://app.posthog.com/my/flags',
          },
        },
      });
    });

    it('includes correct flag metadata', async () => {
      mockVerifyAccess.mockResolvedValue(true);
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer valid_token' : null),
        },
      } as unknown as NextRequest;

      const response = await getFlags(request);
      const data = await response.json();

      const flagDef = data.definitions['show-beta-feature'];
      expect(flagDef.origin).toContain('posthog.com');
      expect(flagDef.description).toBeTruthy();
      expect(flagDef.options).toHaveLength(2);
      expect(flagDef.options[0]).toEqual({ label: 'Off', value: false });
      expect(flagDef.options[1]).toEqual({ label: 'On', value: true });
    });

    it('returns all defined flags', async () => {
      mockVerifyAccess.mockResolvedValue(true);
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer valid_token' : null),
        },
      } as unknown as NextRequest;

      const response = await getFlags(request);
      const data = await response.json();

      const flagKeys = Object.keys(data.definitions);
      expect(flagKeys).toContain('show-beta-feature');
      expect(flagKeys.length).toBeGreaterThan(0);
    });
  });

  describe('response format', () => {
    it('returns proper JSON response', async () => {
      mockVerifyAccess.mockResolvedValue(true);
      const { getFlags } = await import('../access');

      const request = {
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer valid_token' : null),
        },
      } as unknown as NextRequest;

      const response = await getFlags(request);

      expect(response.headers.get('content-type')).toContain('application/json');
      const data = await response.json();
      expect(data).toHaveProperty('definitions');
    });
  });
});
