import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCurrentUser = vi.fn();
const mockAnalytics = {
  isFeatureEnabled: vi.fn(),
};
const mockFlag = vi.fn();

vi.mock('@repo/auth/server', () => ({
  currentUser: () => mockCurrentUser(),
}));

vi.mock('@repo/analytics/posthog/server', () => ({
  analytics: mockAnalytics,
}));

vi.mock('flags/next', () => ({
  flag: mockFlag,
}));

describe('createFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Setup flag mock to return a function
    mockFlag.mockImplementation(({ decide, defaultValue, key }) => {
      const flagFunc = async () => {
        const context = { defaultValue };
        return decide.call(context);
      };
      flagFunc.key = key;
      flagFunc.defaultValue = defaultValue;
      return flagFunc;
    });
  });

  it('exports createFlag function', async () => {
    const { createFlag } = await import('../lib/create-flag');
    expect(createFlag).toBeDefined();
    expect(typeof createFlag).toBe('function');
  });

  describe('flag evaluation', () => {
    let createFlag: any;

    beforeEach(async () => {
      ({ createFlag } = await import('../lib/create-flag'));
    });

    it('returns true when flag is enabled for user', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockResolvedValue(true);

      const flag = createFlag('test-flag');
      const result = await flag();

      expect(result).toBe(true);
      expect(mockCurrentUser).toHaveBeenCalled();
      expect(mockAnalytics.isFeatureEnabled).toHaveBeenCalledWith('test-flag', 'user_123');
    });

    it('returns false when flag is disabled for user', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockResolvedValue(false);

      const flag = createFlag('test-flag');
      const result = await flag();

      expect(result).toBe(false);
      expect(mockAnalytics.isFeatureEnabled).toHaveBeenCalledWith('test-flag', 'user_123');
    });

    it('returns false when flag value is null', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockResolvedValue(null);

      const flag = createFlag('test-flag');
      const result = await flag();

      expect(result).toBe(false);
    });

    it('returns false when flag value is undefined', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockResolvedValue(undefined);

      const flag = createFlag('test-flag');
      const result = await flag();

      expect(result).toBe(false);
    });

    it('handles missing user gracefully', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const flag = createFlag('test-flag');
      const result = await flag();

      expect(result).toBe(false);
      expect(mockAnalytics.isFeatureEnabled).not.toHaveBeenCalled();
    });

    it('handles user without id', async () => {
      mockCurrentUser.mockResolvedValue({ name: 'Test User' });

      const flag = createFlag('test-flag');
      const result = await flag();

      expect(result).toBe(false);
      expect(mockAnalytics.isFeatureEnabled).toHaveBeenCalledWith('test-flag', undefined);
    });

    it('handles currentUser rejection', async () => {
      mockCurrentUser.mockRejectedValue(new Error('Failed to get user'));

      const flag = createFlag('test-flag');
      await expect(flag()).rejects.toThrow('Failed to get user');
    });

    it('handles analytics rejection', async () => {
      mockCurrentUser.mockResolvedValue({ id: 'user_123' });
      mockAnalytics.isFeatureEnabled.mockRejectedValue(new Error('Analytics error'));

      const flag = createFlag('test-flag');
      await expect(flag()).rejects.toThrow('Analytics error');
    });

    it('creates flag with correct parameters', async () => {
      const flag = createFlag('test-flag');

      expect(mockFlag).toHaveBeenCalledWith({
        decide: expect.any(Function),
        defaultValue: false,
        key: 'test-flag',
      });
    });
  });

  describe('flag factory', () => {
    it('creates separate flag instances for different flag names', async () => {
      const { createFlag } = await import('../lib/create-flag');

      const flag1 = createFlag('flag-1');
      const flag2 = createFlag('flag-2');

      expect(flag1).not.toBe(flag2);
      expect(mockFlag).toHaveBeenCalledTimes(2);
      expect(mockFlag).toHaveBeenCalledWith(expect.objectContaining({ key: 'flag-1' }));
      expect(mockFlag).toHaveBeenCalledWith(expect.objectContaining({ key: 'flag-2' }));
    });
  });
});
