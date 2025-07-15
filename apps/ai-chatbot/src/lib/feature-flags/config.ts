/**
 * Feature flag configuration for MCP integration in ai-chatbot
 * Provides centralized configuration and validation for MCP feature flags
 */

import { env } from '#/root/env';
import { logInfo, logWarn } from '@repo/observability';
import { getMcpConfigWithFallback } from './mcp-config-parser';
import { allMcpFlags, evaluateAllMcpFlags } from './mcp-flags';

/**
 * Feature flag context interface
 */
export interface FeatureFlagContext {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  request?: {
    url?: string;
    userAgent?: string;
  };
  environment?: string;
  sessionId?: string;
}

/**
 * MCP feature configuration with metadata
 */
export interface McpFeatureConfig {
  key: string;
  description: string;
  enabled: boolean;
  dependencies?: string[];
  requirements?: string[];
  metadata?: Record<string, any>;
}

/**
 * Get MCP configuration based on current feature flags
 */
export function getMcpConfiguration(context: FeatureFlagContext = {}): {
  isEnhancedMode: boolean;
  isDemoMode: boolean;
  features: Record<string, McpFeatureConfig>;
  capabilities: string[];
  metadata: Record<string, any>;
} {
  const flags = evaluateAllMcpFlags(context);

  // Log feature flag evaluation for debugging
  if (env.NODE_ENV === 'development') {
    logInfo('MCP feature flags evaluated', {
      operation: 'feature_flag_evaluation',
      metadata: {
        context: {
          userId: context.user?.id,
          environment: env.NODE_ENV,
        },
        flags,
      },
    });
  }

  const features: Record<string, McpFeatureConfig> = {
    enhancedMcp: {
      key: 'enhanced-mcp',
      description: 'MCP client using @repo/ai functionality',
      enabled: flags.mcpEnabled,
      dependencies: ['@repo/ai'],
      requirements: ['MCP_ENHANCED_MODE_ENABLED=true'],
      metadata: {
        rolloutPercentage: getMcpConfigWithFallback(env.MCP_CONFIG || env.NEXT_PUBLIC_MCP_CONFIG)
          .rolloutPercentage,
        hasUserContext: !!context.user?.id,
      },
    },
    errorHandling: {
      key: 'error-handling',
      description: 'AI SDK v5 error handling integration',
      enabled: flags.errorHandlingEnabled,
      dependencies: ['enhanced-mcp'],
      requirements: ['MCP_ERROR_HANDLING_ENABLED=true'],
    },
    streamLifecycle: {
      key: 'stream-lifecycle',
      description: 'Advanced stream lifecycle management',
      enabled: flags.streamLifecycleEnabled,
      dependencies: ['enhanced-mcp'],
      requirements: ['MCP_STREAM_LIFECYCLE_ENABLED=true'],
    },
    healthMonitoring: {
      key: 'health-monitoring',
      description: 'MCP health monitoring and diagnostics',
      enabled: flags.healthMonitoringEnabled,
      dependencies: ['enhanced-mcp'],
      requirements: ['MCP_HEALTH_MONITORING_ENABLED=true'],
    },
    gracefulDegradation: {
      key: 'graceful-degradation',
      description: 'Graceful degradation for MCP failures',
      enabled: flags.gracefulDegradationEnabled,
      requirements: ['MCP_GRACEFUL_DEGRADATION_ENABLED=true'],
      metadata: {
        alwaysEnabledWhenFlagsOff: true,
      },
    },
    demoMode: {
      key: 'demo-mode',
      description: 'MCP demo mode with mock data',
      enabled: flags.demoModeEnabled,
      requirements: ['NEXT_PUBLIC_MCP_DEMO_MODE=true'],
      metadata: {
        alwaysEnabledInDevelopment: true,
        currentEnvironment: env.NODE_ENV,
      },
    },
    connectionPooling: {
      key: 'connection-pooling',
      description: 'MCP connection pooling and optimization',
      enabled: flags.connectionPoolingEnabled,
      dependencies: ['enhanced-mcp'],
      requirements: ['NODE_ENV=production'],
      metadata: {
        productionOnly: true,
      },
    },
    analytics: {
      key: 'analytics',
      description: 'MCP analytics and telemetry',
      enabled: flags.analyticsEnabled,
      dependencies: ['enhanced-mcp'],
      requirements: ['NODE_ENV=production'],
      metadata: {
        productionOnly: true,
      },
    },
  };

  // Determine capabilities based on enabled features
  const capabilities: string[] = [];
  if (features.enhancedMcp.enabled) capabilities.push('enhanced-mcp');
  if (features.errorHandling.enabled) capabilities.push('error-handling');
  if (features.streamLifecycle.enabled) capabilities.push('stream-lifecycle');
  if (features.healthMonitoring.enabled) capabilities.push('health-monitoring');
  if (features.gracefulDegradation.enabled) capabilities.push('graceful-degradation');
  if (features.demoMode.enabled) capabilities.push('demo-mode');
  if (features.connectionPooling.enabled) capabilities.push('connection-pooling');
  if (features.analytics.enabled) capabilities.push('analytics');

  // Validate dependencies
  const dependencyIssues: string[] = [];
  Object.entries(features).forEach(([featureKey, feature]) => {
    if (feature.enabled && feature.dependencies) {
      feature.dependencies.forEach(dep => {
        if (dep.startsWith('@repo/')) {
          // Package dependency - assume available if in package.json
          return;
        }

        // Feature dependency
        if (!capabilities.includes(dep)) {
          dependencyIssues.push(`Feature '${featureKey}' requires '${dep}' but it's not enabled`);
        }
      });
    }
  });

  if (dependencyIssues.length > 0) {
    logWarn('MCP feature flag dependency issues detected', {
      operation: 'feature_flag_validation',
      metadata: {
        issues: dependencyIssues,
        context: {
          userId: context.user?.id,
          environment: env.NODE_ENV,
        },
      },
    });
  }

  return {
    isEnhancedMode: flags.mcpEnabled,
    isDemoMode: flags.demoModeEnabled,
    features,
    capabilities,
    metadata: {
      masterToggleEnabled: flags.featureFlagsEnabled,
      rolloutPercentage: getMcpConfigWithFallback(env.MCP_CONFIG || env.NEXT_PUBLIC_MCP_CONFIG)
        .rolloutPercentage,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      dependencyIssues,
    },
  };
}

