/**
 * Production Agent Factory
 *
 * This module provides a production-ready factory for creating and managing
 * AI agents with advanced features. It includes configuration management,
 * health monitoring, and scalability patterns.
 */

import { openai } from '@ai-sdk/openai';

// Import all advanced agent features
import {
  AdvancedToolManager,
  advancedToolUtils,
  globalAdvancedToolManager,
  type AdvancedToolManagerConfig,
} from '../../src/server/agents/advanced-tool-management';
import {
  AgentCommunicationManager,
  communicationUtils,
  createCommunicationAwareAgent,
  globalCommunicationManager,
  type AgentCapability,
} from '../../src/server/agents/agent-communication';
import {
  AgentConfigurationBuilder,
  agentConfigurationTemplates,
  configurationUtils,
  type AgentConfigurationTemplate,
  type DeploymentEnvironment,
} from '../../src/server/agents/agent-configuration-templates';
import {
  AgentMemoryManager,
  createMemoryAwareAgent,
  type AgentMemoryConfig,
} from '../../src/server/agents/agent-memory';
import {
  AgentObservabilityManager,
  createObservableAgent,
  globalObservabilityManager,
  type AgentMonitoringConfig,
} from '../../src/server/agents/agent-observability';

/**
 * Production Agent Factory Configuration
 */
export interface ProductionAgentConfig {
  // Agent identification
  agentId: string;
  agentType:
    | 'customer_support'
    | 'research_assistant'
    | 'code_development'
    | 'content_creation'
    | 'data_analysis'
    | 'custom';

  // Environment configuration
  environment: DeploymentEnvironment;
  region?: string;
  datacenter?: string;

  // Scaling configuration
  scaling: {
    minInstances: number;
    maxInstances: number;
    targetUtilization: number;
    scaleUpCooldown: number;
    scaleDownCooldown: number;
  };

  // Memory configuration overrides
  memoryConfig?: Partial<AgentMemoryConfig>;

  // Tool management overrides
  toolConfig?: Partial<AdvancedToolManagerConfig>;

  // Monitoring configuration overrides
  monitoringConfig?: Partial<AgentMonitoringConfig>;

  // Custom capabilities
  customCapabilities?: AgentCapability[];

  // Feature flags
  features?: {
    enablePersistentMemory?: boolean;
    enableCommunication?: boolean;
    enableAdvancedTools?: boolean;
    enableObservability?: boolean;
    enableAutoScaling?: boolean;
  };

  // Performance tuning
  performance?: {
    maxConcurrentRequests?: number;
    requestTimeout?: number;
    memoryLimit?: string;
    cpuLimit?: string;
  };
}

/**
 * Production Agent Instance
 */
export interface ProductionAgentInstance {
  id: string;
  type: string;
  environment: string;
  status: 'initializing' | 'running' | 'scaling' | 'maintenance' | 'error';
  agent: any;
  memory: AgentMemoryManager;
  communication: AgentCommunicationManager;
  tools: AdvancedToolManager;
  observability: AgentObservabilityManager;
  config: ProductionAgentConfig;
  metrics: {
    uptime: number;
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  healthCheck: () => Promise<boolean>;
  shutdown: () => Promise<void>;
}

/**
 * Production Agent Factory
 */
export class ProductionAgentFactory {
  private instances: Map<string, ProductionAgentInstance> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsCollectionInterval: NodeJS.Timeout | null = null;

  constructor(
    private globalConfig: {
      enableHealthChecks: boolean;
      healthCheckInterval: number;
      metricsCollectionInterval: number;
      defaultEnvironment: DeploymentEnvironment;
    } = {
      enableHealthChecks: true,
      healthCheckInterval: 30000, // 30 seconds
      metricsCollectionInterval: 60000, // 1 minute
      defaultEnvironment: 'production',
    },
  ) {
    this.startHealthChecks();
    this.startMetricsCollection();
  }

