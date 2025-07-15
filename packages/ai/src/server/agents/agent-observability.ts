/**
 * AI SDK v5 Agent Observability and Debugging Tools
 * Comprehensive monitoring, debugging, and observability for agent systems
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { ModelMessage } from 'ai';
import type { AgentDefinition } from './agent-orchestrator';
import type { MultiStepResult } from './multi-step-execution';

/**
 * Agent trace event types
 */
export type AgentTraceEventType =
  | 'agent_start'
  | 'agent_stop'
  | 'step_start'
  | 'step_complete'
  | 'tool_call'
  | 'tool_result'
  | 'decision_point'
  | 'state_change'
  | 'error'
  | 'warning'
  | 'communication'
  | 'memory_access'
  | 'configuration_change';

/**
 * Agent trace event
 */
export interface AgentTraceEvent {
  id: string;
  agentId: string;
  sessionId: string;
  type: AgentTraceEventType;
  timestamp: number;
  duration?: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data: Record<string, any>;
  stackTrace?: string;
  correlationId?: string;
  parentEventId?: string;
  tags: string[];
}

/**
 * Agent performance metrics
 */
export interface AgentPerformanceSnapshot {
  agentId: string;
  sessionId: string;
  timestamp: number;
  metrics: {
    executionTime: number;
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    stepCount: number;
    toolCallCount: number;
    successRate: number;
    errorRate: number;
    averageStepTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  resourceUsage: {
    cpuTime: number;
    memoryMB: number;
    networkRequests: number;
    diskOperations: number;
  };
}

/**
 * Agent health status
 */
export interface AgentHealthStatus {
  agentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  lastHealthCheck: number;
  healthScore: number; // 0-100
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
    timestamp: number;
  }>;
  recommendations: string[];
}

/**
 * Debugging context for agent analysis
 */
export interface AgentDebugContext {
  agentId: string;
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  conversationHistory: ModelMessage[];
  variableState: Record<string, any>;
  memorySnapshot: any;
  activeTools: string[];
  recentEvents: AgentTraceEvent[];
  performanceMetrics: AgentPerformanceSnapshot;
  healthStatus: AgentHealthStatus;
}

/**
 * Agent monitoring configuration
 */
export interface AgentMonitoringConfig {
  enableTracing: boolean;
  enablePerformanceTracking: boolean;
  enableHealthChecks: boolean;
  traceLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionDays: number;
  maxTraceEvents: number;
  performanceSnapshotInterval: number;
  healthCheckInterval: number;
  alertThresholds: {
    maxExecutionTime: number;
    maxTokenUsage: number;
    minSuccessRate: number;
    maxErrorRate: number;
  };
}

/**
 * Comprehensive agent observability system
 */
export class AgentObservabilityManager {
  private traceEvents = new Map<string, AgentTraceEvent[]>(); // agentId -> events
  private performanceSnapshots = new Map<string, AgentPerformanceSnapshot[]>();
  private healthStatuses = new Map<string, AgentHealthStatus>();
  private activeTraces = new Map<string, { startTime: number; events: AgentTraceEvent[] }>();
  private debugContexts = new Map<string, AgentDebugContext>();

  constructor(
    private config: AgentMonitoringConfig = {
      enableTracing: true,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      traceLevel: 'info',
      retentionDays: 7,
      maxTraceEvents: 1000,
      performanceSnapshotInterval: 60000, // 1 minute
      healthCheckInterval: 300000, // 5 minutes
      alertThresholds: {
        maxExecutionTime: 300000, // 5 minutes
        maxTokenUsage: 50000,
        minSuccessRate: 0.8,
        maxErrorRate: 0.2,
      },
    },
  ) {
    if (config.enableHealthChecks) {
      this.startHealthCheckInterval();
    }

    if (config.enablePerformanceTracking) {
      this.startPerformanceSnapshotInterval();
    }

    logInfo('Agent Observability Manager: Initialized', {
      operation: 'agent_observability_init',
      metadata: { config },
    });
  }

