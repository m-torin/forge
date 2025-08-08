/**
 * AI SDK v5 Advanced Agent Framework - Production Patterns and Monitoring
 * Enterprise-grade patterns for deploying and monitoring advanced agent systems
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { ModelMessage } from 'ai';

import { AgentCommunicationManager, type AgentCapability } from './agent-communication';
import {
  agentConfigurationTemplates,
  type AgentConfigurationTemplate,
} from './agent-configuration-templates';
import { AgentMemoryManager } from './agent-memory';
import { AgentObservabilityManager, type AgentMonitoringConfig } from './agent-observability';
import { DynamicToolManager } from './tool-management-dynamic';

/**
 * Production Agent Lifecycle Manager
 * Manages the complete lifecycle of agents in production environments
 */
export class ProductionAgentLifecycleManager {
  private agents = new Map<string, ProductionAgent>();
  private globalObservability: AgentObservabilityManager;
  private globalCommunication: AgentCommunicationManager;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(private config: ProductionLifecycleConfig) {
    this.globalObservability = new AgentObservabilityManager(config.monitoring);
    this.globalCommunication = new AgentCommunicationManager();

    this.startHealthMonitoring();
    this.startMetricsCollection();
  }

  /**
   * Create and register a production agent with full lifecycle management
   */
  async createAgent(
    agentId: string,
    template: AgentConfigurationTemplate,
    capabilities: AgentCapability[],
    options: ProductionAgentOptions = {},
  ): Promise<ProductionAgent> {
    logInfo('Creating production agent', { agentId, template: template.id });

    const agent = new ProductionAgent(agentId, template, capabilities, {
      ...options,
      globalObservability: this.globalObservability,
      globalCommunication: this.globalCommunication,
    });

    await agent.initialize();
    this.agents.set(agentId, agent);

    // Register agent with global systems
    this.globalCommunication.registerAgent(agentId, capabilities);
    this.globalObservability.updateHealthStatus(agentId, {
      status: 'healthy',
      healthScore: 100,
      issues: [],
      recommendations: [],
    });

    logInfo('Production agent created successfully', { agentId });
    return agent;
  }

