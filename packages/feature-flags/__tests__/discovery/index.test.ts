import { createFlagsDiscoveryEndpoint } from '@/discovery';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
}));

// Mock Response.json
global.Response = {
  json: vi.fn(data => ({ json: () => Promise.resolve(data), data })),
} as any;

describe('createFlagsDiscoveryEndpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create a discovery endpoint function', () => {
    const getProviderData = vi.fn();
    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);

    expect(endpoint).toBeInstanceOf(Function);
    expect(endpoint.name).toBe('GET');
  });

  test('should return provider data when successful', async () => {
    const mockData = {
      provider: 'test-provider',
      flags: [{ key: 'test-flag', options: [{ label: 'Enabled', value: true }] }],
    };

    const getProviderData = vi.fn().mockResolvedValue(mockData);
    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);

    const result = await endpoint();

    expect(getProviderData).toHaveBeenCalledOnce();
    expect(Response.json).toHaveBeenCalledWith(mockData);
    expect(result).toStrictEqual({ json: expect.any(Function), data: mockData });
  });

  test('should return empty flags when provider throws error', async () => {
    const error = new Error('Provider error');
    const getProviderData = vi.fn().mockRejectedValue(error);
    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);

    const result = await endpoint();

    expect(getProviderData).toHaveBeenCalledOnce();
    expect(Response.json).toHaveBeenCalledWith({
      provider: 'fallback',
      flags: [],
    });
    expect(result).toStrictEqual({
      json: expect.any(Function),
      data: {
        provider: 'fallback',
        flags: [],
      },
    });
  });

  test('should handle non-Error objects gracefully', async () => {
    const getProviderData = vi.fn().mockRejectedValue('string error');
    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);

    const result = await endpoint();

    expect(getProviderData).toHaveBeenCalledOnce();
    expect(Response.json).toHaveBeenCalledWith({
      provider: 'fallback',
      flags: [],
    });
  });

  test('should log errors when provider fails', async () => {
    const { logError } = vi.mocked(await import('@repo/observability/server/next'));
    const error = new Error('Provider error');
    const getProviderData = vi.fn().mockRejectedValue(error);
    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);

    await endpoint();

    expect(logError).toHaveBeenCalledWith('Error in flags discovery endpoint', error, {
      endpoint: 'discovery',
    });
  });

  test('should work with async provider data', async () => {
    const mockData = {
      provider: 'async-provider',
      flags: [{ key: 'async-flag', options: [{ label: 'Test', value: 'test' }] }],
    };

    const getProviderData = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return mockData;
    });

    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);
    const result = await endpoint();

    expect(getProviderData).toHaveBeenCalledOnce();
    expect(Response.json).toHaveBeenCalledWith(mockData);
    expect(result).toStrictEqual({ json: expect.any(Function), data: mockData });
  });

  test('should handle empty flags array', async () => {
    const mockData = {
      provider: 'empty-provider',
      flags: [],
    };

    const getProviderData = vi.fn().mockResolvedValue(mockData);
    const endpoint = createFlagsDiscoveryEndpoint(getProviderData);

    const result = await endpoint();

    expect(Response.json).toHaveBeenCalledWith(mockData);
    expect(result).toStrictEqual({ json: expect.any(Function), data: mockData });
  });
});
