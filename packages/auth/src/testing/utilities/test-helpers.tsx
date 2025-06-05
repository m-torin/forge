/**
 * Test helper utilities
 */

import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { createMockAuthContext } from '../mocks/storybook';

import type { ReactElement } from 'react';
import type { OrganizationRole } from '../../shared/types';
import type { mockUsers } from '../mocks/auth';

/**
 * Custom render function that includes auth context
 */
export function renderWithAuth(
  ui: ReactElement,
  options: {
    authenticated?: boolean;
    userType?: keyof typeof mockUsers;
    organizationId?: string;
    role?: OrganizationRole;
  } = {}
) {
  const {
    authenticated = true,
    userType = 'member',
    organizationId,
    role = 'member',
  } = options;

  const mockContext = createMockAuthContext(authenticated, userType, organizationId, role);

  // Mock the auth context
  const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-auth-provider">{children}</div>;
  };

  // Mock useAuth hook
  vi.doMock('../../client/hooks', () => ({
    useAuth: () => mockContext,
  }));

  return render(ui, {
    wrapper: AuthProvider,
    ...options,
  });
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to test error boundaries
 */
export function throwError(message = 'Test error') {
  throw new Error(message);
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalConsole = { ...console };
  
  const mocks = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  };

  const restore = () => {
    Object.keys(mocks).forEach(key => {
      mocks[key as keyof typeof mocks].mockRestore();
    });
  };

  return { mocks, restore };
}

/**
 * Mock localStorage for testing
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
}

/**
 * Mock sessionStorage for testing
 */
export function mockSessionStorage() {
  const store: Record<string, string> = {};

  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
}

/**
 * Mock location for testing navigation
 */
export function mockLocation(url = 'http://localhost:3000') {
  const location = new URL(url);
  
  Object.defineProperty(window, 'location', {
    value: {
      href: location.href,
      origin: location.origin,
      protocol: location.protocol,
      host: location.host,
      hostname: location.hostname,
      port: location.port,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  });

  return window.location;
}

/**
 * Creates a promise that can be resolved/rejected externally
 */
export function createDeferred<T = any>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

/**
 * Test if a function throws an error
 */
export async function expectToThrow(
  fn: () => Promise<any> | any,
  errorMessage?: string
): Promise<Error> {
  try {
    await fn();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (errorMessage && !(error as Error).message.includes(errorMessage)) {
      throw new Error(`Expected error message to include "${errorMessage}", but got "${(error as Error).message}"`);
    }
    return error as Error;
  }
}

/**
 * Test helper for API endpoint testing
 */
export function createApiTestHelper(baseUrl = '/api/auth') {
  const buildUrl = (path: string) => `${baseUrl}${path}`;
  
  const mockRequest = (method: string, path: string, data?: any) => {
    return {
      method,
      url: buildUrl(path),
      headers: {
        'Content-Type': 'application/json',
        ...(data && { body: JSON.stringify(data) }),
      },
    };
  };

  return {
    buildUrl,
    mockRequest,
    get: (path: string) => mockRequest('GET', path),
    post: (path: string, data?: any) => mockRequest('POST', path, data),
    patch: (path: string, data?: any) => mockRequest('PATCH', path, data),
    delete: (path: string) => mockRequest('DELETE', path),
  };
}

/**
 * Mock Next.js router for testing
 */
export function mockNextRouter(overrides: Partial<any> = {}) {
  const router = {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    isFallback: false,
    basePath: '',
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    isReady: true,
    isPreview: false,
    push: vi.fn(() => Promise.resolve(true)),
    replace: vi.fn(() => Promise.resolve(true)),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(() => Promise.resolve()),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    ...overrides,
  };

  return router;
}

/**
 * Helper to test React hooks outside of components
 */
export function createHookTester<T>(hook: () => T) {
  let result: T | undefined;
  let error: Error | null = null;

  function TestComponent() {
    try {
      result = hook();
      error = null;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }
    return null;
  }

  const utils = render(<TestComponent />);

  return {
    result: result!,
    error,
    rerender: () => {
      utils.rerender(<TestComponent />);
      return { result: result!, error };
    },
    unmount: utils.unmount,
  };
}