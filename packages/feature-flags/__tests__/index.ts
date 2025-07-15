/**
 * Feature Flags Test Utilities Index
 *
 * Central export point for all test utilities, factories, and data generators.
 * This makes it easy to import everything needed for testing from one place.
 */

// Core test utilities
export * from './test-utils';

// Test data generators
export * from './test-data-generators';

// Test factory functions
export * from './feature-flags-test-factory';

// Test setup
export * from './setup';

// Re-export common vitest utilities for convenience
export { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
