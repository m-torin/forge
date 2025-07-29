// Shared utilities for Next.js mocks
import { vi } from 'vitest';

// Conditionally import React only if available
let React: any;
try {
  React = require('react');
} catch {
  // Create a minimal React substitute for non-React environments
  React = {
    createElement: (type: any, props: any, ...children: any[]) => ({
      type,
      props: { ...props, children: children.length === 1 ? children[0] : children },
    }),
    Fragment: 'fragment',
    useEffect: vi.fn(),
    useState: vi.fn(),
  };
}

// Mock Headers implementation based on Web Headers API
export const createMockHeaders = () => {
  const headerStore = new Map<string, string>();

  return {
    get: vi.fn((name: string) => headerStore.get(name.toLowerCase()) || null),
    set: vi.fn((name: string, value: string) => {
      headerStore.set(name.toLowerCase(), value);
    }),
    has: vi.fn((name: string) => headerStore.has(name.toLowerCase())),
    delete: vi.fn((name: string) => headerStore.delete(name.toLowerCase())),
    append: vi.fn((name: string, value: string) => {
      const existing = headerStore.get(name.toLowerCase());
      headerStore.set(name.toLowerCase(), existing ? `${existing}, ${value}` : value);
    }),
    forEach: vi.fn((callback: (value: string, key: string) => void) => {
      headerStore.forEach((value, key) => callback(value, key));
    }),
    keys: vi.fn(() => headerStore.keys()),
    values: vi.fn(() => headerStore.values()),
    entries: vi.fn(() => headerStore.entries()),
    [Symbol.iterator]: vi.fn(() => headerStore.entries()),
  };
};

// Mock Cookies implementation based on Web Cookies API
export const createMockCookies = () => {
  const cookieStore = new Map<string, { value: string; options?: any }>();

  return {
    get: vi.fn((name: string) => {
      const cookie = cookieStore.get(name);
      return cookie ? { name, value: cookie.value, ...cookie.options } : undefined;
    }),
    getAll: vi.fn(() => {
      return Array.from(cookieStore.entries()).map(([name, cookie]) => ({
        name,
        value: cookie.value,
        ...cookie.options,
      }));
    }),
    set: vi.fn((name: string, value: string, options?: any) => {
      cookieStore.set(name, { value, options });
    }),
    delete: vi.fn((name: string) => {
      cookieStore.delete(name);
    }),
    has: vi.fn((name: string) => cookieStore.has(name)),
    clear: vi.fn(() => cookieStore.clear()),
    size: cookieStore.size,
    toString: vi.fn(() => {
      return Array.from(cookieStore.entries())
        .map(([name, cookie]) => `${name}=${cookie.value}`)
        .join('; ');
    }),
  };
};

// Mock URLSearchParams for useSearchParams
export const createMockSearchParams = (params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  return {
    get: vi.fn((name: string) => searchParams.get(name)),
    getAll: vi.fn((name: string) => searchParams.getAll(name)),
    has: vi.fn((name: string) => searchParams.has(name)),
    set: vi.fn((name: string, value: string) => searchParams.set(name, value)),
    delete: vi.fn((name: string) => searchParams.delete(name)),
    append: vi.fn((name: string, value: string) => searchParams.append(name, value)),
    forEach: vi.fn((callback: (value: string, key: string) => void) => {
      searchParams.forEach(callback);
    }),
    keys: vi.fn(() => searchParams.keys()),
    values: vi.fn(() => searchParams.values()),
    entries: vi.fn(() => searchParams.entries()),
    toString: vi.fn(() => searchParams.toString()),
    [Symbol.iterator]: vi.fn(() => searchParams.entries()),
    size: searchParams.size,
  };
};

export { React };
