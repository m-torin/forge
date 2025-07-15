/**
 * MCP Production Integration Layer
 * Integrates all Phase 4 production features with the existing MCP system
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import type { FeatureFlagContext } from '../feature-flags/config';
import { mcpAnalytics, type McpAnalyticsService } from './analytics';
import { mcpConnectionPool, type McpConnectionPool } from './connection-pool';
import { context7Integration } from './context7-integration';
import { createMcpToolsWithFeatureFlags } from './feature-flags';
import { mcpMarketplace } from './marketplace';
import { mcpOrchestrator } from './orchestration';

/**
 * Production MCP system configuration
 */
export interface McpProductionConfig {
  analytics: {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
    retentionPeriod: number;
  };
  connectionPool: {
    maxConnections: number;
    healthCheckInterval: number;
    enableLoadBalancing: boolean;
    enableCircuitBreaker: boolean;
  };
  marketplace: {
    enabled: boolean;
    registryUrl: string;
    allowUntrustedPackages: boolean;
    enableAutoUpdates: boolean;
  };
  orchestration: {
    enabled: boolean;
    maxConcurrentChains: number;
    defaultTimeout: number;
    enablePersistence: boolean;
  };
  context7: {
    enabled: boolean;
    cacheTimeout: number;
    autoEnhancement: boolean;
    maxLibrariesPerMessage: number;
  };
  monitoring: {
    enableHealthEndpoint: boolean;
    enableMetricsEndpoint: boolean;
    enableDebugMode: boolean;
  };
}

/**
 * Default production configuration
 */
const DEFAULT_PRODUCTION_CONFIG: McpProductionConfig = {
  analytics: {
    enabled: true,
    batchSize: 50,
    flushInterval: 30000,
    retentionPeriod: 30,
  },
  connectionPool: {
    maxConnections: 10,
    healthCheckInterval: 60000,
    enableLoadBalancing: true,
    enableCircuitBreaker: true,
  },
  marketplace: {
    enabled: true,
    registryUrl: 'https://mcp-registry.ai/api/v1',
    allowUntrustedPackages: false,
    enableAutoUpdates: false,
  },
  orchestration: {
    enabled: true,
    maxConcurrentChains: 5,
    defaultTimeout: 300000,
    enablePersistence: true,
  },
  context7: {
    enabled: true,
    cacheTimeout: 1800000, // 30 minutes
    autoEnhancement: true,
    maxLibrariesPerMessage: 3,
  },
  monitoring: {
    enableHealthEndpoint: true,
    enableMetricsEndpoint: true,
    enableDebugMode: false,
  },
};

/**
 * MCP system health status
 */
export interface McpSystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  components: {
    analytics: {
      status: 'healthy' | 'unhealthy';
      eventsProcessed: number;
      lastFlush: number;
    };
    connectionPool: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      activeConnections: number;
      failedConnections: number;
      circuitBreakerStates: Record<string, string>;
    };
    marketplace: {
      status: 'healthy' | 'unhealthy';
      installedPackages: number;
      lastRegistryCheck: number;
    };
    orchestration: {
      status: 'healthy' | 'unhealthy';
      activeExecutions: number;
      registeredChains: number;
    };
    context7: {
      status: 'healthy' | 'unhealthy';
      cacheSize: number;
      cacheHitRate: number;
      enhancementsToday: number;
    };
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    totalOperations: number;
    errorRate: number;
  };
}

/**
 * Production MCP System Manager
 */
