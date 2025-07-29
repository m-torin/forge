// Main QA package exports
// This is the default entry point for @repo/qa

// Re-export vitest mocks and utilities for easy access
export * from './vitest/mocks/index';

// Export test utilities and configs
export * from './vitest/mocks/internal/database';
export * from './vitest/mocks/internal/email';
export * from './vitest/mocks/internal/prisma-with-enums';
export * from './vitest/utils/prisma-test-setup';
export * from './vitest/utils/test-patterns';
