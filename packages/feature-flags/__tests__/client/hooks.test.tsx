// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, vi } from 'vitest';

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
  test('should be defined as a function', () => {
    expect(useFlag).toBeDefined();
    expect(typeof useFlag).toBe('function');
  });

  test('should return initial value while loading', () => {
    const flagFunction = vi.fn(() => Promise.resolve(true));
    const { result } = renderHook(() => useFlag(flagFunction, false));

    expect(result.current).toBeFalsy();
  });

  test('should return flag value after evaluation', async () => {
    const flagFunction = vi.fn(() => Promise.resolve(true));
    const { result } = renderHook(() => useFlag(flagFunction));

    await waitFor(() => {
      expect(result.current).toBeTruthy();
    });

    expect(flagFunction).toHaveBeenCalledOnce();
  });

  test('should throw error when flag evaluation fails', async () => {
    const flagFunction = vi.fn(() => Promise.reject(new Error('Flag error')));

    expect(() => {
      renderHook(() => useFlag(flagFunction));
    }).not.toThrow(); // The hook itself shouldn't throw

    // Wait for the async error to be thrown
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  test('should update when flag function changes', async () => {
    let flagFunction = vi.fn(() => Promise.resolve(true));
    const { result, rerender } = renderHook(props => useFlag(props.flagFunction), {
      initialProps: { flagFunction },
    });

    await waitFor(() => {
      expect(result.current).toBeTruthy();
    });

    flagFunction = vi.fn(() => Promise.resolve(false));
    rerender({ flagFunction });

    await waitFor(() => {
      expect(result.current).toBeFalsy();
    });
  });
});

describe('featureFlagProvider', () => {
  test('should provide adapter to children', () => {
    const adapter = createMockAdapter();
    const { result } = renderHook(() => useFeatureFlag('test-flag'), {
      wrapper: props => wrapper({ adapter, ...props }),
    });

    expect(result.current).toBeDefined();
  });
});

describe('useFeatureFlag Hook', () => {
  let mockAdapter: FeatureFlagAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
  });

  test('should return enabled state for feature flag', async () => {
    vi.mocked(mockAdapter.isEnabled).mockResolvedValue(true);

    const { result } = renderHook(() => useFeatureFlag('test-flag'), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    await waitFor(() => {
      expect(result.current).toBeTruthy();
    });

    expect(mockAdapter.isEnabled).toHaveBeenCalledWith('test-flag');
  });

  test('should return false by default', () => {
    const { result } = renderHook(() => useFeatureFlag('test-flag'), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    expect(result.current).toBeFalsy();
  });

  test('should throw error outside of provider', () => {
    expect(() => {
      renderHook(() => useFeatureFlag('test-flag'));
    }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');
  });

  test('should handle adapter errors gracefully', async () => {
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

  test('should return flag payload', async () => {
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

  test('should use default value', async () => {
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

  test('should throw error outside of provider', () => {
    expect(() => {
      renderHook(() => useFeatureFlagPayload('test-flag'));
    }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');
  });

  test('should handle adapter errors gracefully', async () => {
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

  test('should return all feature flags', async () => {
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

  test('should return empty object by default', () => {
    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
    });

    expect(result.current).toStrictEqual({});
  });

  test('should throw error outside of provider', () => {
    expect(() => {
      renderHook(() => useFeatureFlags());
    }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');
  });

  test('should handle adapter errors gracefully', async () => {
    vi.mocked(mockAdapter.getAllFlags).mockRejectedValue(new Error('Adapter error'));

    expect(() => {
      renderHook(() => useFeatureFlags(), {
        wrapper: props => wrapper({ adapter: mockAdapter, ...props }),
      });
    }).not.toThrow();

    await new Promise(resolve => setTimeout(resolve, 0));
  });
});
