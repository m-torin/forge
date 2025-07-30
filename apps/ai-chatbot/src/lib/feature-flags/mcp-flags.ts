/**
 * MCP-specific feature flags for ai-chatbot
 * Uses Flags v4 SDK with environment-based configuration
 */

import { env } from '#/root/env';
import { getMcpConfigWithFallback, type McpConfig } from './mcp-config-parser';

// Simple flag function since the package import is having issues
function flag<T>(config: {
  key: string;
  description: string;
  decide: () => T | Promise<T>;
  options: Array<{ value: T; label: string }>;
}) {
  const flagObject = {
    ...config,
    call: config.decide,
  };

  // Make it callable
  const callable = config.decide;
  Object.assign(callable, flagObject);

  return callable as typeof config.decide & typeof flagObject;
}

/**
 * Simple hash function for consistent user-based rollouts
 */
function _hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Master toggle for all MCP feature flags
 * When disabled, all MCP features fall back to mock implementations
 */
export const mcpFeatureFlagsEnabled = flag<boolean>({
  key: 'mcp-feature-flags-enabled',
  description: 'Master toggle for all MCP feature flags',
  decide: () => getMcpConfig().enabled,
  options: [
    { value: false, label: 'Disabled' },
    { value: true, label: 'Enabled' },
  ],
});

/**
 * Enable MCP client using @repo/ai functionality
 * When enabled, replaces mock MCP client with real implementation
 */
export const mcpEnabled = flag<boolean>({
  key: 'mcp-enabled',
  description: 'Enable MCP client using @repo/ai functionality',
  decide: async () => {
    const config = getMcpConfig();

    // Check master toggle first
    if (!config.enabled) return false;
    if (!config.features.enhanced) return false;

    // Gradual rollout based on percentage
    const rolloutPercentage = config.rolloutPercentage;
    if (rolloutPercentage === 0) return false;
    if (rolloutPercentage === 100) return true;

    // For now, use environment-based rollout
    // In a real implementation, you'd get user ID from context
    return rolloutPercentage > 50;
  },
  options: [
    { value: false, label: 'Mock Implementation' },
    { value: true, label: 'Real MCP Client' },
  ],
});

/**
 * Enable AI SDK v5 error handling integration
 * Provides comprehensive error handling and recovery mechanisms
 */
export const mcpErrorHandlingEnabled = flag<boolean>({
  key: 'mcp-error-handling-enabled',
  description: 'Enable AI SDK v5 error handling integration for MCP',
  decide: async () => {
    const config = getMcpConfig();

    if (!config.enabled) return false;
    if (!config.features.errorHandling) return false;

    // Enable if MCP is enabled
    const mcpIsEnabled = await mcpEnabled();
    return mcpIsEnabled;
  },
  options: [
    { value: false, label: 'Basic Error Handling' },
    { value: true, label: 'AI SDK v5 Error Handling' },
  ],
});

/**
 * Enable stream lifecycle management
 * Provides comprehensive stream monitoring and resource management
 */
export const mcpStreamLifecycleEnabled = flag<boolean>({
  key: 'mcp-stream-lifecycle-enabled',
  description: 'Enable stream lifecycle management for MCP',
  decide: async () => {
    const config = getMcpConfig();

    if (!config.enabled) return false;
    if (!config.features.streamLifecycle) return false;

    // Enable if MCP is enabled
    const mcpIsEnabled = await mcpEnabled();
    return mcpIsEnabled;
  },
  options: [
    { value: false, label: 'Basic Stream Management' },
    { value: true, label: 'Full Lifecycle Management' },
  ],
});

/**
 * Enable MCP health monitoring and diagnostics
 * Provides real-time health checks and connection monitoring
 */
export const mcpHealthMonitoringEnabled = flag<boolean>({
  key: 'mcp-health-monitoring-enabled',
  description: 'Enable MCP health monitoring and diagnostics',
  decide: async () => {
    const config = getMcpConfig();

    if (!config.enabled) return false;
    if (!config.features.healthMonitoring) return false;

    // Enable if MCP is enabled
    const mcpIsEnabled = await mcpEnabled();
    return mcpIsEnabled;
  },
  options: [
    { value: false, label: 'Basic Monitoring' },
    { value: true, label: 'Full Health Diagnostics' },
  ],
});

/**
 * Enable graceful degradation for MCP failures
 * When enabled, MCP failures fall back to mock implementations
 */
export const mcpGracefulDegradationEnabled = flag<boolean>({
  key: 'mcp-graceful-degradation-enabled',
  description: 'Enable graceful degradation for MCP failures',
  decide: () => {
    const config = getMcpConfig();
    if (!config.enabled) return true; // Always enable fallback when flags are off
    return config.features.gracefulDegradation;
  },
  options: [
    { value: false, label: 'Fail Fast' },
    { value: true, label: 'Graceful Fallback' },
  ],
});

/**
 * Enable MCP demo mode with mock data
 * Provides realistic demo experience without real MCP connections
 */