  /**
   * Create a production-ready agent instance
   */
  async createAgent(config: ProductionAgentConfig): Promise<ProductionAgentInstance> {
    const startTime = Date.now();

    try {
      // Apply template configuration
      const template = this.getAgentTemplate(config.agentType);
      const environmentConfig = configurationUtils.applyEnvironmentOverrides(
        template,
        config.environment,
      );

      // Initialize memory manager
      const memoryManager = new AgentMemoryManager(config.agentId, {
        ...environmentConfig.memoryConfig,
        ...config.memoryConfig,
      });

      // Initialize communication manager (shared or dedicated)
      const communicationManager =
        config.features?.enableCommunication !== false
          ? globalCommunicationManager
          : new AgentCommunicationManager();

      // Initialize tool manager
      const toolManager =
        config.features?.enableAdvancedTools !== false
          ? new AdvancedToolManager({
              ...this.getToolManagerConfig(config.environment),
              ...config.toolConfig,
            })
          : globalAdvancedToolManager;

      // Initialize observability manager
      const observabilityManager =
        config.features?.enableObservability !== false
          ? new AgentObservabilityManager({
              ...environmentConfig.monitoringConfig,
              ...config.monitoringConfig,
            })
          : globalObservabilityManager;

      // Create base agent
      const baseAgent = {
        id: config.agentId,
        name: template.name,
        description: template.description,
      };

      // Layer advanced features
      let agent = baseAgent;

      if (config.features?.enablePersistentMemory !== false) {
        agent = createMemoryAwareAgent(agent, memoryManager.getConfig());
      }

      if (config.features?.enableCommunication !== false) {
        const capabilities = [
          ...template.requiredCapabilities.map(cap =>
            communicationUtils.createCapability(cap, `${cap} capability`, {}),
          ),
          ...(config.customCapabilities || []),
        ];
        agent = createCommunicationAwareAgent(agent, communicationManager, capabilities);
      }

      if (config.features?.enableObservability !== false) {
        agent = createObservableAgent(agent, observabilityManager);
      }

      // Initialize built-in tools
      if (config.features?.enableAdvancedTools !== false) {
        advancedToolUtils.initializeBuiltInTools(toolManager);
      }

      // Create production instance
      const instance: ProductionAgentInstance = {
        id: config.agentId,
        type: config.agentType,
        environment: config.environment,
        status: 'running',
        agent,
        memory: memoryManager,
        communication: communicationManager,
        tools: toolManager,
        observability: observabilityManager,
        config,
        metrics: {
          uptime: 0,
          requestCount: 0,
          errorCount: 0,
          averageResponseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
        },
        healthCheck: () => this.performHealthCheck(instance),
        shutdown: () => this.shutdownAgent(instance),
      };

      // Register instance
      this.instances.set(config.agentId, instance);

      // Log successful creation
      observabilityManager.recordEvent({
        agentId: config.agentId,
        sessionId: 'factory',
        type: 'agent_created',
        level: 'info',
        message: `Production agent created successfully`,
        data: {
          type: config.agentType,
          environment: config.environment,
          initTime: Date.now() - startTime,
        },
        tags: ['production', 'factory', 'created'],
      });

      return instance;
    } catch (error) {
      globalObservabilityManager.recordEvent({
        agentId: config.agentId,
        sessionId: 'factory',
        type: 'agent_creation_failed',
        level: 'error',
        message: `Failed to create production agent`,
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          config: config.agentType,
        },
        tags: ['production', 'factory', 'error'],
      });

      throw new Error(`Failed to create agent ${config.agentId}: ${error}`);
    }
  }

  /**
   * Get agent instance by ID
   */
  getAgent(agentId: string): ProductionAgentInstance | undefined {
    return this.instances.get(agentId);
  }

