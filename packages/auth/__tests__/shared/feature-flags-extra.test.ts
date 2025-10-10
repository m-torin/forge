import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  authFeatureFlag,
  isAuthEnabled,
  isAuthEnabledClient,
} from '../../src/shared/utils/feature-flags';

describe('feature-flags (extra)', () => {
  afterEach(() => {
    delete process.env.ENABLE_BETTER_AUTH;
    delete process.env.NEXT_PUBLIC_ENABLE_BETTER_AUTH;
    vi.unstubAllGlobals();
  });

  test('server: prefers ENABLE_BETTER_AUTH over client flag', () => {
    vi.stubGlobal('window', undefined as unknown as Window);
    process.env.ENABLE_BETTER_AUTH = 'true';
    process.env.NEXT_PUBLIC_ENABLE_BETTER_AUTH = 'false';
    expect(isAuthEnabled()).toBeTruthy();
  });

  test('server: falls back to default when flags missing', () => {
    vi.stubGlobal('window', undefined as unknown as Window);
    expect(authFeatureFlag(true)).toBeTruthy();
    expect(isAuthEnabled()).toBeFalsy(); // default is false in helpers
  });

  test('client: uses NEXT_PUBLIC_ENABLE_BETTER_AUTH when present', () => {
    // JSDOM provides window by default; ensure client branch
    process.env.NEXT_PUBLIC_ENABLE_BETTER_AUTH = 'true';
    expect(isAuthEnabledClient()).toBeTruthy();
  });
});
