import { vi } from 'vitest';
import { featureFlagTestData } from './test-data-generators';

// Import types from flags - these come from the package
type ReadonlyHeaders = import('flags').ReadonlyHeaders;
type ReadonlyRequestCookies = import('flags').ReadonlyRequestCookies;

/**
 * Creates a mock ReadonlyHeaders object for testing
 */
export function createMockHeaders(entries: Record<string, string> = {}): ReadonlyHeaders {
  const headers = new Headers(entries);
  return headers as ReadonlyHeaders;
}

/**
 * Creates a mock ReadonlyRequestCookies object for testing
 */
export function createMockCookies(cookies: Record<string, string> = {}): ReadonlyRequestCookies {
  return {
    get: vi.fn((name: string) => {
      const value = cookies[name];
      return value ? { name, value } : undefined;
    }),
    getAll: vi.fn(() => Object.entries(cookies).map(([name, value]) => ({ name, value }))),
    has: vi.fn((name: string) => name in cookies),
    size: Object.keys(cookies).length,
    [Symbol.iterator]: vi.fn(function* () {
      for (const [name, value] of Object.entries(cookies)) {
        yield { name, value };
      }
    }),
  } as any;
}

/**
 * Creates a mock CookieStore object for testing shared utils
 */
export function createMockCookieStore(cookies: Record<string, string> = {}) {
  return {
    get: vi.fn((name: string) => {
      const value = cookies[name];
      return value ? { value } : undefined;
    }),
    has: vi.fn((name: string) => name in cookies),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    getAll: vi.fn(() => Object.entries(cookies).map(([name, value]) => ({ name, value }))),
    toString: vi.fn(() => ''),
    [Symbol.iterator]: vi.fn(function* () {
      for (const [name, value] of Object.entries(cookies)) {
        yield { name, value };
      }
    }),
  };
}

/**
 * Standard test parameters for adapter decide functions
 */
export function createDecideParams(
  overrides: {
    key?: string;
    entities?: any;
    headers?: ReadonlyHeaders;
    cookies?: ReadonlyRequestCookies;
  } = {},
) {
  return {
    key: overrides.key || 'test-flag',
    entities: overrides.entities,
    headers: overrides.headers || createMockHeaders(),
    cookies: overrides.cookies || createMockCookies(),
  };
}

/**
 * Creates a comprehensive mock feature flag adapter for testing
 */
