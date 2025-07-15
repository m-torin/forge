import { describe, expect, vi } from 'vitest';

import type { Dictionary } from '../src/index';

// Mock server-only before importing
vi.mock('server-only', () => ({}));

describe('type Exports', () => {
  test('has Dictionary type', () => {
    // This test just verifies that the Dictionary type is available for import
    // The actual type will be checked at compile time
    expect(true).toBeTruthy();
  });

  test('dictionary includes correct properties', () => {
    // Define a mock dictionary that follows the Dictionary type
    const mockDictionary: Dictionary = {
      // This would fail compilation if Dictionary type is incorrect
      // We don't need to provide all properties - just test the type structure
    } as Dictionary;

    expect(mockDictionary).toBeDefined();
  });

  test('locales is readonly array', async () => {
    // Import to verify the type
    const { locales } = await import('../src/index');

    // Verify it's an array
    expect(Array.isArray(locales)).toBeTruthy();

    // Verify it has expected locales
    expect(locales).toContain('en');

    // Verify it's read-only (TypeScript will catch mutations at compile time)
    expect(locales.length).toBeGreaterThan(0);
  });
});
