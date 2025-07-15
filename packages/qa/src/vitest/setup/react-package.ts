/**
 * Comprehensive setup for React packages/libraries
 * Import this in your vitest config via the createReactPackageConfig builder
 */

// Base setup including jest-dom and common utilities
import './common';

// Import only necessary mocks for React packages
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '../mocks/browser';
import '../mocks/environment';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Set test environment
process.env.NODE_ENV = 'test';

// Browser mocks are already loaded via the browser mock module import

// Export utilities for tests
export { act, render, renderHook, screen, waitFor } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export * from '../utils/test-helpers';
