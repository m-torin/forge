/**
 * Comprehensive setup for Next.js applications
 * Import this in your vitest config via the createNextAppConfig builder
 */

// Base setup including jest-dom and common utilities
import './common';

// Import all standard mocks
import '../mocks';

// Next.js specific setup
import './next';

// React Testing Library cleanup
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { CONSOLE_PRESETS, setupConsoleSuppression } from '../utils/console';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock environment variables commonly used in Next.js apps
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Browser mocks are already loaded via '../mocks' import which includes browser.ts

// Apply Next.js console suppression preset (already imported at top)
setupConsoleSuppression(CONSOLE_PRESETS.nextjs);

// Export utilities for tests
export { act, render, screen, waitFor } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export * from '../utils/test-helpers';
