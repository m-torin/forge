import {
  createEdgeConfigAdapter,
  edgeConfigAdapter,
  getEdgeConfigProviderData,
} from '@/adapters/edge-config';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock Vercel Edge Config
const mockEdgeConfigClient = {
  get: vi.fn(),
};

vi.mock('@vercel/edge-config', () => ({
  createClient: vi.fn(),
}));

// Mock observability
vi.mock('@repo/observability/server/edge', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock environment
vi.mock('../../env', () => ({
  safeEnv: vi.fn(() => ({
    EDGE_CONFIG: 'https://edge-config.vercel.com/test',
    NODE_ENV: 'test',
    NEXT_PUBLIC_NODE_ENV: 'test',
  })),
}));

describe('createEdgeConfigAdapter', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createClient } = vi.mocked(await import('@vercel/edge-config'));
    createClient.mockReturnValue(mockEdgeConfigClient);
  });

  test('should create adapter with connection string from options', () => {
    const adapter = createEdgeConfigAdapter({
      connectionString: 'custom-connection-string',
    });

    expect(adapter).toBeInstanceOf(Function);
  });

  test('should create adapter with custom Edge Config client', () => {
    const customClient = { get: vi.fn() };
    const adapter = createEdgeConfigAdapter({
      connectionString: customClient,
    });

    expect(adapter).toBeInstanceOf(Function);
  });

  test('should create no-op adapter when no connection string configured', async () => {
    const { safeEnv } = vi.mocked(await import('../../env'));
    safeEnv.mockReturnValueOnce({
      EDGE_CONFIG: undefined,
    } as any);

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    expect(flagsAdapter.decide).toBeInstanceOf(Function);
    expect(flagsAdapter.config.reportValue).toBeTruthy();
    expect(flagsAdapter.origin.provider).toBe('edge-config');
  });

  test('should return flag value from Edge Config', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'test-flag': true,
      'variant-flag': 'variant-a',
    });

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide({ key: 'test-flag' });
    expect(result).toBeTruthy();

    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'test-flag': true,
      'variant-flag': 'variant-a',
    });

    const variantResult = await flagsAdapter.decide({ key: 'variant-flag' });
    expect(variantResult).toBe('variant-a');
  });

  test('should return undefined for non-existent flag', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'existing-flag': true,
    });

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide({ key: 'non-existent-flag' });
    expect(result).toBeUndefined();
  });

  test('should return undefined when Edge Config returns null', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce(null);

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide({ key: 'test-flag' });
    expect(result).toBeUndefined();
  });

  test('should return undefined when Edge Config returns non-object', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce('not-an-object');

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide({ key: 'test-flag' });
    expect(result).toBeUndefined();
  });

  test('should throw error when Edge Config client throws', async () => {
    const error = new Error('Edge Config error');
    mockEdgeConfigClient.get.mockRejectedValueOnce(error);

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    await expect(flagsAdapter.decide({ key: 'test-flag' })).rejects.toThrow('Edge Config error');
  });

  test('should use custom edgeConfigItemKey', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'test-flag': true,
    });

    const adapter = createEdgeConfigAdapter({
      options: { edgeConfigItemKey: 'custom-flags' },
    });
    const flagsAdapter = adapter();

    await flagsAdapter.decide({ key: 'test-flag' });

    expect(mockEdgeConfigClient.get).toHaveBeenCalledWith('custom-flags');
  });

  test('should include teamSlug in origin when provided', () => {
    const adapter = createEdgeConfigAdapter({
      options: { teamSlug: 'my-team' },
    });
    const flagsAdapter = adapter();

    expect(flagsAdapter.origin.teamSlug).toBe('my-team');
  });

  test('should extract edgeConfigId from connection string', () => {
    const adapter = createEdgeConfigAdapter({
      connectionString: 'https://edge-config.vercel.com/ecfg_abc123',
    });
    const flagsAdapter = adapter();

    expect(flagsAdapter.origin.edgeConfigId).toBe('ecfg_abc123');
  });

  test('should use custom-client for custom client', () => {
    const customClient = { get: vi.fn() };
    const adapter = createEdgeConfigAdapter({
      connectionString: customClient,
    });
    const flagsAdapter = adapter();

    expect(flagsAdapter.origin.edgeConfigId).toBe('custom-client');
  });
});

