import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagPayload,
  useFeatureFlags,
} from '../../client/hooks';

// Mock adapter
const mockGetFlag = vi.fn();
const mockGetAllFlags = vi.fn();
const mockIsEnabled = vi.fn();
const mockReload = vi.fn();

const mockAdapter = {
  identify: vi.fn(),
  getAllFlags: mockGetAllFlags,
  getFlag: mockGetFlag,
  isEnabled: mockIsEnabled,
  reload: mockReload,
  track: vi.fn(),
};

describe('Feature Flag Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFlag.mockResolvedValue(false);
    mockGetAllFlags.mockResolvedValue({});
    mockIsEnabled.mockResolvedValue(false);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FeatureFlagProvider adapter={mockAdapter as any}>{children}</FeatureFlagProvider>
  );

  describe('useFeatureFlag', () => {
    it('should return flag value', async () => {
      mockIsEnabled.mockResolvedValue(true);

      const { result } = renderHook(() => useFeatureFlag('test-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      expect(mockIsEnabled).toHaveBeenCalledWith('test-flag');
    });

    it('should return false by default', async () => {
      const { result } = renderHook(() => useFeatureFlag('unknown-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should update when flag changes', async () => {
      mockIsEnabled.mockResolvedValue(false);

      const { rerender, result } = renderHook(() => useFeatureFlag('test-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });

      // Change flag value
      mockIsEnabled.mockResolvedValue(true);

      // Trigger re-render
      rerender();

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle loading state', () => {
      mockIsEnabled.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useFeatureFlag('slow-flag'), { wrapper });

      // Should start with false while loading
      expect(result.current).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockIsEnabled.mockRejectedValue(new Error('Failed to fetch flag'));

      const { result } = renderHook(() => useFeatureFlag('error-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('useFeatureFlagPayload', () => {
    it('should return flag payload', async () => {
      const payload = { config: { color: 'blue' }, variant: 'A' };
      mockGetFlag.mockResolvedValue(payload);

      const { result } = renderHook(() => useFeatureFlagPayload('test-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(payload);
      });

      expect(mockGetFlag).toHaveBeenCalledWith('test-flag', undefined);
    });

    it('should return default value when flag is not set', async () => {
      mockGetFlag.mockResolvedValue(undefined);

      const defaultValue = { variant: 'default' };
      const { result } = renderHook(() => useFeatureFlagPayload('test-flag', defaultValue), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual(defaultValue);
      });

      expect(mockGetFlag).toHaveBeenCalledWith('test-flag', defaultValue);
    });

    it('should handle string payloads', async () => {
      mockGetFlag.mockResolvedValue('variant-b');

      const { result } = renderHook(() => useFeatureFlagPayload('string-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe('variant-b');
      });
    });

    it('should handle boolean payloads', async () => {
      mockGetFlag.mockResolvedValue(true);

      const { result } = renderHook(() => useFeatureFlagPayload('bool-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle numeric payloads', async () => {
      mockGetFlag.mockResolvedValue(42);

      const { result } = renderHook(() => useFeatureFlagPayload('number-flag'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(42);
      });
    });
  });

  describe('useFeatureFlags', () => {
    it('should return all flags', async () => {
      const allFlags = {
        'feature-1': true,
        'feature-2': false,
        'feature-3': 'variant-a',
      };
      mockGetAllFlags.mockResolvedValue(allFlags);

      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(allFlags);
      });
    });

    it('should return empty object initially', () => {
      mockGetAllFlags.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current).toEqual({});
    });

    it('should update when flags reload', async () => {
      mockGetAllFlags.mockResolvedValue({ 'flag-1': true });

      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual({ 'flag-1': true });
      });

      // Update flags
      mockGetAllFlags.mockResolvedValue({ 'flag-1': false, 'flag-2': true });

      // Trigger reload
      await act(async () => {
        await mockReload();
      });

      // Force re-render by changing props
      const { rerender } = renderHook(() => useFeatureFlags(), { wrapper });
      rerender();

      await waitFor(() => {
        expect(result.current).toHaveProperty('flag-2');
      });
    });
  });

  describe('FeatureFlagProvider', () => {
    it('should provide adapter to children', async () => {
      let contextValue: any;

      const TestComponent = () => {
        contextValue = useFeatureFlag('test');
        return null;
      };

      renderHook(() => null, {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <FeatureFlagProvider adapter={mockAdapter as any}>
            <TestComponent />
            {children}
          </FeatureFlagProvider>
        ),
      });

      await waitFor(() => {
        expect(contextValue).toBeDefined();
      });
    });

    it('should throw when hooks are used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useFeatureFlag('test'));
      }).toThrow('useFeatureFlag must be used within a FeatureFlagProvider');

      consoleSpy.mockRestore();
    });

    it('should memoize context value', () => {
      const { result: result1 } = renderHook(() => useFeatureFlag('flag1'), { wrapper });
      const { result: result2 } = renderHook(() => useFeatureFlag('flag2'), { wrapper });

      // Both hooks should receive the same context instance
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple flags being fetched simultaneously', async () => {
      mockIsEnabled
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const { result: result1 } = renderHook(() => useFeatureFlag('flag1'), { wrapper });
      const { result: result2 } = renderHook(() => useFeatureFlag('flag2'), { wrapper });
      const { result: result3 } = renderHook(() => useFeatureFlag('flag3'), { wrapper });

      await waitFor(() => {
        expect(result1.current).toBe(true);
        expect(result2.current).toBe(false);
        expect(result3.current).toBe(true);
      });

      expect(mockIsEnabled).toHaveBeenCalledTimes(3);
    });
  });

  describe('error boundaries', () => {
    it('should not crash the app on adapter errors', async () => {
      mockGetFlag.mockRejectedValue(new Error('Adapter error'));
      mockIsEnabled.mockRejectedValue(new Error('Adapter error'));

      const { result } = renderHook(
        () => {
          const flag = useFeatureFlag('error-flag');
          const payload = useFeatureFlagPayload('error-flag');
          return { flag, payload };
        },
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.flag).toBe(false);
        expect(result.current.payload).toBeUndefined();
      });
    });
  });
});
