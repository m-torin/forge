// Minimal Vitest setup for ESLint config tests
import { afterEach, beforeEach, vi } from 'vitest';

// Reset all mocks automatically between tests
beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