/**
 * Check if a specific MCP feature is enabled
 * Uses synchronous evaluation for compatibility
 */
export function isMcpFeatureEnabled(
  featureKey: keyof typeof allMcpFlags,
  context: FeatureFlagContext = {},
): boolean {
  // Use the synchronous evaluation function instead
  const flags = evaluateAllMcpFlags(context);

  switch (featureKey) {
    case 'mcpFeatureFlagsEnabled':
      return flags.featureFlagsEnabled;
    case 'mcpEnabled':
      return flags.mcpEnabled;
    case 'mcpErrorHandlingEnabled':
      return flags.errorHandlingEnabled;
    case 'mcpStreamLifecycleEnabled':
      return flags.streamLifecycleEnabled;
    case 'mcpHealthMonitoringEnabled':
      return flags.healthMonitoringEnabled;
    case 'mcpGracefulDegradationEnabled':
      return flags.gracefulDegradationEnabled;
    case 'mcpDemoModeEnabled':
      return flags.demoModeEnabled;
    case 'mcpConnectionPoolingEnabled':
      return flags.connectionPoolingEnabled;
    case 'mcpAnalyticsEnabled':
      return flags.analyticsEnabled;
    case 'ragEnabled':
      return flags.ragEnabled !== 'disabled';
    default:
      logWarn(`Unknown MCP feature flag: ${featureKey}`, {
        operation: 'feature_flag_check',
        metadata: { featureKey, availableFlags: Object.keys(allMcpFlags) },
      });
      return false;
  }
}

/**
 * Get RAG mode from feature flags
 */
export function getRagMode(context: FeatureFlagContext = {}): 'disabled' | 'mock' | 'enabled' {
  const flags = evaluateAllMcpFlags(context);
  return flags.ragEnabled;
}

/**
 * Check if RAG is enabled (not disabled)
 */
export function isRagEnabled(context: FeatureFlagContext = {}): boolean {
  return getRagMode(context) !== 'disabled';
}

/**
 * Check if RAG is using mock implementation
 */
export function isRagMock(context: FeatureFlagContext = {}): boolean {
  return getRagMode(context) === 'mock';
}

/**
 * Check if RAG is using production implementation
 */
export function isRagProduction(context: FeatureFlagContext = {}): boolean {
  return getRagMode(context) === 'enabled';
}

/**
 * Get MCP client type based on feature flags
 */
export function getMcpClientType(context: FeatureFlagContext = {}): 'mock' | 'enhanced' | 'demo' {
  const config = getMcpConfiguration(context);

  if (config.isDemoMode && !config.isEnhancedMode) {
    return 'demo';
  }

  if (config.isEnhancedMode) {
    return 'enhanced';
  }

  return 'mock';
}

/**
 * Create MCP configuration summary for debugging and monitoring
 */
export function getMcpConfigurationSummary(context: FeatureFlagContext = {}): {
  mode: string;
  enabledFeatures: string[];
  capabilities: string[];
  environment: string;
  hasUserContext: boolean;
  dependencyIssues: number;
} {
  const config = getMcpConfiguration(context);
  const enabledFeatures = Object.entries(config.features)
    .filter(([, feature]) => feature.enabled)
    .map(([key]) => key);

  return {
    mode: getMcpClientType(context),
    enabledFeatures,
    capabilities: config.capabilities,
    environment: env.NODE_ENV,
    hasUserContext: !!context.user?.id,
    dependencyIssues: config.metadata.dependencyIssues?.length || 0,
  };
}

/**
 * Validate MCP feature flag configuration
 */
export function validateMcpConfiguration(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getMcpConfigWithFallback(env.MCP_CONFIG || env.NEXT_PUBLIC_MCP_CONFIG);

  // Check rollout percentage bounds
  if (config.rolloutPercentage < 0) {
    errors.push('MCP rollout percentage must be >= 0');
  }

  if (config.rolloutPercentage > 100) {
    errors.push('MCP rollout percentage must be <= 100');
  }

  // Check for potential misconfigurations
  if (config.features.enhanced && !config.enabled) {
    warnings.push('Enhanced MCP is enabled but master toggle is disabled');
  }

  if (env.NODE_ENV === 'production' && config.rolloutPercentage === 100) {
    warnings.push('MCP rollout is at 100% in production - consider gradual rollout');
  }

  if (env.NODE_ENV === 'development' && !config.features.demoMode) {
    warnings.push('Demo mode is disabled in development - this may affect testing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