  /**
   * List all agent instances
   */
  listAgents(): ProductionAgentInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Scale agent instances based on load
   */
  async scaleAgent(agentId: string, targetInstances: number): Promise<ProductionAgentInstance[]> {
    const baseInstance = this.instances.get(agentId);
    if (!baseInstance) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const currentInstances = this.listAgents().filter(
      instance => instance.type === baseInstance.type,
    );

    if (targetInstances > currentInstances.length) {
      // Scale up
      const instancesToCreate = targetInstances - currentInstances.length;
      const newInstances: ProductionAgentInstance[] = [];

      for (let i = 0; i < instancesToCreate; i++) {
        const newConfig: ProductionAgentConfig = {
          ...baseInstance.config,
          agentId: `${baseInstance.config.agentId}-replica-${Date.now()}-${i}`,
        };

        const newInstance = await this.createAgent(newConfig);
        newInstances.push(newInstance);
      }

      return [...currentInstances, ...newInstances];
    } else if (targetInstances < currentInstances.length) {
      // Scale down
      const instancesToRemove = currentInstances.length - targetInstances;
      const instancesToKeep = currentInstances.slice(0, targetInstances);
      const instancesToShutdown = currentInstances.slice(targetInstances);

      // Gracefully shutdown excess instances
      await Promise.all(instancesToShutdown.map(instance => this.shutdownAgent(instance)));

      return instancesToKeep;
    }

    return currentInstances;
  }

