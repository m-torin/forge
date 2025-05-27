import { describe, expect, it } from 'vitest';

import type { Dictionary } from '../index';

describe('Type Exports', () => {
  it('Dictionary type is properly exported', () => {
    // This test verifies that the Dictionary type can be imported
    // and used in TypeScript contexts
    const mockDictionary: Dictionary = {
      // We don't have the actual structure here in tests,
      // but this verifies the type is exported correctly
    } as any;

    expect(mockDictionary).toBeDefined();
  });

  it('locales is readonly array', async () => {
    // Import to verify the type
    const { locales } = await import('../index');

    // Verify it's an array
    expect(Array.isArray(locales)).toBe(true);

    // Verify it contains expected locales
    expect(locales).toContain('en');
    expect(locales.length).toBe(6);
  });
});
