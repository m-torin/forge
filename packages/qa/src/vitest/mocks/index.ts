// Centralized mock exports for all tests in the monorepo
// Import this file in your test setup to get all mocks

// Import all mock modules to ensure they're registered
// Note: Importing in a specific order to avoid dependency issues
import './internal/index';
import './packages/index';
import './providers/index';

// Re-export specific utilities from each mock module
// Note: Only re-export what actually exists to avoid conflicts
export type {
  // Forms
  MockEnhancedForm,
  formStates,
} from './internal';

export * from './packages/index';
export * from './providers/index';

// Master reset function - import vi conditionally to avoid issues with config loading
export const resetAllMocks = async () => {
  const { vi } = await import('vitest');
  vi.clearAllMocks();
};
