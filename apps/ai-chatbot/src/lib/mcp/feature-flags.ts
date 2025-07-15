/**
 * MCP Feature Flag Integration Layer
 * Provides feature flag-aware MCP functionality and compatibility layer
 * between mock implementations and enhanced @repo/ai functionality
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import type { FeatureFlagContext, McpFeatureConfig } from '../feature-flags/config';
import {
  getMcpClientType,
  getMcpConfiguration,
  getMcpConfigurationSummary,
  isMcpFeatureEnabled,
} from '../feature-flags/config';

// Import existing mock functionality
import {
  checkMCPHealth,
  getEnhancedMCPTools,
  getMCPToolsForUser,
  initializeMCPConnections,
} from '../ai/tools/mcp/enhanced-mcp-tools';

/**
 * Feature flag-aware MCP tool factory
 * Switches between mock and enhanced implementations based on feature flags
 */
export async function createMcpToolsWithFeatureFlags(
  userType: string = 'regular',
  context: FeatureFlagContext = {},
): Promise<{
  tools: Record<string, any>;
  clientType: 'mock' | 'enhanced' | 'demo';
  features: Record<string, McpFeatureConfig>;
  metadata: {
    isEnhancedMode: boolean;
    isDemoMode: boolean;
    capabilities: string[];
    configSummary: any;
  };
}> {
  const clientType = getMcpClientType(context);
  const config = getMcpConfiguration(context);
  const configSummary = getMcpConfigurationSummary(context);

  logInfo('Creating MCP tools with feature flags', {
    operation: 'mcp_tools_creation_with_flags',
    metadata: {
      userType,
      clientType,
      userId: context.user?.id,
      enabledFeatures: configSummary.enabledFeatures,
      capabilities: configSummary.capabilities,
    },
  });

  let tools: Record<string, any> = {};

  try {
    switch (clientType) {
      case 'enhanced':
        // Use enhanced MCP functionality from @repo/ai package
        tools = await createEnhancedMcpTools(context);
        break;

      case 'demo':
        // Use demo/mock tools with enhanced presentation
        tools = await createDemoMcpTools(userType, context);
        break;

      case 'mock':
      default:
        // Use existing mock implementation
        tools = getMCPToolsForUser(userType);
        break;
    }

    return {
      tools,
      clientType,
      features: config.features,
      metadata: {
        isEnhancedMode: config.isEnhancedMode,
        isDemoMode: config.isDemoMode,
        capabilities: config.capabilities,
        configSummary,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Failed to create MCP tools with feature flags', {
      operation: 'mcp_tools_creation_error',
      metadata: {
        userType,
        clientType,
        userId: context.user?.id,
        error: errorMessage,
      },
      error: error instanceof Error ? error : new Error(errorMessage),
    });

    // Fallback to graceful degradation if enabled
    if (isMcpFeatureEnabled('mcpGracefulDegradationEnabled', context)) {
      logWarn('Falling back to mock MCP tools due to error', {
        operation: 'mcp_graceful_degradation',
        metadata: {
          originalClientType: clientType,
          fallbackType: 'mock',
          error: errorMessage,
        },
      });

      return {
        tools: getMCPToolsForUser(userType),
        clientType: 'mock',
        features: config.features,
        metadata: {
          isEnhancedMode: false,
          isDemoMode: false,
          capabilities: ['graceful-degradation'],
          configSummary: { ...configSummary, mode: 'mock-fallback' },
        },
      };
    }

    throw error;
  }
}

/**
 * Create enhanced MCP tools using @repo/ai functionality
 * Uses the comprehensive MCP implementation from @repo/ai package
 */