describe('edgeConfigAdapter', () => {
  test('should be defined as default adapter', () => {
    expect(edgeConfigAdapter).toBeInstanceOf(Function);
  });
});

describe('getEdgeConfigProviderData', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createClient } = vi.mocked(await import('@vercel/edge-config'));
    createClient.mockReturnValue(mockEdgeConfigClient);
  });

  test('should return empty flags when no connection string', async () => {
    const { safeEnv } = vi.mocked(await import('../../env'));
    safeEnv.mockReturnValueOnce({
      EDGE_CONFIG: undefined,
    } as any);

    const result = await getEdgeConfigProviderData();

    expect(result).toStrictEqual({
      provider: 'edge-config',
      flags: [],
    });
  });

  test('should return empty flags when Edge Config returns null', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce(null);

    const result = await getEdgeConfigProviderData();

    expect(result).toStrictEqual({
      provider: 'edge-config',
      flags: [],
    });
  });

  test('should transform boolean flags correctly', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'boolean-flag': true,
    });

    const result = await getEdgeConfigProviderData();

    expect(result.flags).toStrictEqual([
      {
        key: 'boolean-flag',
        options: [
          { label: 'Enabled', value: true },
          { label: 'Disabled', value: false },
        ],
      },
    ]);
  });

  test('should transform string variant flags correctly', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'variant-flag': 'variant-a',
      'control-flag': 'control',
    });

    const result = await getEdgeConfigProviderData();

    expect(result.flags).toStrictEqual([
      {
        key: 'variant-flag',
        options: [
          { label: 'Control', value: 'control' },
          { label: 'Variant A', value: 'variant-a' },
          { label: 'Variant B', value: 'variant-b' },
        ],
      },
      {
        key: 'control-flag',
        options: [
          { label: 'Control', value: 'control' },
          { label: 'Variant A', value: 'variant-a' },
          { label: 'Variant B', value: 'variant-b' },
        ],
      },
    ]);
  });

  test('should transform regular string flags correctly', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'string-flag': 'some-value',
    });

    const result = await getEdgeConfigProviderData();

    expect(result.flags).toStrictEqual([
      {
        key: 'string-flag',
        options: [{ label: 'some-value', value: 'some-value' }],
      },
    ]);
  });

  test('should transform object flags correctly', async () => {
    const objectValue = { key: 'value' };
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'object-flag': objectValue,
    });

    const result = await getEdgeConfigProviderData();

    expect(result.flags).toStrictEqual([
      {
        key: 'object-flag',
        options: [{ label: 'Custom Config', value: objectValue }],
      },
    ]);
  });

  test('should transform number flags correctly', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({
      'number-flag': 42,
    });

    const result = await getEdgeConfigProviderData();

    expect(result.flags).toStrictEqual([
      {
        key: 'number-flag',
        options: [{ label: '42', value: 42 }],
      },
    ]);
  });

  test('should throw error when Edge Config client throws', async () => {
    const error = new Error('Edge Config error');
    mockEdgeConfigClient.get.mockRejectedValueOnce(error);

    await expect(getEdgeConfigProviderData()).rejects.toThrow('Edge Config error');
  });

  test('should use custom edgeConfigItemKey', async () => {
    mockEdgeConfigClient.get.mockResolvedValueOnce({});

    await getEdgeConfigProviderData({
      options: { edgeConfigItemKey: 'custom-flags' },
    });

    expect(mockEdgeConfigClient.get).toHaveBeenCalledWith('custom-flags');
  });
});
