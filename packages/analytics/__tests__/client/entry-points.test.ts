/**
 * Tests for client entry points and exports
 */

import { describe, expect, vi } from 'vitest';

describe('client Entry Points', () => {
  describe('client.ts exports', () => {
    test('should export main client functions', async () => {
      const clientModule = await import('#/client');

      expect(clientModule).toHaveProperty('createClientAnalytics');
      expect(clientModule).toHaveProperty('createClientAnalyticsUninitialized');
    });
  });

  describe('client-next.ts exports', () => {
    test('should export Next.js client functions', async () => {
      // Mock environment variables to prevent server-side access on client
      const mockEnv = {
        NODE_ENV: 'test',
        OBSERVABILITY_DEBUG: false,
        NEXT_PUBLIC_NODE_ENV: 'test',
        NEXT_PUBLIC_OBSERVABILITY_DEBUG: false,
      };

      // Mock the observability env module to prevent server-side access
      vi.doMock('@repo/observability/env', () => ({
        env: mockEnv,
        safeEnv: () => mockEnv,
      }));

      const clientNextModule = await import('#/client-next');

      expect(clientNextModule).toHaveProperty('createNextJSClientAnalytics');
      expect(clientNextModule).toHaveProperty('createNextJSClientAnalyticsUninitialized');
    });
  });

  describe('server.ts exports', () => {
    test('should export server functions', async () => {
      const serverModule = await import('#/server');

      expect(serverModule).toHaveProperty('createServerAnalytics');
      expect(serverModule).toHaveProperty('createServerAnalyticsUninitialized');
    });
  });

  describe('server-next.ts exports', () => {
    test('should export Next.js server functions', async () => {
      const serverNextModule = await import('#/server-next');

      expect(serverNextModule).toHaveProperty('createServerAnalytics');
      expect(serverNextModule).toHaveProperty('createServerAnalyticsUninitialized');
    });
  });

  describe('shared.ts exports', () => {
    test('should export environment-agnostic functions', async () => {
      const sharedModule = await import('#/shared');

      expect(sharedModule).toHaveProperty('createAnalytics');
      expect(sharedModule).toHaveProperty('environmentInfo');
    });

    test('should provide environment information', async () => {
      const { environmentInfo } = await import('#/shared');

      expect(environmentInfo).toHaveProperty('isServer');
      expect(environmentInfo).toHaveProperty('isNextJS');
      expect(environmentInfo).toHaveProperty('runtime');
      expect(environmentInfo).toHaveProperty('nodeEnv');
    });
  });
});
