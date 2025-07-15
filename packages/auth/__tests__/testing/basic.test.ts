/**
 * Tests for testing utilities index exports
 */

import { describe, expect, it } from 'vitest';

describe('testing index exports', () => {
  it('should export testing utilities', async () => {
    const testingModule = await import('@/testing/index');

    expect(testingModule).toBeDefined();
    expect(typeof testingModule).toBe('object');
  });

  it('should be a valid module', async () => {
    const testingModule = await import('@/testing/index');

    // Should not throw when importing
    expect(testingModule).not.toBeNull();
    expect(testingModule).not.toBeUndefined();
  });
});
