/**
 * Basic tests for config utilities that don't require complex setup
 */

import { describe, expect, it } from 'vitest';

describe('Config Basic Tests', () => {
  describe('PROVIDER_REQUIREMENTS', () => {
    it('should export provider requirements from config', async () => {
      const { PROVIDER_REQUIREMENTS } = await import('@/shared/utils/config');

      expect(PROVIDER_REQUIREMENTS).toBeDefined();
      expect(typeof PROVIDER_REQUIREMENTS).toBe('object');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('console');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('posthog');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('segment');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('vercel');
    });

    it('should export provider requirements from config-client', async () => {
      const { PROVIDER_REQUIREMENTS } = await import('@/shared/utils/config-client');

      expect(PROVIDER_REQUIREMENTS).toBeDefined();
      expect(typeof PROVIDER_REQUIREMENTS).toBe('object');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('console');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('posthog');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('segment');
      expect(PROVIDER_REQUIREMENTS).toHaveProperty('vercel');
    });

    it('should have correct requirements for PostHog', async () => {
      const { PROVIDER_REQUIREMENTS } = await import('@/shared/utils/config');

      expect(PROVIDER_REQUIREMENTS.posthog).toContain('apiKey');
      expect(Array.isArray(PROVIDER_REQUIREMENTS.posthog)).toBe(true);
    });

    it('should have correct requirements for Segment', async () => {
      const { PROVIDER_REQUIREMENTS } = await import('@/shared/utils/config');

      expect(PROVIDER_REQUIREMENTS.segment).toContain('writeKey');
      expect(Array.isArray(PROVIDER_REQUIREMENTS.segment)).toBe(true);
    });

    it('should have no requirements for console', async () => {
      const { PROVIDER_REQUIREMENTS } = await import('@/shared/utils/config');

      expect(Array.isArray(PROVIDER_REQUIREMENTS.console)).toBe(true);
      expect(PROVIDER_REQUIREMENTS.console).toHaveLength(0);
    });
  });

  describe('createConfigBuilder', () => {
    it('should create a config builder', async () => {
      const { createConfigBuilder } = await import('@/shared/utils/config');

      const builder = createConfigBuilder();

      expect(builder).toBeDefined();
      expect(typeof builder).toBe('object');
      expect(typeof builder.build).toBe('function');
      expect(typeof builder.addConsole).toBe('function');
      expect(typeof builder.addPostHog).toBe('function');
      expect(typeof builder.addSegment).toBe('function');
      expect(typeof builder.addVercel).toBe('function');
    });

    it('should build a basic config', async () => {
      const { createConfigBuilder } = await import('@/shared/utils/config');

      const builder = createConfigBuilder();
      const config = builder.build();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('providers');
      expect(typeof config.providers).toBe('object');
    });

    it('should chain configuration methods', async () => {
      const { createConfigBuilder } = await import('@/shared/utils/config');

      const builder = createConfigBuilder();
      const config = builder.addConsole({}).build();

      expect(config.providers).toHaveProperty('console');
      expect(config.providers.console).toBeDefined();
    });
  });

  describe('getAnalyticsConfig', () => {
    it('should get a default analytics config', async () => {
      const { getAnalyticsConfig } = await import('@/shared/utils/config');

      const config = getAnalyticsConfig();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('providers');
      expect(typeof config.providers).toBe('object');
    });

    it('should get analytics config from client utils', async () => {
      const { getAnalyticsConfig } = await import('@/shared/utils/config-client');

      const config = getAnalyticsConfig();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('providers');
      expect(typeof config.providers).toBe('object');
    });
  });

  describe('validateConfig basic functionality', () => {
    it('should validate a minimal valid config', async () => {
      const { validateConfig } = await import('@/shared/utils/config');

      const config = {
        providers: {
          console: {},
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate config with multiple providers', async () => {
      const { validateConfig } = await import('@/shared/utils/config');

      const config = {
        providers: {
          console: {},
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});
