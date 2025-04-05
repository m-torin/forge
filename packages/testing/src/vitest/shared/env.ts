/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 *
 * Environment utilities for testing
 * These utilities have been moved to a new location for better organization.
 */
import {
  mockEnvVars as newMockEnvVars,
  setupAllTestEnvVars as newSetupAllTestEnvVars,
  testEnvVars as newTestEnvVars,
  setupConsoleMocks as newSetupConsoleMocks,
  restoreConsoleMocks as newRestoreConsoleMocks,
  mockDate as newMockDate,
  mockFetch as newMockFetch,
} from "../env/index.ts";

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const mockEnvVars = newMockEnvVars;

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const testEnvVars = newTestEnvVars;

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const setupAllTestEnvVars = newSetupAllTestEnvVars;

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const setupConsoleMocks = newSetupConsoleMocks;

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const restoreConsoleMocks = newRestoreConsoleMocks;

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const mockDate = newMockDate;

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export const mockFetch = newMockFetch;
