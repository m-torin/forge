import {
  createEdgeConfigAdapter,
  edgeConfigAdapter,
  getEdgeConfigProviderData,
} from '#/adapters/edge-config';
import { beforeEach, describe, expect, vi } from 'vitest';
import { featureFlagTestData } from '../test-data-generators';
import {
  assertionHelpers,
  createDecideParams,
  createMockEdgeConfigClient,
  createMockEnvironment,
  createMockObservability,
  createTestWrapper,
} from '../test-utils';

vi.mock('@vercel/edge-config', () => ({
  createClient: vi.fn(),
}));

vi.mock('@repo/observability', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Create test wrapper with mocks
const testWrapper = createTestWrapper({
  mockClient: createMockEdgeConfigClient(),
  mockEnvironment: createMockEnvironment(),
  mockObservability: createMockObservability(),
});

describe('createEdgeConfigAdapter', () => {
  beforeEach(async () => {
    testWrapper.cleanup();
    const { createClient } = vi.mocked(await import('@vercel/edge-config'));
    createClient.mockReturnValue(testWrapper.mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Environment variables automatically restored due to unstubEnvs: true
  });

  // Note: Factory-generated tests have timing issues with mock setup.
  // The error throwing functionality is tested by the manual test below:
  // "should throw error when Edge Config client throws"

  test('should create adapter with connection string from options', () => {
    expect.hasAssertions();
    const adapter = createEdgeConfigAdapter({
      connectionString: 'custom-connection-string',
    });

    assertionHelpers.assertAdapterStructure(adapter);
  });

  test('should create adapter with custom Edge Config client', () => {
    expect.hasAssertions();
    const customClient = createMockEdgeConfigClient({
      connection: {
        baseUrl: 'https://edge-config.vercel.com',
        id: 'custom',
        token: 'custom-token',
        version: '1',
        type: 'external' as const,
      },
    });

    const adapter = createEdgeConfigAdapter({
      connectionString: customClient as any,
    });

    assertionHelpers.assertAdapterStructure(adapter);
  });

  test('should create no-op adapter when no connection string configured', () => {
    // Use modern vi.stubEnv approach to temporarily remove EDGE_CONFIG
    vi.stubEnv('EDGE_CONFIG', '');

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    expect(flagsAdapter.decide).toBeInstanceOf(Function);
    expect(flagsAdapter.config?.reportValue).toBeTruthy();
    expect(typeof flagsAdapter.origin === 'object' && flagsAdapter.origin?.provider).toBe(
      'edge-config',
    );
    // Environment variables are automatically restored due to unstubEnvs: true
  });

  test('should return flag value from Edge Config', async () => {
    expect.hasAssertions();
    testWrapper.mockClient.get.mockResolvedValueOnce(
      featureFlagTestData.edgeConfig.responses.valid,
    );

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide(createDecideParams({ key: 'boolean-flag' }));
    assertionHelpers.assertFlagDecision(result, true);

    testWrapper.mockClient.get.mockResolvedValueOnce(
      featureFlagTestData.edgeConfig.responses.valid,
    );

    const variantResult = await flagsAdapter.decide(createDecideParams({ key: 'variant-flag' }));
    assertionHelpers.assertFlagDecision(variantResult, 'variant-a');
  });

  test('should return undefined for non-existent flag', async () => {
    expect.hasAssertions();
    testWrapper.mockClient.get.mockResolvedValueOnce({
      'existing-flag': true,
    });

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide(createDecideParams({ key: 'non-existent-flag' }));
    assertionHelpers.assertFlagDecision(result, undefined);
  });

  test('should return undefined when Edge Config returns null', async () => {
    expect.hasAssertions();
    testWrapper.mockClient.get.mockResolvedValueOnce(null);

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide(createDecideParams({ key: 'test-flag' }));
    assertionHelpers.assertFlagDecision(result, undefined);
  });

  test('should return undefined when Edge Config returns non-object', async () => {
    expect.hasAssertions();
    testWrapper.mockClient.get.mockResolvedValueOnce('not-an-object');

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    const result = await flagsAdapter.decide(createDecideParams({ key: 'test-flag' }));
    assertionHelpers.assertFlagDecision(result, undefined);
  });

  test('should throw error when Edge Config client throws', async () => {
    expect.hasAssertions();
    const error = new Error('Edge Config error');
    testWrapper.mockClient.get.mockRejectedValueOnce(error);

    const adapter = createEdgeConfigAdapter();
    const flagsAdapter = adapter();

    await assertionHelpers.assertErrorThrown(
      () => flagsAdapter.decide(createDecideParams({ key: 'test-flag' })),
      'Edge Config error',
    );
  });

  test('should use custom edgeConfigItemKey', async () => {
    expect.hasAssertions();
    testWrapper.mockClient.get.mockResolvedValueOnce(
      featureFlagTestData.edgeConfig.responses.valid,
    );

    const adapter = createEdgeConfigAdapter({
      options: { edgeConfigItemKey: 'custom-flags' },
    });
    const flagsAdapter = adapter();

    await flagsAdapter.decide(createDecideParams({ key: 'test-flag' }));

    assertionHelpers.assertMockCalled(testWrapper.mockClient.get, 1, ['custom-flags']);
  });

  test('should include teamSlug in origin when provided', () => {
    const adapter = createEdgeConfigAdapter({
      options: { teamSlug: 'my-team' },
    });
    const flagsAdapter = adapter();

    expect(typeof flagsAdapter.origin === 'object' && (flagsAdapter.origin as any)?.teamSlug).toBe(
      'my-team',
    );
  });

  test('should extract edgeConfigId from connection string', () => {
    const adapter = createEdgeConfigAdapter({
      connectionString: 'https://edge-config.vercel.com/ecfg_abc123',
    });
    const flagsAdapter = adapter();

    expect(
      typeof flagsAdapter.origin === 'object' && (flagsAdapter.origin as any)?.edgeConfigId,
    ).toBe('ecfg_abc123');
  });

  test('should use custom-client for custom client', () => {
    const customClient = createMockEdgeConfigClient({
      connection: {
        baseUrl: 'https://edge-config.vercel.com',
        id: 'custom',
        token: 'custom-token',
        version: '1',
        type: 'external' as const,
      },
    });

    const adapter = createEdgeConfigAdapter({
      connectionString: customClient as any,
    });
    const flagsAdapter = adapter();

    expect(
      typeof flagsAdapter.origin === 'object' && (flagsAdapter.origin as any)?.edgeConfigId,
    ).toBe('custom-client');
  });
});

describe('edgeConfigAdapter', () => {
  test('should be defined as default adapter', () => {
    expect(edgeConfigAdapter).toBeInstanceOf(Function);
  });
});

describe('getEdgeConfigProviderData', () => {
  beforeEach(async () => {
    testWrapper.cleanup();
    const { createClient } = vi.mocked(await import('@vercel/edge-config'));
    createClient.mockReturnValue(testWrapper.mockClient);
  });

  // Note: getEdgeConfigProviderData is not an adapter factory, so we test it separately below

  test('should return empty flags when no connection string', async () => {
    // Use modern vi.stubEnv approach to temporarily remove EDGE_CONFIG
    vi.stubEnv('EDGE_CONFIG', '');

    // Clear the mock so it doesn't return any data
    testWrapper.mockClient.get.mockResolvedValueOnce(null);

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
    expect(result).toStrictEqual({
      provider: 'edge-config',
      flags: [],
    });
    // Environment variables are automatically restored due to unstubEnvs: true
  });

  test('should return empty flags when Edge Config returns null', async () => {
    testWrapper.mockClient.get.mockResolvedValueOnce(null);

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
    expect(result).toStrictEqual({
      provider: 'edge-config',
      flags: [],
    });
  });

  test('should transform boolean flags correctly', async () => {
    testWrapper.mockClient.get.mockResolvedValueOnce({
      'boolean-flag': true,
    });

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
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
    testWrapper.mockClient.get.mockResolvedValueOnce({
      'variant-flag': 'variant-a',
      'control-flag': 'control',
    });

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
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
    testWrapper.mockClient.get.mockResolvedValueOnce({
      'string-flag': 'some-value',
    });

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
    expect(result.flags).toStrictEqual([
      {
        key: 'string-flag',
        options: [{ label: 'some-value', value: 'some-value' }],
      },
    ]);
  });

  test('should transform object flags correctly', async () => {
    const objectValue = { key: 'value' };
    testWrapper.mockClient.get.mockResolvedValueOnce({
      'object-flag': objectValue,
    });

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
    expect(result.flags).toStrictEqual([
      {
        key: 'object-flag',
        options: [{ label: 'Custom Config', value: objectValue }],
      },
    ]);
  });

  test('should transform number flags correctly', async () => {
    testWrapper.mockClient.get.mockResolvedValueOnce({
      'number-flag': 42,
    });

    const result = await getEdgeConfigProviderData();

    assertionHelpers.assertProviderDataStructure(result);
    expect(result.flags).toStrictEqual([
      {
        key: 'number-flag',
        options: [{ label: '42', value: 42 }],
      },
    ]);
  });

  test('should throw error when Edge Config client throws', async () => {
    expect.hasAssertions();
    const error = new Error('Edge Config error');
    testWrapper.mockClient.get.mockRejectedValueOnce(error);

    await assertionHelpers.assertErrorThrown(
      () => getEdgeConfigProviderData(),
      'Edge Config error',
    );
  });

  test('should use custom edgeConfigItemKey', async () => {
    expect.hasAssertions();
    testWrapper.mockClient.get.mockResolvedValueOnce({});

    await getEdgeConfigProviderData({
      options: { edgeConfigItemKey: 'custom-flags' },
    });

    assertionHelpers.assertMockCalled(testWrapper.mockClient.get, 1, ['custom-flags']);
  });
});
