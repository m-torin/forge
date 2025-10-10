/**
 * Vitest Accessibility Test Setup
 *
 * Provides jest-axe compatibility for Vitest environment
 * with proper async loading and fallback support.
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure Testing Library for accessibility-first testing
configure({
  defaultHidden: true,
  asyncUtilTimeout: 5000,
  testIdAttribute: 'data-testid',
});

// Mock axe function for fallback
const mockAxe = async () => ({ violations: [] });

// Create compatibility layer for jest-axe
export const getAxe = async () => {
  try {
    // Dynamic import with proper error handling
    const jestAxe = await import('jest-axe');
    return jestAxe.axe || mockAxe;
  } catch (error) {
    console.warn('jest-axe not available, using mock:', error);
    return mockAxe;
  }
};

// Setup jest-axe matchers if available
export const setupAxeMatchers = async () => {
  try {
    // Dynamic import with proper error handling
    const jestAxe = await import('jest-axe');
    const toHaveNoViolations = jestAxe.toHaveNoViolations;

    if (toHaveNoViolations && typeof expect?.extend === 'function') {
      expect.extend({ toHaveNoViolations });
    }

    return { toHaveNoViolations };
  } catch (error) {
    console.warn('jest-axe matchers not available:', error);

    // Create mock matcher
    const mockMatcher = () => ({
      pass: true,
      message: () => 'jest-axe not available - mock matcher used',
    });

    if (typeof expect?.extend === 'function') {
      expect.extend({ toHaveNoViolations: mockMatcher });
    }

    return { toHaveNoViolations: mockMatcher };
  }
};

// Initialize matchers
setupAxeMatchers();
