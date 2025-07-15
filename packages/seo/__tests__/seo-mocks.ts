/**
 * SEO Mocks
 *
 * Provides mocking setup for SEO-related dependencies and external services.
 */

import { vi } from 'vitest';

/**
 * Sets up all SEO-related mocks
 */
export function setupSEOMocks() {
  // Mock Next.js metadata APIs
  vi.mock('next/headers', () => ({
    headers: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
    })),
    cookies: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
    })),
  }));

  // Mock Next.js navigation
  vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    })),
    usePathname: vi.fn(() => '/test-path'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  }));

  // Mock environment variables
  vi.stubGlobal('process', {
    ...process,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      NEXT_PUBLIC_SITE_URL: 'https://test.example.com',
      NEXT_PUBLIC_SITE_NAME: 'Test Site',
      NEXT_PUBLIC_SITE_DESCRIPTION: 'A test site for SEO testing',
    },
  });

  // Mock server-only to allow imports in test environment
  vi.mock('server-only', () => ({}));

  // Mock console methods to avoid test noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

/**
 * Resets all SEO mocks
 */
export function resetSEOMocks() {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
}