async function createEnhancedMcpTools(context: FeatureFlagContext): Promise<Record<string, any>> {
  logInfo('Creating enhanced MCP tools using @repo/ai', {
    operation: 'enhanced_mcp_tools_creation',
    metadata: {
      userId: context.user?.id,
      hasErrorHandling: isMcpFeatureEnabled('mcpErrorHandlingEnabled', context),
      hasStreamLifecycle: isMcpFeatureEnabled('mcpStreamLifecycleEnabled', context),
      hasHealthMonitoring: isMcpFeatureEnabled('mcpHealthMonitoringEnabled', context),
    },
  });

  try {
    // Import @repo/ai MCP functionality with compatibility bridge
    let createMCPToolsFromConfigs: any;
    try {
      const serverModule = await import('@repo/ai/server');
      createMCPToolsFromConfigs = serverModule.createMCPToolsForStreamTextCompat;
    } catch (importError) {
      logWarn('Enhanced MCP functionality not available, falling back to mock', {
        operation: 'mcp_import_fallback',
        metadata: {
          importError: importError instanceof Error ? importError.message : String(importError),
        },
      });
      throw new Error('Enhanced MCP functionality not available');
    }

    // Create MCP client configurations based on environment
    const mcpConfigs = await createMcpClientConfigurations(context);

    logInfo('Created MCP client configurations', {
      operation: 'mcp_config_creation',
      metadata: {
        configCount: mcpConfigs.length,
        configNames: mcpConfigs.map(c => c.name),
      },
    });

    // Create MCP tools with AI SDK v5 integration
    const result = await createMCPToolsFromConfigs(mcpConfigs, { gracefulDegradation: true });

    logInfo('Enhanced MCP tools created successfully', {
      operation: 'enhanced_mcp_tools_success',
      metadata: {
        toolCount: Object.keys(result.tools).length,
        clientCount: result.clients.length,
        toolNames: Object.keys(result.tools),
      },
    });

    // Add feature flag metadata to tools
    const enhancedTools: Record<string, any> = {};
    Object.entries(result.tools).forEach(([key, tool]) => {
      if (tool && typeof tool === 'object') {
        enhancedTools[key] = {
          ...tool,
          metadata: {
            ...(typeof tool === 'object' && 'metadata' in tool ? (tool as any).metadata : {}),
            enhanced: true,
            userId: context.user?.id,
            capabilities: {
              errorHandling: isMcpFeatureEnabled('mcpErrorHandlingEnabled', context),
              streamLifecycle: isMcpFeatureEnabled('mcpStreamLifecycleEnabled', context),
              healthMonitoring: isMcpFeatureEnabled('mcpHealthMonitoringEnabled', context),
            },
          },
        };
      } else {
        enhancedTools[key] = tool;
      }
    });

    return enhancedTools;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Failed to create enhanced MCP tools', {
      operation: 'enhanced_mcp_tools_error',
      metadata: {
        userId: context.user?.id,
        error: errorMessage,
      },
      error: error instanceof Error ? error : new Error(errorMessage),
    });

    throw error;
  }
}

/**
 * Create MCP client configurations based on environment and feature flags
 * Uses the centralized configuration manager for consistent setup
 */
async function createMcpClientConfigurations(context: FeatureFlagContext): Promise<any[]> {
  const { mcpConfig } = await import('./config-manager');
  const { mcpSecurity } = await import('./security');
  const userId = context.user?.id;

  logInfo('Creating MCP client configurations using config manager', {
    operation: 'mcp_config_creation_start',
    metadata: {
      userId,
      hasFeatureFlags: isMcpFeatureEnabled('mcpFeatureFlagsEnabled', context),
      hasEnhancedMode: isMcpFeatureEnabled('mcpEnabled', context),
    },
  });

  try {
    // Get configurations from the centralized config manager
    const configurations = await mcpConfig.createClientConfigurations(context);

    // Apply additional validation and security checks
    const validatedConfigs: any[] = [];

    for (const config of configurations) {
      // Additional security validation beyond what config manager does
      const validation = mcpSecurity.validateConfig(config, userId);

      if (!validation.isValid) {
        logError('MCP configuration failed additional security validation', {
          operation: 'mcp_config_security_validation_failed',
          metadata: {
            userId,
            configName: config.name,
            errors: validation.errors,
          },
        });
        continue;
      }

      if (validation.warnings.length > 0) {
        logWarn('MCP configuration security warnings', {
          operation: 'mcp_config_security_warnings',
          metadata: {
            userId,
            configName: config.name,
            warnings: validation.warnings,
          },
        });
      }

      validatedConfigs.push(validation.sanitizedConfig);
    }

    const configSummary = mcpConfig.getConfigurationSummary();

    logInfo('MCP client configurations created successfully', {
      operation: 'mcp_config_creation_success',
      metadata: {
        userId,
        totalProfiles: configSummary.totalProfiles,
        availableConfigs: configurations.length,
        validatedConfigs: validatedConfigs.length,
        configNames: validatedConfigs.map(c => c.name),
        environment: configSummary.environment,
        preset: configSummary.preset,
      },
    });

    return validatedConfigs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Failed to create MCP client configurations', {
      operation: 'mcp_config_creation_error',
      metadata: {
        userId,
        error: errorMessage,
      },
      error: error instanceof Error ? error : new Error(errorMessage),
    });

    // Return empty array for graceful degradation
    if (isMcpFeatureEnabled('mcpGracefulDegradationEnabled', context)) {
      logWarn('Returning empty MCP configurations due to error (graceful degradation)', {
        operation: 'mcp_config_graceful_degradation',
        metadata: { userId, originalError: errorMessage },
      });
      return [];
    }

    throw error;
  }
}