export const mcpDemoModeEnabled = flag<boolean>({
  key: 'mcp-demo-mode-enabled',
  description: 'Enable MCP demo mode with mock data',
  decide: () => {
    const config = getMcpConfig();

    // Always enable demo mode in development
    if (env.NODE_ENV === 'development') return true;

    // Check configuration
    return config.features.demoMode;
  },
  options: [
    { value: false, label: 'Production Mode' },
    { value: true, label: 'Demo Mode' },
  ],
});

/**
 * Enable MCP connection pooling and optimization
 * Provides connection reuse and performance optimizations
 */
export const mcpConnectionPoolingEnabled = flag<boolean>({
  key: 'mcp-connection-pooling-enabled',
  description: 'Enable MCP connection pooling and optimization',
  decide: async () => {
    const config = getMcpConfig();

    if (!config.enabled) return false;
    if (!config.features.connectionPooling) return false;

    // Enable for production with MCP
    const mcpIsEnabled = await mcpEnabled();
    return env.NODE_ENV === 'production' && mcpIsEnabled;
  },
  options: [
    { value: false, label: 'Individual Connections' },
    { value: true, label: 'Connection Pooling' },
  ],
});

/**
 * Enable MCP analytics and telemetry
 * Tracks MCP usage patterns and performance metrics
 */
export const mcpAnalyticsEnabled = flag<boolean>({
  key: 'mcp-analytics-enabled',
  description: 'Enable MCP analytics and telemetry',
  decide: async () => {
    const config = getMcpConfig();

    if (!config.enabled) return false;
    if (!config.features.analytics) return false;

    // Enable for production with MCP
    const mcpIsEnabled = await mcpEnabled();
    return env.NODE_ENV === 'production' && mcpIsEnabled;
  },
  options: [
    { value: false, label: 'No Analytics' },
    { value: true, label: 'Full Telemetry' },
  ],
});

/**
 * Enable RAG functionality with implementation choice
 * Controls whether to use disabled, mock, or production RAG
 */
export const ragEnabled = flag<'disabled' | 'mock' | 'enabled'>({
  key: 'rag-enabled',
  description: 'Enable RAG functionality',
  decide: () => {
    // Check if Upstash Vector is configured
    const hasVectorConfig = !!(env.UPSTASH_VECTOR_REST_URL && env.UPSTASH_VECTOR_REST_TOKEN);

    // Environment-based defaults
    if (env.NODE_ENV === 'development') {
      return hasVectorConfig ? 'enabled' : 'mock';
    }

    if (env.NODE_ENV === 'production') {
      return hasVectorConfig ? 'enabled' : 'disabled';
    }

    // Default fallback
    return 'mock';
  },
  options: [
    { value: 'disabled', label: 'Disabled' },
    { value: 'mock', label: 'Mock Implementation' },
    { value: 'enabled', label: 'Production RAG' },
  ],
});

/**
 * Get MCP configuration from JSON environment variable or defaults
 */
function getMcpConfig(): McpConfig {
  return getMcpConfigWithFallback(env.MCP_CONFIG || env.NEXT_PUBLIC_MCP_CONFIG);
}

/**
 * Utility function to evaluate all MCP flags synchronously
 * Using JSON configuration with defaults for better user experience
 */
export function evaluateAllMcpFlags(_context: any = {}) {
  const config = getMcpConfig();

  // RAG evaluation
  const hasVectorConfig = !!(env.UPSTASH_VECTOR_REST_URL && env.UPSTASH_VECTOR_REST_TOKEN);
  let ragMode: 'disabled' | 'mock' | 'enabled' = 'mock';

  if (env.NODE_ENV === 'development') {
    ragMode = hasVectorConfig ? 'enabled' : 'mock';
  } else if (env.NODE_ENV === 'production') {
    ragMode = hasVectorConfig ? 'enabled' : 'disabled';
  }

  return {
    featureFlagsEnabled: config.enabled,
    mcpEnabled: config.enabled && config.features.enhanced,
    errorHandlingEnabled: config.enabled && config.features.errorHandling,
    streamLifecycleEnabled: config.enabled && config.features.streamLifecycle,
    healthMonitoringEnabled: config.enabled && config.features.healthMonitoring,
    gracefulDegradationEnabled: config.features.gracefulDegradation,
    demoModeEnabled: config.features.demoMode || env.NODE_ENV === 'development',
    connectionPoolingEnabled:
      config.enabled && config.features.connectionPooling && env.NODE_ENV === 'production',
    analyticsEnabled: config.enabled && config.features.analytics && env.NODE_ENV === 'production',
    ragEnabled: ragMode,
  };
}

/**
 * Export all MCP flags for easy access
 */
export const allMcpFlags = {
  mcpFeatureFlagsEnabled,
  mcpEnabled,
  mcpErrorHandlingEnabled,
  mcpStreamLifecycleEnabled,
  mcpHealthMonitoringEnabled,
  mcpGracefulDegradationEnabled,
  mcpDemoModeEnabled,
  mcpConnectionPoolingEnabled,
  mcpAnalyticsEnabled,
  ragEnabled,
};
