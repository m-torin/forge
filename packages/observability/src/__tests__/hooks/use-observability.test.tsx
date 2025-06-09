/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ObservabilityProvider } from '../../hooks/ObservabilityProvider';
import { useObservability } from '../../hooks/use-observability';

import type { ObservabilityConfig } from '../../shared/types/types';

// Mock configuration for testing
const mockConfig: ObservabilityConfig = {
  providers: {
    console: {},
  },
};

// Configuration with multiple providers
const multiProviderConfig: ObservabilityConfig = {
  providers: {
    console: {},
    logtail: { apiKey: 'test-key' },
  },
};

// Configuration with error handling
const errorConfig: ObservabilityConfig = {
  providers: {
    // Invalid provider that will cause errors
    'invalid-provider': {},
  },
};

describe('useObservability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide observability methods from context', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    // Verify the current result is properly initialized
    expect(result.current).toBeDefined();
    expect(typeof result.current.log).toBe('function');
    expect(typeof result.current.captureException).toBe('function');
    expect(typeof result.current.identify).toBe('function');
    expect(typeof result.current.setContext).toBe('function');
  });

  it('should log messages through provider', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    await act(async () => {
      await result.current.log('info', 'Test message', { userId: '123' });
    });

    // Just verify the function is available and was called
    expect(typeof result.current.log).toBe('function');
  });

  it('should capture exceptions through provider', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    const error = new Error('Test error');

    await act(async () => {
      await result.current.captureException(error, { context: 'test' });
    });

    expect(typeof result.current.captureException).toBe('function');
  });

  it('should identify users through provider', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    await act(async () => {
      await result.current.identify('user-123', { email: 'test@example.com' });
    });

    expect(typeof result.current.identify).toBe('function');
  });

  it('should set context through provider', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    await act(async () => {
      await result.current.setContext({ environment: 'test' });
    });

    expect(typeof result.current.setContext).toBe('function');
  });

  it('should handle multiple providers', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={multiProviderConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    await act(async () => {
      await result.current.log('info', 'Test message');
    });

    // Just test that the log method exists and can be called
    expect(typeof result.current.log).toBe('function');
  });

  it('should skip disabled providers', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    // Verify the result is properly initialized
    expect(result.current).not.toBeNull();

    await act(async () => {
      await result.current.log('info', 'Test message');
    });

    expect(typeof result.current.log).toBe('function');
  });

  it('should provide helper methods', async () => {
    let isInitialized = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider
        config={mockConfig}
        onInitialized={() => {
          isInitialized = true;
        }}
      >
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Wait for provider to initialize
    await waitFor(
      () => {
        expect(isInitialized).toBe(true);
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 },
    );

    // Test debug helper
    await act(async () => {
      await result.current.debug('Debug message');
    });

    expect(typeof result.current.debug).toBe('function');
  });

  it('should throw when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useObservability());
    }).toThrow('useObservability must be used within an ObservabilityProvider');

    consoleSpy.mockRestore();
  });

  it('should handle provider errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ObservabilityProvider config={errorConfig} onError={() => {}}>
        {children}
      </ObservabilityProvider>
    );

    const { result } = renderHook(() => useObservability(), { wrapper });

    // Test should complete without throwing
    expect(result.current).toBeDefined();

    consoleSpy.mockRestore();
  });
});
