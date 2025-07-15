/**
 * Tests for utility imports and basic functionality
 */

import { describe, expect, it } from 'vitest';

describe('Utility Imports', () => {
  describe('config utilities', () => {
    it('should import config utilities without errors', async () => {
      const configModule = await import('@/shared/utils/config');

      expect(configModule).toHaveProperty('validateConfig');
      expect(configModule).toHaveProperty('createConfigBuilder');
      expect(configModule).toHaveProperty('getAnalyticsConfig');
      expect(configModule).toHaveProperty('PROVIDER_REQUIREMENTS');

      expect(typeof configModule.validateConfig).toBe('function');
      expect(typeof configModule.createConfigBuilder).toBe('function');
      expect(typeof configModule.getAnalyticsConfig).toBe('function');
      expect(typeof configModule.PROVIDER_REQUIREMENTS).toBe('object');
    });

    it('should import client config utilities without errors', async () => {
      const configClientModule = await import('@/shared/utils/config-client');

      expect(configClientModule).toHaveProperty('validateConfig');
      expect(configClientModule).toHaveProperty('createConfigBuilder');
      expect(configClientModule).toHaveProperty('getAnalyticsConfig');
      expect(configClientModule).toHaveProperty('PROVIDER_REQUIREMENTS');
    });
  });

  describe('validation utilities', () => {
    it('should import validation utilities without errors', async () => {
      const validationModule = await import('@/shared/utils/validation');

      expect(validationModule).toHaveProperty('validateAnalyticsConfig');
      expect(validationModule).toHaveProperty('validateProvider');
      expect(validationModule).toHaveProperty('validateEnvironmentVariables');
      expect(validationModule).toHaveProperty('validateConfigOrThrow');

      expect(typeof validationModule.validateAnalyticsConfig).toBe('function');
      expect(typeof validationModule.validateProvider).toBe('function');
      expect(typeof validationModule.validateEnvironmentVariables).toBe('function');
      expect(typeof validationModule.validateConfigOrThrow).toBe('function');
    });

    it('should import client validation utilities without errors', async () => {
      const validationClientModule = await import('@/shared/utils/validation-client');

      expect(validationClientModule).toHaveProperty('validateAnalyticsConfig');
      expect(validationClientModule).toHaveProperty('validateProvider');
      expect(validationClientModule).toHaveProperty('validateConfig');
    });
  });

  describe('manager utilities', () => {
    it('should import manager utilities without errors', async () => {
      const managerModule = await import('@/shared/utils/manager');

      expect(managerModule).toHaveProperty('AnalyticsManager');
      expect(managerModule).toHaveProperty('createAnalyticsManager');

      expect(typeof managerModule.AnalyticsManager).toBe('function');
      expect(typeof managerModule.createAnalyticsManager).toBe('function');
    });
  });

  describe('emitter adapter utilities', () => {
    it('should import emitter adapter utilities without errors', async () => {
      const adapterModule = await import('@/shared/utils/emitter-adapter');

      expect(adapterModule).toHaveProperty('processEmitterPayload');
      expect(adapterModule).toHaveProperty('processIdentifyPayload');
      expect(adapterModule).toHaveProperty('processTrackPayload');
      expect(adapterModule).toHaveProperty('processPagePayload');
      expect(adapterModule).toHaveProperty('processGroupPayload');
      expect(adapterModule).toHaveProperty('processAliasPayload');
      expect(adapterModule).toHaveProperty('createEmitterProcessor');
      expect(adapterModule).toHaveProperty('trackEcommerceEvent');

      expect(typeof adapterModule.processEmitterPayload).toBe('function');
      expect(typeof adapterModule.createEmitterProcessor).toBe('function');
      expect(typeof adapterModule.trackEcommerceEvent).toBe('function');
    });
  });

  describe('PostHog utilities', () => {
    it('should import PostHog bootstrap utilities without errors', async () => {
      const bootstrapModule = await import('@/shared/utils/posthog-bootstrap');

      expect(bootstrapModule).toHaveProperty('generateDistinctId');
      expect(bootstrapModule).toHaveProperty('parsePostHogCookie');
      expect(bootstrapModule).toHaveProperty('getPostHogCookieName');
      expect(bootstrapModule).toHaveProperty('createBootstrapData');
      expect(bootstrapModule).toHaveProperty('createMinimalBootstrapData');
      expect(bootstrapModule).toHaveProperty('validateBootstrapData');

      expect(typeof bootstrapModule.generateDistinctId).toBe('function');
      expect(typeof bootstrapModule.createBootstrapData).toBe('function');
      expect(typeof bootstrapModule.validateBootstrapData).toBe('function');
    });

    it('should import PostHog client utilities without errors', async () => {
      expect(async () => {
        await import('@/shared/utils/posthog-client-utils');
      }).not.toThrow();
    });

    it('should import PostHog Next.js utilities without errors', async () => {
      expect(async () => {
        await import('@/shared/utils/posthog-next-utils');
      }).not.toThrow();
    });

    it('should import PostHog server utilities without errors', async () => {
      expect(async () => {
        await import('@/shared/utils/posthog-server-utils');
      }).not.toThrow();
    });
  });
});
