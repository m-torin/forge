/**
 * @vitest-environment node
 */
import {
  createPostHogServerAdapter,
  getProviderData,
  postHogServerAdapter,
} from '@/adapters/posthog-server';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock PostHog Node client
const mockPostHogClient = {
  isFeatureEnabled: vi.fn(),
  getFeatureFlag: vi.fn(),
  getFeatureFlagPayload: vi.fn(),
};

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(() => mockPostHogClient),
}));

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock environment
vi.mock('../../env', () => ({
  safeEnv: vi.fn(() => ({
    POSTHOG_KEY: 'test-posthog-key',
    POSTHOG_HOST: 'https://app.posthog.com',
    POSTHOG_PERSONAL_API_KEY: 'test-personal-key',
    POSTHOG_PROJECT_ID: 'test-project-id',
    NODE_ENV: 'test',
    NEXT_PUBLIC_NODE_ENV: 'test',
  })),
}));

// Mock fetch for getProviderData
vi.spyOn(global, 'fetch').mockImplementation();

// Mock window to simulate server environment
Object.defineProperty(global, 'window', {
  value: undefined,
  writable: true,
});

describe.todo('createPostHogServerAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create adapter with provided options', () => {
    const adapter = createPostHogServerAdapter({
      postHogKey: 'custom-key',
      postHogOptions: { host: 'https://custom-host.com' },
    });

    expect(adapter.isFeatureEnabled).toBeInstanceOf(Function);
    expect(adapter.featureFlagValue).toBeInstanceOf(Function);
    expect(adapter.featureFlagPayload).toBeInstanceOf(Function);
  });

  test('should create no-op adapter when no PostHog key configured', async () => {
    const { safeEnv } = vi.mocked(await import('../../env'));
    safeEnv.mockReturnValueOnce({
      POSTHOG_KEY: undefined,
      NODE_ENV: 'test',
      NEXT_PUBLIC_NODE_ENV: 'test',
    } as any);

    const adapter = createPostHogServerAdapter();

    expect(adapter.isFeatureEnabled).toBeInstanceOf(Function);
    expect(adapter.featureFlagValue).toBeInstanceOf(Function);
    expect(adapter.featureFlagPayload).toBeInstanceOf(Function);
  });

  describe('isFeatureEnabled', () => {
    test('should return feature flag status from PostHog', async () => {
      mockPostHogClient.isFeatureEnabled.mockResolvedValueOnce(true);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.isFeatureEnabled();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toBeTruthy();
      expect(mockPostHogClient.isFeatureEnabled).toHaveBeenCalledWith('test-flag', 'user-123');
    });

    test('should use anonymous user id when no user provided', async () => {
      mockPostHogClient.isFeatureEnabled.mockResolvedValueOnce(false);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.isFeatureEnabled();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: {},
      });

      expect(result).toBeFalsy();
      expect(mockPostHogClient.isFeatureEnabled).toHaveBeenCalledWith('test-flag', 'anonymous');
    });

    test('should return false when PostHog throws error', async () => {
      mockPostHogClient.isFeatureEnabled.mockRejectedValueOnce(new Error('PostHog error'));

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.isFeatureEnabled();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toBeFalsy();
    });

    test('should throw error when used in browser environment', async () => {
      global.window = {} as any;

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.isFeatureEnabled();

      await expect(
        flagAdapter.decide({
          key: 'test-flag',
          entities: { user: { id: 'user-123' } },
        }),
      ).rejects.toThrow('PostHog server adapter only works in Node.js/server environments');

      global.window = undefined;
    });

    test('should return false for no-op adapter', async () => {
      const { safeEnv } = vi.mocked(await import('../../env'));
      safeEnv.mockReturnValueOnce({
        POSTHOG_KEY: undefined,
        NODE_ENV: 'test',
        NEXT_PUBLIC_NODE_ENV: 'test',
      } as any);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.isFeatureEnabled();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toBeFalsy();
    });
  });

  describe('featureFlagValue', () => {
    test('should return feature flag value from PostHog', async () => {
      mockPostHogClient.getFeatureFlag.mockResolvedValueOnce('variant-a');

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagValue();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toBe('variant-a');
      expect(mockPostHogClient.getFeatureFlag).toHaveBeenCalledWith('test-flag', 'user-123');
    });

    test('should return false when flag value is undefined', async () => {
      mockPostHogClient.getFeatureFlag.mockResolvedValueOnce(undefined);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagValue();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toBeFalsy();
    });

    test('should return false when PostHog throws error', async () => {
      mockPostHogClient.getFeatureFlag.mockRejectedValueOnce(new Error('PostHog error'));

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagValue();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toBeFalsy();
    });

    test('should throw error when used in browser environment', async () => {
      global.window = {} as any;

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagValue();

      await expect(
        flagAdapter.decide({
          key: 'test-flag',
          entities: { user: { id: 'user-123' } },
        }),
      ).rejects.toThrow('PostHog server adapter only works in Node.js/server environments');

      global.window = undefined;
    });
  });

  describe('featureFlagPayload', () => {
    test('should return feature flag payload from PostHog', async () => {
      const payload = { config: { variant: 'a' } };
      mockPostHogClient.getFeatureFlagPayload.mockResolvedValueOnce(payload);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagPayload();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toStrictEqual(payload);
      expect(mockPostHogClient.getFeatureFlagPayload).toHaveBeenCalledWith('test-flag', 'user-123');
    });

    test('should transform payload when transform function provided', async () => {
      const payload = { original: 'value' };
      const transformed = { transformed: 'value' };
      mockPostHogClient.getFeatureFlagPayload.mockResolvedValueOnce(payload);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagPayload((value: any) => transformed);

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toStrictEqual(transformed);
    });

    test('should return empty object when payload is null', async () => {
      mockPostHogClient.getFeatureFlagPayload.mockResolvedValueOnce(null);

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagPayload();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toStrictEqual({});
    });

    test('should return empty object when PostHog throws error', async () => {
      mockPostHogClient.getFeatureFlagPayload.mockRejectedValueOnce(new Error('PostHog error'));

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagPayload();

      const result = await flagAdapter.decide({
        key: 'test-flag',
        entities: { user: { id: 'user-123' } },
      });

      expect(result).toStrictEqual({});
    });

    test('should throw error when used in browser environment', async () => {
      global.window = {} as any;

      const adapter = createPostHogServerAdapter();
      const flagAdapter = adapter.featureFlagPayload();

      await expect(
        flagAdapter.decide({
          key: 'test-flag',
          entities: { user: { id: 'user-123' } },
        }),
      ).rejects.toThrow('PostHog server adapter only works in Node.js/server environments');

      global.window = undefined;
    });
  });
});

