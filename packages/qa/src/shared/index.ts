/**
 * @fileoverview Shared utilities and types for the @repo/qa package.
 *
 * This module exports common types, utilities, and constants that are used
 * across different testing environments and frameworks within the QA package.
 */

// Export enhanced TypeScript definitions for better development experience
export * from './types/testing';

// Shared utilities - deprecated, use @repo/qa/vitest instead
// Re-export from vitest for backward compatibility
export * from '../vitest/utils/database';
export * from '../vitest/utils/render';
