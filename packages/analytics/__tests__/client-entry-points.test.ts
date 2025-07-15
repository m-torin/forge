/**
 * Tests for client entry points and exports
 */

import { describe, expect, it } from 'vitest';

describe('Client Entry Points', () => {
  describe('client.ts exports', () => {
    it('should export main client functions', async () => {
      const clientModule = await import('@/client');

      expect(clientModule).toHaveProperty('createClientAnalytics');
      expect(clientModule).toHaveProperty('createClientAnalyticsUninitialized');
    });
  });

  describe('client-next.ts exports', () => {
    it('should export Next.js client functions', async () => {
      const clientNextModule = await import('@/client-next');

      expect(clientNextModule).toHaveProperty('createNextJSClientAnalytics');
      expect(clientNextModule).toHaveProperty('createNextJSClientAnalyticsUninitialized');
    });
  });

  describe('server.ts exports', () => {
    it('should export server functions', async () => {
      const serverModule = await import('@/server');

      expect(serverModule).toHaveProperty('createServerAnalytics');
      expect(serverModule).toHaveProperty('createServerAnalyticsUninitialized');
    });
  });

  describe('server-next.ts exports', () => {
    it('should export Next.js server functions', async () => {
      const serverNextModule = await import('@/server-next');

      expect(serverNextModule).toHaveProperty('createServerAnalytics');
      expect(serverNextModule).toHaveProperty('createServerAnalyticsUninitialized');
    });
  });

  describe('shared-env.ts exports', () => {
    it('should export environment-agnostic functions', async () => {
      const sharedEnvModule = await import('@/shared-env');

      expect(sharedEnvModule).toHaveProperty('createAnalytics');
      expect(sharedEnvModule).toHaveProperty('environmentInfo');
    });

    it('should provide environment information', async () => {
      const { environmentInfo } = await import('@/shared-env');

      expect(environmentInfo).toHaveProperty('isServer');
      expect(environmentInfo).toHaveProperty('isNextJS');
      expect(environmentInfo).toHaveProperty('runtime');
      expect(environmentInfo).toHaveProperty('nodeEnv');
    });
  });
});
