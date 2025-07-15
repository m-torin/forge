import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * Common test helper utilities
 */

// Create a mock function with default implementation
export function createMockFunction<T extends (...args: any[]) => any>(
  defaultImplementation?: T,
): Mock {
  return vi.fn(defaultImplementation);
}

/**
 * Legacy test helper exports
 *
 * These functions are deprecated in favor of the more comprehensive
 * utilities in './patterns'. They are kept for backward compatibility.
 *
 * @deprecated Use imports from './patterns' directly for new code
 */

// Re-export from patterns for backward compatibility
export {
  createAsyncMock,
  createMockFetch,
  createMockResponse,
  flushPromises,
  mockLocalStorage,
  mockSessionStorage,
} from './patterns';

// Legacy function - maps to patterns.createAsyncMock
export function createAsyncErrorMock(error: Error | string) {
  const { createAsyncMock } = require('./patterns');
  const mock = createAsyncMock();
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  mock.mock.rejectWith(errorObj);
  return mock.mock;
}

// Create a mock React component
export function createMockComponent(name: string) {
  return ({ children, ...props }: any) => {
    return (
      <div data-testid={`mock-${name}`} {...props}>
        {children}
      </div>
    );
  };
}

// Legacy fetch mock - use createMockResponse from patterns
export function mockFetchResponse(data: any, options: Partial<Response> = {}) {
  const { createMockResponse } = require('./patterns');
  return Promise.resolve(createMockResponse(data, options.status || 200, options.headers as any));
}

// Mock fetch error
export function mockFetchError(message = 'Network error') {
  return Promise.reject(new Error(message));
}

// Create a test user object
export function createTestUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Create a test session object
export function createTestSession(overrides = {}) {
  return {
    id: 'test-session-id',
    userId: 'test-user-id',
    user: createTestUser(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    ipAddress: '127.0.0.1',
    userAgent: 'test-user-agent',
    ...overrides,
  };
}

// Create test organization
export function createTestOrganization(overrides = {}) {
  return {
    id: 'test-org-id',
    name: 'Test Organization',
    slug: 'test-org',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock console methods for cleaner test output
 * @deprecated Use setupConsoleSuppression from './console' for better control
 */
export function mockConsole() {
  const { createConsoleSuppression } = require('./console');
  const suppression = createConsoleSuppression({
    log: { enabled: true, patterns: [] },
    error: { enabled: true, patterns: [] },
    warn: { enabled: true, patterns: [] },
  });

  suppression.setup();

  return {
    restore: () => suppression.restore(),
    mocks: {
      log: console.log as Mock,
      error: console.error as Mock,
      warn: console.warn as Mock,
      info: console.info as Mock,
      debug: console.debug as Mock,
    },
  };
}

// Test data generators
export const testData = {
  uuid: () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }),

  email: (prefix = 'test') => `${prefix}-${Date.now()}@example.com`,

  url: (path = '') => `http://localhost:3000${path}`,

  timestamp: (daysOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  },
};

// Assertion helpers
export const asserters = {
  isValidUUID: (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};