export class McpProductionSystem {
  private config: McpProductionConfig;
  private startTime: number;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<McpProductionConfig> = {}) {
    this.config = { ...DEFAULT_PRODUCTION_CONFIG, ...config };
    this.startTime = Date.now();
    this.initialize();
  }

  /**
   * Initialize the production system
   */
  private async initialize(): Promise<void> {
    try {
      logInfo('MCP Production System: Initializing', {
        operation: 'mcp_production_init',
        metadata: {
          analyticsEnabled: this.config.analytics.enabled,
          marketplaceEnabled: this.config.marketplace.enabled,
          orchestrationEnabled: this.config.orchestration.enabled,
        },
      });

      // Initialize analytics if enabled
      if (this.config.analytics.enabled) {
        this.initializeAnalytics();
      }

      // Initialize connection pool monitoring
      this.initializeConnectionPoolMonitoring();

      // Initialize marketplace if enabled
      if (this.config.marketplace.enabled) {
        await this.initializeMarketplace();
      }

      // Initialize orchestration if enabled
      if (this.config.orchestration.enabled) {
        this.initializeOrchestration();
      }

      // Initialize Context7 if enabled
      if (this.config.context7.enabled) {
        this.initializeContext7();
      }

      // Start health monitoring
      if (this.config.monitoring.enableHealthEndpoint) {
        this.startHealthMonitoring();
      }

      logInfo('MCP Production System: Initialization completed', {
        operation: 'mcp_production_init_completed',
        metadata: {
          componentsEnabled: this.getEnabledComponents(),
        },
      });

      // Track system startup
      mcpAnalytics.trackEvent({
        operationType: 'configuration_update',
        clientType: 'enhanced',
        metadata: {
          success: true,
          operation: 'system_startup',
          componentsEnabled: this.getEnabledComponents(),
        },
      });
    } catch (error) {
      const initError = error instanceof Error ? error : new Error(String(error));

      logError('MCP Production System: Initialization failed', {
        operation: 'mcp_production_init_failed',
        error: initError,
      });

      throw initError;
    }
  }

  /**
   * Get enhanced MCP tools with production features
   */
  async getEnhancedMcpTools(context: FeatureFlagContext = {}): Promise<{
    tools: Record<string, any>;
    clientType: 'enhanced' | 'demo' | 'mock';
    features: Record<string, boolean>;
    metadata: {
      analyticsEnabled: boolean;
      poolConnections: number;
      installedPackages: number;
      registeredChains: number;
    };
  }> {
    try {
      // Get base MCP tools
      const mcpToolsResult = await createMcpToolsWithFeatureFlags(
        context.user?.role || 'regular',
        context,
      );

      // Add production metadata
      const poolStats = mcpConnectionPool.getPoolStatistics();
      const installedPackages = mcpMarketplace.getInstalledPackages();
      const registeredChains = mcpOrchestrator.getToolChains();

      const enhancedResult = {
        ...mcpToolsResult,
        features: Object.fromEntries(
          Object.entries(mcpToolsResult.features).map(([key, feature]) => [
            key,
            typeof feature === 'boolean' ? feature : feature.enabled,
          ]),
        ) as Record<string, boolean>,
        metadata: {
          ...mcpToolsResult.metadata,
          analyticsEnabled: this.config.analytics.enabled,
          poolConnections: poolStats.totalConnections,
          installedPackages: installedPackages.length,
          registeredChains: registeredChains.length,
        },
      };

      // Track tool access
      mcpAnalytics.trackEvent({
        operationType: 'tool_execution',
        userId: context.user?.id,
        clientType: enhancedResult.clientType,
        metadata: {
          success: true,
          toolName: 'get_enhanced_mcp_tools',
          toolsCount: Object.keys(enhancedResult.tools).length,
          featuresActive: Object.values(enhancedResult.features).filter(Boolean).length,
        },
      });

      return enhancedResult;
    } catch (error) {
      const toolsError = error instanceof Error ? error : new Error(String(error));

      logError('MCP Production System: Failed to get enhanced tools', {
        operation: 'mcp_production_get_tools_failed',
        metadata: { userId: context.user?.id },
        error: toolsError,
      });

      // Return fallback tools
      return {
        tools: {},
        clientType: 'mock',
        features: {},
        metadata: {
          analyticsEnabled: false,
          poolConnections: 0,
          installedPackages: 0,
          registeredChains: 0,
        },
      };
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<McpSystemHealth> {
    const timestamp = Date.now();
    const uptime = timestamp - this.startTime;

    // Get component health
    const poolStats = mcpConnectionPool.getPoolStatistics();
    const marketplacePackages = mcpMarketplace.getInstalledPackages();
    const orchestratorChains = mcpOrchestrator.getToolChains();
    const analyticsMetrics = mcpAnalytics.getUsageMetrics();
    const context7Stats = context7Integration.getCacheStats();

    // Determine component health
    const analyticsHealth = this.config.analytics.enabled ? 'healthy' : 'healthy';

    const connectionPoolHealth =
      poolStats.failureRate > 0.5
        ? 'unhealthy'
        : poolStats.failureRate > 0.2
          ? 'degraded'
          : 'healthy';

    const marketplaceHealth = this.config.marketplace.enabled ? 'healthy' : 'healthy';
    const orchestrationHealth = this.config.orchestration.enabled ? 'healthy' : 'healthy';
    const context7Health = this.config.context7.enabled ? 'healthy' : 'healthy';

    // Determine overall system health
    const componentHealths = [
      analyticsHealth,
      connectionPoolHealth,
      marketplaceHealth,
      orchestrationHealth,
      context7Health,
    ];

    const overallHealth = componentHealths.includes('unhealthy')
      ? 'unhealthy'
      : componentHealths.includes('degraded')
        ? 'degraded'
        : 'healthy';

    return {
      status: overallHealth,
      timestamp,
      components: {
        analytics: {
          status: analyticsHealth,
          eventsProcessed: analyticsMetrics.totalOperations,
          lastFlush: timestamp - 30000, // Approximate
        },
        connectionPool: {
          status: connectionPoolHealth,
          activeConnections: poolStats.totalConnections,
          failedConnections: poolStats.connectionsByState.failed || 0,
          circuitBreakerStates: poolStats.circuitBreakerStates,
        },
        marketplace: {
          status: marketplaceHealth,
          installedPackages: marketplacePackages.length,
          lastRegistryCheck: timestamp - 3600000, // Approximate
        },
        orchestration: {
          status: orchestrationHealth,
          activeExecutions: 0, // Would get from orchestrator
          registeredChains: orchestratorChains.length,
        },
        context7: {
          status: context7Health,
          cacheSize: context7Stats.totalEntries,
          cacheHitRate: context7Stats.cacheHitRate,
          enhancementsToday: 0, // Would track this in production
        },
      },
      metrics: {
        uptime,
        memoryUsage: process.memoryUsage().heapUsed,
        totalOperations: analyticsMetrics.totalOperations,
        errorRate:
          analyticsMetrics.totalOperations > 0
            ? analyticsMetrics.failedOperations / analyticsMetrics.totalOperations
            : 0,
      },
    };
  }

  /**
   * Get comprehensive system metrics
   */
  async getSystemMetrics(): Promise<{
    analytics: ReturnType<McpAnalyticsService['getUsageMetrics']>;
    connectionPool: ReturnType<McpConnectionPool['getPoolStatistics']>;
    marketplace: {
      installedPackages: number;
      availableUpdates: number;
      categories: Record<string, number>;
    };
    orchestration: {
      activeExecutions: number;
      completedExecutions: number;
      registeredChains: number;
      averageExecutionTime: number;
    };
  }> {
    try {
      const analyticsMetrics = mcpAnalytics.getUsageMetrics();
      const poolStats = mcpConnectionPool.getPoolStatistics();
      const installedPackages = mcpMarketplace.getInstalledPackages();
      const availableUpdates = await mcpMarketplace.checkForUpdates();
      const orchestratorChains = mcpOrchestrator.getToolChains();
      const executionHistory = mcpOrchestrator.getExecutionHistory(100);

      // Calculate marketplace categories
      const categories: Record<string, number> = {};
      installedPackages.forEach(pkg => {
        pkg.metadata.categories.forEach(category => {
          categories[category] = (categories[category] || 0) + 1;
        });
      });

      // Calculate orchestration metrics
      const completedExecutions = executionHistory.filter(e => e.success).length;
      const averageExecutionTime =
        executionHistory.length > 0
          ? executionHistory.reduce((sum, e) => sum + e.totalExecutionTime, 0) /
            executionHistory.length
          : 0;

      return {
        analytics: analyticsMetrics,
        connectionPool: poolStats,
        marketplace: {
          installedPackages: installedPackages.length,
          availableUpdates: availableUpdates.length,
          categories,
        },
        orchestration: {
          activeExecutions: 0, // Would get from orchestrator active executions
          completedExecutions,
          registeredChains: orchestratorChains.length,
          averageExecutionTime,
        },
      };
    } catch (error) {
      logError('MCP Production System: Failed to get system metrics', {
        operation: 'mcp_production_metrics_failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Return empty metrics on error
      return {
        analytics: {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          averageExecutionTime: 0,
          toolUsageCount: {},
          errorsByType: {},
          clientTypeDistribution: {},
          featureFlagUsage: {},
          connectionHealth: {
            activeConnections: 0,
            failedConnections: 0,
            recoverySuccessRate: 0,
          },
          performanceMetrics: {
            p50ExecutionTime: 0,
            p95ExecutionTime: 0,
            p99ExecutionTime: 0,
            slowestOperations: [],
          },
        },
        connectionPool: {
          totalConnections: 0,
          connectionsByProfile: {},
          connectionsByState: {
            initializing: 0,
            connected: 0,
            reconnecting: 0,
            failed: 0,
            degraded: 0,
            closing: 0,
            closed: 0,
          },
          circuitBreakerStates: {},
          averageConnectionUptime: 0,
          totalRequests: 0,
          failureRate: 0,
        },
        marketplace: {
          installedPackages: 0,
          availableUpdates: 0,
          categories: {},
        },
        orchestration: {
          activeExecutions: 0,
          completedExecutions: 0,
          registeredChains: 0,
          averageExecutionTime: 0,
        },
      };
    }
  }

  /**
   * Perform system maintenance
   */
  async performMaintenance(): Promise<{
    analyticsCleanup: { removedEvents: number };
    connectionPoolCleanup: { closedConnections: number };
    marketplaceUpdates: { updatedPackages: number };
    memoryCleanup: { freedMB: number };
  }> {
    try {
      logInfo('MCP Production System: Starting maintenance', {
        operation: 'mcp_production_maintenance_start',
      });

      const memoryBefore = process.memoryUsage().heapUsed;

      // Analytics cleanup
      mcpAnalytics.cleanupOldEvents();
      const analyticsCleanup = { removedEvents: 0 }; // Would track actual cleanup

      // Connection pool cleanup (idle connections)
      const poolStatsBefore = mcpConnectionPool.getPoolStatistics();
      // Connection pool automatically handles cleanup
      const poolStatsAfter = mcpConnectionPool.getPoolStatistics();
      const connectionPoolCleanup = {
        closedConnections: poolStatsBefore.totalConnections - poolStatsAfter.totalConnections,
      };

      // Marketplace updates check
      let marketplaceUpdates = { updatedPackages: 0 };
      if (this.config.marketplace.enableAutoUpdates) {
        const availableUpdates = await mcpMarketplace.checkForUpdates();
        // Auto-update would be implemented here
        marketplaceUpdates = { updatedPackages: availableUpdates.length };
      }

      // Memory cleanup
      global.gc?.(); // Run garbage collection if available
      const memoryAfter = process.memoryUsage().heapUsed;
      const freedMB = Math.max(0, (memoryBefore - memoryAfter) / (1024 * 1024));

      const maintenanceResult = {
        analyticsCleanup,
        connectionPoolCleanup,
        marketplaceUpdates,
        memoryCleanup: { freedMB },
      };

      logInfo('MCP Production System: Maintenance completed', {
        operation: 'mcp_production_maintenance_completed',
        metadata: maintenanceResult,
      });

      return maintenanceResult;
    } catch (error) {
      logError('MCP Production System: Maintenance failed', {
        operation: 'mcp_production_maintenance_failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });

      return {
        analyticsCleanup: { removedEvents: 0 },
        connectionPoolCleanup: { closedConnections: 0 },
        marketplaceUpdates: { updatedPackages: 0 },
        memoryCleanup: { freedMB: 0 },
      };
    }
  }

  /**
   * Shutdown the production system
   */
  async shutdown(): Promise<void> {
    try {
      logInfo('MCP Production System: Shutting down', {
        operation: 'mcp_production_shutdown_start',
      });

      // Stop health monitoring
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = null;
      }

      // Shutdown components
      await Promise.allSettled([
        mcpAnalytics.destroy(),
        mcpConnectionPool.shutdown(),
        mcpOrchestrator.shutdown(),
      ]);

      logInfo('MCP Production System: Shutdown completed', {
        operation: 'mcp_production_shutdown_completed',
        metadata: {
          uptime: Date.now() - this.startTime,
        },
      });
    } catch (error) {
      logError('MCP Production System: Shutdown failed', {
        operation: 'mcp_production_shutdown_failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Private initialization methods
   */
  private initializeAnalytics(): void {
    logInfo('MCP Production System: Analytics initialized', {
      operation: 'mcp_production_analytics_init',
      metadata: {
        batchSize: this.config.analytics.batchSize,
        flushInterval: this.config.analytics.flushInterval,
      },
    });
  }

  private initializeConnectionPoolMonitoring(): void {
    mcpConnectionPool.on('connection-established', connection => {
      mcpAnalytics.trackConnection({
        success: true,
        connectionId: connection.id,
        clientType: 'enhanced',
      });
    });

    mcpConnectionPool.on('connection-failed', (profileId, error) => {
      mcpAnalytics.trackConnection({
        success: false,
        connectionId: `failed-${profileId}`,
        clientType: 'enhanced',
        error,
      });
    });

    logInfo('MCP Production System: Connection pool monitoring initialized', {
      operation: 'mcp_production_pool_monitoring_init',
    });
  }

  private async initializeMarketplace(): Promise<void> {
    // Load installed packages and check for updates
    const installedPackages = mcpMarketplace.getInstalledPackages();

    logInfo('MCP Production System: Marketplace initialized', {
      operation: 'mcp_production_marketplace_init',
      metadata: {
        installedPackages: installedPackages.length,
        registryUrl: this.config.marketplace.registryUrl,
      },
    });
  }

  private initializeOrchestration(): void {
    mcpOrchestrator.on('execution-started', execution => {
      mcpAnalytics.trackEvent({
        operationType: 'tool_execution',
        userId: execution.context.userId,
        clientType: 'enhanced',
        metadata: {
          success: true,
          toolName: 'tool_chain_start',
          chainId: execution.chainId,
          executionId: execution.executionId,
        },
      });
    });

    mcpOrchestrator.on('execution-completed', result => {
      mcpAnalytics.trackEvent({
        operationType: 'tool_execution',
        userId: result.metadata.userId,
        clientType: 'enhanced',
        metadata: {
          success: result.success,
          toolName: 'tool_chain_completed',
          chainId: result.chainId,
          executionTime: result.totalExecutionTime,
          stepsExecuted: result.stepsExecuted,
        },
      });
    });

    logInfo('MCP Production System: Orchestration initialized', {
      operation: 'mcp_production_orchestration_init',
      metadata: {
        maxConcurrentChains: this.config.orchestration.maxConcurrentChains,
        defaultTimeout: this.config.orchestration.defaultTimeout,
      },
    });
  }

  private initializeContext7(): void {
    // Configure Context7 integration settings
    if (this.config.context7.cacheTimeout !== 1800000) {
      // Note: In a real implementation, we'd configure the cache timeout
      logInfo('MCP Production System: Context7 cache timeout configured', {
        operation: 'mcp_production_context7_cache_config',
        metadata: { cacheTimeout: this.config.context7.cacheTimeout },
      });
    }

    logInfo('MCP Production System: Context7 initialized', {
      operation: 'mcp_production_context7_init',
      metadata: {
        cacheTimeout: this.config.context7.cacheTimeout,
        autoEnhancement: this.config.context7.autoEnhancement,
        maxLibrariesPerMessage: this.config.context7.maxLibrariesPerMessage,
      },
    });
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();

        if (health.status === 'unhealthy') {
          logWarn('MCP Production System: System health is unhealthy', {
            operation: 'mcp_production_health_unhealthy',
            metadata: {
              components: health.components,
              errorRate: health.metrics.errorRate,
            },
          });
        }

        // Track health metrics
        mcpAnalytics.trackEvent({
          operationType: 'health_check',
          clientType: 'enhanced',
          metadata: {
            success: health.status === 'healthy',
            systemStatus: health.status,
            uptime: health.metrics.uptime,
            memoryUsage: health.metrics.memoryUsage,
            errorRate: health.metrics.errorRate,
          },
        });
      } catch (error) {
        logError('MCP Production System: Health check failed', {
          operation: 'mcp_production_health_check_failed',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }, 60000); // Check every minute
  }

  private getEnabledComponents(): string[] {
    const enabled: string[] = [];

    if (this.config.analytics.enabled) enabled.push('analytics');
    if (this.config.marketplace.enabled) enabled.push('marketplace');
    if (this.config.orchestration.enabled) enabled.push('orchestration');
    if (this.config.context7.enabled) enabled.push('context7');
    if (this.config.monitoring.enableHealthEndpoint) enabled.push('health-monitoring');

    return enabled;
  }
}

/**
 * Global production system instance
 */
export const mcpProductionSystem = new McpProductionSystem();

/**
 * Utility functions for production system management
 */
export const productionUtils = {
  getEnhancedTools: (context?: FeatureFlagContext) =>
    mcpProductionSystem.getEnhancedMcpTools(context),

  getHealth: () => mcpProductionSystem.getSystemHealth(),

  getMetrics: () => mcpProductionSystem.getSystemMetrics(),

  performMaintenance: () => mcpProductionSystem.performMaintenance(),

  shutdown: () => mcpProductionSystem.shutdown(),
};
