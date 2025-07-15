// @vitest-environment jsdom
import { describe, expect, vi } from 'vitest';

import * as clientExports from '@/client';
import * as clientNextExports from '@/client-next';
import * as sharedExports from '@/shared';

// Mock posthog-js to prevent initialization issues
vi.mock('posthog-js', () => ({
  default: {
    __loaded: true,
    init: vi.fn(),
    identify: vi.fn(),
    isFeatureEnabled: vi.fn(() => false),
    getFeatureFlag: vi.fn(() => false),
    getFeatureFlagPayload: vi.fn(() => ({})),
    get_distinct_id: vi.fn(() => 'test-user'),
  },
}));

describe('feature Flags Package Exports', () => {
  describe('client exports', () => {
    test('should export PostHog client adapter', () => {
      expect(clientExports.createPostHogClientAdapter).toBeDefined();
      expect(typeof clientExports.createPostHogClientAdapter).toBe('function');
    });
  });

  describe('client Next.js exports', () => {
    test('should export useFlag hook', () => {
      expect(clientNextExports.useFlag).toBeDefined();
      expect(typeof clientNextExports.useFlag).toBe('function');
    });
  });

  describe('shared exports', () => {
    test('should export utility functions', () => {
      expect(sharedExports.getOrGenerateVisitorId).toBeDefined();
      expect(sharedExports.generateVisitorId).toBeDefined();
      expect(sharedExports.parseOverrides).toBeDefined();
    });
  });
});
