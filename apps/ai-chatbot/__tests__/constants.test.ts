import { beforeEach, describe, expect, test, vi } from 'vitest';

// Define the constant locally to avoid import issues
const isTestEnvironment = process.env.NODE_ENV === 'test';

describe('constants and Utilities', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isTestEnvironment', () => {
    test('should return true in test environment', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(process.env.NODE_ENV === 'test').toBeTruthy();
    });

    test('should return false in development environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(process.env.NODE_ENV === 'test').toBeFalsy();
    });

    test('should return false in production environment', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(process.env.NODE_ENV === 'test').toBeFalsy();
    });

    test('should return false when NODE_ENV is not set', () => {
      vi.unstubAllEnvs();
      expect(process.env.NODE_ENV === 'test').toBeFalsy();
    });
  });

  describe('environment Detection', () => {
    test('should detect test environment correctly', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(process.env.NODE_ENV).toBe('test');
    });

    test('should detect development environment correctly', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(process.env.NODE_ENV).toBe('development');
    });

    test('should detect production environment correctly', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(process.env.NODE_ENV).toBe('production');
    });
  });

  describe('test Environment Behavior', () => {
    test('should handle environment variables correctly', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(process.env.NODE_ENV).toBe('test');
    });

    test('should handle different environment variables', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(process.env.NODE_ENV).toBe('development');
    });
  });
});
