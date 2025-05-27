// Import after mocks
import { captureException } from '@sentry/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parseError } from '../error';
import { log } from '../log';

// Mock Sentry before importing anything
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({ setExtra: vi.fn() })),
}));

// Mock log module to avoid circular dependencies
vi.mock('../log', () => ({
  log: {
    error: vi.fn(),
  },
}));

// Create mocks
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('@repo/observability/error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles Error objects', () => {
    const error = new Error('Test error message');

    const result = parseError(error);

    expect(result).toBe('Test error message');
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith('Parsing error: Test error message');
  });

  it('handles string errors', () => {
    const errorMessage = 'String error message';

    const result = parseError(errorMessage);

    expect(result).toBe('String error message');
    expect(captureException).toHaveBeenCalledWith(errorMessage);
    expect(log.error).toHaveBeenCalledWith('Parsing error: String error message');
  });

  it('handles object errors', () => {
    const errorObject = { code: 500, message: 'Object error' };

    const result = parseError(errorObject);

    expect(result).toBe('Object error');
    expect(captureException).toHaveBeenCalledWith(errorObject);
    expect(log.error).toHaveBeenCalledWith('Parsing error: Object error');
  });

  it('handles errors when Sentry throws', () => {
    const error = new Error('Test error');
    vi.mocked(captureException).mockImplementationOnce(() => {
      throw new Error('Sentry error');
    });

    const result = parseError(error);

    expect(result).toBe('Test error');
    expect(mockConsoleError).toHaveBeenCalledWith('Error parsing error:', expect.any(Error));
  });
});