export function createMockFeatureFlagAdapter(overrides: Partial<any> = {}) {
  return {
    getAllFlags: vi.fn(() => Promise.resolve(featureFlagTestData.posthog.responses.allFlags)),
    getFlag: vi.fn((key: string, defaultValue?: any) => {
      const flags = featureFlagTestData.posthog.responses.featureFlags as Record<string, any>;
      return Promise.resolve(flags[key] || defaultValue);
    }),
    identify: vi.fn(() => Promise.resolve()),
    isEnabled: vi.fn((key: string) => {
      const flags = featureFlagTestData.posthog.responses.featureFlags as Record<string, any>;
      return Promise.resolve(Boolean(flags[key]));
    }),
    reload: vi.fn(() => Promise.resolve()),
    track: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

/**
 * Creates mock Edge Config client for testing
 */
export function createMockEdgeConfigClient(overrides: Partial<any> = {}) {
  return {
    get: vi.fn(() => Promise.resolve(featureFlagTestData.edgeConfig.responses.valid)),
    getAll: vi.fn(() => Promise.resolve(featureFlagTestData.edgeConfig.responses.valid)),
    has: vi.fn((key: string) =>
      Promise.resolve(key in featureFlagTestData.edgeConfig.responses.valid),
    ),
    digest: vi.fn(() => Promise.resolve('mock-digest')),
    connection: {
      baseUrl: 'https://edge-config.vercel.com',
      id: 'test',
      token: 'test-token',
      version: '1',
      type: 'external' as const,
    },
    ...overrides,
  };
}

/**
 * Creates mock PostHog client for testing
 */
export function createMockPostHogClient(overrides: Partial<any> = {}) {
  return {
    getFeatureFlag: vi.fn((key: string, distinctId?: string) => {
      const flags = featureFlagTestData.posthog.responses.featureFlags as Record<string, any>;
      return Promise.resolve(flags[key]);
    }),
    getFeatureFlagPayload: vi.fn((key: string, distinctId?: string) => {
      const flags = featureFlagTestData.posthog.responses.featureFlags as Record<string, any>;
      return Promise.resolve(flags[key]);
    }),
    getAllFlags: vi.fn(() => Promise.resolve(featureFlagTestData.posthog.responses.allFlags)),
    isFeatureEnabled: vi.fn((key: string, distinctId?: string) => {
      const flags = featureFlagTestData.posthog.responses.featureFlags as Record<string, any>;
      return Promise.resolve(Boolean(flags[key]));
    }),
    identify: vi.fn(() => Promise.resolve()),
    capture: vi.fn(() => Promise.resolve()),
    shutdown: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

/**
 * Creates mock environment variables for testing
 */
export function createMockEnvironment(type: 'complete' | 'minimal' | 'empty' = 'complete') {
  const mockEnv = vi.fn(() => {
    switch (type) {
      case 'complete':
        return {
          EDGE_CONFIG: 'https://edge-config.vercel.com/ecfg_test123',
          POSTHOG_API_KEY: 'phc_test_key_123',
          POSTHOG_PROJECT_ID: 'project-123',
          POSTHOG_HOST: 'https://app.posthog.com',
          NODE_ENV: 'test',
          NEXT_PUBLIC_NODE_ENV: 'test',
        };
      case 'minimal':
        return {
          NODE_ENV: 'test',
          NEXT_PUBLIC_NODE_ENV: 'test',
        };
      case 'empty':
      default:
        return {};
    }
  });

  return { safeEnv: mockEnv };
}

/**
 * Creates mock observability for testing
 */
export function createMockObservability() {
  return {
    logError: vi.fn(),
    logWarn: vi.fn(),
    logInfo: vi.fn(),
    logDebug: vi.fn(),
    createSpan: vi.fn(() => ({
      setAttributes: vi.fn(),
      setStatus: vi.fn(),
      end: vi.fn(),
    })),
    recordException: vi.fn(),
    incrementCounter: vi.fn(),
    recordHistogram: vi.fn(),
  };
}

/**
 * Creates adapter scenarios for comprehensive testing
 */
function createAdapterScenarios(adapterType: 'edge-config' | 'posthog-client' | 'posthog-server') {
  const baseScenarios = {
    success: {
      description: 'should return flag value successfully',
      setup: () => {},
      expectations: {
        result: true,
        called: true,
      },
    },

    notFound: {
      description: 'should return undefined for non-existent flag',
      setup: () => {},
      expectations: {
        result: undefined,
        called: true,
      },
    },

    error: {
      description: 'should propagate errors',
      setup: () => {},
      expectations: {
        shouldThrow: true,
        errorMessage: 'Test error',
      },
    },

    edgeCases: {
      description: 'should handle edge cases',
      setup: () => {},
      expectations: {
        result: undefined,
        called: true,
      },
    },
  };

  switch (adapterType) {
    case 'edge-config':
      return {
        ...baseScenarios,
        nullResponse: {
          description: 'should handle null response from Edge Config',
          setup: () => {},
          expectations: {
            result: undefined,
            called: true,
          },
        },
        invalidResponse: {
          description: 'should handle invalid response from Edge Config',
          setup: () => {},
          expectations: {
            result: undefined,
            called: true,
          },
        },
      };

    case 'posthog-client':
    case 'posthog-server':
      return {
        ...baseScenarios,
        allFlags: {
          description: 'should return all feature flags',
          setup: () => {},
          expectations: {
            result: featureFlagTestData.posthog.responses.allFlags,
            called: true,
          },
        },
        distinctId: {
          description: 'should handle distinct ID correctly',
          setup: () => {},
          expectations: {
            result: true,
            called: true,
          },
        },
      };

    default:
      return baseScenarios;
  }
}

/**
 * Creates test wrapper with common setup
 */
export function createTestWrapper(
  options: {
    mockClient?: any;
    mockEnvironment?: any;
    mockObservability?: any;
  } = {},
) {
  const {
    mockClient = createMockEdgeConfigClient(),
    mockEnvironment = createMockEnvironment(),
    mockObservability = createMockObservability(),
  } = options;

  return {
    mockClient,
    mockEnvironment,
    mockObservability,
    cleanup: () => {
      vi.clearAllMocks();
    },
  };
}

/**
 * Assertion helpers for common test patterns
 */
export const assertionHelpers = {
  /**
   * Asserts that a flag decision was made correctly
   */
  assertFlagDecision: (result: any, expected: any) => {
    if (expected === undefined) {
      expect(result).toBeUndefined();
    } else {
      expect(result).toStrictEqual(expected);
    }
  },

  /**
   * Asserts that a mock was called with correct parameters
   */
  assertMockCalled: (mock: any, expectedCalls: number = 1, expectedArgs?: any[]) => {
    expect(mock).toHaveBeenCalledTimes(expectedCalls);
    if (expectedArgs) {
      expect(mock).toHaveBeenCalledWith(...expectedArgs);
    }
  },

  /**
   * Asserts that an error was thrown with correct message
   */
  assertErrorThrown: async (asyncFn: () => Promise<any>, expectedMessage: string) => {
    await expect(asyncFn()).rejects.toThrow(expectedMessage);
  },

  /**
   * Asserts that adapter structure is correct
   */
  assertAdapterStructure: (adapter: any) => {
    expect(adapter).toBeDefined();
    expect(typeof adapter).toBe('function');

    const instance = adapter();
    expect(instance).toBeDefined();
    expect(typeof instance).toBe('object');
    expect(instance).toHaveProperty('decide');
    expect(typeof instance.decide).toBe('function');
  },

  /**
   * Asserts that provider data has correct structure
   */
  assertProviderDataStructure: (data: any) => {
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('provider');
    expect(data).toHaveProperty('flags');
    expect(Array.isArray(data.flags)).toBeTruthy();
  },
};

/**
 * Performance testing utilities
 */
export const performanceHelpers = {
  /**
   * Measures execution time of a function
   */
  measureExecutionTime: async (fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * Asserts that execution time is within acceptable limits
   */
  assertPerformance: (duration: number, maxDuration: number) => {
    expect(duration).toBeLessThan(maxDuration);
  },

  /**
   * Creates a performance test scenario
   */
  createPerformanceTest: (fn: () => Promise<any>, maxDuration: number, description: string) => ({
    name: 'performance',
    description,
    test: async () => {
      const { duration } = await performanceHelpers.measureExecutionTime(fn);
      performanceHelpers.assertPerformance(duration, maxDuration);
    },
  }),
};
