/**
 * Feature Flags Module Entry Point
 * Provides centralized access to all MCP feature flag functionality
 */

// Core MCP flags
// Import for local use
import { isMcpFeatureEnabled } from './config';

export * from './mcp-flags';

// Configuration utilities
export * from './config';

// Re-export commonly used functions for convenience
export {
  getMcpClientType,
  getMcpConfiguration,
  getMcpConfigurationSummary,
  isMcpFeatureEnabled,
  validateMcpConfiguration,
} from './config';

export { allMcpFlags, evaluateAllMcpFlags } from './mcp-flags';

/**
 * Quick access to common feature flag checks
 */
export const mcpFeatureFlags = {
  isEnhanced: (context = {}) => isMcpFeatureEnabled('mcpEnabled', context),
  isDemoMode: (context = {}) => isMcpFeatureEnabled('mcpDemoModeEnabled', context),
  hasErrorHandling: (context = {}) => isMcpFeatureEnabled('mcpErrorHandlingEnabled', context),
  hasStreamLifecycle: (context = {}) => isMcpFeatureEnabled('mcpStreamLifecycleEnabled', context),
  hasHealthMonitoring: (context = {}) => isMcpFeatureEnabled('mcpHealthMonitoringEnabled', context),
  hasGracefulDegradation: (context = {}) =>
    isMcpFeatureEnabled('mcpGracefulDegradationEnabled', context),
};

/**
 * Quick access to RAG feature flag checks
 * TODO: Implement RAG-specific feature flags when RAG integration is complete
 */
export const ragFeatureFlags = {
  getMode: () => 'disabled' as const,
  isEnabled: () => false,
  isMock: () => false,
  isProduction: () => false,
  isDisabled: () => true,
};
