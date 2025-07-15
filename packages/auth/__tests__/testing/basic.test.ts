/**
 * Tests for testing utilities index exports
 */

import { describe, expect } from 'vitest';

describe('testing index exports', () => {
  test('should export testing utilities', async () => {
    const testingModule = await import('@/testing/index');

    expect(testingModule).toBeDefined();
    expect(typeof testingModule).toBe('object');
  });

  test('should be a valid module', async () => {
    const testingModule = await import('@/testing/index');

    // Should not throw when importing
    expect(testingModule).not.toBeNull();
    expect(testingModule).toBeDefined();
  });
});
