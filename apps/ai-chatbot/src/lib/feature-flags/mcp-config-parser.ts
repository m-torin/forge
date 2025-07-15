/**
 * MCP Configuration Parser
 * Handles parsing and validation of JSON-based MCP feature flag configuration
 */

import { logError, logWarn } from '@repo/observability';
import { z } from 'zod/v4';

/**
 * Zod schema for MCP configuration
 */
export const McpConfigSchema = z
  .object({
    enabled: z.boolean().default(true),
    rolloutPercentage: z.number().min(0).max(100).default(100),
    features: z
      .object({
        enhanced: z.boolean().default(true),
        errorHandling: z.boolean().default(true),
        streamLifecycle: z.boolean().default(true),
        healthMonitoring: z.boolean().default(true),
        gracefulDegradation: z.boolean().default(true),
        demoMode: z.boolean().default(true),
        connectionPooling: z.boolean().default(true),
        analytics: z.boolean().default(true),
      })
      .default(() => ({
        enhanced: true,
        errorHandling: true,
        streamLifecycle: true,
        healthMonitoring: true,
        gracefulDegradation: true,
        demoMode: true,
        connectionPooling: true,
        analytics: true,
      })),
  })
  .default(() => ({
    enabled: true,
    rolloutPercentage: 100,
    features: {
      enhanced: true,
      errorHandling: true,
      streamLifecycle: true,
      healthMonitoring: true,
      gracefulDegradation: true,
      demoMode: true,
      connectionPooling: true,
      analytics: true,
    },
  }));

/**
 * TypeScript interface for MCP configuration
 */
export type McpConfig = z.infer<typeof McpConfigSchema>;

/**
 * Default MCP configuration with all features enabled
 */
export const DEFAULT_MCP_CONFIG: McpConfig = {
  enabled: true,
  rolloutPercentage: 100,
  features: {
    enhanced: true,
    errorHandling: true,
    streamLifecycle: true,
    healthMonitoring: true,
    gracefulDegradation: true,
    demoMode: true,
    connectionPooling: true,
    analytics: true,
  },
};

/**
 * Parse MCP configuration from JSON string with fallback to defaults
 */
export function parseMcpConfig(jsonString?: string): McpConfig {
  if (!jsonString) {
    return DEFAULT_MCP_CONFIG;
  }

  try {
    const parsed = JSON.parse(jsonString);
    const validated = McpConfigSchema.parse(parsed);

    logWarn('MCP configuration loaded from JSON', {
      operation: 'mcp_config_parsing',
      metadata: {
        enabled: validated.enabled,
        rolloutPercentage: validated.rolloutPercentage,
        enabledFeatures: Object.entries(validated.features)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key),
      },
    });

    return validated;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logError('Failed to parse MCP configuration JSON, using defaults', {
      operation: 'mcp_config_parse_error',
      metadata: {
        jsonString: jsonString.substring(0, 200), // Log first 200 chars for debugging
        error: errorMessage,
        fallbackUsed: true,
      },
      error: error instanceof Error ? error : new Error(errorMessage),
    });

    return DEFAULT_MCP_CONFIG;
  }
}

/**
 * Parse MCP configuration from legacy environment variables
 * Provides backward compatibility during migration
 */