/**
 * Create demo MCP tools with enhanced presentation
 */
async function createDemoMcpTools(
  userType: string,
  context: FeatureFlagContext,
): Promise<Record<string, any>> {
  logInfo('Creating demo MCP tools', {
    operation: 'demo_mcp_tools_creation',
    metadata: {
      userType,
      userId: context.user?.id,
    },
  });

  // Use enhanced mock tools for demo mode
  const baseTools = getEnhancedMCPTools();

  // Add demo-specific metadata and enhanced functionality
  const demoTools: Record<string, any> = {};

  Object.entries(baseTools).forEach(([key, tool]) => {
    if (typeof tool === 'object' && tool !== null && 'execute' in tool) {
      demoTools[key] = {
        ...tool,
        metadata: {
          ...((tool as any).metadata || {}),
          demoMode: true,
          enhanced: true,
          userId: context.user?.id,
        },
        execute: async (params: any) => {
          const result = await (tool as any).execute(params);

          // Add demo-specific enhancements to results
          return {
            ...result,
            metadata: {
              ...result.metadata,
              demoMode: true,
              enhanced: true,
              timestamp: new Date().toISOString(),
            },
          };
        },
      };
    } else {
      demoTools[key] = tool;
    }
  });

  return demoTools;
}

/**
 * Get MCP connection status with feature flag awareness
 */
export function getMcpConnectionStatusWithFlags(context: FeatureFlagContext = {}): {
  status: 'connected' | 'disconnected' | 'degraded' | 'demo';
  clientType: 'mock' | 'enhanced' | 'demo';
  health: any;
  features: {
    enhanced: boolean;
    errorHandling: boolean;
    streamLifecycle: boolean;
    healthMonitoring: boolean;
    gracefulDegradation: boolean;
    demo: boolean;
  };
  metadata: any;
} {
  const clientType = getMcpClientType(context);
  const config = getMcpConfiguration(context);
  const health = checkMCPHealth();

  let status: 'connected' | 'disconnected' | 'degraded' | 'demo' = 'disconnected';

  switch (clientType) {
    case 'enhanced':
      status = health.healthy ? 'connected' : 'degraded';
      break;
    case 'demo':
      status = 'demo';
      break;
    case 'mock':
    default:
      status = health.healthy ? 'connected' : 'disconnected';
      break;
  }

  return {
    status,
    clientType,
    health,
    features: {
      enhanced: config.features.enhancedMcp.enabled,
      errorHandling: config.features.errorHandling.enabled,
      streamLifecycle: config.features.streamLifecycle.enabled,
      healthMonitoring: config.features.healthMonitoring.enabled,
      gracefulDegradation: config.features.gracefulDegradation.enabled,
      demo: config.features.demoMode.enabled,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      capabilities: config.capabilities,
      environment: process.env.NODE_ENV,
    },
  };
}

/**
 * Initialize MCP connections with feature flag awareness
 */
