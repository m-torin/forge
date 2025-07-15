import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createMockCookies, createMockHeaders } from './test-utils';

// Mock observability functions
const mockLogWarn = vi.fn();
const mockLogError = vi.fn();

vi.mock('@repo/observability', () => ({
  logError: mockLogError,
  logWarn: mockLogWarn,
}));

// Mock environment
const mockSafeEnv = vi.fn(() => ({}));
vi.mock('#/env', () => ({
  safeEnv: mockSafeEnv,
}));

// Mock the adapter modules
vi.mock('#/adapters/edge-config', () => ({
  createEdgeConfigAdapter: vi.fn(),
  edgeConfigAdapter: {},
  getEdgeConfigProviderData: vi.fn(),
}));

describe('server-edge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response());

    // Mock successful PostHog API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          featureFlags: { test_flag: true },
          featureFlagPayloads: { test_flag: { variant: 'A' } },
          results: [{ key: 'test_flag', active: true }],
        }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('module can be imported', async () => {
    expect(async () => {
      await import('#/server-edge');
    }).not.toThrow();
  });

  describe('createPostHogEdgeAdapter', () => {
    test('creates adapter with API key', async () => {
      const { createPostHogEdgeAdapter } = await import('#/server-edge');

      const adapter = createPostHogEdgeAdapter({
        postHogKey: 'test-key',
        postHogHost: 'https://test.posthog.com',
      });

      expect(adapter).toHaveProperty('isFeatureEnabled');
      expect(adapter).toHaveProperty('featureFlagValue');
      expect(adapter).toHaveProperty('featureFlagPayload');
    });

    test('creates no-op adapter without API key', async () => {
      const { createPostHogEdgeAdapter } = await import('#/server-edge');

      const adapter = createPostHogEdgeAdapter();
      const result = await adapter.isFeatureEnabled().decide({
        entities: {},
        key: 'test',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });

      // Should return false when no API key is configured
      expect(result).toBeFalsy();

      // Test all adapter methods return expected no-op values
      const flagValue = await adapter.featureFlagValue().decide({
        entities: {},
        key: 'test',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });
      expect(flagValue).toBeFalsy();

      const payload = await adapter.featureFlagPayload().decide({
        entities: {},
        key: 'test',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });
      expect(payload).toStrictEqual({});
    });

    test('isFeatureEnabled makes correct API call', async () => {
      const { createPostHogEdgeAdapter } = await import('#/server-edge');

      const adapter = createPostHogEdgeAdapter({
        postHogKey: 'test-key',
        postHogHost: 'https://test.posthog.com',
      });

      const result = await adapter.isFeatureEnabled().decide({
        entities: { user: { id: 'user123' } },
        key: 'test_flag',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });

      expect(global.fetch).toHaveBeenCalledWith('https://test.posthog.com/decide/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-key',
        },
        body: JSON.stringify({
          api_key: 'test-key',
          distinct_id: 'user123',
          person_properties: { id: 'user123' },
        }),
      });
      expect(result).toBeTruthy();
    });

    test('handles API errors gracefully', async () => {
      const { createPostHogEdgeAdapter } = await import('#/server-edge');

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const adapter = createPostHogEdgeAdapter({ postHogKey: 'test-key' });
      const result = await adapter.isFeatureEnabled().decide({
        entities: {},
        key: 'test_flag',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });

      expect(mockLogWarn).toHaveBeenCalledWith('PostHog API error', {
        status: 401,
        provider: 'posthog-edge',
      });
      expect(result).toBeFalsy();
    });

    test('handles network errors gracefully', async () => {
      const { createPostHogEdgeAdapter } = await import('#/server-edge');

      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const adapter = createPostHogEdgeAdapter({ postHogKey: 'test-key' });
      const result = await adapter.isFeatureEnabled().decide({
        entities: {},
        key: 'test_flag',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });

      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'posthog-edge',
        method: 'isFeatureEnabled',
      });
      expect(result).toBeFalsy();
    });

    test('featureFlagPayload applies transform function', async () => {
      const { createPostHogEdgeAdapter } = await import('#/server-edge');

      const adapter = createPostHogEdgeAdapter({ postHogKey: 'test-key' });
      const transform = (value: any) => ({ ...value, transformed: true });

      const result = await adapter.featureFlagPayload(transform).decide({
        entities: {},
        key: 'test_flag',
        headers: createMockHeaders(),
        cookies: createMockCookies(),
      });

      expect(result).toStrictEqual({ variant: 'A', transformed: true });
    });
  });

  describe('getPostHogProviderData', () => {
    test('returns empty flags without API key', async () => {
      // Ensure the environment returns empty values
      mockSafeEnv.mockReturnValue({
        POSTHOG_PERSONAL_API_KEY: undefined,
        POSTHOG_PROJECT_ID: undefined,
      });

      const { getPostHogProviderData } = await import('#/server-edge');

      // Call without any parameters to trigger the no-key path
      const result = await getPostHogProviderData({});

      // Should return empty flags when API key is not configured
      expect(result).toStrictEqual({ provider: 'posthog-edge', flags: [] });
    });

    test('handles API errors when fetching flags', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
      });

      const { getPostHogProviderData } = await import('#/server-edge');

      const result = await getPostHogProviderData({
        personalApiKey: 'invalid-key',
        projectId: '123',
      });

      // Should return empty flags when API fails
      expect(result).toStrictEqual({ provider: 'posthog-edge', flags: [] });
    });

    test('fetches and transforms flags correctly', async () => {
      // Reset to successful response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [{ key: 'test_flag', active: true }],
          }),
      });

      const { getPostHogProviderData } = await import('#/server-edge');

      const result = await getPostHogProviderData({
        personalApiKey: 'personal-key',
        projectId: '123',
        postHogHost: 'https://test.posthog.com',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.posthog.com/api/projects/123/feature_flags/',
        {
          headers: {
            Authorization: 'Bearer personal-key',
            'Content-Type': 'application/json',
          },
        },
      );

      expect(result).toStrictEqual({
        provider: 'posthog-edge',
        flags: [
          {
            key: 'test_flag',
            options: [
              { label: 'Enabled', value: true },
              { label: 'Disabled', value: false },
            ],
          },
        ],
      });
    });
  });
});
