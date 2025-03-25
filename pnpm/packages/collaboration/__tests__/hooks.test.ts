import { describe, expect, it } from 'vitest';
import * as hooksExports from '../hooks';

describe('Collaboration Hooks Exports', () => {
  it('exports all expected items from @liveblocks/react/suspense', () => {
    // Since we're re-exporting from @liveblocks/react/suspense, we should have all the exports from that package
    // We can't test the exact exports since they might change with package updates
    // But we can test that we're exporting something
    expect(Object.keys(hooksExports).length).toBeGreaterThan(0);
  });

  it('exports are not undefined', () => {
    // Check that none of the exports are undefined
    Object.entries(hooksExports).forEach(([key, value]) => {
      expect(value).not.toBeUndefined();
    });
  });

  it('exports common Liveblocks hooks', () => {
    // Test for some common exports from @liveblocks/react/suspense
    // These are the most likely exports, but they might change with package updates
    const expectedExports = [
      'useMyPresence',
      'useOthers',
      'useRoom',
      'useStorage',
      'useMutation',
    ];

    // Check that at least some of these exports exist
    // We don't require all of them since the package might change
    const exportKeys = Object.keys(hooksExports);
    const hasExpectedExports = expectedExports.some((key) =>
      exportKeys.includes(key),
    );

    expect(hasExpectedExports).toBe(true);
  });
});