export async function initializeMcpWithFeatureFlags(context: FeatureFlagContext = {}): Promise<{
  success: boolean;
  clientType: 'mock' | 'enhanced' | 'demo';
  features: string[];
  error?: string;
}> {
  const clientType = getMcpClientType(context);
  const configSummary = getMcpConfigurationSummary(context);

  logInfo('Initializing MCP with feature flags', {
    operation: 'mcp_initialization_with_flags',
    metadata: {
      clientType,
      enabledFeatures: configSummary.enabledFeatures,
      userId: context.user?.id,
    },
  });

  try {
    switch (clientType) {
      case 'enhanced':
        // Initialize enhanced MCP clients using existing functionality
        const configs = await createMcpClientConfigurations(context);
        if (configs.length === 0) {
          logWarn('No MCP configurations available, falling back to mock', {
            operation: 'mcp_no_configs_fallback',
            metadata: { userId: context.user?.id },
          });
          await initializeMCPConnections();
        } else {
          logInfo('Enhanced MCP initialized with configurations', {
            operation: 'mcp_enhanced_initialization',
            metadata: {
              configCount: configs.length,
              configNames: configs.map(c => c.name),
            },
          });
        }
        break;

      case 'demo':
      case 'mock':
      default:
        // Initialize mock connections
        await initializeMCPConnections();
        break;
    }

    return {
      success: true,
      clientType,
      features: configSummary.enabledFeatures,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logError('Failed to initialize MCP with feature flags', {
      operation: 'mcp_initialization_error',
      metadata: {
        clientType,
        userId: context.user?.id,
        error: errorMessage,
      },
      error: error instanceof Error ? error : new Error(errorMessage),
    });

    // Graceful degradation if enabled
    if (isMcpFeatureEnabled('mcpGracefulDegradationEnabled', context)) {
      logWarn('Falling back to mock MCP initialization', {
        operation: 'mcp_initialization_fallback',
        metadata: {
          originalClientType: clientType,
          fallbackType: 'mock',
        },
      });

      try {
        await initializeMCPConnections();
        return {
          success: true,
          clientType: 'mock',
          features: ['graceful-degradation'],
        };
      } catch (fallbackError) {
        return {
          success: false,
          clientType: 'mock',
          features: [],
          error: fallbackError instanceof Error ? fallbackError.message : 'Fallback failed',
        };
      }
    }

    return {
      success: false,
      clientType,
      features: configSummary.enabledFeatures,
      error: errorMessage,
    };
  }
}

/**
 * Create feature flag-aware MCP tool selector
 * Returns appropriate tools based on user context and feature flags
 */
export function selectMcpToolsForUser(
  userType: string,
  context: FeatureFlagContext = {},
): {
  availableTools: string[];
  recommendedTools: string[];
  clientType: 'mock' | 'enhanced' | 'demo';
  capabilities: string[];
} {
  const clientType = getMcpClientType(context);
  const config = getMcpConfiguration(context);

  let availableTools: string[] = [];
  let recommendedTools: string[] = [];

  switch (clientType) {
    case 'enhanced':
      availableTools = [
        'enhancedWebSearch',
        'enhancedCodeInterpreter',
        'mcpFileOperations',
        'mcpConnectionStatus',
      ];
      recommendedTools = userType === 'premium' ? availableTools : ['mcpConnectionStatus'];
      break;

    case 'demo':
      availableTools = [
        'enhancedWebSearch',
        'enhancedCodeInterpreter',
        'mcpFileOperations',
        'mcpConnectionStatus',
      ];
      recommendedTools = ['enhancedWebSearch', 'mcpConnectionStatus'];
      break;

    case 'mock':
    default:
      availableTools = ['mcpConnectionStatus'];
      recommendedTools = userType === 'premium' ? ['mcpConnectionStatus'] : [];
      break;
  }

  return {
    availableTools,
    recommendedTools,
    clientType,
    capabilities: config.capabilities,
  };
}

/**
 * Export feature flag-aware MCP functions for backward compatibility
 */
export const featureFlagAwareMcp = {
  createTools: createMcpToolsWithFeatureFlags,
  getStatus: getMcpConnectionStatusWithFlags,
  initialize: initializeMcpWithFeatureFlags,
  selectTools: selectMcpToolsForUser,
  getConfiguration: getMcpConfiguration,
  getConfigurationSummary: getMcpConfigurationSummary,
};
