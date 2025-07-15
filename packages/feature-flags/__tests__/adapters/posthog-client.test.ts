// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { createPostHogClientAdapter } from '#/adapters/posthog-client';

vi.mock('posthog-js', () => {
  const mockIsFeatureEnabled = vi.fn();
  const mockGetFeatureFlag = vi.fn();
  const mockGetFeatureFlagPayload = vi.fn();
  const mockOnFeatureFlags = vi.fn();
  const mockReloadFeatureFlags = vi.fn();
  const mockCapture = vi.fn();
  const mockIdentify = vi.fn();
  const mockGetDistinctId = vi.fn();

  return {
    default: {
      get_distinct_id: mockGetDistinctId,
      identify: mockIdentify,
      __loaded: true,
      capture: mockCapture,
      getFeatureFlag: mockGetFeatureFlag,
      getFeatureFlagPayload: mockGetFeatureFlagPayload,
      isFeatureEnabled: mockIsFeatureEnabled,
      onFeatureFlags: mockOnFeatureFlags,
      reloadFeatureFlags: mockReloadFeatureFlags,
      __mocks: {
        mockIsFeatureEnabled,
        mockGetFeatureFlag,
        mockGetFeatureFlagPayload,
        mockOnFeatureFlags,
        mockReloadFeatureFlags,
        mockCapture,
        mockIdentify,
        mockGetDistinctId,
      },
    },
  };
});

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test-key');
vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com');

describe('postHogClientAdapter', () => {
  let adapter: ReturnType<typeof createPostHogClientAdapter>;
  let mocks: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const posthogModule = await import('posthog-js');
    mocks = (posthogModule.default as any).__mocks;
    mocks.mockGetDistinctId.mockReturnValue('test-user');
    adapter = createPostHogClientAdapter({
      postHogKey: 'test-key',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isFeatureEnabled adapter', () => {
    test('should return true when flag is enabled', async () => {
      mocks.mockIsFeatureEnabled.mockReturnValue(true);

      const flagAdapter = adapter.isFeatureEnabled();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBeTruthy();
      expect(mocks.mockIsFeatureEnabled).toHaveBeenCalledWith('test-flag');
    });

    test('should return false when flag is disabled', async () => {
      mocks.mockIsFeatureEnabled.mockReturnValue(false);

      const flagAdapter = adapter.isFeatureEnabled();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBeFalsy();
    });

    test('should identify user when different from current', async () => {
      mocks.mockGetDistinctId.mockReturnValue('different-user');
      mocks.mockIsFeatureEnabled.mockReturnValue(true);

      const flagAdapter = adapter.isFeatureEnabled();
      await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(mocks.mockIdentify).toHaveBeenCalledWith('user-123');
    });

    test('should handle anonymous users', async () => {
      mocks.mockIsFeatureEnabled.mockReturnValue(false);

      const flagAdapter = adapter.isFeatureEnabled();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: {},
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBeFalsy();
      expect(mocks.mockIdentify).not.toHaveBeenCalled();
    });

    test('should throw error when used outside browser', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const flagAdapter = adapter.isFeatureEnabled();

      await expect(
        flagAdapter.decide({
          cookies: {} as any,
          entities: { user: { id: 'user-123' } },
          headers: new Headers(),
          key: 'test-flag',
        }),
      ).rejects.toThrow('PostHog client adapter only works in browser environments');

      global.window = originalWindow;
    });
  });

  describe('featureFlagValue adapter', () => {
    test('should return flag value when available', async () => {
      mocks.mockGetFeatureFlag.mockReturnValue('variant-a');

      const flagAdapter = adapter.featureFlagValue();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBe('variant-a');
      expect(mocks.mockGetFeatureFlag).toHaveBeenCalledWith('test-flag');
    });

    test('should return false when flag is undefined', async () => {
      mocks.mockGetFeatureFlag.mockReturnValue(undefined);

      const flagAdapter = adapter.featureFlagValue();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBeFalsy();
    });

    test('should return boolean values', async () => {
      mocks.mockGetFeatureFlag.mockReturnValue(true);

      const flagAdapter = adapter.featureFlagValue();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'bool-flag',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('featureFlagPayload adapter', () => {
    test('should return payload when available', async () => {
      const payload = { config: { timeout: 5000 }, variant: 'A' };
      mocks.mockGetFeatureFlagPayload.mockReturnValue(payload);

      const flagAdapter = adapter.featureFlagPayload();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toStrictEqual(payload);
      expect(mocks.mockGetFeatureFlagPayload).toHaveBeenCalledWith('test-flag');
    });

    test('should transform payload when transform function provided', async () => {
      const payload = { value: 'raw' };
      mocks.mockGetFeatureFlagPayload.mockReturnValue(payload);

      const transform = (data: any) => ({ transformed: data.value });
      const flagAdapter = adapter.featureFlagPayload(transform);
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toStrictEqual({ transformed: 'raw' });
    });

    test('should return default payload when no payload available', async () => {
      mocks.mockGetFeatureFlagPayload.mockReturnValue(null);

      const flagAdapter = adapter.featureFlagPayload();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toStrictEqual({});
    });
  });

  describe('adapter configuration', () => {
    test('should have correct adapter configuration', () => {
      const flagAdapter = adapter.isFeatureEnabled();

      expect(flagAdapter.config).toStrictEqual({ reportValue: true });
      expect(flagAdapter.origin).toStrictEqual({ provider: 'posthog' });
    });
  });

  describe('createPostHogClientAdapter', () => {
    test('should return no-op adapter when no API key provided', async () => {
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '');

      const adapter = createPostHogClientAdapter();
      const isEnabledAdapter = adapter.isFeatureEnabled();
      const mockHeaders = {
        get: vi.fn().mockReturnValue(null),
      } as any;
      const mockCookies = {
        get: vi.fn().mockReturnValue(undefined),
      } as any;
      const result = await isEnabledAdapter.decide({
        entities: {},
        key: 'test-flag',
        headers: mockHeaders,
        cookies: mockCookies,
      });

      expect(result).toBeFalsy();
    });

    test('should use provided options', () => {
      const adapter = createPostHogClientAdapter({
        postHogKey: 'custom-key',
        postHogOptions: {
          debug: true,
          host: 'https://custom.posthog.com',
        },
      });

      expect(adapter).toBeDefined();
    });

    test('should use environment variables when no options provided', () => {
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'env-key');
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://env.posthog.com');

      const adapter = createPostHogClientAdapter();

      expect(adapter).toBeDefined();
    });
  });
});