export function parseMcpConfigFromLegacyEnv(env: {
  MCP_FEATURE_FLAGS_ENABLED?: boolean;
  MCP_ROLLOUT_PERCENTAGE?: number;
  MCP_ENHANCED_MODE_ENABLED?: boolean;
  MCP_ERROR_HANDLING_ENABLED?: boolean;
  MCP_STREAM_LIFECYCLE_ENABLED?: boolean;
  MCP_HEALTH_MONITORING_ENABLED?: boolean;
  MCP_GRACEFUL_DEGRADATION_ENABLED?: boolean;
  NEXT_PUBLIC_MCP_DEMO_MODE?: boolean;
  NODE_ENV?: string;
}): McpConfig {
  const config: McpConfig = {
    enabled: env.MCP_FEATURE_FLAGS_ENABLED ?? true,
    rolloutPercentage: env.MCP_ROLLOUT_PERCENTAGE ?? 100,
    features: {
      enhanced: env.MCP_ENHANCED_MODE_ENABLED ?? true,
      errorHandling: env.MCP_ERROR_HANDLING_ENABLED ?? true,
      streamLifecycle: env.MCP_STREAM_LIFECYCLE_ENABLED ?? true,
      healthMonitoring: env.MCP_HEALTH_MONITORING_ENABLED ?? true,
      gracefulDegradation: env.MCP_GRACEFUL_DEGRADATION_ENABLED ?? true,
      demoMode: env.NODE_ENV === 'development' || (env.NEXT_PUBLIC_MCP_DEMO_MODE ?? true),
      connectionPooling: env.NODE_ENV === 'production',
      analytics: env.NODE_ENV === 'production',
    },
  };

  logWarn('MCP configuration created from legacy environment variables', {
    operation: 'mcp_config_legacy_migration',
    metadata: {
      enabled: config.enabled,
      rolloutPercentage: config.rolloutPercentage,
      enabledFeatures: Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
      legacyVarsFound: Object.keys(env).filter(key => key.startsWith('MCP_')).length,
    },
  });

  return config;
}

/**
 * Merge user-provided JSON config with legacy environment variables
 * Prioritizes JSON config when both are available
 */
export function getMcpConfigWithFallback(
  jsonConfig?: string,
  legacyEnv?: {
    MCP_FEATURE_FLAGS_ENABLED?: boolean;
    MCP_ROLLOUT_PERCENTAGE?: number;
    MCP_ENHANCED_MODE_ENABLED?: boolean;
    MCP_ERROR_HANDLING_ENABLED?: boolean;
    MCP_STREAM_LIFECYCLE_ENABLED?: boolean;
    MCP_HEALTH_MONITORING_ENABLED?: boolean;
    MCP_GRACEFUL_DEGRADATION_ENABLED?: boolean;
    NEXT_PUBLIC_MCP_DEMO_MODE?: boolean;
    NODE_ENV?: string;
  },
): McpConfig {
  // If JSON config is provided, use it (with fallback to default on parse error)
  if (jsonConfig) {
    return parseMcpConfig(jsonConfig);
  }

  // If legacy environment variables are available, use them
  if (legacyEnv && Object.keys(legacyEnv).some(key => key.startsWith('MCP_'))) {
    return parseMcpConfigFromLegacyEnv(legacyEnv);
  }

  // Otherwise, use default configuration
  return DEFAULT_MCP_CONFIG;
}

/**
 * Serialize MCP configuration to JSON string for storage
 */
export function serializeMcpConfig(config: McpConfig): string {
  try {
    return JSON.stringify(config, null, 2);
  } catch (error) {
    logError('Failed to serialize MCP configuration', {
      operation: 'mcp_config_serialization_error',
      metadata: { config },
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return JSON.stringify(DEFAULT_MCP_CONFIG, null, 2);
  }
}

/**
 * Validate that a configuration object matches the expected schema
 * Uses strict validation without applying defaults
 */
export function validateMcpConfig(config: unknown): config is McpConfig {
  if (config === null || config === undefined) {
    return false;
  }

  try {
    // Create a schema without defaults for strict validation
    const StrictMcpConfigSchema = z.object({
      enabled: z.boolean(),
      rolloutPercentage: z.number().min(0).max(100),
      features: z.object({
        enhanced: z.boolean(),
        errorHandling: z.boolean(),
        streamLifecycle: z.boolean(),
        healthMonitoring: z.boolean(),
        gracefulDegradation: z.boolean(),
        demoMode: z.boolean(),
        connectionPooling: z.boolean(),
        analytics: z.boolean(),
      }),
    });

    StrictMcpConfigSchema.parse(config);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get configuration summary for debugging and monitoring
 */
export function getMcpConfigSummary(config: McpConfig): {
  enabled: boolean;
  rolloutPercentage: number;
  enabledFeatures: string[];
  disabledFeatures: string[];
  totalFeatures: number;
} {
  const enabledFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const disabledFeatures = Object.entries(config.features)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key);

  return {
    enabled: config.enabled,
    rolloutPercentage: config.rolloutPercentage,
    enabledFeatures,
    disabledFeatures,
    totalFeatures: Object.keys(config.features).length,
  };
}
