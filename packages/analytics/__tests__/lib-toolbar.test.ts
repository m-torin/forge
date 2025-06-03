import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockKeys = vi.fn();
const mockWithVercelToolbar = vi.fn();

vi.mock('../keys', () => ({
  keys: () => mockKeys(),
}));

vi.mock('@vercel/toolbar/plugins/next', () => ({
  withVercelToolbar: () => mockWithVercelToolbar,
}));

describe('withToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    (process.env as any).NODE_ENV = 'development';
    mockKeys.mockReturnValue({ FLAGS_SECRET: 'secret_123' });
    mockWithVercelToolbar.mockImplementation((config) => ({ ...config, toolbar: true }));
  });

  it('exports withToolbar function', async () => {
    const { withToolbar } = await import('../lib/toolbar');
    expect(withToolbar).toBeDefined();
    expect(typeof withToolbar).toBe('function');
  });

  it('applies toolbar when FLAGS_SECRET is set', async () => {
    const { withToolbar } = await import('../lib/toolbar');

    const baseConfig = {
      images: { domains: ['example.com'] },
      reactStrictMode: true,
    };

    const wrappedConfig = withToolbar(baseConfig);

    expect(mockWithVercelToolbar).toHaveBeenCalledWith(baseConfig);
    expect(wrappedConfig).toEqual({ ...baseConfig, toolbar: true });
  });

  it('returns original config when FLAGS_SECRET is not set', async () => {
    mockKeys.mockReturnValue({ FLAGS_SECRET: undefined });
    const { withToolbar } = await import('../lib/toolbar');

    const baseConfig = {
      images: { domains: ['example.com'] },
      reactStrictMode: true,
    };

    const _wrappedConfig = withToolbar(baseConfig);

    expect(_wrappedConfig).toBe(baseConfig);
    expect(mockWithVercelToolbar).not.toHaveBeenCalled();
  });

  it('handles Next.js config function', async () => {
    const { withToolbar } = await import('../lib/toolbar');

    const baseConfig = () => ({
      env: { API_URL: 'https://api.example.com' },
      reactStrictMode: true,
    });

    const _wrappedConfig = withToolbar(baseConfig);

    expect(mockWithVercelToolbar).toHaveBeenCalledWith(baseConfig);
  });

  it('handles error in keys function', async () => {
    mockKeys.mockImplementation(() => {
      throw new Error('Keys error');
    });

    const { withToolbar } = await import('../lib/toolbar');
    const baseConfig = { reactStrictMode: true };

    // Should throw when calling the function
    expect(() => withToolbar(baseConfig)).toThrow('Keys error');
  });

  it('handles empty string FLAGS_SECRET', async () => {
    mockKeys.mockReturnValue({ FLAGS_SECRET: '' });

    const { withToolbar } = await import('../lib/toolbar');
    const baseConfig = { experimental: { serverComponentsExternalPackages: [] } };

    const _wrappedConfig = withToolbar(baseConfig);
    expect(_wrappedConfig).toBe(baseConfig);
    expect(mockWithVercelToolbar).not.toHaveBeenCalled();
  });

  it('works with async Next.js config', async () => {
    const { withToolbar } = await import('../lib/toolbar');

    const baseConfig = async () => ({
      async headers() {
        return [];
      },
      reactStrictMode: true,
    });

    const _wrappedConfig = withToolbar(baseConfig);
    expect(mockWithVercelToolbar).toHaveBeenCalledWith(baseConfig);
  });

  it('chains multiple configuration enhancers', async () => {
    const { withToolbar } = await import('../lib/toolbar');

    const baseConfig = { reactStrictMode: true };

    // Mock another configuration wrapper
    const withOtherPlugin = (config: any) => ({
      ...config,
      otherPlugin: true,
    });

    const _wrappedConfig = withToolbar(withOtherPlugin(baseConfig));

    expect(mockWithVercelToolbar).toHaveBeenCalledWith({
      otherPlugin: true,
      reactStrictMode: true,
    });
  });
});
