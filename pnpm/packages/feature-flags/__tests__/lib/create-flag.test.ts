import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createFlag } from '../../lib/create-flag';

// Import the mocked modules
vi.mock('@repo/analytics/posthog/server');
vi.mock('@repo/auth/server');
vi.mock('flags/next');

describe('createFlag', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a flag with the provided key', () => {
    const flag = createFlag('testFlag');
    expect(flag.key).toBe('testFlag');
  });

  it('sets the default value to false', () => {
    const flag = createFlag('testFlag');
    expect(flag.defaultValue).toBe(false);
  });

  it('includes a decide function', () => {
    const flag = createFlag('testFlag');
    expect(typeof flag.decide).toBe('function');
  });

  describe('decide function', () => {
    it('returns the default value when no user is authenticated', async () => {
      // Mock auth to return no userId
      const { auth } = require('@repo/auth/server');
      auth.mockResolvedValueOnce({ userId: null });

      const flag = createFlag('testFlag');
      const result = await flag.decide();

      expect(result).toBe(false); // Default value
      expect(auth).toHaveBeenCalled();
    });

    it('checks PostHog feature flag when user is authenticated', async () => {
      // Mock auth to return a userId
      const { auth } = require('@repo/auth/server');
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock analytics.isFeatureEnabled
      const { analytics } = require('@repo/analytics/posthog/server');
      analytics.isFeatureEnabled.mockResolvedValueOnce(true);

      const flag = createFlag('testFlag');
      const result = await flag.decide();

      expect(result).toBe(true);
      expect(auth).toHaveBeenCalled();
      expect(analytics.isFeatureEnabled).toHaveBeenCalledWith(
        'testFlag',
        'test-user-id',
      );
    });

    it('returns the default value when PostHog returns null', async () => {
      // Mock auth to return a userId
      const { auth } = require('@repo/auth/server');
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock analytics.isFeatureEnabled to return null
      const { analytics } = require('@repo/analytics/posthog/server');
      analytics.isFeatureEnabled.mockResolvedValueOnce(null);

      const flag = createFlag('testFlag');
      const result = await flag.decide();

      expect(result).toBe(false); // Default value
      expect(auth).toHaveBeenCalled();
      expect(analytics.isFeatureEnabled).toHaveBeenCalledWith(
        'testFlag',
        'test-user-id',
      );
    });

    it('returns the PostHog value when it is defined', async () => {
      // Test with true value
      const { auth } = require('@repo/auth/server');
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      const { analytics } = require('@repo/analytics/posthog/server');
      analytics.isFeatureEnabled.mockResolvedValueOnce(true);

      const flag = createFlag('testFlag');
      let result = await flag.decide();

      expect(result).toBe(true);

      // Test with false value
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });
      analytics.isFeatureEnabled.mockResolvedValueOnce(false);

      result = await flag.decide();

      expect(result).toBe(false);
    });
  });
});
