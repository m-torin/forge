import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Setup React Testing Library cleanup
 * Automatically cleans up after each test
 */
export function setupReactCleanup() {
  afterEach(() => {
    cleanup();
  });
}

/**
 * Setup comprehensive cleanup for React tests
 * Includes React Testing Library cleanup and mock clearing
 */
export function setupReactTestCleanup() {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
}

/**
 * Create a mock fetch implementation with predefined responses
 */
export function createMockFetch(responses: Record<string, any> = {}) {
  return vi.fn(async (url: string | URL | Request, _options?: RequestInit) => {
    const urlStr =
      typeof url === 'string'
        ? url
        : url instanceof URL
          ? url.toString()
          : url instanceof Request
            ? url.url
            : String(url);

    // Check for exact match first
    if (responses[urlStr]) {
      return createMockResponse(responses[urlStr]);
    }

    // Check for pattern matches
    for (const [pattern, response] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return createMockResponse(response);
      }
    }

    // Default 404 response
    return createMockResponse({ error: 'Not found' }, 404);
  });
}

/**
 * Create a mock Response object
 */
export function createMockResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
    json: async () => JSON.parse(body),
    text: async () => body,
    blob: async () => new Blob([body]),
    arrayBuffer: async () => new TextEncoder().encode(body).buffer,
    formData: async () => new FormData(),
    clone: function () {
      return { ...this };
    },
    body: null,
    bodyUsed: false,
    url: '',
    redirected: false,
    type: 'basic' as ResponseType,
  } as Response;
}

/**
 * Create a mock for async functions with controllable behavior
 */
export function createAsyncMock<T = any>(defaultValue?: T) {
  const mock = vi.fn();

  return {
    mock,
    resolveWith: (value: T) => {
      mock.mockResolvedValueOnce(value);
    },
    rejectWith: (error: Error | string) => {
      mock.mockRejectedValueOnce(typeof error === 'string' ? new Error(error) : error);
    },
    delayResolveWith: (value: T, delay: number) => {
      mock.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve(value), delay)),
      );
    },
    reset: () => {
      mock.mockReset();
      if (defaultValue !== undefined) {
        mock.mockResolvedValue(defaultValue);
      }
    },
  };
}

/**
 * Wait for all promises in the queue to resolve
 * Useful for testing async React components
 */
export async function flushPromises() {
  await new Promise(resolve => setImmediate(resolve));
}

/**
 * Create a test wrapper with providers
 */
export function createTestWrapper(providers: React.FC<{ children: React.ReactNode }>[]) {
  return ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as React.ReactElement,
    );
  };
}

/**
 * Mock local storage for tests
 */
export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  const localStorageMock = {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    }),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return {
    storage,
    mock: localStorageMock,
    reset: () => {
      localStorageMock.clear();
      vi.clearAllMocks();
    },
  };
}

/**
 * Mock session storage for tests
 */
export function mockSessionStorage() {
  const storage: Record<string, string> = {};

  const sessionStorageMock = {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    }),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  return {
    storage,
    mock: sessionStorageMock,
    reset: () => {
      sessionStorageMock.clear();
      vi.clearAllMocks();
    },
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {},
) {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Condition was not met within timeout');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Create a test timer controller
 */
export function createTimerController() {
  return {
    useFakeTimers: () => {
      vi.useFakeTimers();
    },
    useRealTimers: () => {
      vi.useRealTimers();
    },
    advanceBy: (ms: number) => {
      vi.advanceTimersByTime(ms);
    },
    runAllTimers: () => {
      vi.runAllTimers();
    },
    runOnlyPendingTimers: () => {
      vi.runOnlyPendingTimers();
    },
    clearAllTimers: () => {
      vi.clearAllTimers();
    },
  };
}
