import { describe, expect, it } from 'vitest';

import * as clientExports from '../client';
import * as clientNextExports from '../client-next';
import * as serverExports from '../server';
import * as serverNextExports from '../server-next';
import * as sharedExports from '../shared';

describe('Feature Flags Package Exports', () => {
  describe('Server exports', () => {
    it('should export PostHog adapter functions', () => {
      expect(serverExports.createPostHogServerAdapter).toBeDefined();
      expect(typeof serverExports.createPostHogServerAdapter).toBe('function');
      expect(serverExports.getPostHogProviderData).toBeDefined();
    });

    it('should export Edge Config adapter functions', () => {
      expect(serverExports.createEdgeConfigAdapter).toBeDefined();
      expect(typeof serverExports.createEdgeConfigAdapter).toBe('function');
    });
  });

  describe('Server Next.js exports', () => {
    it('should export flag function', () => {
      expect(serverNextExports.flag).toBeDefined();
      expect(typeof serverNextExports.flag).toBe('function');
    });

    it('should export dedupe function', () => {
      expect(serverNextExports.dedupe).toBeDefined();
      expect(typeof serverNextExports.dedupe).toBe('function');
    });

    it('should export precompute function', () => {
      expect(serverNextExports.precompute).toBeDefined();
      expect(typeof serverNextExports.precompute).toBe('function');
    });

    it('should export generatePermutations function', () => {
      expect(serverNextExports.generatePermutations).toBeDefined();
      expect(typeof serverNextExports.generatePermutations).toBe('function');
    });
  });

  describe('Client exports', () => {
    it('should export PostHog client adapter', () => {
      expect(clientExports.createPostHogClientAdapter).toBeDefined();
      expect(typeof clientExports.createPostHogClientAdapter).toBe('function');
    });
  });

  describe('Client Next.js exports', () => {
    it('should export useFlag hook', () => {
      expect(clientNextExports.useFlag).toBeDefined();
      expect(typeof clientNextExports.useFlag).toBe('function');
    });

    // flag is exported from server-next, not client-next
    // it('should export flag function for client', () => {
    //   expect(clientNextExports.flag).toBeDefined();
    // });
  });

  describe('Shared exports', () => {
    it('should export utility functions', () => {
      expect(sharedExports.getOrGenerateVisitorId).toBeDefined();
      expect(sharedExports.generateVisitorId).toBeDefined();
      expect(sharedExports.parseOverrides).toBeDefined();
    });
  });
});
