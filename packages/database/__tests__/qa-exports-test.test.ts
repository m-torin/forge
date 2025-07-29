import { describe, expect, it } from 'vitest';

// Test what's actually exported from @repo/qa
describe('QA Package Exports Validation', () => {
  it('should be able to import basic utilities', async () => {
    const qaModule = await import('@repo/qa');

    // Check for essential exports that actually exist
    expect(qaModule.resetAllMocks).toBeDefined();
    expect(qaModule.createMockEnhancedForm).toBeDefined();
  });

  it('should be able to import mocking utilities', async () => {
    const qaModule = await import('@repo/qa');

    // Check for mocking utilities that exist
    const hasMockingUtils = ['resetAllMocks', 'createMockEnhancedForm', 'mockUpstashRedis'].every(
      fn => fn in qaModule,
    );

    expect(hasMockingUtils).toBe(true);
  });
});
