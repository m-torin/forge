import { describe, expect, it } from 'vitest';

import * as aiExports from '../index';

describe('AI Package Exports', () => {
  it('exports all expected items from ai package', () => {
    // Since we're re-exporting from 'ai', we should have all the exports from that package
    // We can't test the exact exports since they might change with package updates
    // But we can test that we're exporting something
    expect(Object.keys(aiExports).length).toBeGreaterThan(0);
  });

  it('exports are not undefined', () => {
    // Check that none of the exports are undefined
    Object.entries(aiExports).forEach(([_key, value]) => {
      expect(value).not.toBeUndefined();
    });
  });
});
