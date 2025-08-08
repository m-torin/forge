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
  // Next.js mocks are handled by the centralized setup via @repo/qa

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
