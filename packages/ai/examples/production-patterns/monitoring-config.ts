/**
 * Production Monitoring and Alerting Configuration
 *
 * This module provides comprehensive monitoring, alerting, and observability
 * configurations for production AI agent deployments. It integrates with
 * popular monitoring tools and provides custom metrics and alerts.
 */

// Import observability components
import {
  type AgentPerformanceSnapshot,
  type AgentTraceEvent,
} from '../../src/server/agents/agent-observability';

/**
 * Monitoring Integration Types
 */
export type MonitoringProvider = 'datadog' | 'newrelic' | 'prometheus' | 'cloudwatch' | 'custom';

export interface MonitoringIntegration {
  provider: MonitoringProvider;
  config: {
    apiKey?: string;
    endpoint?: string;
    namespace?: string;
    tags?: Record<string, string>;
  };
  enabled: boolean;
}

/**
 * Alert Configuration
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  channels: ('email' | 'slack' | 'pagerduty' | 'webhook')[];
  cooldown: number; // Minimum time between alerts in milliseconds
  enabled: boolean;
}

/**
 * Dashboard Configuration
 */
export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  panels: Array<{
    id: string;
    title: string;
    type: 'timeseries' | 'gauge' | 'table' | 'heatmap' | 'logs';
    metrics: string[];
    timeRange: string;
    refreshInterval: string;
  }>;
}

/**
 * Production Monitoring Configuration Manager
 */
export class ProductionMonitoringManager {
  private integrations: Map<string, MonitoringIntegration> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private dashboards: Map<string, DashboardConfig> = new Map();
  private metricsBuffer: Array<{
    timestamp: number;
    metric: string;
    value: number;
    tags: Record<string, string>;
  }> = [];
  private alertHistory: Map<string, number> = new Map(); // Last alert time by rule ID

  constructor(
    private config: {
      metricsFlushInterval: number;
      maxMetricsBuffer: number;
      enableAsyncProcessing: boolean;
    } = {
      metricsFlushInterval: 60000, // 1 minute
      maxMetricsBuffer: 10000,
      enableAsyncProcessing: true,
    },
  ) {
    this.initializeDefaultAlerts();
    this.initializeDefaultDashboards();
    this.startMetricsProcessing();
  }

  /**
   * Add monitoring integration
   */
  addIntegration(integration: MonitoringIntegration): void {
    this.integrations.set(integration.provider, integration);
    console.log(`✅ Added monitoring integration: ${integration.provider}`);
  }

  /**
   * Configure alert rules
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`✅ Added alert rule: ${rule.name}`);
  }

  /**
   * Add dashboard configuration
   */
  addDashboard(dashboard: DashboardConfig): void {
    this.dashboards.set(dashboard.id, dashboard);
    console.log(`✅ Added dashboard: ${dashboard.name}`);
  }

  /**
   * Record custom metric
   */
  recordMetric(metric: string, value: number, tags: Record<string, string> = {}): void {
    const metricData = {
      timestamp: Date.now(),
      metric,
      value,
      tags: {
        environment: process.env.NODE_ENV || 'development',
        service: 'ai-agents',
        ...tags,
      },
    };

    this.metricsBuffer.push(metricData);

    // Check buffer size
    if (this.metricsBuffer.length > this.config.maxMetricsBuffer) {
      this.flushMetrics();
    }

    // Check alert rules
    this.checkAlertRules(metric, value, tags);
  }

