// Common setup for Next.js applications
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Import setupBrowserMocks and setupNextMocks
import { setupBrowserMocks } from '../mocks/browser';
import { setupNextMocks } from '../mocks/next';
import { setupNodeModuleMocks } from '../mocks/node-modules';

import { suppressConsoleErrors } from './common';

// Setup console error suppression
suppressConsoleErrors();

// Setup browser and Next.js mocks
setupBrowserMocks();
setupNextMocks();
setupNodeModuleMocks();

// Clear all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock environment variables for testing
process.env = {
  ...process.env,
  NEXT_PUBLIC_VERCEL_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
};

export default {
  setupBrowserMocks,
  setupNextMocks,
  setupNodeModuleMocks,
  suppressConsoleErrors,
};
