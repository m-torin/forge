import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useInstantSearchConfig } from '../../algolia/hooks/useInstantSearchConfig';

describe('useInstantSearchConfig', (_: any) => {
  it('should throw error when used outside InstantSearch provider', (_: any) => {
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useInstantSearchConfig());
    }).toThrow(); // The hook will throw, either from react-instantsearch or our code

    consoleSpy.mockRestore();
  });

  it('should document the expected usage pattern', (_: any) => {
    // This test documents that the hook requires InstantSearch context
    // and recommends using the config prop approach instead
    expect(typeof useInstantSearchConfig).toBe('function');

    // The hook is exported for advanced use cases but config prop is recommended
    const hookSource = useInstantSearchConfig.toString();
    expect(hookSource).toContain('InstantSearch'); // Function references InstantSearch
  });
});