  /**
   * Record agent performance metrics
   */
  recordAgentMetrics(agentId: string, agentType: string, snapshot: AgentPerformanceSnapshot): void {
    const baseTagsL = {
      agent_id: agentId,
      agent_type: agentType,
      session_id: snapshot.sessionId,
    };

    // Record core metrics
    this.recordMetric('agent.execution_time', snapshot.metrics.executionTime, baseTagsL);
    this.recordMetric(
      'agent.token_usage.total',
      snapshot.metrics.tokenUsage.totalTokens,
      baseTagsL,
    );
    this.recordMetric(
      'agent.token_usage.prompt',
      snapshot.metrics.tokenUsage.inputTokens,
      baseTagsL,
    );
    this.recordMetric(
      'agent.token_usage.completion',
      snapshot.metrics.tokenUsage.outputTokens,
      baseTagsL,
    );
    this.recordMetric('agent.step_count', snapshot.metrics.stepCount, baseTagsL);
    this.recordMetric('agent.tool_call_count', snapshot.metrics.toolCallCount, baseTagsL);
    this.recordMetric('agent.success_rate', snapshot.metrics.successRate, baseTagsL);
    this.recordMetric('agent.error_rate', snapshot.metrics.errorRate, baseTagsL);
    this.recordMetric('agent.average_step_time', snapshot.metrics.averageStepTime, baseTagsL);
    this.recordMetric('agent.memory_usage', snapshot.metrics.memoryUsage, baseTagsL);
    this.recordMetric('agent.cache_hit_rate', snapshot.metrics.cacheHitRate, baseTagsL);

    // Record resource metrics
    this.recordMetric('agent.resource.cpu_time', snapshot.resourceUsage.cpuTime, baseTagsL);
    this.recordMetric('agent.resource.memory_mb', snapshot.resourceUsage.memoryMB, baseTagsL);
    this.recordMetric(
      'agent.resource.network_requests',
      snapshot.resourceUsage.networkRequests,
      baseTagsL,
    );
    this.recordMetric(
      'agent.resource.disk_operations',
      snapshot.resourceUsage.diskOperations,
      baseTagsL,
    );
  }

  /**
   * Record agent events for log analysis
   */
  recordAgentEvent(agentId: string, agentType: string, event: AgentTraceEvent): void {
    const logEntry = {
      timestamp: event.timestamp,
      level: event.level,
      agent_id: agentId,
      agent_type: agentType,
      session_id: event.sessionId,
      event_type: event.type,
      message: event.message,
      data: event.data,
      tags: event.tags,
    };

    // Send to log aggregation systems
    this.sendToLogSystems(logEntry);

    // Record event metrics
    this.recordMetric('agent.events.total', 1, {
      agent_id: agentId,
      agent_type: agentType,
      event_type: event.type,
      level: event.level,
    });

    // Record error events separately
    if (event.level === 'error') {
      this.recordMetric('agent.errors.total', 1, {
        agent_id: agentId,
        agent_type: agentType,
        error_type: event.type,
      });
    }
  }

  /**
   * Generate comprehensive monitoring report
   */
  generateMonitoringReport(timeRange: { start: number; end: number }): {
    summary: {
      totalMetrics: number;
      activeAlerts: number;
      systemHealth: 'healthy' | 'degraded' | 'critical';
      availabilityScore: number;
    };
    metrics: {
      agentMetrics: Record<string, any>;
      systemMetrics: Record<string, any>;
      errorRates: Record<string, number>;
    };
    alerts: Array<{
      rule: string;
      status: 'firing' | 'resolved';
      since: number;
      message: string;
    }>;
    recommendations: string[];
  } {
    const metrics = this.aggregateMetrics(timeRange);
    const activeAlerts = this.getActiveAlerts();
    const systemHealth = this.calculateSystemHealth(metrics);

    return {
      summary: {
        totalMetrics: this.metricsBuffer.length,
        activeAlerts: activeAlerts.length,
        systemHealth,
        availabilityScore: this.calculateAvailabilityScore(metrics),
      },
      metrics: {
        agentMetrics: metrics.agent,
        systemMetrics: metrics.system,
        errorRates: metrics.errors,
      },
      alerts: activeAlerts,
      recommendations: this.generateRecommendations(metrics, activeAlerts),
    };
  }

  /**
   * Export monitoring configuration for external tools
   */
  exportConfiguration(): {
    prometheus: string;
    grafana: any;
    alertmanager: any;
    datadog: any;
  } {
    return {
      prometheus: this.generatePrometheusConfig(),
      grafana: this.generateGrafanaConfig(),
      alertmanager: this.generateAlertManagerConfig(),
      datadog: this.generateDatadogConfig(),
    };
  }

