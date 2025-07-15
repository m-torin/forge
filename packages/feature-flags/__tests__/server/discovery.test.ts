import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock observability functions
const mockLogError = vi.fn();
const mockLogInfo = vi.fn();

vi.mock('@repo/observability', () => ({
  logError: mockLogError,
  logInfo: mockLogInfo,
}));

// Mock environment
const mockSafeEnv = vi.fn(() => ({
  FLAGS_SECRET: 'test-secret',
  NODE_ENV: 'test',
}));

vi.mock('#/env', () => ({
  safeEnv: mockSafeEnv,
}));

// Mock flags/next
const mockCreateFlagsDiscoveryEndpoint = vi.fn();
const mockGetProviderData = vi.fn();

vi.mock('flags/next', () => ({
  createFlagsDiscoveryEndpoint: mockCreateFlagsDiscoveryEndpoint,
  getProviderData: mockGetProviderData,
}));

describe('server/discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEPLOYMENT_ID = 'test-deployment';
  });

  describe('createModernFlagsDiscoveryEndpoint', () => {
    test('should create discovery endpoint with default options', async () => {
      const { createModernFlagsDiscoveryEndpoint } = await import('#/server/discovery');

      const mockGetFlags = vi.fn().mockResolvedValue({ definitions: [] });
      const mockEndpoint = vi.fn();
      mockCreateFlagsDiscoveryEndpoint.mockReturnValue(mockEndpoint);

      const result = createModernFlagsDiscoveryEndpoint(mockGetFlags);

      expect(result).toBe(mockEndpoint);
      expect(mockCreateFlagsDiscoveryEndpoint).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should create discovery endpoint with custom options', async () => {
      const { createModernFlagsDiscoveryEndpoint } = await import('#/server/discovery');

      const mockGetFlags = vi.fn().mockResolvedValue({ definitions: [] });
      const options = { secret: 'custom-secret', enableLogging: false };

      createModernFlagsDiscoveryEndpoint(mockGetFlags, options);

      expect(mockCreateFlagsDiscoveryEndpoint).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should handle getFlags success with logging enabled', async () => {
      const { createModernFlagsDiscoveryEndpoint } = await import('#/server/discovery');

      const mockFlags = { definitions: [{ key: 'test', value: true }] };
      const mockGetFlags = vi.fn().mockResolvedValue(mockFlags);

      mockCreateFlagsDiscoveryEndpoint.mockImplementation(fn => fn);

      const endpoint = createModernFlagsDiscoveryEndpoint(mockGetFlags, { enableLogging: true });
      const result = await endpoint({} as any);

      expect(result).toStrictEqual(mockFlags);
      expect(mockLogInfo).toHaveBeenCalledWith('Flags discovery endpoint accessed', {
        timestamp: expect.any(String),
      });
      expect(mockLogInfo).toHaveBeenCalledWith('Flags discovery data generated', {
        flagCount: 1,
        hasOverrides: false,
      });
    });

    test('should handle getFlags success with logging disabled', async () => {
      const { createModernFlagsDiscoveryEndpoint } = await import('#/server/discovery');

      const mockFlags = { definitions: [] };
      const mockGetFlags = vi.fn().mockResolvedValue(mockFlags);

      mockCreateFlagsDiscoveryEndpoint.mockImplementation(fn => fn);

      const endpoint = createModernFlagsDiscoveryEndpoint(mockGetFlags, { enableLogging: false });
      await endpoint({} as any);

      expect(mockLogInfo).not.toHaveBeenCalled();
    });

    test('should handle getFlags error and log it', async () => {
      const { createModernFlagsDiscoveryEndpoint } = await import('#/server/discovery');

      const error = new Error('Test error');
      const mockGetFlags = vi.fn().mockRejectedValue(error);

      mockCreateFlagsDiscoveryEndpoint.mockImplementation(fn => fn);

      const endpoint = createModernFlagsDiscoveryEndpoint(mockGetFlags);

      await expect(endpoint({} as any)).rejects.toThrow('Test error');
      expect(mockLogError).toHaveBeenCalledWith(error, {
        context: 'flags-discovery',
      });
    });

    test('should handle non-Error rejection', async () => {
      const { createModernFlagsDiscoveryEndpoint } = await import('#/server/discovery');

      const mockGetFlags = vi.fn().mockRejectedValue('string error');

      mockCreateFlagsDiscoveryEndpoint.mockImplementation(fn => fn);

      const endpoint = createModernFlagsDiscoveryEndpoint(mockGetFlags);

      await expect(endpoint({} as any)).rejects.toThrow('string error');
      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), { context: 'flags-discovery' });
    });
  });

  describe('getProviderDataWithMetadata', () => {
    test('should return base data without metadata when includeMetadata is false', async () => {
      const { getProviderDataWithMetadata } = await import('#/server/discovery');

      const mockFlags = { testFlag: true };
      const mockData = { definitions: [{ key: 'test' }] };
      mockGetProviderData.mockResolvedValue(mockData);

      const result = await getProviderDataWithMetadata(mockFlags, { includeMetadata: false });

      expect(result).toStrictEqual(mockData);
      expect(mockGetProviderData).toHaveBeenCalledWith(mockFlags);
    });

    test('should return enriched data with metadata when includeMetadata is true', async () => {
      const { getProviderDataWithMetadata } = await import('#/server/discovery');

      const mockFlags = { testFlag: true };
      const mockBaseData = {
        definitions: [{ key: 'test' }],
        metadata: { existing: 'value' },
      };
      mockGetProviderData.mockResolvedValue(mockBaseData);

      const result = await getProviderDataWithMetadata(mockFlags, { includeMetadata: true });

      expect(result).toMatchObject({
        definitions: [{ key: 'test' }],
        metadata: {
          existing: 'value',
          generatedAt: expect.any(String),
          sdkVersion: '4.0.0',
          totalFlags: 1,
          environment: 'test',
          deployment: 'test-deployment',
        },
      });
      expect(mockGetProviderData).toHaveBeenCalledWith(mockFlags);
    });

    test('should handle base data without existing metadata', async () => {
      const { getProviderDataWithMetadata } = await import('#/server/discovery');

      const mockFlags = { testFlag: true };
      const mockBaseData = { definitions: [] };
      mockGetProviderData.mockResolvedValue(mockBaseData);

      const result = await getProviderDataWithMetadata(mockFlags, { includeMetadata: true });

      expect((result as any).metadata).toMatchObject({
        generatedAt: expect.any(String),
        sdkVersion: '4.0.0',
        totalFlags: 0,
        environment: 'test',
        deployment: 'test-deployment',
      });
    });

    test('should enable analytics integration when specified', async () => {
      const { getProviderDataWithMetadata } = await import('#/server/discovery');

      // Mock window object for client-side check
      const originalWindow = globalThis.window;
      (globalThis as any).window = {};

      const mockFlags = { testFlag: true };
      const mockBaseData = { definitions: [] };
      mockGetProviderData.mockResolvedValue(mockBaseData);

      await getProviderDataWithMetadata(mockFlags, {
        includeMetadata: true,
        enableAnalytics: true,
      });

      expect(mockLogInfo).toHaveBeenCalledWith('Analytics integration enabled for flags discovery');

      // Restore original window
      (globalThis as any).window = originalWindow;
    });

    test('should handle getProviderData error', async () => {
      const { getProviderDataWithMetadata } = await import('#/server/discovery');

      const error = new Error('Provider error');
      mockGetProviderData.mockRejectedValue(error);

      await expect(getProviderDataWithMetadata({})).rejects.toThrow('Provider error');
      expect(mockLogError).toHaveBeenCalledWith(error, { context: 'provider-data-metadata' });
    });

    test('should handle non-Error rejection from getProviderData', async () => {
      const { getProviderDataWithMetadata } = await import('#/server/discovery');

      mockGetProviderData.mockRejectedValue('string error');

      await expect(getProviderDataWithMetadata({})).rejects.toThrow();
      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), {
        context: 'provider-data-metadata',
      });
    });
  });

  describe('mergeMultipleProviders', () => {
    test('should merge successful providers', async () => {
      const { mergeMultipleProviders } = await import('#/server/discovery');

      const provider1 = vi.fn().mockResolvedValue({
        definitions: [{ key: 'flag1' }],
        metadata: { source: 'provider1' },
      });
      const provider2 = vi.fn().mockResolvedValue({
        definitions: [{ key: 'flag2' }],
        metadata: { source: 'provider2' },
      });

      const result = await mergeMultipleProviders([provider1, provider2]);

      expect(result).toMatchObject({
        definitions: [{ key: 'flag1' }, { key: 'flag2' }],
        metadata: {
          source: 'provider1',
          providersUsed: 2,
          providersFailed: 0,
        },
      });
    });

    test('should handle partial provider failures', async () => {
      const { mergeMultipleProviders } = await import('#/server/discovery');

      const provider1 = vi.fn().mockResolvedValue({
        definitions: [{ key: 'flag1' }],
        metadata: { source: 'provider1' },
      });
      const provider2 = vi.fn().mockRejectedValue(new Error('Provider 2 failed'));

      const result = await mergeMultipleProviders([provider1, provider2]);

      expect(result).toMatchObject({
        definitions: [{ key: 'flag1' }],
        metadata: {
          source: 'provider1',
          providersUsed: 1,
          providersFailed: 1,
        },
      });
      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), { context: 'provider-merge' });
    });

    test('should handle providers without definitions', async () => {
      const { mergeMultipleProviders } = await import('#/server/discovery');

      const provider1 = vi.fn().mockResolvedValue({ metadata: { source: 'provider1' } });
      const provider2 = vi.fn().mockResolvedValue({ definitions: [{ key: 'flag2' }] });

      const result = await mergeMultipleProviders([provider1, provider2]);

      expect(result.definitions).toStrictEqual([{ key: 'flag2' }]);
    });

    test('should throw error when all providers fail', async () => {
      const { mergeMultipleProviders } = await import('#/server/discovery');

      const provider1 = vi.fn().mockRejectedValue(new Error('Failed 1'));
      const provider2 = vi.fn().mockRejectedValue(new Error('Failed 2'));

      await expect(mergeMultipleProviders([provider1, provider2])).rejects.toThrow(
        'All flag providers failed',
      );
      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), { context: 'provider-merge' });
    });

    test('should handle general error in merge process', async () => {
      const { mergeMultipleProviders } = await import('#/server/discovery');

      // Force an error by passing invalid providers
      await expect(mergeMultipleProviders(null as any)).rejects.toThrow();
      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), { context: 'provider-merge' });
    });
  });
});