  /**
   * Gracefully shutdown an agent
   */
  async shutdownAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      logWarn('Attempted to shutdown non-existent agent', { agentId });
      return;
    }

    logInfo('Shutting down production agent', { agentId });

    try {
      await agent.shutdown();
      this.agents.delete(agentId);

      this.globalObservability.updateHealthStatus(agentId, {
        status: 'offline',
        healthScore: 0,
        issues: [],
        recommendations: [],
      });

      logInfo('Production agent shutdown completed', { agentId });
    } catch (error) {
      logError('Error during agent shutdown', { agentId, error });
      throw error;
    }
  }

  /**
   * Scale agents up or down based on demand
   */
  async scaleAgents(templateId: string, targetCount: number): Promise<void> {
    const template = Object.values(agentConfigurationTemplates).find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const currentAgents = Array.from(this.agents.values()).filter(
      agent => agent.getTemplate().id === templateId,
    );

    const currentCount = currentAgents.length;

    if (targetCount > currentCount) {
      // Scale up
      const toCreate = targetCount - currentCount;
      logInfo('Scaling up agents', { templateId, currentCount, targetCount, toCreate });

      const promises = [];
      for (let i = 0; i < toCreate; i++) {
        const agentId = `${templateId}-${Date.now()}-${i}`;
        promises.push(this.createAgent(agentId, template, []));
      }

      await Promise.all(promises);
    } else if (targetCount < currentCount) {
      // Scale down
      const toRemove = currentCount - targetCount;
      logInfo('Scaling down agents', { templateId, currentCount, targetCount, toRemove });

      const agentsToRemove = currentAgents.slice(0, toRemove);
      const promises = agentsToRemove.map(agent => this.shutdownAgent(agent.getId()));

      await Promise.all(promises);
    }
  }

  /**
   * Get comprehensive system health report
   */
  getSystemHealth(): ProductionSystemHealth {
    const agents = Array.from(this.agents.values());
    const healthReport = this.globalObservability.generateHealthReport();
    const communicationMetrics = this.globalCommunication.getCommunicationMetrics();

    return {
      timestamp: Date.now(),
      totalAgents: agents.length,
      healthyAgents: healthReport.overall.healthyAgents,
      degradedAgents: healthReport.overall.degradedAgents,
      unhealthyAgents: healthReport.overall.unhealthyAgents,
      offlineAgents: healthReport.overall.offlineAgents || 0,
      systemLoad: this.calculateSystemLoad(agents),
      communicationHealth: {
        totalMessages: communicationMetrics.totalMessages,
        averageQueueSize: communicationMetrics.averageQueueSize,
        activeChannels: communicationMetrics.totalChannels,
      },
      recommendations: healthReport.recommendations,
      alerts: this.generateSystemAlerts(healthReport),
    };
  }

  /**
   * Get performance metrics for all agents
   */
  getPerformanceMetrics(): ProductionPerformanceMetrics {
    const agents = Array.from(this.agents.values());
    const agentMetrics = agents.map(agent => ({
      agentId: agent.getId(),
      template: agent.getTemplate().id,
      metrics: agent.getPerformanceMetrics(),
    }));

    return {
      timestamp: Date.now(),
      agentMetrics,
      systemThroughput: this.calculateSystemThroughput(agentMetrics),
      resourceUtilization: this.calculateResourceUtilization(agentMetrics),
      errorRates: this.calculateErrorRates(agentMetrics),
    };
  }

  /**
   * Export system state for backup or analysis
   */
  exportSystemState(): ProductionSystemSnapshot {
    const agents = Array.from(this.agents.values());

    return {
      timestamp: Date.now(),
      version: '1.0.0',
      agents: agents.map(agent => ({
        id: agent.getId(),
        template: agent.getTemplate(),
        state: agent.exportState(),
        metrics: agent.getPerformanceMetrics(),
      })),
      globalHealth: this.getSystemHealth(),
      globalMetrics: this.getPerformanceMetrics(),
    };
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsCollectionInterval);
  }

  private async performHealthChecks(): Promise<void> {
    const agents = Array.from(this.agents.values());

    for (const agent of agents) {
      try {
        const health = await agent.performHealthCheck();
        this.globalObservability.updateHealthStatus(agent.getId(), {
          ...health,
          issues: health.issues.map(issue => ({
            ...issue,
            severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
          })),
        });
      } catch (error) {
        logError('Health check failed for agent', {
          agentId: agent.getId(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        this.globalObservability.updateHealthStatus(agent.getId(), {
          status: 'unhealthy',
          healthScore: 0,
          issues: [
            {
              severity: 'high',
              category: 'system',
              message: 'Health check failed',
              timestamp: Date.now(),
            },
          ],
          recommendations: ['Investigate agent connectivity', 'Consider agent restart'],
        });
      }
    }
  }

  private collectMetrics(): void {
    const performanceMetrics = this.getPerformanceMetrics();

    // Log system-wide metrics
    logInfo('System performance metrics', {
      totalAgents: performanceMetrics.agentMetrics.length,
      systemThroughput: performanceMetrics.systemThroughput,
      resourceUtilization: performanceMetrics.resourceUtilization,
      errorRates: performanceMetrics.errorRates,
    });

    // Check for performance alerts
    if (
      performanceMetrics.errorRates.overall > this.config.monitoring.alertThresholds.maxErrorRate
    ) {
      logWarn('High system error rate detected', {
        errorRate: performanceMetrics.errorRates.overall,
        threshold: this.config.monitoring.alertThresholds.maxErrorRate,
      });
    }
  }

  private calculateSystemLoad(agents: ProductionAgent[]): number {
    if (agents.length === 0) return 0;

    const totalLoad = agents.reduce((sum, agent) => {
      const metrics = agent.getPerformanceMetrics();
      return sum + (metrics.snapshots[0]?.metrics.memoryUsage || 0);
    }, 0);

    return totalLoad / agents.length / 100; // Normalize to 0-1 scale
  }

  private calculateSystemThroughput(
    agentMetrics: Array<{ agentId: string; template: string; metrics: any }>,
  ): number {
    return agentMetrics.reduce((sum, agent) => {
      return sum + (agent.metrics.aggregated.averageTokenUsage || 0);
    }, 0);
  }

  private calculateResourceUtilization(
    agentMetrics: Array<{ agentId: string; template: string; metrics: any }>,
  ): {
    cpu: number;
    memory: number;
    network: number;
  } {
    if (agentMetrics.length === 0) {
      return { cpu: 0, memory: 0, network: 0 };
    }

    const totals = agentMetrics.reduce(
      (acc, agent) => {
        const latest = agent.metrics.snapshots[0];
        if (latest) {
          acc.cpu += latest.resourceUsage.cpuTime;
          acc.memory += latest.resourceUsage.memoryMB;
          acc.network += latest.resourceUsage.networkRequests;
        }
        return acc;
      },
      { cpu: 0, memory: 0, network: 0 },
    );

    return {
      cpu: totals.cpu / agentMetrics.length,
      memory: totals.memory / agentMetrics.length,
      network: totals.network / agentMetrics.length,
    };
  }

  private calculateErrorRates(
    agentMetrics: Array<{ agentId: string; template: string; metrics: any }>,
  ): {
    overall: number;
    byAgent: Record<string, number>;
  } {
    const byAgent: Record<string, number> = {};
    let totalErrors = 0;
    let totalRequests = 0;

    for (const agent of agentMetrics) {
      const errorRate = 1 - (agent.metrics.aggregated.successRate || 0);
      byAgent[agent.agentId] = errorRate;
      totalErrors += errorRate;
      totalRequests += 1;
    }

    return {
      overall: totalRequests > 0 ? totalErrors / totalRequests : 0,
      byAgent,
    };
  }

  private generateSystemAlerts(healthReport: {
    overall: { unhealthyAgents: number; degradedAgents: number; totalAgents: number };
    agents: Array<{ status: string; agentId: string }>;
  }): SystemAlert[] {
    const alerts: SystemAlert[] = [];

    if (healthReport.overall.unhealthyAgents > 0) {
      alerts.push({
        severity: 'high',
        category: 'health',
        message: `${healthReport.overall.unhealthyAgents} agents are unhealthy`,
        timestamp: Date.now(),
        affectedAgents: healthReport.agents
          .filter((a: any) => a.status === 'unhealthy')
          .map((a: any) => a.agentId),
      });
    }

    if (healthReport.overall.degradedAgents > healthReport.overall.totalAgents * 0.3) {
      alerts.push({
        severity: 'medium',
        category: 'performance',
        message: 'High number of degraded agents detected',
        timestamp: Date.now(),
        affectedAgents: healthReport.agents
          .filter((a: any) => a.status === 'degraded')
          .map((a: any) => a.agentId),
      });
    }

    return alerts;
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Shutdown all agents
    const shutdownPromises = Array.from(this.agents.keys()).map(agentId =>
      this.shutdownAgent(agentId),
    );
    await Promise.all(shutdownPromises);
  }
}

/**
 * Production Agent with enhanced capabilities for enterprise environments
 */
export class ProductionAgent {
  private memory: AgentMemoryManager;
  private tools: DynamicToolManager;
  private observability: AgentObservabilityManager;
  private communication: AgentCommunicationManager;
  private isInitialized = false;
  private shutdownHandlers: (() => Promise<void>)[] = [];

  constructor(
    private agentId: string,
    private template: AgentConfigurationTemplate,
    private capabilities: AgentCapability[],
    private options: ProductionAgentInternalOptions,
  ) {
    this.memory = new AgentMemoryManager(agentId, template.memoryConfig);
    this.tools = new DynamicToolManager({
      cacheEnabled: true,
      cacheTtl: 3600000,
      maxCacheSize: 100,
      performanceTracking: true,
      autoOptimization: true,
    });
    this.observability =
      options.globalObservability || new AgentObservabilityManager(template.monitoringConfig);
    this.communication = options.globalCommunication || new AgentCommunicationManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    logInfo('Initializing production agent', { agentId: this.agentId });

    try {
      // Initialize built-in tools if specified
      if (this.options.initializeBuiltInTools !== false) {
        const builtInTools = await import('./tool-management-dynamic');
        builtInTools.dynamicToolUtils.initializeBuiltInTools(this.tools);
      }

      // Setup graceful shutdown handlers
      this.setupShutdownHandlers();

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      logInfo('Production agent initialized successfully', { agentId: this.agentId });
    } catch (error) {
      logError('Failed to initialize production agent', { agentId: this.agentId, error });
      throw error;
    }
  }

  async processMessage(message: ModelMessage, context?: unknown): Promise<ModelMessage> {
    if (!this.isInitialized) {
      throw new Error('Agent not initialized');
    }

    const sessionId = `session_${Date.now()}`;
    const traceId = this.observability.startTrace(this.agentId, sessionId);

    try {
      // Store message in memory
      this.memory.addMessage(message);

      // Set context if provided
      if (context) {
        this.memory.pushContext(context);
      }

      // Get relevant context from memory
      const relevantContext = this.memory.getRelevantContext(
        message.content as string,
        this.template.memoryConfig.maxEntries / 10,
      );

      // Record processing start
      this.observability.recordEvent({
        agentId: this.agentId,
        sessionId,
        type: 'step_start',
        level: 'info',
        message: 'Started processing user message',
        data: {
          messageLength: (message.content as string).length,
          contextItems: relevantContext.length,
        },
        tags: ['processing', 'message'],
      });

      // Process message using template configuration
      const response = await this.generateResponse(message, relevantContext, sessionId);

      // Store response
      this.memory.addMessage(response);

      // Record successful processing
      this.observability.recordEvent({
        agentId: this.agentId,
        sessionId,
        type: 'step_complete',
        level: 'info',
        message: 'Message processing completed successfully',
        data: {
          responseLength: (response.content as string).length,
        },
        tags: ['processing', 'success'],
      });

      // Complete trace
      this.observability.stopTrace(traceId, {
        steps: [{ stepNumber: 1, result: 'Message processed successfully' }],
        finalResult: { text: response.content as string, finishReason: 'stop' },
        totalTokensUsed: 100, // Mock value
        executionTime: Date.now() - parseInt(sessionId.split('_')[1]),
        stoppedBy: 'completed',
        metadata: {},
      });

      return response;
    } catch (error) {
      this.observability.recordEvent({
        agentId: this.agentId,
        sessionId,
        type: 'error',
        level: 'error',
        message: 'Error processing message',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        tags: ['processing', 'error'],
      });

      throw error;
    }
  }

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    healthScore: number;
    issues: Array<{ severity: string; category: string; message: string; timestamp: number }>;
    recommendations: string[];
  }> {
    const issues: any[] = [];
    const recommendations: string[] = [];
    let healthScore = 100;

    // Check memory health
    const memoryMetrics = this.memory.getMemoryMetrics();
    if (memoryMetrics.totalMemories > this.template.memoryConfig.maxEntries * 0.9) {
      issues.push({
        severity: 'medium',
        category: 'memory',
        message: 'Agent memory near capacity',
        timestamp: Date.now(),
      });
      recommendations.push('Consider memory cleanup or increase capacity');
      healthScore -= 20;
    }

    // Check tool performance
    const toolReport = this.tools.generateUsageReport();
    if (toolReport.overallSuccessRate < 0.8) {
      issues.push({
        severity: 'high',
        category: 'tools',
        message: 'Low tool success rate',
        timestamp: Date.now(),
      });
      recommendations.push('Investigate tool reliability issues');
      healthScore -= 30;
    }

    // Check observability health
    const performanceMetrics = this.observability.getPerformanceMetrics(this.agentId);
    if (performanceMetrics.snapshots.length > 0) {
      const latestSnapshot = performanceMetrics.snapshots[0];
      if (latestSnapshot.metrics.errorRate > 0.2) {
        issues.push({
          severity: 'high',
          category: 'performance',
          message: 'High error rate detected',
          timestamp: Date.now(),
        });
        recommendations.push('Investigate error patterns and causes');
        healthScore -= 25;
      }
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    if (healthScore >= 90) {
      status = 'healthy';
    } else if (healthScore >= 70) {
      status = 'degraded';
    } else if (healthScore >= 30) {
      status = 'unhealthy';
    } else {
      status = 'offline';
    }

    return {
      status,
      healthScore,
      issues,
      recommendations,
    };
  }

  getPerformanceMetrics() {
    return {
      memory: this.memory.getMemoryMetrics(),
      tools: this.tools.generateUsageReport(),
      observability: this.observability.getPerformanceMetrics(this.agentId),
      snapshots: this.observability.getPerformanceMetrics(this.agentId).snapshots,
      aggregated: this.observability.getPerformanceMetrics(this.agentId).aggregated,
    };
  }

  exportState() {
    return {
      snapshot: this.memory.createSnapshot(`export_${Date.now()}`),
      debugData: this.observability.exportDebugData(this.agentId),
      toolMetrics: this.tools.generateUsageReport(),
      template: this.template,
      capabilities: this.capabilities,
    };
  }

  getId(): string {
    return this.agentId;
  }

  getTemplate(): AgentConfigurationTemplate {
    return this.template;
  }

  private async generateResponse(
    message: ModelMessage,
    context: unknown[],
    _sessionId: string,
  ): Promise<ModelMessage> {
    // Mock response generation - in production, integrate with AI model
    const responseText = `I understand your message: "${message.content}". Based on my configuration as a ${this.template.name}, I'm processing your request with ${context.length} relevant context items.`;

    return {
      role: 'assistant',
      content: responseText,
    };
  }

  private setupShutdownHandlers(): void {
    // Graceful shutdown on process termination
    const gracefulShutdown = async (signal: string) => {
      logInfo('Received shutdown signal, starting graceful shutdown', {
        agentId: this.agentId,
        signal,
      });

      try {
        await this.shutdown();
        process.exit(0);
      } catch (error) {
        logError('Error during graceful shutdown', { agentId: this.agentId, error });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  private startHealthMonitoring(): void {
    // Periodic self-health checks
    setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        this.observability.updateHealthStatus(this.agentId, {
          ...health,
          issues: health.issues.map(issue => ({
            ...issue,
            severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
          })),
        });
      } catch (error) {
        logError('Self health check failed', { agentId: this.agentId, error });
      }
    }, 60000); // Every minute
  }

  async shutdown(): Promise<void> {
    logInfo('Shutting down production agent', { agentId: this.agentId });

    try {
      // Run shutdown handlers
      await Promise.all(this.shutdownHandlers.map(handler => handler()));

      // Clear agent data
      this.observability.clearAgentData(this.agentId);

      logInfo('Production agent shutdown complete', { agentId: this.agentId });
    } catch (error) {
      logError('Error during agent shutdown', { agentId: this.agentId, error });
      throw error;
    }
  }
}

/**
 * Production monitoring utilities
 */
export class ProductionMonitoring {
  static createDashboard(lifecycleManager: ProductionAgentLifecycleManager): ProductionDashboard {
    return {
      async getSystemOverview() {
        const health = lifecycleManager.getSystemHealth();
        const performance = lifecycleManager.getPerformanceMetrics();

        return {
          timestamp: Date.now(),
          system: {
            status:
              health.healthyAgents === health.totalAgents
                ? 'healthy'
                : health.unhealthyAgents > 0
                  ? 'unhealthy'
                  : 'degraded',
            totalAgents: health.totalAgents,
            healthyAgents: health.healthyAgents,
            load: health.systemLoad,
          },
          performance: {
            throughput: performance.systemThroughput,
            errorRate: performance.errorRates.overall,
            resourceUtilization: performance.resourceUtilization,
          },
          alerts: health.alerts,
        };
      },

      async getAgentDetails(agentId: string) {
        // Implementation would fetch specific agent details
        return {
          agentId,
          status: 'healthy',
          uptime: Date.now() - 1000000,
          metrics: {},
          recentActivity: [],
        };
      },

      async getPerformanceTrends(timeRange: { start: number; end: number }) {
        // Implementation would fetch historical performance data
        return {
          timeRange,
          throughputTrend: [],
          errorRateTrend: [],
          resourceTrend: [],
        };
      },
    };
  }

  static createAlerting(config: AlertingConfig): ProductionAlerting {
    return {
      async sendAlert(alert: SystemAlert) {
        logWarn('System alert triggered', alert);

        // In production, integrate with alerting systems like PagerDuty, Slack, etc.
        if (config.webhookUrl) {
          // Send webhook notification
        }

        if (config.emailRecipients && config.emailRecipients.length > 0) {
          // Send email notification
        }
      },

      async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
        logInfo('Alert acknowledged', { alertId, acknowledgedBy });
      },

      async resolveAlert(alertId: string, resolvedBy: string) {
        logInfo('Alert resolved', { alertId, resolvedBy });
      },
    };
  }
}

// Type definitions
export interface ProductionLifecycleConfig {
  monitoring: AgentMonitoringConfig;
  healthCheckInterval: number;
  metricsCollectionInterval: number;
  autoscaling?: {
    enabled: boolean;
    minAgents: number;
    maxAgents: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };
}

export interface ProductionAgentOptions {
  initializeBuiltInTools?: boolean;
  customToolLoaders?: unknown[];
  memoryBackend?: 'memory' | 'redis' | 'postgresql';
  communicationBackend?: 'memory' | 'redis' | 'rabbitmq';
}

interface ProductionAgentInternalOptions extends ProductionAgentOptions {
  globalObservability?: AgentObservabilityManager;
  globalCommunication?: AgentCommunicationManager;
}

export interface ProductionSystemHealth {
  timestamp: number;
  totalAgents: number;
  healthyAgents: number;
  degradedAgents: number;
  unhealthyAgents: number;
  offlineAgents: number;
  systemLoad: number;
  communicationHealth: {
    totalMessages: number;
    averageQueueSize: number;
    activeChannels: number;
  };
  recommendations: string[];
  alerts: SystemAlert[];
}

export interface ProductionPerformanceMetrics {
  timestamp: number;
  agentMetrics: Array<{
    agentId: string;
    template: string;
    metrics: unknown;
  }>;
  systemThroughput: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
  };
  errorRates: {
    overall: number;
    byAgent: Record<string, number>;
  };
}

