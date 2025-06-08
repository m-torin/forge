import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPostHogClientAdapter } from '../../adapters/posthog-client';

// Mock PostHog client
const mockIsFeatureEnabled = vi.fn();
const mockGetFeatureFlag = vi.fn();
const mockGetFeatureFlagPayload = vi.fn();
const mockOnFeatureFlags = vi.fn();
const mockReloadFeatureFlags = vi.fn();
const mockCapture = vi.fn();
const mockIdentify = vi.fn();
const mockGetDistinctId = vi.fn();

const mockPosthog = {
  get_distinct_id: mockGetDistinctId,
  identify: mockIdentify,
  __loaded: true,
  capture: mockCapture,
  getFeatureFlag: mockGetFeatureFlag,
  getFeatureFlagPayload: mockGetFeatureFlagPayload,
  isFeatureEnabled: mockIsFeatureEnabled,
  onFeatureFlags: mockOnFeatureFlags,
  reloadFeatureFlags: mockReloadFeatureFlags,
};

vi.mock('posthog-js', () => ({
  default: mockPosthog,
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test-key');
vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com');

// Mock window object
Object.defineProperty(global, 'window', {
  value: {},
  writable: true,
});

describe('PostHogClientAdapter', () => {
  let adapter: ReturnType<typeof createPostHogClientAdapter>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDistinctId.mockReturnValue('test-user');
    adapter = createPostHogClientAdapter({
      postHogKey: 'test-key',
    });
  });

  describe('isFeatureEnabled adapter', () => {
    it('should return true when flag is enabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);

      const flagAdapter = adapter.isFeatureEnabled();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBe(true);
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('test-flag');
    });

    it('should return false when flag is disabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const flagAdapter = adapter.isFeatureEnabled();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBe(false);
    });

    it('should identify user when different from current', async () => {
      mockGetDistinctId.mockReturnValue('different-user');
      mockIsFeatureEnabled.mockReturnValue(true);

      const flagAdapter = adapter.isFeatureEnabled();
      await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(mockIdentify).toHaveBeenCalledWith('user-123');
    });

    it('should handle anonymous users', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const flagAdapter = adapter.isFeatureEnabled();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: {},
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBe(false);
      expect(mockIdentify).not.toHaveBeenCalled();
    });

    it('should throw error when used outside browser', async () => {
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
    it('should return flag value when available', async () => {
      mockGetFeatureFlag.mockReturnValue('variant-a');

      const flagAdapter = adapter.featureFlagValue();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBe('variant-a');
      expect(mockGetFeatureFlag).toHaveBeenCalledWith('test-flag');
    });

    it('should return false when flag is undefined', async () => {
      mockGetFeatureFlag.mockReturnValue(undefined);

      const flagAdapter = adapter.featureFlagValue();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toBe(false);
    });

    it('should return boolean values', async () => {
      mockGetFeatureFlag.mockReturnValue(true);

      const flagAdapter = adapter.featureFlagValue();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'bool-flag',
      });

      expect(result).toBe(true);
    });
  });

  describe('featureFlagPayload adapter', () => {
    it('should return payload when available', async () => {
      const payload = { config: { timeout: 5000 }, variant: 'A' };
      mockGetFeatureFlagPayload.mockReturnValue(payload);

      const flagAdapter = adapter.featureFlagPayload();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toEqual(payload);
      expect(mockGetFeatureFlagPayload).toHaveBeenCalledWith('test-flag');
    });

    it('should transform payload when transform function provided', async () => {
      const payload = { value: 'raw' };
      mockGetFeatureFlagPayload.mockReturnValue(payload);

      const transform = (data: any) => ({ transformed: data.value });
      const flagAdapter = adapter.featureFlagPayload(transform);
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toEqual({ transformed: 'raw' });
    });

    it('should return default payload when no payload available', async () => {
      mockGetFeatureFlagPayload.mockReturnValue(null);

      const flagAdapter = adapter.featureFlagPayload();
      const result = await flagAdapter.decide({
        cookies: {} as any,
        entities: { user: { id: 'user-123' } },
        headers: new Headers(),
        key: 'test-flag',
      });

      expect(result).toEqual({});
    });
  });

  describe('adapter configuration', () => {
    it('should have correct adapter configuration', () => {
      const flagAdapter = adapter.isFeatureEnabled();

      expect(flagAdapter.config).toEqual({ reportValue: true });
      expect(flagAdapter.origin).toEqual({ provider: 'posthog' });
    });
  });

  describe('createPostHogClientAdapter', () => {
    it('should throw error when no API key provided', () => {
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '');

      expect(() => createPostHogClientAdapter()).toThrow(
        'PostHog API key is required. Set NEXT_PUBLIC_POSTHOG_KEY or pass postHogKey option.',
      );
    });

    it('should use provided options', () => {
      const adapter = createPostHogClientAdapter({
        postHogKey: 'custom-key',
        postHogOptions: {
          debug: true,
          host: 'https://custom.posthog.com',
        },
      });

      expect(adapter).toBeDefined();
    });

    it('should use environment variables when no options provided', () => {
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'env-key');
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://env.posthog.com');

      const adapter = createPostHogClientAdapter();

      expect(adapter).toBeDefined();
    });
  });
});
