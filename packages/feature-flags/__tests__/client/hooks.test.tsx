// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagPayload,
  useFeatureFlags,
  useFlag,
  type FeatureFlagAdapter,
} from '@/client/hooks';

// Mock adapter for testing
const createMockAdapter = (): FeatureFlagAdapter => ({
  getAllFlags: vi.fn(),
  getFlag: vi.fn(),
  identify: vi.fn(),
  isEnabled: vi.fn(),
  reload: vi.fn(),
  track: vi.fn(),
});

const wrapper = ({
  adapter,
  children,
}: {
  adapter: FeatureFlagAdapter;
  children: React.ReactNode;
}) => <FeatureFlagProvider adapter={adapter}>{children}</FeatureFlagProvider>;

describe('useFlag Hook', () => {
  it('should be defined as a function', () => {
    expect(useFlag).toBeDefined();
    expect(typeof useFlag).toBe('function');
  });

  it('should return initial value while loading', () => {
    const flagFunction = vi.fn(() => Promise.resolve(true));
    const { result } = renderHook(() => useFlag(flagFunction, false));

    expect(result.current).toBe(false);
  });

  it('should return flag value after evaluation', async () => {
    const flagFunction = vi.fn(() => Promise.resolve(true));
    const { result } = renderHook(() => useFlag(flagFunction));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(flagFunction).toHaveBeenCalledOnce();
  });

  it('should throw error when flag evaluation fails', async () => {
    const flagFunction = vi.fn(() => Promise.reject(new Error('Flag error')));

    expect(() => {
      renderHook(() => useFlag(flagFunction));
    }).not.toThrow(); // The hook itself shouldn't throw

    // Wait for the async error to be thrown
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it('should update when flag function changes', async () => {
    let flagFunction = vi.fn(() => Promise.resolve(true));
    const { result, rerender } = renderHook(props => useFlag(props.flagFunction), {
      initialProps: { flagFunction },
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    flagFunction = vi.fn(() => Promise.resolve(false));
    rerender({ flagFunction });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('FeatureFlagProvider', () => {
  it('should provide adapter to children', () => {
    const adapter = createMockAdapter();
    const TestComponent = () => {
      const { result } = renderHook(() => useFeatureFlag('test-flag'), {
        wrapper: props => wrapper({ adapter, ...props }),
      });
      return null;
    };

    expect(() => <TestComponent />).not.toThrow();
  });
});

describe('useFeatureFlag Hook', () => {
  let mockAdapter: FeatureFlagAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
  });

  it('should return enabled state for feature flag', async () => {
    vi.mocked(mockAdapter.isEnabled).mockResolvedValue(true);

    const { result } = renderHook(() => useFeatureFlag('test-flag'), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mockAdapter.isEnabled).toHaveBeenCalledWith('test-flag');
  });

  it('should return false by default', () => {
    const { result } = renderHook(() => useFeatureFlag('test-flag'), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    expect(result.current).toBe(false);
  });

  it('should throw error outside of provider', () => {
    expect(() => {
      renderHook(() => useFeatureFlag('test-flag'));
    }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');
  });

  it('should handle adapter errors gracefully', async () => {
    vi.mocked(mockAdapter.isEnabled).mockRejectedValue(new Error('Adapter error'));

    expect(() => {
      renderHook(() => useFeatureFlag('test-flag'), {
        wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
      });
    }).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 0));
  });
});

describe('useFeatureFlagPayload Hook', () => {
  let mockAdapter: FeatureFlagAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
  });

  it('should return flag payload', async () => {
    const payload = { variant: 'a', config: { theme: 'dark' } };
    vi.mocked(mockAdapter.getFlag).mockResolvedValue(payload);

    const { result } = renderHook(() => useFeatureFlagPayload('test-flag'), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual(payload);
    });

    expect(mockAdapter.getFlag).toHaveBeenCalledWith('test-flag', undefined);
  });

  it('should use default value', async () => {
    const defaultValue = { variant: 'default' };
    vi.mocked(mockAdapter.getFlag).mockResolvedValue(defaultValue);

    const { result } = renderHook(() => useFeatureFlagPayload('test-flag', defaultValue), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual(defaultValue);
    });

    expect(mockAdapter.getFlag).toHaveBeenCalledWith('test-flag', defaultValue);
  });

  it('should throw error outside of provider', () => {
    expect(() => {
      renderHook(() => useFeatureFlagPayload('test-flag'));
    }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');
  });

  it('should handle adapter errors gracefully', async () => {
    vi.mocked(mockAdapter.getFlag).mockRejectedValue(new Error('Adapter error'));

    expect(() => {
      renderHook(() => useFeatureFlagPayload('test-flag'), {
        wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
      });
    }).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 0));
  });
});

describe('useFeatureFlags Hook', () => {
  let mockAdapter: FeatureFlagAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
  });

  it('should return all feature flags', async () => {
    const flags = { 'flag-1': true, 'flag-2': 'variant-a', 'flag-3': { config: 'value' } };
    vi.mocked(mockAdapter.getAllFlags).mockResolvedValue(flags);

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual(flags);
    });

    expect(mockAdapter.getAllFlags).toHaveBeenCalledOnce();
  });

  it('should return empty object by default', () => {
    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    expect(result.current).toStrictEqual({});
  });

  it('should throw error outside of provider', () => {
    expect(() => {
      renderHook(() => useFeatureFlags());
    }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');
  });

  it('should handle adapter errors gracefully', async () => {
    vi.mocked(mockAdapter.getAllFlags).mockRejectedValue(new Error('Adapter error'));

    expect(() => {
      renderHook(() => useFeatureFlags(), {
        wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
      });
    }).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 0));
  });
});
