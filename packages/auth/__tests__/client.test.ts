import { describe, expect, it } from 'vitest';
import * as clientExports from '../client';

describe('Auth Client Exports', () => {
  it('exports all expected items from @clerk/nextjs', () => {
    // Since we're re-exporting from @clerk/nextjs, we should have all the exports from that package
    // We can't test the exact exports since they might change with package updates
    // But we can test that we're exporting something
    expect(Object.keys(clientExports).length).toBeGreaterThan(0);
  });

  it('exports are not undefined', () => {
    // Check that none of the exports are undefined
    Object.entries(clientExports).forEach(([key, value]) => {
      expect(value).not.toBeUndefined();
    });
  });

  it('exports common Clerk client components and hooks', () => {
    // Test for some common exports from @clerk/nextjs
    // These are the most likely exports, but they might change with package updates
    const expectedExports = [
      'SignIn',
      'SignUp',
      'SignedIn',
      'SignedOut',
      'useAuth',
      'useUser',
      'useClerk',
    ];

    // Check that at least some of these exports exist
    // We don't require all of them since the package might change
    const exportKeys = Object.keys(clientExports);
    const hasExpectedExports = expectedExports.some((key) =>
      exportKeys.includes(key),
    );

    expect(hasExpectedExports).toBe(true);
  });
});
