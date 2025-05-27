import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocks
import { log } from '../log';

// Mock modules before any imports
vi.mock('@logtail/next', () => ({
  log: vi.fn(),
}));

describe('@repo/observability/log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports console in non-production environment', () => {
    // In test environment (non-production), log should be console
    expect(log).toBe(console);
  });

  it('has standard console methods', () => {
    expect(log).toHaveProperty('log');
    expect(log).toHaveProperty('error');
    expect(log).toHaveProperty('warn');
    expect(log).toHaveProperty('info');
  });
});
