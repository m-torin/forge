import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostHogClientAdapter } from '../../adapters/posthog-client';

// Mock PostHog client
const mockIsFeatureEnabled = vi.fn();
const mockGetFeatureFlagPayload = vi.fn();
const mockOnFeatureFlags = vi.fn();
const mockReloadFeatureFlags = vi.fn();
const mockCapture = vi.fn();
const mockIdentify = vi.fn();

const mockPosthog = {
  identify: mockIdentify,
  capture: mockCapture,
  getFeatureFlagPayload: mockGetFeatureFlagPayload,
  isFeatureEnabled: mockIsFeatureEnabled,
  onFeatureFlags: mockOnFeatureFlags,
  reloadFeatureFlags: mockReloadFeatureFlags,
};

vi.mock('posthog-js', () => ({
  default: mockPosthog,
}));

describe('PostHogClientAdapter', () => {
  let adapter: PostHogClientAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new PostHogClientAdapter(mockPosthog as any);
  });

  describe('getFlag', () => {
    it('should return flag value when enabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      mockGetFeatureFlagPayload.mockReturnValue({ variant: 'A' });

      const result = await adapter.getFlag('test-flag');

      expect(result).toEqual({ variant: 'A' });
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('test-flag');
      expect(mockGetFeatureFlagPayload).toHaveBeenCalledWith('test-flag');
    });

    it('should return boolean true when enabled without payload', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      mockGetFeatureFlagPayload.mockReturnValue(undefined);

      const result = await adapter.getFlag('test-flag');

      expect(result).toBe(true);
    });

    it('should return false when flag is disabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const result = await adapter.getFlag('test-flag');

      expect(result).toBe(false);
      expect(mockGetFeatureFlagPayload).not.toHaveBeenCalled();
    });

    it('should return default value when flag is disabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const result = await adapter.getFlag('test-flag', 'default');

      expect(result).toBe('default');
    });

    it('should return default value when flag is undefined', async () => {
      mockIsFeatureEnabled.mockReturnValue(undefined);

      const result = await adapter.getFlag('test-flag', { defaultVariant: 'B' });

      expect(result).toEqual({ defaultVariant: 'B' });
    });

    it('should handle string payloads', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      mockGetFeatureFlagPayload.mockReturnValue('variant-a');

      const result = await adapter.getFlag('string-flag');

      expect(result).toBe('variant-a');
    });

    it('should handle numeric payloads', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      mockGetFeatureFlagPayload.mockReturnValue(42);

      const result = await adapter.getFlag('number-flag');

      expect(result).toBe(42);
    });
  });

  describe('getAllFlags', () => {
    it('should wait for flags to load and return all flags', async () => {
      const mockFlags = {
        'flag-1': true,
        'flag-2': 'variant-a',
        'flag-3': { config: 'value' },
      };

      mockOnFeatureFlags.mockImplementation((callback) => {
        // Simulate async flag loading
        setTimeout(() => callback(mockFlags), 10);
      });

      const result = await adapter.getAllFlags();

      expect(result).toEqual(mockFlags);
      expect(mockOnFeatureFlags).toHaveBeenCalled();
    });

    it('should handle empty flags', async () => {
      mockOnFeatureFlags.mockImplementation((callback) => {
        callback({});
      });

      const result = await adapter.getAllFlags();

      expect(result).toEqual({});
    });

    it('should handle null flags response', async () => {
      mockOnFeatureFlags.mockImplementation((callback) => {
        callback(null);
      });

      const result = await adapter.getAllFlags();

      expect(result).toEqual({});
    });

    it('should timeout if flags never load', async () => {
      mockOnFeatureFlags.mockImplementation(() => {
        // Never call the callback
      });

      const promise = adapter.getAllFlags();

      // Should eventually timeout (implementation dependent)
      await expect(promise).resolves.toBeDefined();
    });
  });

  describe('isEnabled', () => {
    it('should return true for enabled flags', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);

      const result = await adapter.isEnabled('test-flag');

      expect(result).toBe(true);
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('test-flag');
    });

    it('should return false for disabled flags', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const result = await adapter.isEnabled('test-flag');

      expect(result).toBe(false);
    });

    it('should return false for undefined flags', async () => {
      mockIsFeatureEnabled.mockReturnValue(undefined);

      const result = await adapter.isEnabled('test-flag');

      expect(result).toBe(false);
    });

    it('should return false for null flags', async () => {
      mockIsFeatureEnabled.mockReturnValue(null);

      const result = await adapter.isEnabled('test-flag');

      expect(result).toBe(false);
    });
  });

  describe('reload', () => {
    it('should reload feature flags', async () => {
      await adapter.reload();

      expect(mockReloadFeatureFlags).toHaveBeenCalled();
    });

    it('should handle reload errors gracefully', async () => {
      mockReloadFeatureFlags.mockImplementation(() => {
        throw new Error('Reload failed');
      });

      // Should not throw
      await expect(adapter.reload()).resolves.toBeUndefined();
    });
  });

  describe('identify', () => {
    it('should identify user with properties', async () => {
      await adapter.identify('user-123', {
        email: 'test@example.com',
        plan: 'pro',
      });

      expect(mockIdentify).toHaveBeenCalledWith('user-123', {
        email: 'test@example.com',
        plan: 'pro',
      });
    });

    it('should identify user without properties', async () => {
      await adapter.identify('user-456');

      expect(mockIdentify).toHaveBeenCalledWith('user-456', undefined);
    });
  });

  describe('track', () => {
    it('should track flag evaluation event', async () => {
      await adapter.track('flag_evaluated', {
        flag: 'test-flag',
        value: true,
      });

      expect(mockCapture).toHaveBeenCalledWith('flag_evaluated', {
        flag: 'test-flag',
        value: true,
      });
    });

    it('should track events without properties', async () => {
      await adapter.track('app_loaded');

      expect(mockCapture).toHaveBeenCalledWith('app_loaded', undefined);
    });
  });

  describe('error handling', () => {
    it('should handle PostHog errors in getFlag', async () => {
      mockIsFeatureEnabled.mockImplementation(() => {
        throw new Error('PostHog error');
      });

      const result = await adapter.getFlag('test-flag', 'fallback');

      expect(result).toBe('fallback');
    });

    it('should handle PostHog errors in getAllFlags', async () => {
      mockOnFeatureFlags.mockImplementation(() => {
        throw new Error('PostHog error');
      });

      const result = await adapter.getAllFlags();

      expect(result).toEqual({});
    });

    it('should handle PostHog errors in isEnabled', async () => {
      mockIsFeatureEnabled.mockImplementation(() => {
        throw new Error('PostHog error');
      });

      const result = await adapter.isEnabled('test-flag');

      expect(result).toBe(false);
    });
  });

  describe('constructor', () => {
    it('should throw if PostHog client is not provided', () => {
      expect(() => new PostHogClientAdapter(null as any)).toThrow();
      expect(() => new PostHogClientAdapter(undefined as any)).toThrow();
    });

    it('should accept valid PostHog client', () => {
      const adapter = new PostHogClientAdapter(mockPosthog as any);
      expect(adapter).toBeDefined();
    });
  });
});
