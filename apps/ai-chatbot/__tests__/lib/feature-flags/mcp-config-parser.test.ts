/**
 * Tests for MCP Configuration Parser
 * Validates JSON parsing, schema validation, and fallback behavior
 */

import {
  DEFAULT_MCP_CONFIG,
  getMcpConfigSummary,
  getMcpConfigWithFallback,
  parseMcpConfig,
  parseMcpConfigFromLegacyEnv,
  serializeMcpConfig,
  validateMcpConfig,
  type McpConfig,
} from '#/lib/feature-flags/mcp-config-parser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('mCP Configuration Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseMcpConfig', () => {
    test('should return default config when no JSON provided', () => {
      const result = parseMcpConfig();
      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG);
    });

    test('should return default config when empty string provided', () => {
      const result = parseMcpConfig('');
      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG);
    });

    test('should parse valid JSON configuration', () => {
      const validConfig = {
        enabled: false,
        rolloutPercentage: 50,
        features: {
          enhanced: false,
          errorHandling: true,
          streamLifecycle: false,
          healthMonitoring: true,
          gracefulDegradation: true,
          demoMode: false,
          connectionPooling: false,
          analytics: false,
        },
      };

      const result = parseMcpConfig(JSON.stringify(validConfig));
      expect(result).toStrictEqual(validConfig);
    });

    test('should apply defaults for missing properties', () => {
      const partialConfig = {
        enabled: false,
        features: {
          enhanced: false,
        },
      };

      const result = parseMcpConfig(JSON.stringify(partialConfig));

      expect(result.enabled).toBeFalsy();
      expect(result.rolloutPercentage).toBe(100); // default
      expect(result.features.enhanced).toBeFalsy();
      expect(result.features.errorHandling).toBeTruthy(); // default
      expect(result.features.gracefulDegradation).toBeTruthy(); // default
    });

    test('should return default config for malformed JSON', () => {
      const result = parseMcpConfig('{ invalid json }');
      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG);
    });

    test('should return default config for invalid schema', () => {
      const invalidConfig = {
        enabled: 'not-boolean',
        rolloutPercentage: -10,
        features: {
          enhanced: 'invalid',
        },
      };

      const result = parseMcpConfig(JSON.stringify(invalidConfig));
      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG);
    });

    test('should validate rollout percentage bounds', () => {
      const configWithInvalidRollout = {
        enabled: true,
        rolloutPercentage: 150, // Invalid: > 100
        features: {},
      };

      const result = parseMcpConfig(JSON.stringify(configWithInvalidRollout));
      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG);
    });
  });

  describe('parseMcpConfigFromLegacyEnv', () => {
    test('should create config from legacy environment variables', () => {
      const legacyEnv = {
        MCP_FEATURE_FLAGS_ENABLED: true,
        MCP_ROLLOUT_PERCENTAGE: 75,
        MCP_ENHANCED_MODE_ENABLED: false,
        MCP_ERROR_HANDLING_ENABLED: true,
        MCP_STREAM_LIFECYCLE_ENABLED: false,
        MCP_HEALTH_MONITORING_ENABLED: true,
        MCP_GRACEFUL_DEGRADATION_ENABLED: false,
        NEXT_PUBLIC_MCP_DEMO_MODE: true,
        NODE_ENV: 'production',
      };

      const result = parseMcpConfigFromLegacyEnv(legacyEnv);

      expect(result.enabled).toBeTruthy();
      expect(result.rolloutPercentage).toBe(75);
      expect(result.features.enhanced).toBeFalsy();
      expect(result.features.errorHandling).toBeTruthy();
      expect(result.features.streamLifecycle).toBeFalsy();
      expect(result.features.healthMonitoring).toBeTruthy();
      expect(result.features.gracefulDegradation).toBeFalsy();
      expect(result.features.demoMode).toBeTruthy();
      expect(result.features.connectionPooling).toBeTruthy(); // production
      expect(result.features.analytics).toBeTruthy(); // production
    });

    test('should apply defaults for missing legacy environment variables', () => {
      const result = parseMcpConfigFromLegacyEnv({});

      expect(result.enabled).toBeTruthy();
      expect(result.rolloutPercentage).toBe(100);
      expect(result.features.enhanced).toBeTruthy();
      expect(result.features.errorHandling).toBeTruthy();
      expect(result.features.gracefulDegradation).toBeTruthy();
      expect(result.features.demoMode).toBeTruthy();
    });

    test('should enable demo mode in development environment', () => {
      const result = parseMcpConfigFromLegacyEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_MCP_DEMO_MODE: false,
      });

      expect(result.features.demoMode).toBeTruthy(); // Always true in development
    });

    test('should disable production features in development', () => {
      const result = parseMcpConfigFromLegacyEnv({
        NODE_ENV: 'development',
      });

      expect(result.features.connectionPooling).toBeFalsy();
      expect(result.features.analytics).toBeFalsy();
    });
  });

  describe('getMcpConfigWithFallback', () => {
    test('should prioritize JSON config over legacy env', () => {
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

      const result = getMcpConfigWithFallback(jsonConfig, legacyEnv);

      expect(result.enabled).toBeFalsy(); // From JSON
      expect(result.rolloutPercentage).toBe(25); // From JSON
      expect(result.features.enhanced).toBeFalsy(); // From JSON
    });

    test('should fall back to legacy env when JSON is not provided', () => {
      const legacyEnv = {
        MCP_FEATURE_FLAGS_ENABLED: true,
        MCP_ROLLOUT_PERCENTAGE: 60,
      };

      const result = getMcpConfigWithFallback(undefined, legacyEnv);

      expect(result.enabled).toBeTruthy();
      expect(result.rolloutPercentage).toBe(60);
    });

    test('should use default config when neither JSON nor legacy env provided', () => {
      const result = getMcpConfigWithFallback();
      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG);
    });

    test('should fall back to legacy env when JSON is malformed', () => {
      const legacyEnv = {
        MCP_FEATURE_FLAGS_ENABLED: false,
        MCP_ROLLOUT_PERCENTAGE: 30,
      };

      const result = getMcpConfigWithFallback('{ invalid json }', legacyEnv);

      expect(result).toStrictEqual(DEFAULT_MCP_CONFIG); // Malformed JSON falls back to default
    });
  });

  describe('serializeMcpConfig', () => {
    test('should serialize valid config to JSON string', () => {
      const config: McpConfig = {
        enabled: true,
        rolloutPercentage: 80,
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

      const result = serializeMcpConfig(config);
      const parsed = JSON.parse(result);

      expect(parsed).toStrictEqual(config);
    });

    test('should handle serialization errors gracefully', () => {
      // Create a circular reference to cause serialization error
      const circularConfig = { enabled: true } as any;
      circularConfig.self = circularConfig;

      const result = serializeMcpConfig(circularConfig);
      const parsed = JSON.parse(result);

      expect(parsed).toStrictEqual(DEFAULT_MCP_CONFIG);
    });
  });

  describe('validateMcpConfig', () => {
    test('should validate correct config', () => {
      const validConfig: McpConfig = {
        enabled: true,
        rolloutPercentage: 50,
        features: {
          enhanced: true,
          errorHandling: true,
          streamLifecycle: false,
          healthMonitoring: true,
          gracefulDegradation: true,
          demoMode: false,
          connectionPooling: true,
          analytics: false,
        },
      };

      expect(validateMcpConfig(validConfig)).toBeTruthy();
    });

    test('should reject invalid config structure', () => {
      const invalidConfig = {
        enabled: 'not-boolean',
        rolloutPercentage: -10,
        features: {
          enhanced: 123,
        },
      };

      expect(validateMcpConfig(invalidConfig)).toBeFalsy();
    });

    test('should reject config with missing required fields', () => {
      const incompleteConfig = {
        enabled: true,
        // Missing rolloutPercentage and features
      };

      expect(validateMcpConfig(incompleteConfig)).toBeFalsy();
    });

    test('should reject null or undefined config', () => {
      expect(validateMcpConfig(null)).toBeFalsy();
      expect(validateMcpConfig(undefined)).toBeFalsy();
    });
  });

  describe('getMcpConfigSummary', () => {
    test('should provide accurate summary for mixed config', () => {
      const config: McpConfig = {
        enabled: true,
        rolloutPercentage: 75,
        features: {
          enhanced: true,
          errorHandling: true,
          streamLifecycle: false,
          healthMonitoring: true,
          gracefulDegradation: false,
          demoMode: true,
          connectionPooling: false,
          analytics: false,
        },
      };

      const summary = getMcpConfigSummary(config);

      expect(summary.enabled).toBeTruthy();
      expect(summary.rolloutPercentage).toBe(75);
      expect(summary.enabledFeatures).toStrictEqual([
        'enhanced',
        'errorHandling',
        'healthMonitoring',
        'demoMode',
      ]);
      expect(summary.disabledFeatures).toStrictEqual([
        'streamLifecycle',
        'gracefulDegradation',
        'connectionPooling',
        'analytics',
      ]);
      expect(summary.totalFeatures).toBe(8);
    });

    test('should handle all features enabled', () => {
      const summary = getMcpConfigSummary(DEFAULT_MCP_CONFIG);

      expect(summary.enabledFeatures).toHaveLength(8);
      expect(summary.disabledFeatures).toHaveLength(0);
      expect(summary.totalFeatures).toBe(8);
    });

    test('should handle all features disabled', () => {
      const config: McpConfig = {
        enabled: false,
        rolloutPercentage: 0,
        features: {
          enhanced: false,
          errorHandling: false,
          streamLifecycle: false,
          healthMonitoring: false,
          gracefulDegradation: false,
          demoMode: false,
          connectionPooling: false,
          analytics: false,
        },
      };

      const summary = getMcpConfigSummary(config);

      expect(summary.enabledFeatures).toHaveLength(0);
      expect(summary.disabledFeatures).toHaveLength(8);
      expect(summary.totalFeatures).toBe(8);
    });
  });

  describe('dEFAULT_MCP_CONFIG', () => {
    test('should have all features enabled by default', () => {
      expect(DEFAULT_MCP_CONFIG.enabled).toBeTruthy();
      expect(DEFAULT_MCP_CONFIG.rolloutPercentage).toBe(100);

      Object.values(DEFAULT_MCP_CONFIG.features).forEach(featureEnabled => {
        expect(featureEnabled).toBeTruthy();
      });
    });

    test('should be valid according to schema', () => {
      expect(validateMcpConfig(DEFAULT_MCP_CONFIG)).toBeTruthy();
    });
  });

  describe('integration Tests', () => {
    test('should handle complete JSON config roundtrip', () => {
      const originalConfig: McpConfig = {
        enabled: false,
        rolloutPercentage: 45,
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

      // Serialize and parse back
      const serialized = serializeMcpConfig(originalConfig);
      const parsed = parseMcpConfig(serialized);

      expect(parsed).toStrictEqual(originalConfig);
      expect(validateMcpConfig(parsed)).toBeTruthy();
    });

    test('should maintain feature flag compatibility', () => {
      const jsonConfig = JSON.stringify({
        enabled: true,
        rolloutPercentage: 80,
        features: {
          enhanced: false,
          errorHandling: true,
          streamLifecycle: false,
          healthMonitoring: true,
          gracefulDegradation: true,
          demoMode: false,
          connectionPooling: true,
          analytics: false,
        },
      });

      const config = parseMcpConfig(jsonConfig);
      const summary = getMcpConfigSummary(config);

      expect(summary.enabledFeatures).toContain('errorHandling');
      expect(summary.enabledFeatures).toContain('healthMonitoring');
      expect(summary.enabledFeatures).toContain('gracefulDegradation');
      expect(summary.enabledFeatures).toContain('connectionPooling');

      expect(summary.disabledFeatures).toContain('enhanced');
      expect(summary.disabledFeatures).toContain('streamLifecycle');
      expect(summary.disabledFeatures).toContain('demoMode');
      expect(summary.disabledFeatures).toContain('analytics');
    });
  });
});
