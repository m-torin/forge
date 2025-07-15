/**
 * Browser testing setup with centralized third-party mocks
 * This file provides consistent browser API mocking across all tests
 */

import '@testing-library/jest-dom';
import { setupBrowserMocks as setupBrowserApiMocks } from '../mocks/browser';

// Setup browser APIs that are not available in jsdom
setupBrowserApiMocks();

// Additional browser-specific setup
export function setupBrowserMocks() {
  // This function can be called in individual test files if needed
  // for additional browser-specific mock setup
}
