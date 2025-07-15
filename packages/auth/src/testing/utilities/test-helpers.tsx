/**
 * Test helper utilities
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';

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
  } = {},
): ReturnType<typeof render> {
  const { authenticated = true, organizationId, role = 'member', userType = 'member' } = options;

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
  const mocks = {
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
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
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    getItem: vi.fn((key: string) => store[key] || null),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: 0,
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
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
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    getItem: vi.fn((key: string) => store[key] || null),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: 0,
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
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
      hostname: location.hostname,
      pathname: location.pathname,
      assign: vi.fn(),
      hash: location.hash,
      host: location.host,
      href: location.href,
      origin: location.origin,
      port: location.port,
      protocol: location.protocol,
      reload: vi.fn(),
      replace: vi.fn(),
      search: location.search,
    },
    writable: true,
  });

  return window.location;
}

/**
 * Creates a promise that can be resolved/rejected externally
 */
export function createDeferred<T = any>() {
  let resolveFunc!: (value: T) => void;
  let rejectFunc!: (reason?: any) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolveFunc = resolve;
    rejectFunc = reject;
  });

  return {
    promise,
    reject: rejectFunc,
    resolve: resolveFunc,
  };
}

/**
 * Test if a function throws an error
 */
export async function expectToThrow(
  fn: () => Promise<any> | any,
  errorMessage?: string,
): Promise<Error> {
  try {
    await fn();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (errorMessage && !(error as Error).message.includes(errorMessage)) {
      throw new Error(
        `Expected error message to include "${errorMessage}", but got "${(error as Error).message}"`,
      );
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
      url: buildUrl(path),
      headers: {
        'Content-Type': 'application/json',
        ...(data && { body: JSON.stringify(data) }),
      },
      method,
    };
  };

  return {
    buildUrl,
    delete: (path: string) => mockRequest('DELETE', path),
    get: (path: string) => mockRequest('GET', path),
    mockRequest,
    patch: (path: string, data?: any) => mockRequest('PATCH', path, data),
    post: (path: string, data?: any) => mockRequest('POST', path, data),
  };
}

/**
 * Mock Next.js router for testing
 */
export function mockNextRouter(overrides: Partial<any> = {}) {
  const router = {
    pathname: '/',
    asPath: '/',
    back: vi.fn(),
    basePath: '',
    beforePopState: vi.fn(),
    defaultLocale: 'en',
    events: {
      emit: vi.fn(),
      off: vi.fn(),
      on: vi.fn(),
    },
    isFallback: false,
    isPreview: false,
    isReady: true,
    locale: 'en',
    locales: ['en'],
    prefetch: vi.fn(() => Promise.resolve()),
    push: vi.fn(() => Promise.resolve(true)),
    query: {},
    reload: vi.fn(),
    replace: vi.fn(() => Promise.resolve(true)),
    route: '/',
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
    error,
    rerender: () => {
      utils.rerender(<TestComponent />);
      return { error, result: result as any };
    },
    result: result as any,
    unmount: utils.unmount,
  };
}
