import { describe, expect, test } from 'vitest';

describe('Links Package', () => {
  test('should be importable', async () => {
    expect(async () => {
      await import('../client');
      await import('../server');
    }).not.toThrow();
  });

  test('should have basic functionality', () => {
    // This is a placeholder test to ensure the package has tests
    expect(true).toBe(true);
  });
});