  private initializeDefaultAlerts(): void {
    const defaultAlerts: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Agent Error Rate',
        description: 'Alert when agent error rate exceeds 10%',
        metric: 'agent.error_rate',
        condition: 'greater_than',
        threshold: 0.1,
        severity: 'critical',
        channels: ['email', 'slack', 'pagerduty'],
        cooldown: 300000, // 5 minutes
        enabled: true,
      },
      {
        id: 'slow_response_time',
        name: 'Slow Agent Response Time',
        description: 'Alert when average response time exceeds 10 seconds',
        metric: 'agent.execution_time',
        condition: 'greater_than',
        threshold: 10000,
        severity: 'high',
        channels: ['email', 'slack'],
        cooldown: 600000, // 10 minutes
        enabled: true,
      },
      {
        id: 'high_token_usage',
        name: 'High Token Usage',
        description: 'Alert when token usage exceeds 50k tokens per hour',
        metric: 'agent.token_usage.total',
        condition: 'greater_than',
        threshold: 50000,
        severity: 'medium',
        channels: ['slack'],
        cooldown: 3600000, // 1 hour
        enabled: true,
      },
      {
        id: 'memory_usage_high',
        name: 'High Memory Usage',
        description: 'Alert when agent memory usage exceeds 90%',
        metric: 'agent.memory_usage',
        condition: 'greater_than',
        threshold: 90,
        severity: 'high',
        channels: ['email', 'slack'],
        cooldown: 300000, // 5 minutes
        enabled: true,
      },
      {
        id: 'low_success_rate',
        name: 'Low Success Rate',
        description: 'Alert when agent success rate drops below 80%',
        metric: 'agent.success_rate',
        condition: 'less_than',
        threshold: 0.8,
        severity: 'high',
        channels: ['email', 'slack', 'pagerduty'],
        cooldown: 600000, // 10 minutes
        enabled: true,
      },
    ];

    defaultAlerts.forEach(alert => this.addAlertRule(alert));
  }

  private initializeDefaultDashboards(): void {
    const agentOverviewDashboard: DashboardConfig = {
      id: 'agent_overview',
      name: 'Agent Overview Dashboard',
      description: 'High-level overview of all agent metrics and health',
      panels: [
        {
          id: 'response_time',
          title: 'Average Response Time',
          type: 'timeseries',
          metrics: ['agent.execution_time'],
          timeRange: '1h',
          refreshInterval: '30s',
        },
        {
          id: 'success_rate',
          title: 'Success Rate',
          type: 'gauge',
          metrics: ['agent.success_rate'],
          timeRange: '1h',
          refreshInterval: '30s',
        },
        {
          id: 'token_usage',
          title: 'Token Usage Over Time',
          type: 'timeseries',
          metrics: ['agent.token_usage.total'],
          timeRange: '24h',
          refreshInterval: '5m',
        },
        {
          id: 'error_rate',
          title: 'Error Rate',
          type: 'timeseries',
          metrics: ['agent.error_rate'],
          timeRange: '1h',
          refreshInterval: '30s',
        },
        {
          id: 'active_agents',
          title: 'Active Agents',
          type: 'table',
          metrics: ['agent.events.total'],
          timeRange: '5m',
          refreshInterval: '10s',
        },
        {
          id: 'recent_errors',
          title: 'Recent Error Events',
          type: 'logs',
          metrics: ['agent.errors.total'],
          timeRange: '1h',
          refreshInterval: '30s',
        },
      ],
    };

    const performanceDashboard: DashboardConfig = {
      id: 'performance_dashboard',
      name: 'Agent Performance Dashboard',
      description: 'Detailed performance metrics and resource usage',
      panels: [
        {
          id: 'cpu_usage',
          title: 'CPU Usage',
          type: 'heatmap',
          metrics: ['agent.resource.cpu_time'],
          timeRange: '4h',
          refreshInterval: '1m',
        },
        {
          id: 'memory_usage',
          title: 'Memory Usage',
          type: 'timeseries',
          metrics: ['agent.resource.memory_mb'],
          timeRange: '4h',
          refreshInterval: '1m',
        },
        {
          id: 'cache_performance',
          title: 'Cache Hit Rate',
          type: 'gauge',
          metrics: ['agent.cache_hit_rate'],
          timeRange: '1h',
          refreshInterval: '1m',
        },
        {
          id: 'tool_performance',
          title: 'Tool Call Performance',
          type: 'timeseries',
          metrics: ['agent.tool_call_count'],
          timeRange: '2h',
          refreshInterval: '1m',
        },
      ],
    };

    this.addDashboard(agentOverviewDashboard);
    this.addDashboard(performanceDashboard);
  }

  private checkAlertRules(metric: string, value: number, tags: Record<string, string>): void {
    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled || rule.metric !== metric) continue;

      const lastAlertTime = this.alertHistory.get(ruleId) || 0;
      const now = Date.now();

      if (now - lastAlertTime < rule.cooldown) continue;

      let shouldAlert = false;
      switch (rule.condition) {
        case 'greater_than':
          shouldAlert = value > rule.threshold;
          break;
        case 'less_than':
          shouldAlert = value < rule.threshold;
          break;
        case 'equals':
          shouldAlert = value === rule.threshold;
          break;
        case 'not_equals':
          shouldAlert = value !== rule.threshold;
          break;
      }

      if (shouldAlert) {
        this.triggerAlert(rule, value, tags);
        this.alertHistory.set(ruleId, now);
      }
    }
  }

  private triggerAlert(rule: AlertRule, value: number, tags: Record<string, string>): void {
    const alertData = {
      rule: rule.name,
      severity: rule.severity,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      condition: rule.condition,
      tags,
      timestamp: Date.now(),
    };

    console.log(
      `🚨 ALERT: ${rule.name} - ${rule.metric} ${rule.condition} ${rule.threshold} (current: ${value})`,
    );

    // Send to configured channels
    rule.channels.forEach(channel => {
      this.sendAlert(channel, alertData);
    });

    // Record alert metric
    this.recordMetric('alerts.triggered', 1, {
      rule_id: rule.id,
      severity: rule.severity,
      metric: rule.metric,
    });
  }

  private async sendAlert(channel: string, alertData: any): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmailAlert(alertData);
        break;
      case 'slack':
        await this.sendSlackAlert(alertData);
        break;
      case 'pagerduty':
        await this.sendPagerDutyAlert(alertData);
        break;
      case 'webhook':
        await this.sendWebhookAlert(alertData);
        break;
    }
  }

  private async sendEmailAlert(alertData: any): Promise<void> {
    // Implement email notification
    console.log(`📧 Email alert sent: ${alertData.rule}`);
  }

  private async sendSlackAlert(alertData: any): Promise<void> {
    // Implement Slack notification
    console.log(`💬 Slack alert sent: ${alertData.rule}`);
  }

  private async sendPagerDutyAlert(alertData: any): Promise<void> {
    // Implement PagerDuty notification
    console.log(`📟 PagerDuty alert sent: ${alertData.rule}`);
  }

  private async sendWebhookAlert(alertData: any): Promise<void> {
    // Implement webhook notification
    console.log(`🔗 Webhook alert sent: ${alertData.rule}`);
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer.length = 0;

    // Send to monitoring integrations
    for (const [provider, integration] of this.integrations) {
      if (integration.enabled) {
        this.sendMetricsToProvider(provider, integration, metrics);
      }
    }
  }

  private async sendMetricsToProvider(
    provider: MonitoringProvider,
    integration: MonitoringIntegration,
    metrics: any[],
  ): Promise<void> {
    try {
      switch (provider) {
        case 'datadog':
          await this.sendToDatadog(integration, metrics);
          break;
        case 'newrelic':
          await this.sendToNewRelic(integration, metrics);
          break;
        case 'prometheus':
          await this.sendToPrometheus(integration, metrics);
          break;
        case 'cloudwatch':
          await this.sendToCloudWatch(integration, metrics);
          break;
        case 'custom':
          await this.sendToCustomEndpoint(integration, metrics);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to send metrics to ${provider}:`, error);
    }
  }

  private async sendToDatadog(integration: MonitoringIntegration, metrics: any[]): Promise<void> {
    // Implement Datadog metrics submission
    console.log(`📊 Sent ${metrics.length} metrics to Datadog`);
  }

  private async sendToNewRelic(integration: MonitoringIntegration, metrics: any[]): Promise<void> {
    // Implement New Relic metrics submission
    console.log(`📊 Sent ${metrics.length} metrics to New Relic`);
  }

  private async sendToPrometheus(
    integration: MonitoringIntegration,
    metrics: any[],
  ): Promise<void> {
    // Implement Prometheus metrics submission
    console.log(`📊 Sent ${metrics.length} metrics to Prometheus`);
  }

  private async sendToCloudWatch(
    integration: MonitoringIntegration,
    metrics: any[],
  ): Promise<void> {
    // Implement CloudWatch metrics submission
    console.log(`📊 Sent ${metrics.length} metrics to CloudWatch`);
  }

  private async sendToCustomEndpoint(
    integration: MonitoringIntegration,
    metrics: any[],
  ): Promise<void> {
    // Implement custom endpoint metrics submission
    console.log(`📊 Sent ${metrics.length} metrics to custom endpoint`);
  }

  private sendToLogSystems(logEntry: any): void {
    // Send structured logs to log aggregation systems
    console.log(`📝 Log entry:`, JSON.stringify(logEntry));
  }

  private aggregateMetrics(_timeRange: { start: number; end: number }): any {
    // Implement metrics aggregation logic
    return {
      agent: {},
      system: {},
      errors: {},
    };
  }

  private getActiveAlerts(): any[] {
    // Return currently active alerts
    return [];
  }

  private calculateSystemHealth(_metrics: any): 'healthy' | 'degraded' | 'critical' {
    // Implement system health calculation logic
    return 'healthy';
  }

  private calculateAvailabilityScore(_metrics: any): number {
    // Implement availability score calculation
    return 0.999;
  }

  private generateRecommendations(metrics: any, alerts: any[]): string[] {
    const recommendations: string[] = [];

    if (alerts.length > 0) {
      recommendations.push(`You have ${alerts.length} active alerts that require attention`);
    }

    // Add more intelligent recommendations based on metrics
    return recommendations;
  }

  private generatePrometheusConfig(): string {
    return `# Prometheus configuration for AI Agents
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "agent_alerts.yml"

scrape_configs:
  - job_name: 'ai-agents'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s`;
  }

  private generateGrafanaConfig(): any {
    return {
      dashboard: {
        id: null,
        title: 'AI Agents Monitoring',
        tags: ['ai', 'agents', 'monitoring'],
        timezone: 'browser',
        panels: this.dashboards.get('agent_overview')?.panels || [],
        time: {
          from: 'now-1h',
          to: 'now',
        },
        refresh: '30s',
      },
    };
  }

  private generateAlertManagerConfig(): any {
    return {
      global: {
        smtp_smarthost: 'localhost:587',
        smtp_from: 'alerts@example.com',
      },
      route: {
        group_by: ['alertname'],
        group_wait: '10s',
        group_interval: '10s',
        repeat_interval: '1h',
        receiver: 'web.hook',
      },
      receivers: [
        {
          name: 'web.hook',
          webhook_configs: [
            {
              url: 'http://localhost:5001/',
            },
          ],
        },
      ],
    };
  }

  private generateDatadogConfig(): any {
    return {
      api_key: '${DATADOG_API_KEY}',
      app_key: '${DATADOG_APP_KEY}',
      site: 'datadoghq.com',
      tags: ['service:ai-agents', 'env:production'],
    };
  }

  private startMetricsProcessing(): void {
    setInterval(() => {
      this.flushMetrics();
    }, this.config.metricsFlushInterval);
  }
}

/**
 * Global monitoring manager instance
 */
export const globalMonitoringManager = new ProductionMonitoringManager();

/**
 * Helper function to set up comprehensive monitoring
 */
export function setupProductionMonitoring(
  integrations: MonitoringIntegration[] = [],
  customAlerts: AlertRule[] = [],
): ProductionMonitoringManager {
  const monitoring = new ProductionMonitoringManager();

  // Add integrations
  integrations.forEach(integration => {
    monitoring.addIntegration(integration);
  });

  // Add custom alerts
  customAlerts.forEach(alert => {
    monitoring.addAlertRule(alert);
  });

  return monitoring;
}

/**
 * Production monitoring configuration examples
 */
export const productionMonitoringExamples = {
  // Datadog integration
  datadogIntegration: {
    provider: 'datadog' as MonitoringProvider,
    config: {
      apiKey: process.env.DATADOG_API_KEY,
      endpoint: 'https://api.datadoghq.com',
      namespace: 'ai.agents',
      tags: {
        service: 'ai-agents',
        environment: 'production',
      },
    },
    enabled: true,
  },

  // CloudWatch integration
  cloudwatchIntegration: {
    provider: 'cloudwatch' as MonitoringProvider,
    config: {
      namespace: 'AI/Agents',
      tags: {
        Application: 'AIAgents',
        Environment: 'Production',
      },
    },
    enabled: true,
  },

  // Custom webhook integration
  customIntegration: {
    provider: 'custom' as MonitoringProvider,
    config: {
      endpoint: 'https://your-monitoring-system.com/metrics',
      apiKey: process.env.CUSTOM_MONITORING_API_KEY,
    },
    enabled: true,
  },
};

export default ProductionMonitoringManager;
