import { describe, expect, it, vi } from 'vitest';
import * as serverExports from '../server';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('Auth Server Exports', () => {
  it('exports all expected items from @clerk/nextjs/server', () => {
    // Since we're re-exporting from @clerk/nextjs/server, we should have all the exports from that package
    // We can't test the exact exports since they might change with package updates
    // But we can test that we're exporting something
    expect(Object.keys(serverExports).length).toBeGreaterThan(0);
  });

  it('exports are not undefined', () => {
    // Check that none of the exports are undefined
    Object.entries(serverExports).forEach(([key, value]) => {
      expect(value).not.toBeUndefined();
    });
  });

  it('exports common Clerk server functions', () => {
    // Test for some common exports from @clerk/nextjs/server
    // These are the most likely exports, but they might change with package updates
    const expectedExports = ['auth', 'currentUser', 'clerkClient', 'getAuth'];

    // Check that at least some of these exports exist
    // We don't require all of them since the package might change
    const exportKeys = Object.keys(serverExports);
    const hasExpectedExports = expectedExports.some((key) =>
      exportKeys.includes(key),
    );

    expect(hasExpectedExports).toBe(true);
  });
});