  /**
   * Start tracing an agent execution
   */
  startTrace(agentId: string, sessionId: string): string {
    const traceId = this.generateTraceId();

    this.activeTraces.set(traceId, {
      startTime: Date.now(),
      events: [],
    });

    this.recordEvent({
      agentId,
      sessionId,
      type: 'agent_start',
      level: 'info',
      message: `Agent execution started`,
      data: { traceId },
      tags: ['trace', 'start'],
    });

    return traceId;
  }

  /**
   * Stop tracing an agent execution
   */
  stopTrace(traceId: string, result?: MultiStepResult): void {
    const trace = this.activeTraces.get(traceId);
    if (!trace) return;

    const executionTime = Date.now() - trace.startTime;

    this.recordEvent({
      agentId: 'unknown', // Will be updated by the trace context
      sessionId: 'unknown',
      type: 'agent_stop',
      level: 'info',
      message: `Agent execution completed`,
      data: {
        traceId,
        executionTime,
        result: result
          ? {
              steps: result.steps.length,
              tokens: result.totalTokensUsed,
              stoppedBy: result.stoppedBy,
            }
          : undefined,
      },
      tags: ['trace', 'stop'],
    });

    this.activeTraces.delete(traceId);
  }

  /**
   * Record trace event
   */
  recordEvent(
    event: Omit<AgentTraceEvent, 'id' | 'timestamp'> & {
      timestamp?: number;
      correlationId?: string;
    },
  ): string {
    if (!this.config.enableTracing) return '';

    const eventId = this.generateEventId();
    const fullEvent: AgentTraceEvent = {
      ...event,
      id: eventId,
      timestamp: event.timestamp || Date.now(),
      tags: event.tags || [],
    };

    // Store event in agent's trace history
    if (!this.traceEvents.has(event.agentId)) {
      this.traceEvents.set(event.agentId, []);
    }

    const agentEvents = this.traceEvents.get(event.agentId) ?? [];
    agentEvents.push(fullEvent);

    // Limit trace events per agent
    if (agentEvents.length > this.config.maxTraceEvents) {
      agentEvents.splice(0, agentEvents.length - this.config.maxTraceEvents);
    }

    // Log event if at appropriate level
    if (this.shouldLogEvent(fullEvent.level)) {
      this.logTraceEvent(fullEvent);
    }

    return eventId;
  }

  /**
   * Record performance snapshot
   */
  recordPerformanceSnapshot(snapshot: AgentPerformanceSnapshot): void {
    if (!this.config.enablePerformanceTracking) return;

    if (!this.performanceSnapshots.has(snapshot.agentId)) {
      this.performanceSnapshots.set(snapshot.agentId, []);
    }

    const snapshots = this.performanceSnapshots.get(snapshot.agentId)!;
    snapshots.push(snapshot);

    // Check alert thresholds
    this.checkPerformanceAlerts(snapshot);

    // Cleanup old snapshots
    const cutoffTime = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const filteredSnapshots = snapshots.filter(s => s.timestamp >= cutoffTime);
    this.performanceSnapshots.set(snapshot.agentId, filteredSnapshots);
  }

  /**
   * Update agent health status
   */
  updateHealthStatus(agentId: string, status: Partial<AgentHealthStatus>): void {
    const currentStatus = this.healthStatuses.get(agentId) || {
      agentId,
      status: 'healthy',
      lastHealthCheck: Date.now(),
      healthScore: 100,
      issues: [],
      recommendations: [],
    };

    const updatedStatus = { ...currentStatus, ...status, lastHealthCheck: Date.now() };
    this.healthStatuses.set(agentId, updatedStatus);

    // Record health change event
    this.recordEvent({
      agentId,
      sessionId: 'health_check',
      type: 'state_change',
      level: updatedStatus.status === 'healthy' ? 'info' : 'warn',
      message: `Agent health status updated to ${updatedStatus.status}`,
      data: { healthScore: updatedStatus.healthScore, issues: updatedStatus.issues.length },
      tags: ['health', 'status'],
    });
  }