export interface ProductionSystemSnapshot {
  timestamp: number;
  version: string;
  agents: Array<{
    id: string;
    template: AgentConfigurationTemplate;
    state: unknown;
    metrics: unknown;
  }>;
  globalHealth: ProductionSystemHealth;
  globalMetrics: ProductionPerformanceMetrics;
}

export interface SystemAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'health' | 'performance' | 'security' | 'system';
  message: string;
  timestamp: number;
  affectedAgents: string[];
  metadata?: unknown;
}

export interface ProductionDashboard {
  getSystemOverview(): Promise<{
    timestamp: number;
    system: { status: string; totalAgents: number; healthyAgents: number; load: number };
    performance: {
      throughput: number;
      errorRate: number;
      resourceUtilization: { cpu: number; memory: number; network: number };
    };
    alerts: SystemAlert[];
  }>;
  getAgentDetails(agentId: string): Promise<{
    agentId: string;
    status: string;
    uptime: number;
    metrics: unknown;
    recentActivity: unknown[];
  }>;
  getPerformanceTrends(timeRange: { start: number; end: number }): Promise<{
    timeRange: { start: number; end: number };
    throughputTrend: unknown[];
    errorRateTrend: unknown[];
    resourceTrend: unknown[];
  }>;
}

export interface ProductionAlerting {
  sendAlert(alert: SystemAlert): Promise<void>;
  acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void>;
  resolveAlert(alertId: string, resolvedBy: string): Promise<void>;
}

