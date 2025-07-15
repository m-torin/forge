import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { CONSOLE_PRESETS, setupConsoleSuppression } from '../utils/console';

// Import environment utilities
import { setupTestEnvironment } from '../utils/environment';

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Setup minimal console suppression by default
setupConsoleSuppression(CONSOLE_PRESETS.minimal);

// Legacy function for backward compatibility - now uses centralized console utility
export function suppressConsoleErrors(patterns: RegExp[] = [/Warning:/, /Error:/]): void {
  setupConsoleSuppression({
    error: { enabled: true, patterns },
  });
}

// Legacy function for backward compatibility - now uses centralized environment utility
export function setTestEnv(envVars: Record<string, string>): void {
  setupTestEnvironment(envVars);
}

// Re-export for backward compatibility
export { createEnvironmentSetup as createSetTestEnv } from '../utils/environment';

// Re-export for backward compatibility
export { createConsoleSuppression as createSuppressConsoleErrors } from '../utils/console';

// Global afterEach hook
afterEach(() => {
  // any afterEach logic if needed
});

export default {
  setTestEnv,
  suppressConsoleErrors,
};
