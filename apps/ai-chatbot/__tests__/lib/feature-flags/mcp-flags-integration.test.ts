/**
 * Integration tests for MCP Feature Flags with JSON Configuration
 * Tests the interaction between JSON config parsing and flag evaluation
 */

import {
  DEFAULT_MCP_CONFIG,
  getMcpConfigWithFallback,
  parseMcpConfig,
} from '#/lib/feature-flags/mcp-config-parser';
import { describe, expect } from 'vitest';

describe('mCP Configuration Integration Tests', () => {
  describe('jSON Configuration Scenarios', () => {
    test('should handle complete configuration scenarios', () => {
      // Test complete JSON configuration
      const completeConfig = JSON.stringify({
        enabled: true,
        rolloutPercentage: 75,
        features: {
          enhanced: true,
          errorHandling: false,
          streamLifecycle: true,
          healthMonitoring: false,
          gracefulDegradation: true,
          demoMode: false,
          connectionPooling: true,
          analytics: false,
        },
      });

      const config = parseMcpConfig(completeConfig);

      expect(config.enabled).toBeTruthy();
      expect(config.rolloutPercentage).toBe(75);
      expect(config.features.enhanced).toBeTruthy();
      expect(config.features.errorHandling).toBeFalsy();
      expect(config.features.streamLifecycle).toBeTruthy();
      expect(config.features.healthMonitoring).toBeFalsy();
      expect(config.features.gracefulDegradation).toBeTruthy();
      expect(config.features.demoMode).toBeFalsy();
      expect(config.features.connectionPooling).toBeTruthy();
      expect(config.features.analytics).toBeFalsy();
    });

    test('should handle legacy environment variable fallback', () => {
      // Test fallback to legacy environment variables
      const legacyEnv = {
        MCP_FEATURE_FLAGS_ENABLED: true,
        MCP_ROLLOUT_PERCENTAGE: 60,
        MCP_ENHANCED_MODE_ENABLED: false,
        MCP_ERROR_HANDLING_ENABLED: true,
        NODE_ENV: 'development' as const,
      };

      const config = getMcpConfigWithFallback(undefined, legacyEnv);

      expect(config.enabled).toBeTruthy();
      expect(config.rolloutPercentage).toBe(60);
      expect(config.features.enhanced).toBeFalsy();
      expect(config.features.errorHandling).toBeTruthy();
      expect(config.features.demoMode).toBeTruthy(); // Always true in development
    });

    test('should prioritize JSON over legacy environment variables', () => {
      const jsonConfig = JSON.stringify({
        enabled: false,
        rolloutPercentage: 25,
        features: { enhanced: false },
      });

      const legacyEnv = {
        MCP_FEATURE_FLAGS_ENABLED: true,
        MCP_ROLLOUT_PERCENTAGE: 75,
        MCP_ENHANCED_MODE_ENABLED: true,
      };

      const config = getMcpConfigWithFallback(jsonConfig, legacyEnv);

      // Should use JSON values, not legacy env values
      expect(config.enabled).toBeFalsy();
      expect(config.rolloutPercentage).toBe(25);
      expect(config.features.enhanced).toBeFalsy();
    });

    test('should handle malformed JSON gracefully', () => {
      const malformedJson = '{ invalid json }';
      const config = getMcpConfigWithFallback(malformedJson);

      // Should fall back to defaults
      expect(config).toStrictEqual(DEFAULT_MCP_CONFIG);
    });

    test('should validate configuration schemas correctly', () => {
      // Valid configuration
      const validConfig = {
        enabled: true,
        rolloutPercentage: 50,
        features: {
          enhanced: true,
          errorHandling: false,
          streamLifecycle: true,
          healthMonitoring: false,
          gracefulDegradation: true,
          demoMode: false,
          connectionPooling: true,
          analytics: false,
        },
      };

      const validJsonConfig = JSON.stringify(validConfig);
      const parsedConfig = parseMcpConfig(validJsonConfig);

      expect(parsedConfig).toStrictEqual(validConfig);
    });

    test('should handle environment-specific feature logic', () => {
      // Production environment configuration
      const prodConfig = getMcpConfigWithFallback(undefined, {
        NODE_ENV: 'production',
        MCP_FEATURE_FLAGS_ENABLED: true,
      });

      expect(prodConfig.features.connectionPooling).toBeTruthy();
      expect(prodConfig.features.analytics).toBeTruthy();

      // Development environment configuration
      const devConfig = getMcpConfigWithFallback(undefined, {
        NODE_ENV: 'development',
        MCP_FEATURE_FLAGS_ENABLED: true,
        NEXT_PUBLIC_MCP_DEMO_MODE: false, // Should be overridden
      });

      expect(devConfig.features.demoMode).toBeTruthy(); // Always true in development
      expect(devConfig.features.connectionPooling).toBeFalsy(); // False in development
      expect(devConfig.features.analytics).toBeFalsy(); // False in development
    });

    test('should maintain feature interdependencies', () => {
      const configWithDisabledMaster = JSON.stringify({
        enabled: false, // Master toggle off
        features: {
          enhanced: true,
          errorHandling: true,
          streamLifecycle: true,
          healthMonitoring: true,
          gracefulDegradation: true,
          demoMode: true,
        },
      });

      const config = parseMcpConfig(configWithDisabledMaster);

      expect(config.enabled).toBeFalsy();
      // Individual features are parsed correctly
      expect(config.features.enhanced).toBeTruthy();
      expect(config.features.errorHandling).toBeTruthy();
      // But they would be disabled by the evaluation logic due to enabled: false
    });

    test('should handle partial configurations with defaults', () => {
      const partialConfig = JSON.stringify({
        enabled: true,
        features: {
          enhanced: false,
          // Other features should get defaults
        },
      });

      const config = parseMcpConfig(partialConfig);

      expect(config.enabled).toBeTruthy();
      expect(config.rolloutPercentage).toBe(100); // default
      expect(config.features.enhanced).toBeFalsy(); // explicitly set
      expect(config.features.errorHandling).toBeTruthy(); // default
      expect(config.features.gracefulDegradation).toBeTruthy(); // default
    });

    test('should handle edge cases in rollout percentage', () => {
      const zeroRollout = JSON.stringify({
        enabled: true,
        rolloutPercentage: 0,
        features: { enhanced: true },
      });

      const config1 = parseMcpConfig(zeroRollout);
      expect(config1.rolloutPercentage).toBe(0);

      const fullRollout = JSON.stringify({
        enabled: true,
        rolloutPercentage: 100,
        features: { enhanced: true },
      });

      const config2 = parseMcpConfig(fullRollout);
      expect(config2.rolloutPercentage).toBe(100);

      // Invalid rollout percentage should fall back to defaults
      const invalidRollout = JSON.stringify({
        enabled: true,
        rolloutPercentage: 150, // Invalid
        features: { enhanced: true },
      });

      const config3 = parseMcpConfig(invalidRollout);
      expect(config3).toStrictEqual(DEFAULT_MCP_CONFIG);
    });
  });
});