export interface AlertingConfig {
  webhookUrl?: string;
  emailRecipients?: string[];
  slackChannel?: string;
  pagerDutyIntegrationKey?: string;
}

// Export production utilities
export const productionUtils = {
  createLifecycleManager: (config: ProductionLifecycleConfig) =>
    new ProductionAgentLifecycleManager(config),

  createMonitoring: () => ProductionMonitoring,

  getDefaultProductionConfig: (): ProductionLifecycleConfig => ({
    monitoring: {
      enableTracing: true,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      traceLevel: 'warn',
      retentionDays: 30,
      maxTraceEvents: 10000,
      performanceSnapshotInterval: 300000, // 5 minutes
      healthCheckInterval: 60000, // 1 minute
      alertThresholds: {
        maxExecutionTime: 30000,
        maxTokenUsage: 50000,
        minSuccessRate: 0.95,
        maxErrorRate: 0.05,
      },
    },
    healthCheckInterval: 60000, // 1 minute
    metricsCollectionInterval: 300000, // 5 minutes
    autoscaling: {
      enabled: true,
      minAgents: 1,
      maxAgents: 10,
      scaleUpThreshold: 0.8,
      scaleDownThreshold: 0.3,
    },
  }),

  createProductionTemplate: (
    baseTemplate: AgentConfigurationTemplate,
    overrides: Partial<AgentConfigurationTemplate> = {},
  ): AgentConfigurationTemplate => ({
    ...baseTemplate,
    ...overrides,
    monitoringConfig: {
      ...baseTemplate.monitoringConfig,
      ...overrides.monitoringConfig,
      enableTracing: true,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      traceLevel: 'warn',
      retentionDays: 30,
      alertThresholds: {
        ...baseTemplate.monitoringConfig.alertThresholds,
        maxExecutionTime: 30000,
        maxTokenUsage: 50000,
        minSuccessRate: 0.95,
        maxErrorRate: 0.05,
        ...overrides.monitoringConfig?.alertThresholds,
      },
    },
    memoryConfig: {
      ...baseTemplate.memoryConfig,
      ...overrides.memoryConfig,
      persistenceEnabled: true,
      indexingEnabled: true,
      searchEnabled: true,
    },
  }),
};
