import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { keys } from '../keys';
import { createEnv } from '@t3-oss/env-nextjs';

// Import the mocked modules
vi.mock('@t3-oss/env-nextjs');

describe('Storage Keys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Mock createEnv to return a function that returns the environment variables
    (createEnv as any).mockImplementation(({ server, runtimeEnv }) => {
      const env = {};
      Object.keys(server).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      return () => env;
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('calls createEnv with the correct parameters', () => {
    keys();

    expect(createEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        server: expect.objectContaining({
          BLOB_READ_WRITE_TOKEN: expect.any(Object),
        }),
        runtimeEnv: expect.objectContaining({
          BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      }),
    );
  });

  it('returns the correct environment variables', () => {
    // Set up test environment variables
    process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';

    const result = keys();

    expect(result).toEqual({
      BLOB_READ_WRITE_TOKEN: 'test-blob-token',
    });
  });

  it('handles missing optional environment variables', () => {
    // Clear all environment variables
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const result = keys();

    expect(result).toEqual({
      BLOB_READ_WRITE_TOKEN: undefined,
    });
  });

  it('validates BLOB_READ_WRITE_TOKEN format', () => {
    // Mock createEnv to simulate validation
    (createEnv as any).mockImplementation(({ server, runtimeEnv }) => {
      // Simulate validation by checking if values are defined
      const validateValue = (schema: any, value: any) => {
        if (schema.min && (!value || value.length < schema.min)) {
          throw new Error(
            `Value must be at least ${schema.min} characters long`,
          );
        }
        return value;
      };

      const env = {};
      Object.keys(server).forEach((key) => {
        try {
          env[key] = validateValue(server[key], runtimeEnv[key]);
        } catch (error) {
          // If validation fails, set to undefined for optional fields
          if (server[key].optional) {
            env[key] = undefined;
          } else {
            throw error;
          }
        }
      });

      return () => env;
    });

    // Set valid BLOB_READ_WRITE_TOKEN
    process.env.BLOB_READ_WRITE_TOKEN = 'valid-token';

    // Should not throw for valid token
    expect(() => keys()).not.toThrow();

    // Set empty BLOB_READ_WRITE_TOKEN
    process.env.BLOB_READ_WRITE_TOKEN = '';

    // Should throw for empty token
    expect(() => keys()).toThrow();
  });

  it('allows undefined BLOB_READ_WRITE_TOKEN because it is optional', () => {
    // Mock createEnv to simulate validation
    (createEnv as any).mockImplementation(({ server, runtimeEnv }) => {
      // Simulate validation by checking if values are defined
      const validateValue = (schema: any, value: any) => {
        if (!schema.optional && value === undefined) {
          throw new Error('Value is required');
        }
        if (schema.min && value && value.length < schema.min) {
          throw new Error(
            `Value must be at least ${schema.min} characters long`,
          );
        }
        return value;
      };

      const env = {};
      Object.keys(server).forEach((key) => {
        try {
          env[key] = validateValue(server[key], runtimeEnv[key]);
        } catch (error) {
          // If validation fails, set to undefined for optional fields
          if (server[key].optional) {
            env[key] = undefined;
          } else {
            throw error;
          }
        }
      });

      return () => env;
    });

    // Clear BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_READ_WRITE_TOKEN;

    // Should not throw because BLOB_READ_WRITE_TOKEN is optional
    expect(() => keys()).not.toThrow();

    // Result should have undefined BLOB_READ_WRITE_TOKEN
    expect(keys()).toEqual({
      BLOB_READ_WRITE_TOKEN: undefined,
    });
  });
});