  /**
   * Create debugging context for an agent
   */
  createDebugContext(
    agentId: string,
    sessionId: string,
    additionalData: Partial<AgentDebugContext> = {},
  ): AgentDebugContext {
    const recentEvents = this.getTraceEvents(agentId, { limit: 50 });
    const performanceSnapshots = this.performanceSnapshots.get(agentId) || [];
    const latestPerformance = performanceSnapshots[performanceSnapshots.length - 1];
    const healthStatus = this.healthStatuses.get(agentId);

    const debugContext: AgentDebugContext = {
      agentId,
      sessionId,
      currentStep: 0,
      totalSteps: 0,
      conversationHistory: [],
      variableState: {},
      memorySnapshot: null,
      activeTools: [],
      recentEvents,
      performanceMetrics:
        latestPerformance || this.createEmptyPerformanceSnapshot(agentId, sessionId),
      healthStatus: healthStatus || this.createDefaultHealthStatus(agentId),
      ...additionalData,
    };

    this.debugContexts.set(`${agentId}:${sessionId}`, debugContext);
    return debugContext;
  }

  /**
   * Get trace events for an agent
   */
  getTraceEvents(
    agentId: string,
    options: {
      type?: AgentTraceEventType;
      level?: 'debug' | 'info' | 'warn' | 'error';
      since?: number;
      limit?: number;
      sessionId?: string;
    } = {},
  ): AgentTraceEvent[] {
    const events = this.traceEvents.get(agentId) || [];
    let filteredEvents = [...events];

    if (options.type) {
      filteredEvents = filteredEvents.filter(e => e.type === options.type);
    }

    if (options.level) {
      const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
      const minPriority = levelPriority[options.level];
      filteredEvents = filteredEvents.filter(e => levelPriority[e.level] >= minPriority);
    }

    if (options.since) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= options.since!);
    }

    if (options.sessionId) {
      filteredEvents = filteredEvents.filter(e => e.sessionId === options.sessionId);
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      filteredEvents = filteredEvents.slice(0, options.limit);
    }

    return filteredEvents;
  }

  /**
   * Get performance metrics for an agent
   */
  getPerformanceMetrics(
    agentId: string,
    timeRange?: { start: number; end: number },
  ): {
    snapshots: AgentPerformanceSnapshot[];
    aggregated: {
      averageExecutionTime: number;
      averageTokenUsage: number;
      averageStepCount: number;
      successRate: number;
      errorRate: number;
    };
  } {
    let snapshots = this.performanceSnapshots.get(agentId) || [];

    if (timeRange) {
      snapshots = snapshots.filter(
        s => s.timestamp >= timeRange.start && s.timestamp <= timeRange.end,
      );
    }

    if (snapshots.length === 0) {
      return {
        snapshots: [],
        aggregated: {
          averageExecutionTime: 0,
          averageTokenUsage: 0,
          averageStepCount: 0,
          successRate: 0,
          errorRate: 0,
        },
      };
    }

    const aggregated = {
      averageExecutionTime:
        snapshots.reduce((sum, s) => sum + s.metrics.executionTime, 0) / snapshots.length,
      averageTokenUsage:
        snapshots.reduce((sum, s) => sum + s.metrics.tokenUsage.totalTokens, 0) / snapshots.length,
      averageStepCount:
        snapshots.reduce((sum, s) => sum + s.metrics.stepCount, 0) / snapshots.length,
      successRate: snapshots.reduce((sum, s) => sum + s.metrics.successRate, 0) / snapshots.length,
      errorRate: snapshots.reduce((sum, s) => sum + s.metrics.errorRate, 0) / snapshots.length,
    };

    return { snapshots, aggregated };
  }

  /**
   * Generate agent health report
   */
  generateHealthReport(agentId?: string): {
    overall: {
      totalAgents: number;
      healthyAgents: number;
      degradedAgents: number;
      unhealthyAgents: number;
      offlineAgents: number;
    };
    agents: AgentHealthStatus[];
    recommendations: string[];
  } {
    const allStatuses = Array.from(this.healthStatuses.values());
    const targetStatuses = agentId ? allStatuses.filter(s => s.agentId === agentId) : allStatuses;

    const overall = {
      totalAgents: targetStatuses.length,
      healthyAgents: targetStatuses.filter(s => s.status === 'healthy').length,
      degradedAgents: targetStatuses.filter(s => s.status === 'degraded').length,
      unhealthyAgents: targetStatuses.filter(s => s.status === 'unhealthy').length,
      offlineAgents: targetStatuses.filter(s => s.status === 'offline').length,
    };

    const recommendations: string[] = [];

    if (overall.unhealthyAgents > 0) {
      recommendations.push(
        `${overall.unhealthyAgents} agents are unhealthy and require immediate attention`,
      );
    }

    if (overall.degradedAgents > 0) {
      recommendations.push(
        `${overall.degradedAgents} agents are degraded and should be monitored closely`,
      );
    }

    if (overall.offlineAgents > 0) {
      recommendations.push(
        `${overall.offlineAgents} agents are offline and may need to be restarted`,
      );
    }

    return {
      overall,
      agents: targetStatuses,
      recommendations,
    };
  }

  /**
   * Export debug data for analysis
   */
  exportDebugData(
    agentId: string,
    sessionId?: string,
  ): {
    agent: {
      id: string;
      metadata: any;
    };
    traces: AgentTraceEvent[];
    performance: AgentPerformanceSnapshot[];
    health: AgentHealthStatus | null;
    debugContext: AgentDebugContext | null;
  } {
    const traces = this.getTraceEvents(agentId, { sessionId });
    const performance = this.performanceSnapshots.get(agentId) || [];
    const health = this.healthStatuses.get(agentId) || null;
    const debugContext = sessionId
      ? this.debugContexts.get(`${agentId}:${sessionId}`) || null
      : null;

    return {
      agent: {
        id: agentId,
        metadata: {}, // Could include agent definition metadata
      },
      traces,
      performance,
      health,
      debugContext,
    };
  }

  /**
   * Clear observability data for an agent
   */
  clearAgentData(agentId: string): void {
    this.traceEvents.delete(agentId);
    this.performanceSnapshots.delete(agentId);
    this.healthStatuses.delete(agentId);

    // Clear debug contexts for this agent
    for (const [key] of this.debugContexts.entries()) {
      if (key.startsWith(`${agentId}:`)) {
        this.debugContexts.delete(key);
      }
    }

    logInfo('Agent Observability Manager: Cleared agent data', {
      operation: 'agent_data_cleared',
      metadata: { agentId },
    });
  }

  // Private helper methods

  private shouldLogEvent(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    const configPriority = levelPriority[this.config.traceLevel];
    const eventPriority = levelPriority[level];

    return eventPriority >= configPriority;
  }

  private logTraceEvent(event: AgentTraceEvent): void {
    const logData = {
      operation: `agent_trace_${event.type}`,
      metadata: {
        agentId: event.agentId,
        sessionId: event.sessionId,
        eventId: event.id,
        ...event.data,
      },
    };

    switch (event.level) {
      case 'debug':
        logInfo(event.message, logData);
        break;
      case 'info':
        logInfo(event.message, logData);
        break;
      case 'warn':
        logWarn(event.message, logData);
        break;
      case 'error':
        logError(event.message, { ...logData, error: new Error(event.message) });
        break;
    }
  }

  private checkPerformanceAlerts(snapshot: AgentPerformanceSnapshot): void {
    const alerts: string[] = [];

    if (snapshot.metrics.executionTime > this.config.alertThresholds.maxExecutionTime) {
      alerts.push(`Execution time ${snapshot.metrics.executionTime}ms exceeds threshold`);
    }

    if (snapshot.metrics.tokenUsage.totalTokens > this.config.alertThresholds.maxTokenUsage) {
      alerts.push(`Token usage ${snapshot.metrics.tokenUsage.totalTokens} exceeds threshold`);
    }

    if (snapshot.metrics.successRate < this.config.alertThresholds.minSuccessRate) {
      alerts.push(`Success rate ${snapshot.metrics.successRate} below threshold`);
    }

    if (snapshot.metrics.errorRate > this.config.alertThresholds.maxErrorRate) {
      alerts.push(`Error rate ${snapshot.metrics.errorRate} exceeds threshold`);
    }

    if (alerts.length > 0) {
      this.recordEvent({
        agentId: snapshot.agentId,
        sessionId: snapshot.sessionId,
        type: 'warning',
        level: 'warn',
        message: `Performance alerts detected: ${alerts.join(', ')}`,
        data: { alerts, snapshot: snapshot.metrics },
        tags: ['performance', 'alert'],
      });
    }
  }

  private startHealthCheckInterval(): void {
    setInterval(() => {
      this.runHealthChecks();
    }, this.config.healthCheckInterval);
  }

  private startPerformanceSnapshotInterval(): void {
    // This would typically be triggered by agent execution events
    // For now, it's a placeholder for scheduled performance monitoring
  }

  private runHealthChecks(): void {
    for (const [agentId, healthStatus] of this.healthStatuses.entries()) {
      // Simple health check logic - can be enhanced
      const timeSinceLastCheck = Date.now() - healthStatus.lastHealthCheck;

      if (timeSinceLastCheck > this.config.healthCheckInterval * 2) {
        this.updateHealthStatus(agentId, {
          status: 'offline',
          healthScore: 0,
          issues: [
            {
              severity: 'critical',
              category: 'connectivity',
              message: 'Agent has not responded to health checks',
              timestamp: Date.now(),
            },
          ],
        });
      }
    }
  }

  private createEmptyPerformanceSnapshot(
    agentId: string,
    sessionId: string,
  ): AgentPerformanceSnapshot {
    return {
      agentId,
      sessionId,
      timestamp: Date.now(),
      metrics: {
        executionTime: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        stepCount: 0,
        toolCallCount: 0,
        successRate: 0,
        errorRate: 0,
        averageStepTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
      },
      resourceUsage: {
        cpuTime: 0,
        memoryMB: 0,
        networkRequests: 0,
        diskOperations: 0,
      },
    };
  }

  private createDefaultHealthStatus(agentId: string): AgentHealthStatus {
    return {
      agentId,
      status: 'healthy',
      lastHealthCheck: Date.now(),
      healthScore: 100,
      issues: [],
      recommendations: [],
    };
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

/**
 * Observability-aware agent wrapper
 */
export function createObservableAgent<T extends AgentDefinition>(
  agent: T,
  observabilityManager: AgentObservabilityManager = globalObservabilityManager,
): T & { observability: AgentObservabilityManager } {
  return {
    ...agent,
    observability: observabilityManager,
  };
}

/**
 * Utility functions for agent debugging
 */
export const debugUtils = {
  /**
   * Create formatted debug output
   */
  formatDebugContext: (context: AgentDebugContext): string => {
    const sections = [
      `=== Agent Debug Context ===`,
      `Agent ID: ${context.agentId}`,
      `Session ID: ${context.sessionId}`,
      `Step: ${context.currentStep}/${context.totalSteps}`,
      `Health: ${context.healthStatus.status} (${context.healthStatus.healthScore}/100)`,
      ``,
      `=== Performance Metrics ===`,
      `Execution Time: ${context.performanceMetrics.metrics.executionTime}ms`,
      `Token Usage: ${context.performanceMetrics.metrics.tokenUsage.totalTokens}`,
      `Steps: ${context.performanceMetrics.metrics.stepCount}`,
      `Success Rate: ${Math.round(context.performanceMetrics.metrics.successRate * 100)}%`,
      ``,
      `=== Recent Events ===`,
      ...context.recentEvents
        .slice(0, 10)
        .map(
          event =>
            `[${new Date(event.timestamp).toISOString()}] ${event.level.toUpperCase()}: ${event.message}`,
        ),
      ``,
      `=== Active Tools ===`,
      ...context.activeTools.map(tool => `- ${tool}`),
      ``,
      `=== Variable State ===`,
      ...Object.entries(context.variableState).map(
        ([key, value]) => `${key}: ${JSON.stringify(value)}`,
      ),
    ];

    return sections.join('\n');
  },

  /**
   * Extract error patterns from trace events
   */
  analyzeErrorPatterns: (
    events: AgentTraceEvent[],
  ): {
    errorTypes: Record<string, number>;
    errorFrequency: number;
    commonErrorMessages: string[];
    recommendations: string[];
  } => {
    const errorEvents = events.filter(e => e.level === 'error');
    const errorTypes: Record<string, number> = {};
    const errorMessages = new Map<string, number>();

    errorEvents.forEach(event => {
      const errorType = event.data?.errorType || event.type;
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;

      const message = event.message;
      errorMessages.set(message, (errorMessages.get(message) || 0) + 1);
    });

    const commonErrorMessages = Array.from(errorMessages.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([message]) => message);

    const recommendations: string[] = [];

    if (errorEvents.length > events.length * 0.2) {
      recommendations.push('High error rate detected - consider reviewing agent configuration');
    }

    if (errorTypes.tool_call > 0) {
      recommendations.push(
        'Tool call errors detected - verify tool configurations and permissions',
      );
    }

    if (errorTypes.timeout > 0) {
      recommendations.push(
        'Timeout errors detected - consider increasing timeout limits or optimizing performance',
      );
    }

    return {
      errorTypes,
      errorFrequency: errorEvents.length / Math.max(events.length, 1),
      commonErrorMessages,
      recommendations,
    };
  },

  /**
   * Generate performance insights
   */
  generatePerformanceInsights: (
    snapshots: AgentPerformanceSnapshot[],
  ): {
    trends: {
      executionTime: 'improving' | 'stable' | 'degrading';
      tokenUsage: 'improving' | 'stable' | 'degrading';
      successRate: 'improving' | 'stable' | 'degrading';
    };
    bottlenecks: string[];
    recommendations: string[];
  } => {
    if (snapshots.length < 2) {
      return {
        trends: { executionTime: 'stable', tokenUsage: 'stable', successRate: 'stable' },
        bottlenecks: [],
        recommendations: ['Insufficient data for trend analysis'],
      };
    }

    const recent = snapshots.slice(-5);
    const older = snapshots.slice(-10, -5);

    const avgRecent = {
      executionTime: recent.reduce((sum, s) => sum + s.metrics.executionTime, 0) / recent.length,
      tokenUsage:
        recent.reduce((sum, s) => sum + s.metrics.tokenUsage.totalTokens, 0) / recent.length,
      successRate: recent.reduce((sum, s) => sum + s.metrics.successRate, 0) / recent.length,
    };

    const avgOlder = {
      executionTime:
        older.reduce((sum, s) => sum + s.metrics.executionTime, 0) / Math.max(older.length, 1),
      tokenUsage:
        older.reduce((sum, s) => sum + s.metrics.tokenUsage.totalTokens, 0) /
        Math.max(older.length, 1),
      successRate:
        older.reduce((sum, s) => sum + s.metrics.successRate, 0) / Math.max(older.length, 1),
    };

    const getTrend = (recent: number, older: number): 'improving' | 'stable' | 'degrading' => {
      const change = (recent - older) / Math.max(older, 1);
      if (Math.abs(change) < 0.1) return 'stable';
      return change < 0 ? 'improving' : 'degrading';
    };

    const trends = {
      executionTime: getTrend(avgRecent.executionTime, avgOlder.executionTime),
      tokenUsage: getTrend(avgRecent.tokenUsage, avgOlder.tokenUsage),
      successRate:
        older.length > 0 ? getTrend(avgOlder.successRate, avgRecent.successRate) : 'stable', // Inverted for success rate
    };

    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    if (avgRecent.executionTime > 30000) {
      bottlenecks.push('High execution time');
      recommendations.push('Consider optimizing tool selection or reducing step count');
    }

    if (avgRecent.tokenUsage > 20000) {
      bottlenecks.push('High token usage');
      recommendations.push('Consider using more efficient prompts or reducing context size');
    }

    if (avgRecent.successRate < 0.8) {
      bottlenecks.push('Low success rate');
      recommendations.push('Review error patterns and improve error handling');
    }

    return { trends, bottlenecks, recommendations };
  },
} as const;

/**
 * Global observability manager instance
 */
export const globalObservabilityManager = new AgentObservabilityManager();