  /**
   * Get production metrics for monitoring
   */
  getProductionMetrics(): {
    totalAgents: number;
    agentsByType: Record<string, number>;
    agentsByEnvironment: Record<string, number>;
    agentsByStatus: Record<string, number>;
    overallHealth: number;
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
  } {
    const instances = Array.from(this.instances.values());

    const agentsByType = instances.reduce(
      (acc, instance) => {
        acc[instance.type] = (acc[instance.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const agentsByEnvironment = instances.reduce(
      (acc, instance) => {
        acc[instance.environment] = (acc[instance.environment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const agentsByStatus = instances.reduce(
      (acc, instance) => {
        acc[instance.status] = (acc[instance.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalRequests = instances.reduce(
      (sum, instance) => sum + instance.metrics.requestCount,
      0,
    );
    const totalErrors = instances.reduce((sum, instance) => sum + instance.metrics.errorCount, 0);
    const totalResponseTime = instances.reduce(
      (sum, instance) => sum + instance.metrics.averageResponseTime,
      0,
    );
    const healthyAgents = instances.filter(instance => instance.status === 'running').length;

    return {
      totalAgents: instances.length,
      agentsByType,
      agentsByEnvironment,
      agentsByStatus,
      overallHealth: healthyAgents / instances.length,
      totalRequests,
      totalErrors,
      averageResponseTime: instances.length > 0 ? totalResponseTime / instances.length : 0,
    };
  }

  /**
   * Generate health report for all agents
   */
  generateHealthReport(): {
    timestamp: number;
    overall: any;
    agents: Array<{
      id: string;
      type: string;
      status: string;
      health: boolean;
      uptime: number;
      metrics: any;
    }>;
    recommendations: string[];
  } {
    const instances = Array.from(this.instances.values());
    const timestamp = Date.now();

    const agents = instances.map(instance => ({
      id: instance.id,
      type: instance.type,
      status: instance.status,
      health: instance.status === 'running',
      uptime: instance.metrics.uptime,
      metrics: instance.metrics,
    }));

    const healthyAgents = agents.filter(agent => agent.health).length;
    const recommendations: string[] = [];

    // Generate recommendations
    if (healthyAgents / agents.length < 0.8) {
      recommendations.push('System health is below 80% - investigate failing agents');
    }

    const highErrorRateAgents = instances.filter(
      instance => instance.metrics.errorCount / Math.max(instance.metrics.requestCount, 1) > 0.1,
    );
    if (highErrorRateAgents.length > 0) {
      recommendations.push(
        `${highErrorRateAgents.length} agents have high error rates - review logs`,
      );
    }

    const slowAgents = instances.filter(instance => instance.metrics.averageResponseTime > 5000);
    if (slowAgents.length > 0) {
      recommendations.push(
        `${slowAgents.length} agents have slow response times - consider scaling`,
      );
    }

    return {
      timestamp,
      overall: this.getProductionMetrics(),
      agents,
      recommendations,
    };
  }

  /**
   * Shutdown all agents gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down production agent factory...');

    // Stop health checks and metrics collection
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }

    // Shutdown all agent instances
    const shutdownPromises = Array.from(this.instances.values()).map(instance =>
      this.shutdownAgent(instance),
    );

    await Promise.all(shutdownPromises);
    this.instances.clear();

    console.log('✅ Production agent factory shutdown complete');
  }

  private getAgentTemplate(agentType: string): AgentConfigurationTemplate {
    switch (agentType) {
      case 'customer_support':
        return agentConfigurationTemplates.customerSupport;
      case 'research_assistant':
        return agentConfigurationTemplates.researchAssistant;
      case 'code_development':
        return agentConfigurationTemplates.codeDevelopment;
      case 'content_creation':
        return agentConfigurationTemplates.contentCreation;
      case 'data_analysis':
        return agentConfigurationTemplates.dataAnalysis;
      default:
        // Return a default template for custom agents
        return new AgentConfigurationBuilder()
          .setBasicInfo({
            id: 'custom_agent',
            name: 'Custom Agent',
            description: 'Custom agent configuration',
            useCase: 'customer_support',
            complexity: 'intermediate',
          })
          .setCoreConfig({
            model: openai('gpt-4o'),
            maxSteps: 10,
            temperature: 0.7,
          })
          .build();
    }
  }

  private getToolManagerConfig(
    environment: DeploymentEnvironment,
  ): Partial<AdvancedToolManagerConfig> {
    switch (environment) {
      case 'development':
        return {
          cacheEnabled: false,
          performanceTracking: true,
          autoOptimization: false,
          cacheTtl: 300000, // 5 minutes
          maxCacheSize: 10,
        };
      case 'staging':
        return {
          cacheEnabled: true,
          performanceTracking: true,
          autoOptimization: true,
          cacheTtl: 1800000, // 30 minutes
          maxCacheSize: 50,
        };
      case 'production':
        return {
          cacheEnabled: true,
          performanceTracking: true,
          autoOptimization: true,
          cacheTtl: 3600000, // 1 hour
          maxCacheSize: 100,
        };
      default:
        return {};
    }
  }

  private async performHealthCheck(instance: ProductionAgentInstance): Promise<boolean> {
    try {
      // Check basic instance health
      if (instance.status !== 'running') {
        return false;
      }

      // Check memory manager health
      const memoryMetrics = instance.memory.getMemoryMetrics();
      if (memoryMetrics.totalMemories > 10000) {
        // Too many memories
        return false;
      }

      // Check tool manager health
      const toolReport = instance.tools.generateUsageReport();
      if (toolReport.overallSuccessRate < 0.8) {
        // Low success rate
        return false;
      }

      // Check observability health
      const healthReport = instance.observability.generateHealthReport(instance.id);
      if (healthReport.overall.unhealthyAgents > 0) {
        return false;
      }

      return true;
    } catch (error) {
      instance.observability.recordEvent({
        agentId: instance.id,
        sessionId: 'health-check',
        type: 'health_check_failed',
        level: 'error',
        message: 'Health check failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        tags: ['health', 'error'],
      });
      return false;
    }
  }

  private async shutdownAgent(instance: ProductionAgentInstance): Promise<void> {
    try {
      instance.status = 'maintenance';

      // Clear any pending operations
      instance.memory.clearMemories();

      // Record shutdown
      instance.observability.recordEvent({
        agentId: instance.id,
        sessionId: 'shutdown',
        type: 'agent_shutdown',
        level: 'info',
        message: 'Agent shutdown initiated',
        data: { uptime: instance.metrics.uptime },
        tags: ['shutdown', 'maintenance'],
      });

      // Remove from instances
      this.instances.delete(instance.id);

      console.log(`✅ Agent ${instance.id} shutdown complete`);
    } catch (error) {
      console.error(`❌ Error shutting down agent ${instance.id}:`, error);
    }
  }

  private startHealthChecks(): void {
    if (!this.globalConfig.enableHealthChecks) return;

    this.healthCheckInterval = setInterval(async () => {
      const instances = Array.from(this.instances.values());

      for (const instance of instances) {
        const isHealthy = await instance.healthCheck();

        if (!isHealthy && instance.status === 'running') {
          instance.status = 'error';

          instance.observability.recordEvent({
            agentId: instance.id,
            sessionId: 'health-check',
            type: 'agent_unhealthy',
            level: 'error',
            message: 'Agent failed health check',
            data: { metrics: instance.metrics },
            tags: ['health', 'unhealthy'],
          });
        } else if (isHealthy && instance.status === 'error') {
          instance.status = 'running';

          instance.observability.recordEvent({
            agentId: instance.id,
            sessionId: 'health-check',
            type: 'agent_recovered',
            level: 'info',
            message: 'Agent recovered and is healthy',
            data: { metrics: instance.metrics },
            tags: ['health', 'recovered'],
          });
        }
      }
    }, this.globalConfig.healthCheckInterval);
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(() => {
      const instances = Array.from(this.instances.values());

      for (const instance of instances) {
        // Update uptime
        instance.metrics.uptime = Date.now() - (instance as any).startTime || 0;

        // Simulate some metrics (in real implementation, these would come from actual monitoring)
        instance.metrics.memoryUsage = Math.random() * 100;
        instance.metrics.cpuUsage = Math.random() * 100;

        // Record performance snapshot
        instance.observability.recordPerformanceSnapshot({
          agentId: instance.id,
          sessionId: 'metrics-collection',
          timestamp: Date.now(),
          metrics: {
            executionTime: instance.metrics.averageResponseTime,
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            stepCount: 0,
            toolCallCount: 0,
            successRate:
              instance.metrics.requestCount > 0
                ? 1 - instance.metrics.errorCount / instance.metrics.requestCount
                : 1,
            errorRate:
              instance.metrics.requestCount > 0
                ? instance.metrics.errorCount / instance.metrics.requestCount
                : 0,
            averageStepTime: instance.metrics.averageResponseTime,
            memoryUsage: instance.metrics.memoryUsage,
            cacheHitRate: 0.8,
          },
          resourceUsage: {
            cpuTime: instance.metrics.cpuUsage * 10,
            memoryMB: instance.metrics.memoryUsage * 2,
            networkRequests: 0,
            diskOperations: 0,
          },
        });
      }
    }, this.globalConfig.metricsCollectionInterval);
  }
}

/**
 * Global production agent factory instance
 */
export const globalProductionAgentFactory = new ProductionAgentFactory();

/**
 * Helper function to create a production agent with defaults
 */
export async function createProductionAgent(
  agentId: string,
  agentType: ProductionAgentConfig['agentType'],
  environment: DeploymentEnvironment = 'production',
  overrides: Partial<ProductionAgentConfig> = {},
): Promise<ProductionAgentInstance> {
  const config: ProductionAgentConfig = {
    agentId,
    agentType,
    environment,
    scaling: {
      minInstances: 1,
      maxInstances: 5,
      targetUtilization: 70,
      scaleUpCooldown: 300000, // 5 minutes
      scaleDownCooldown: 600000, // 10 minutes
    },
    features: {
      enablePersistentMemory: true,
      enableCommunication: true,
      enableAdvancedTools: true,
      enableObservability: true,
      enableAutoScaling: false,
    },
    performance: {
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      memoryLimit: '512MB',
      cpuLimit: '1000m',
    },
    ...overrides,
  };

  return globalProductionAgentFactory.createAgent(config);
}

export default ProductionAgentFactory;
