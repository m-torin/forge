import { describe, expect } from 'vitest';

import * as clientExports from '../client';
import * as clientNextExports from '../client-next';
import * as serverExports from '../server';
import * as serverNextExports from '../server-next';
import * as sharedExports from '../shared';

describe('feature Flags Package Exports', () => {
  describe('server exports', () => {
    test('should export PostHog adapter functions', () => {
      expect(serverExports.createPostHogServerAdapter).toBeDefined();
      expect(typeof serverExports.createPostHogServerAdapter).toBe('function');
      expect(serverExports.getPostHogProviderData).toBeDefined();
    });

    test('should export Edge Config adapter functions', () => {
      expect(serverExports.createEdgeConfigAdapter).toBeDefined();
      expect(typeof serverExports.createEdgeConfigAdapter).toBe('function');
    });
  });

  describe('server Next.js exports', () => {
    test('should export flag function', () => {
      expect(serverNextExports.flag).toBeDefined();
      expect(typeof serverNextExports.flag).toBe('function');
    });

    test('should export dedupe function', () => {
      expect(serverNextExports.dedupe).toBeDefined();
      expect(typeof serverNextExports.dedupe).toBe('function');
    });

    test('should export precompute function', () => {
      expect(serverNextExports.precompute).toBeDefined();
      expect(typeof serverNextExports.precompute).toBe('function');
    });

    test('should export generatePermutations function', () => {
      expect(serverNextExports.generatePermutations).toBeDefined();
      expect(typeof serverNextExports.generatePermutations).toBe('function');
    });
  });

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
