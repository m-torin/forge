// Minimal Vitest setup for ESLint config tests
import { vi, beforeEach, afterEach } from 'vitest';

// Reset all mocks automatically between tests
beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
