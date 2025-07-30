/**
 * MCP Module Entry Point
 * Provides centralized access to all MCP functionality with feature flag integration
 */

// Core MCP functionality with feature flags
export * from './feature-flags';
export { featureFlagAwareMcp } from './feature-flags';

// Security layer
export * from './security';
export { mcpCredentialManager, mcpSecurity } from './security';

// Configuration management
export * from './config-manager';
export { mcpConfig, mcpConfigManager } from './config-manager';

// Stream lifecycle management
export * from './stream-lifecycle';
export {
  createMcpStreamLifecycleWrapper,
  mcpStreamAnalytics,
  mcpStreamLifecycle,
  streamLifecycleUtils,
} from './stream-lifecycle';

// Re-export commonly used functions for convenience
export {
  createMcpToolsWithFeatureFlags,
  getMcpConnectionStatusWithFlags,
  initializeMcpWithFeatureFlags,
  selectMcpToolsForUser,
} from './feature-flags';

/**
 * Main MCP interface for easy integration
 * This is the primary API that applications should use
 */
export const mcp = {
  // Tool creation and management
  createTools: async (userType: string = 'regular', context: any = {}) => {
    const { createMcpToolsWithFeatureFlags } = await import('./feature-flags');
    return createMcpToolsWithFeatureFlags(userType, context);
  },

  // Connection status and health
  getStatus: (context: any = {}) => {
    const { getMcpConnectionStatusWithFlags } = require('./feature-flags');
    return getMcpConnectionStatusWithFlags(context);
  },

  // Initialization
  initialize: async (context: any = {}) => {
    const { initializeMcpWithFeatureFlags } = await import('./feature-flags');
    return initializeMcpWithFeatureFlags(context);
  },

  // Tool selection
  selectTools: (userType: string, context: any = {}) => {
    const { selectMcpToolsForUser } = require('./feature-flags');
    return selectMcpToolsForUser(userType, context);
  },

  // Configuration
  config: {
    getAvailableProfiles: (context: any = {}) => {
      const { mcpConfig } = require('./config-manager');
      return mcpConfig.getAvailableProfiles(context);
    },

    getProfile: (profileId: string, context: any = {}) => {
      const { mcpConfig } = require('./config-manager');
      return mcpConfig.getProfile(profileId, context);
    },

    getSummary: () => {
      const { mcpConfig } = require('./config-manager');
      return mcpConfig.getConfigurationSummary();
    },
  },

  // Security
  security: {
    hasPermission: (userId: string | undefined, resource: string, operation: string) => {
      const { mcpSecurity } = require('./security');
      return mcpSecurity.hasPermission(userId, resource, operation);
    },

    getAvailableConnections: (userId?: string) => {
      const { mcpSecurity } = require('./security');
      return mcpSecurity.getAvailableConnections(userId);
    },

    getCredentialsSummary: () => {
      const { mcpSecurity } = require('./security');
      return mcpSecurity.getCredentialsSummary();
    },
  },
};

/**
 * Backward compatibility exports
 * These maintain compatibility with existing mock implementations
 */
export const legacyMcp = {
  // Legacy functions that apps might still be using
  getMCPToolsForUser: async (userType: string) => {
    const tools = await mcp.createTools(userType);
    return tools.tools; // Extract just the tools for backward compatibility
  },

  checkMCPHealth: () => {
    const status = mcp.getStatus();
    return {
      healthy: status.status === 'connected' || status.status === 'demo',
      connections: status.clientType === 'mock' ? 0 : 1,
      issues: status.status === 'degraded' ? ['Connection degraded'] : [],
    };
  },

  initializeMCPConnections: async () => {
    const result = await mcp.initialize();
    return result.success;
  },
};
