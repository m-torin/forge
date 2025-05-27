import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create a typed mock function that includes vi.Mock methods
interface MockFlag {
  (): void;
  description: string;
  key: string;
  mockRejectedValue: (err: Error) => void;
  mockResolvedValue: (value: any) => void;
  options: { value: boolean; label: string }[];
  origin: string;
}

// Cast with unknown first to avoid type errors
const mockFlag = vi.fn() as unknown as MockFlag;

vi.mock('../lib/create-flag', () => ({
  createFlag: (flagName: string) => {
    mockFlag.key = flagName;
    mockFlag.origin = 'https://app.posthog.com/my/flags';
    mockFlag.description = 'Show beta features to users';
    mockFlag.options = [
      { label: 'Off', value: false },
      { label: 'On', value: true },
    ];
    return mockFlag;
  },
}));

describe('feature flags index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('exports showBetaFeature flag', async () => {
    const flags = await import('../index');
    expect(flags.showBetaFeature).toBeDefined();
    expect(typeof flags.showBetaFeature).toBe('function');
  });

  it('showBetaFeature has correct metadata', async () => {
    const { showBetaFeature } = await import('../index');

    expect(showBetaFeature.key).toBe('showBetaFeature');
    expect(showBetaFeature.origin).toBe('https://app.posthog.com/my/flags');
    expect(showBetaFeature.description).toBe('Show beta features to users');
    expect(showBetaFeature.options).toEqual([
      { label: 'Off', value: false },
      { label: 'On', value: true },
    ]);
  });

  it('showBetaFeature calls the flag function', async () => {
    mockFlag.mockResolvedValue(true);
    const { showBetaFeature } = await import('../index');

    const result = await showBetaFeature();

    expect(mockFlag).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('handles flag returning false', async () => {
    mockFlag.mockResolvedValue(false);
    const { showBetaFeature } = await import('../index');

    const result = await showBetaFeature();

    expect(result).toBe(false);
  });

  it('propagates errors from flag function', async () => {
    const error = new Error('Flag evaluation failed');
    mockFlag.mockRejectedValue(error);
    const { showBetaFeature } = await import('../index');

    await expect(showBetaFeature()).rejects.toThrow('Flag evaluation failed');
  });

  it('exports only expected flags', async () => {
    const flags = await import('../index');
    const exportedKeys = Object.keys(flags);

    expect(exportedKeys).toEqual(['showBetaFeature']);
  });
});