describe.todo('postHogServerAdapter', () => {
  test('should be defined as default adapter', () => {
    expect(postHogServerAdapter.isFeatureEnabled).toBeInstanceOf(Function);
    expect(postHogServerAdapter.featureFlagValue).toBeInstanceOf(Function);
    expect(postHogServerAdapter.featureFlagPayload).toBeInstanceOf(Function);
  });
});

describe.todo('getProviderData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return empty flags when credentials not configured', async () => {
    const { safeEnv } = vi.mocked(await import('../../env'));
    safeEnv.mockReturnValueOnce({
      POSTHOG_PERSONAL_API_KEY: undefined,
      POSTHOG_PROJECT_ID: undefined,
      NODE_ENV: 'test',
      NEXT_PUBLIC_NODE_ENV: 'test',
    } as any);

    const result = await getProviderData({});

    expect(result).toStrictEqual({
      provider: 'posthog',
      flags: [],
    });
  });

  test('should fetch and transform PostHog flags', async () => {
    const mockResponse = {
      results: [
        {
          key: 'test-flag',
          filters: {
            multivariate: {
              variants: [
                { name: 'Control', key: 'control' },
                { name: 'Variant A', key: 'variant-a' },
              ],
            },
          },
        },
        {
          key: 'simple-flag',
          filters: {},
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getProviderData({});

    expect(result).toStrictEqual({
      provider: 'posthog',
      flags: [
        {
          key: 'test-flag',
          options: [
            { label: 'Control', value: 'control' },
            { label: 'Variant A', value: 'variant-a' },
          ],
        },
        {
          key: 'simple-flag',
          options: [
            { label: 'Enabled', value: true },
            { label: 'Disabled', value: false },
          ],
        },
      ],
    });
  });

  test('should use provided credentials', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    await getProviderData({
      personalApiKey: 'custom-key',
      projectId: 'custom-project',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://app.posthog.com/api/projects/custom-project/feature_flags/',
      {
        headers: {
          Authorization: 'Bearer custom-key',
          'Content-Type': 'application/json',
        },
      },
    );
  });

  test('should throw error when API request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    } as Response);

    await expect(getProviderData({})).rejects.toThrow(
      'Failed to fetch PostHog flags: Unauthorized',
    );
  });

  test('should throw error when fetch throws', async () => {
    const error = new Error('Network error');
    vi.mocked(fetch).mockRejectedValueOnce(error);

    await expect(getProviderData({})).rejects.toThrow('Network error');
  });
});
