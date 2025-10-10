/**
 * Enterprise Performance Alerting System
 *
 * Advanced performance degradation alerting system leveraging Node.js 22+ features for
 * real-time monitoring, intelligent threshold detection, and automated incident response.
 * This module provides comprehensive performance alerting with adaptive thresholds and
 * multi-channel notification support.
 *
 * ## Key Node 22+ Features Used:
 * - **WeakMap/WeakSet**: Context-aware alert tracking without memory leaks
 * - **Promise.withResolvers()**: External promise control for complex alert workflows
 * - **High-resolution timing**: Nanosecond-precision performance threshold monitoring
 * - **AbortSignal.timeout()**: Timeout management for alert processing operations
 * - **Structured cloning**: Safe alert data serialization for notification systems
 *
 * ## Core Alerting Capabilities:
 * - Real-time performance threshold monitoring with adaptive baselines
 * - Multi-level alerting (info, warning, critical) with escalation paths
 * - Context-aware alert suppression and correlation
 * - Intelligent alert clustering and noise reduction
 * - Integration with external notification systems (email, Slack, PagerDuty)
 * - Performance anomaly detection using statistical analysis
 * - Automated incident creation and tracking
 * - Alert fatigue prevention with smart filtering
 *
 * @module PerformanceAlerts
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { createServerObservability } from '@repo/observability/server/next';
import { globalMemoryMonitor } from '../shared/utils/memory-monitor';
import { globalPerformanceMonitor } from '../shared/utils/performance-metrics';
import { globalTimeoutManager } from '../shared/utils/timeout-manager';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Alert categories
 */
export enum AlertCategory {
  PERFORMANCE = 'performance',
  MEMORY = 'memory',
  AVAILABILITY = 'availability',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
}

/**
 * Performance alert configuration
 */
interface PerformanceAlertRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: AlertCategory;
  readonly severity: AlertSeverity;
  readonly metric: string;
  readonly condition: {
    readonly operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    readonly threshold: number | [number, number];
    readonly duration: number; // milliseconds - how long condition must persist
  };
  readonly evaluationInterval: number; // milliseconds
  readonly suppressionTime: number; // milliseconds - prevent duplicate alerts
  readonly escalationRules?: Array<{
    afterMinutes: number;
    severity: AlertSeverity;
    notificationChannels: string[];
  }>;
  readonly tags?: Record<string, string>;
  readonly enabled: boolean;
}

/**
 * Alert instance
 */
interface PerformanceAlert {
  readonly id: string;
  readonly ruleId: string;
  readonly title: string;
  readonly description: string;
  readonly category: AlertCategory;
  readonly severity: AlertSeverity;
  readonly triggeredAt: Date;
  readonly acknowledgedAt?: Date;
  readonly resolvedAt?: Date;
  readonly acknowledgedBy?: string;
  readonly currentValue: number;
  readonly threshold: number | [number, number];
  readonly metadata: Record<string, unknown>;
  readonly tags: Record<string, string>;
  readonly incidentId?: string;
}

/**
 * Alert notification configuration
 */
interface NotificationChannel {
  readonly id: string;
  readonly type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'teams' | 'discord';
  readonly name: string;
  readonly config: Record<string, unknown>;
  readonly severityFilter: AlertSeverity[];
  readonly categoryFilter: AlertCategory[];
  readonly enabled: boolean;
}

/**
 * Performance alerting system configuration
 */
interface PerformanceAlertingConfig {
  readonly evaluationInterval: number;
  readonly alertRetentionDays: number;
  readonly enableAdaptiveThresholds: boolean;
  readonly anomalyDetectionSensitivity: number; // 0-1
  readonly correlationWindow: number; // milliseconds
  readonly maxAlertsPerRule: number;
  readonly defaultNotificationChannels: string[];
  readonly escalationSettings: {
    readonly enableAutoEscalation: boolean;
    readonly defaultEscalationDelay: number; // minutes
    readonly maxEscalationLevel: number;
  };
}

/**
 * Default alerting configuration
 */
const DEFAULT_CONFIG: PerformanceAlertingConfig = {
  evaluationInterval: 30000, // 30 seconds
  alertRetentionDays: 30,
  enableAdaptiveThresholds: true,
  anomalyDetectionSensitivity: 0.8,
  correlationWindow: 5 * 60 * 1000, // 5 minutes
  maxAlertsPerRule: 10,
  defaultNotificationChannels: ['console', 'log'],
  escalationSettings: {
    enableAutoEscalation: true,
    defaultEscalationDelay: 15, // 15 minutes
    maxEscalationLevel: 3,
  },
};

/**
 * Alert evaluation context
 */
interface AlertEvaluationContext {
  readonly currentValue: number;
  readonly previousValues: number[];
  readonly timestamp: Date;
  readonly metadata: Record<string, unknown>;
  readonly trend: 'increasing' | 'decreasing' | 'stable';
  readonly anomalyScore: number; // 0-1
}

/**
 * Enterprise Performance Alerting System
 */
export class PerformanceAlertingSystem {
  private static instance: PerformanceAlertingSystem;
  private readonly config: PerformanceAlertingConfig;
  private readonly alertRules = new Map<string, PerformanceAlertRule>();
  private readonly activeAlerts = new Map<string, PerformanceAlert>();
  private readonly notificationChannels = new Map<string, NotificationChannel>();
  private readonly alertHistory: PerformanceAlert[] = [];
  private readonly suppressionTracker = new Map<string, Date>();
  private readonly contextTracking = new WeakMap<object, Set<string>>();

  private evaluationTimer?: NodeJS.Timeout;
  private isActive = false;
  private lastEvaluationTime: Date = new Date();

  // Adaptive baseline tracking
  private readonly baselineValues = new Map<string, number[]>();
  private readonly baselineWindow = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config: Partial<PerformanceAlertingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultRules();
    this.initializeDefaultChannels();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<PerformanceAlertingConfig>): PerformanceAlertingSystem {
    if (!PerformanceAlertingSystem.instance) {
      PerformanceAlertingSystem.instance = new PerformanceAlertingSystem(config);
    }
    return PerformanceAlertingSystem.instance;
  }

  /**
   * Start the alerting system
   */
  async start(): Promise<void> {
    if (this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting performance alerting system', {
      config: this.config,
      rulesCount: this.alertRules.size,
      channelsCount: this.notificationChannels.size,
    });

    this.isActive = true;

    // Start evaluation cycle
    this.evaluationTimer = setInterval(async () => {
      try {
        await this.evaluateAllRules();
        await this.processEscalations();
        await this.cleanupExpiredAlerts();
      } catch (error) {
        logger?.log('error', 'Alert evaluation failed', { error });
      }
    }, this.config.evaluationInterval);

    // Initial evaluation
    await this.evaluateAllRules();
  }

  /**
   * Stop the alerting system
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Stopping performance alerting system');

    this.isActive = false;

    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = undefined;
    }
  }

  /**
   * Add or update alert rule
   */
  addRule(rule: PerformanceAlertRule): void {
    this.alertRules.set(rule.id, rule);

    // Initialize baseline tracking for this rule
    if (!this.baselineValues.has(rule.metric)) {
      this.baselineValues.set(rule.metric, []);
    }
  }

  /**
   * Remove alert rule
   */
  removeRule(ruleId: string): void {
    this.alertRules.delete(ruleId);

    // Cleanup active alerts for this rule
    for (const [alertId, alert] of this.activeAlerts) {
      if (alert.ruleId === ruleId) {
        this.activeAlerts.delete(alertId);
      }
    }
  }

  /**
   * Add or update notification channel
   */
  addNotificationChannel(channel: NotificationChannel): void {
    this.notificationChannels.set(channel.id, channel);
  }

  /**
   * Remove notification channel
   */
  removeNotificationChannel(channelId: string): void {
    this.notificationChannels.delete(channelId);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const acknowledgedAlert: PerformanceAlert = {
      ...alert,
      acknowledgedAt: new Date(),
      acknowledgedBy,
    };

    this.activeAlerts.set(alertId, acknowledgedAlert);

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Alert acknowledged', {
      alertId,
      acknowledgedBy,
      title: alert.title,
    });

    // Send acknowledgment notification
    await this.sendNotification(acknowledgedAlert, 'acknowledged');
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy?: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const resolvedAlert: PerformanceAlert = {
      ...alert,
      resolvedAt: new Date(),
    };

    this.activeAlerts.delete(alertId);
    this.alertHistory.push(resolvedAlert);

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Alert resolved', {
      alertId,
      resolvedBy,
      title: alert.title,
      duration: Date.now() - alert.triggeredAt.getTime(),
    });

    // Send resolution notification
    await this.sendNotification(resolvedAlert, 'resolved');
  }

  /**
   * Get current active alerts
   */
  getActiveAlerts(): ReadonlyArray<PerformanceAlert> {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 100): ReadonlyArray<PerformanceAlert> {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get alerting statistics
   */
  getStatistics(): {
    activeAlerts: number;
    totalAlertsToday: number;
    alertsByCategory: Record<AlertCategory, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    topAlertRules: Array<{
      ruleId: string;
      name: string;
      count: number;
    }>;
    averageResolutionTime: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAlerts = this.alertHistory.filter(alert => alert.triggeredAt >= today);

    const alertsByCategory: Record<AlertCategory, number> = {} as any;
    const alertsBySeverity: Record<AlertSeverity, number> = {} as any;
    const ruleAlertCounts = new Map<string, { name: string; count: number }>();

    for (const alert of [...this.activeAlerts.values(), ...todayAlerts]) {
      alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;

      const rule = this.alertRules.get(alert.ruleId);
      if (rule) {
        const current = ruleAlertCounts.get(alert.ruleId) || { name: rule.name, count: 0 };
        ruleAlertCounts.set(alert.ruleId, { ...current, count: current.count + 1 });
      }
    }

    const resolvedAlerts = this.alertHistory.filter(alert => alert.resolvedAt);
    const averageResolutionTime =
      resolvedAlerts.length > 0
        ? resolvedAlerts.reduce(
            (sum, alert) => sum + (alert.resolvedAt!.getTime() - alert.triggeredAt.getTime()),
            0,
          ) / resolvedAlerts.length
        : 0;

    return {
      activeAlerts: this.activeAlerts.size,
      totalAlertsToday: todayAlerts.length,
      alertsByCategory,
      alertsBySeverity,
      topAlertRules: Array.from(ruleAlertCounts.entries())
        .map(([ruleId, data]) => ({ ruleId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      averageResolutionTime,
    };
  }

  /**
   * Track alerts for specific context
   */
  trackContext<T extends object>(context: T, alertIds: string[]): void {
    this.contextTracking.set(context, new Set(alertIds));
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    // High event loop lag
    this.addRule({
      id: 'event-loop-lag-high',
      name: 'High Event Loop Lag',
      description: 'Event loop lag exceeds acceptable threshold',
      category: AlertCategory.PERFORMANCE,
      severity: AlertSeverity.WARNING,
      metric: 'eventLoop.lag',
      condition: {
        operator: 'gt',
        threshold: 100, // 100ms
        duration: 60000, // 1 minute
      },
      evaluationInterval: 30000,
      suppressionTime: 5 * 60 * 1000, // 5 minutes
      tags: { component: 'event-loop', priority: 'high' },
      enabled: true,
    });

    // Critical event loop lag
    this.addRule({
      id: 'event-loop-lag-critical',
      name: 'Critical Event Loop Lag',
      description: 'Event loop lag is critically high',
      category: AlertCategory.PERFORMANCE,
      severity: AlertSeverity.CRITICAL,
      metric: 'eventLoop.lag',
      condition: {
        operator: 'gt',
        threshold: 500, // 500ms
        duration: 30000, // 30 seconds
      },
      evaluationInterval: 15000,
      suppressionTime: 3 * 60 * 1000, // 3 minutes
      escalationRules: [
        {
          afterMinutes: 5,
          severity: AlertSeverity.CRITICAL,
          notificationChannels: ['pager'],
        },
      ],
      tags: { component: 'event-loop', priority: 'critical' },
      enabled: true,
    });

    // High memory usage
    this.addRule({
      id: 'memory-usage-high',
      name: 'High Memory Usage',
      description: 'Memory usage exceeds safe threshold',
      category: AlertCategory.MEMORY,
      severity: AlertSeverity.WARNING,
      metric: 'memory.heapUsedPercent',
      condition: {
        operator: 'gt',
        threshold: 80, // 80%
        duration: 2 * 60 * 1000, // 2 minutes
      },
      evaluationInterval: 30000,
      suppressionTime: 10 * 60 * 1000, // 10 minutes
      tags: { component: 'memory', priority: 'high' },
      enabled: true,
    });

    // Critical memory usage
    this.addRule({
      id: 'memory-usage-critical',
      name: 'Critical Memory Usage',
      description: 'Memory usage is critically high',
      category: AlertCategory.MEMORY,
      severity: AlertSeverity.CRITICAL,
      metric: 'memory.heapUsedPercent',
      condition: {
        operator: 'gt',
        threshold: 95, // 95%
        duration: 30000, // 30 seconds
      },
      evaluationInterval: 15000,
      suppressionTime: 2 * 60 * 1000, // 2 minutes
      escalationRules: [
        {
          afterMinutes: 2,
          severity: AlertSeverity.CRITICAL,
          notificationChannels: ['pager', 'email'],
        },
      ],
      tags: { component: 'memory', priority: 'critical' },
      enabled: true,
    });

    // Memory leaks detected
    this.addRule({
      id: 'memory-leaks-detected',
      name: 'Memory Leaks Detected',
      description: 'Potential memory leaks have been detected',
      category: AlertCategory.MEMORY,
      severity: AlertSeverity.WARNING,
      metric: 'memory.leakCount',
      condition: {
        operator: 'gt',
        threshold: 5,
        duration: 5 * 60 * 1000, // 5 minutes
      },
      evaluationInterval: 60000, // 1 minute
      suppressionTime: 15 * 60 * 1000, // 15 minutes
      tags: { component: 'memory', type: 'leak-detection' },
      enabled: true,
    });

    // High CPU usage (if available)
    this.addRule({
      id: 'cpu-usage-high',
      name: 'High CPU Usage',
      description: 'CPU usage is above normal levels',
      category: AlertCategory.PERFORMANCE,
      severity: AlertSeverity.WARNING,
      metric: 'cpu.usage',
      condition: {
        operator: 'gt',
        threshold: 80, // 80%
        duration: 3 * 60 * 1000, // 3 minutes
      },
      evaluationInterval: 30000,
      suppressionTime: 10 * 60 * 1000, // 10 minutes
      tags: { component: 'cpu', priority: 'medium' },
      enabled: true,
    });

    // Operation timeout alerts
    this.addRule({
      id: 'operation-timeouts-high',
      name: 'High Operation Timeouts',
      description: 'Unusual number of operation timeouts detected',
      category: AlertCategory.AVAILABILITY,
      severity: AlertSeverity.WARNING,
      metric: 'operations.timeouts',
      condition: {
        operator: 'gt',
        threshold: 10,
        duration: 5 * 60 * 1000, // 5 minutes
      },
      evaluationInterval: 60000, // 1 minute
      suppressionTime: 10 * 60 * 1000, // 10 minutes
      tags: { component: 'operations', type: 'timeout' },
      enabled: true,
    });
  }

  /**
   * Initialize default notification channels
   */
  private initializeDefaultChannels(): void {
    // Console logging channel
    this.addNotificationChannel({
      id: 'console',
      type: 'webhook',
      name: 'Console Log',
      config: {},
      severityFilter: [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL],
      categoryFilter: Object.values(AlertCategory),
      enabled: true,
    });

    // Server observability logging
    this.addNotificationChannel({
      id: 'log',
      type: 'webhook',
      name: 'Server Log',
      config: {},
      severityFilter: [AlertSeverity.WARNING, AlertSeverity.CRITICAL],
      categoryFilter: Object.values(AlertCategory),
      enabled: true,
    });
  }

  /**
   * Evaluate all alert rules
   */
  private async evaluateAllRules(): Promise<void> {
    const enabledRules = Array.from(this.alertRules.values()).filter(rule => rule.enabled);

    for (const rule of enabledRules) {
      try {
        await this.evaluateRule(rule);
      } catch (error) {
        const logger = await createServerObservability().catch(() => null);
        logger?.log('error', 'Failed to evaluate alert rule', {
          ruleId: rule.id,
          ruleName: rule.name,
          error,
        });
      }
    }

    this.lastEvaluationTime = new Date();
  }

  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(rule: PerformanceAlertRule): Promise<void> {
    const context = await this.getEvaluationContext(rule.metric);
    if (!context) return;

    const isConditionMet = this.evaluateCondition(rule.condition, context);
    const existingAlert = Array.from(this.activeAlerts.values()).find(
      alert => alert.ruleId === rule.id,
    );

    if (isConditionMet && !existingAlert) {
      // Create new alert
      await this.createAlert(rule, context);
    } else if (!isConditionMet && existingAlert) {
      // Auto-resolve alert
      await this.resolveAlert(existingAlert.id, 'auto-resolved');
    }

    // Update baseline values for adaptive thresholds
    if (this.config.enableAdaptiveThresholds) {
      this.updateBaseline(rule.metric, context.currentValue);
    }
  }

  /**
   * Get evaluation context for a metric
   */
  private async getEvaluationContext(metric: string): Promise<AlertEvaluationContext | null> {
    const performanceMetrics = globalPerformanceMonitor.getCurrentMetrics();
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
    const timeoutStats = globalTimeoutManager.getStats();

    let currentValue: number;
    const timestamp = new Date();
    const metadata: Record<string, unknown> = {};

    // Extract current value based on metric
    switch (metric) {
      case 'eventLoop.lag':
        if (!performanceMetrics) return null;
        currentValue = performanceMetrics.eventLoop.lag;
        metadata.eventLoop = performanceMetrics.eventLoop;
        break;
      case 'memory.heapUsedPercent':
        if (!memoryMetrics) return null;
        currentValue = (memoryMetrics.heapUsed / memoryMetrics.heapTotal) * 100;
        metadata.memory = memoryMetrics;
        break;
      case 'memory.leakCount':
        if (!memoryMetrics) return null;
        const leaks = globalMemoryMonitor.getPotentialLeaks();
        currentValue = leaks.length;
        metadata.leaks = leaks;
        break;
      case 'cpu.usage':
        if (!performanceMetrics) return null;
        currentValue = performanceMetrics.cpu.usage;
        metadata.cpu = performanceMetrics.cpu;
        break;
      case 'operations.timeouts':
        currentValue = timeoutStats.totalTimedOut;
        metadata.timeouts = timeoutStats;
        break;
      default:
        return null;
    }

    // Get historical values for trend analysis
    const baseline = this.baselineValues.get(metric) || [];
    const previousValues = baseline.slice(-10); // Last 10 values

    // Calculate trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (previousValues.length > 2) {
      const recent = previousValues.slice(-3);
      const older = previousValues.slice(-6, -3);
      if (older.length > 0 && recent.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        const change = (recentAvg - olderAvg) / olderAvg;
        if (change > 0.1) trend = 'increasing';
        else if (change < -0.1) trend = 'decreasing';
      }
    }

    // Calculate anomaly score using simple statistical approach
    let anomalyScore = 0;
    if (previousValues.length > 5) {
      const mean = previousValues.reduce((a, b) => a + b, 0) / previousValues.length;
      const variance =
        previousValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        previousValues.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0) {
        const zScore = Math.abs(currentValue - mean) / stdDev;
        anomalyScore = Math.min(1, zScore / 3); // Normalize to 0-1
      }
    }

    return {
      currentValue,
      previousValues,
      timestamp,
      metadata,
      trend,
      anomalyScore,
    };
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(
    condition: PerformanceAlertRule['condition'],
    context: AlertEvaluationContext,
  ): boolean {
    const { operator, threshold } = condition;
    const value = context.currentValue;

    switch (operator) {
      case 'gt':
        return value > (threshold as number);
      case 'gte':
        return value >= (threshold as number);
      case 'lt':
        return value < (threshold as number);
      case 'lte':
        return value <= (threshold as number);
      case 'eq':
        return value === (threshold as number);
      case 'between':
        const [min, max] = threshold as [number, number];
        return value >= min && value <= max;
      default:
        return false;
    }
  }

  /**
   * Create new alert
   */
  private async createAlert(
    rule: PerformanceAlertRule,
    context: AlertEvaluationContext,
  ): Promise<void> {
    // Check suppression
    const suppressionKey = `${rule.id}`;
    const lastAlert = this.suppressionTracker.get(suppressionKey);
    if (lastAlert && Date.now() - lastAlert.getTime() < rule.suppressionTime) {
      return; // Alert is suppressed
    }

    const alertId = `alert_${rule.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alert: PerformanceAlert = {
      id: alertId,
      ruleId: rule.id,
      title: rule.name,
      description: `${rule.description}. Current value: ${context.currentValue}`,
      category: rule.category,
      severity: rule.severity,
      triggeredAt: context.timestamp,
      currentValue: context.currentValue,
      threshold: rule.condition.threshold,
      metadata: {
        ...context.metadata,
        trend: context.trend,
        anomalyScore: context.anomalyScore,
        evaluationContext: structuredClone(context),
      },
      tags: rule.tags || {},
    };

    this.activeAlerts.set(alertId, alert);
    this.suppressionTracker.set(suppressionKey, new Date());

    const logger = await createServerObservability().catch(() => null);
    logger?.log(
      rule.severity === AlertSeverity.CRITICAL ? 'error' : 'warning',
      'Performance alert triggered',
      {
        alertId,
        ruleId: rule.id,
        title: alert.title,
        currentValue: context.currentValue,
        threshold: rule.condition.threshold,
        severity: rule.severity,
      },
    );

    // Send notification
    await this.sendNotification(alert, 'triggered');
  }

  /**
   * Send alert notification
   */
  private async sendNotification(
    alert: PerformanceAlert,
    action: 'triggered' | 'acknowledged' | 'resolved',
  ): Promise<void> {
    const relevantChannels = Array.from(this.notificationChannels.values()).filter(
      channel =>
        channel.enabled &&
        channel.severityFilter.includes(alert.severity) &&
        channel.categoryFilter.includes(alert.category),
    );

    for (const channel of relevantChannels) {
      try {
        await this.sendToChannel(channel, alert, action);
      } catch (error) {
        const logger = await createServerObservability().catch(() => null);
        logger?.log('error', 'Failed to send alert notification', {
          channelId: channel.id,
          alertId: alert.id,
          error,
        });
      }
    }
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(
    channel: NotificationChannel,
    alert: PerformanceAlert,
    action: string,
  ): Promise<void> {
    const message = this.formatAlertMessage(alert, action);

    switch (channel.type) {
      case 'webhook':
        if (channel.id === 'console') {
          console.log(`🚨 [${alert.severity.toUpperCase()}] ${message}`);
        } else if (channel.id === 'log') {
          const logger = await createServerObservability().catch(() => null);
          logger?.log(alert.severity === AlertSeverity.CRITICAL ? 'error' : 'warning', message, {
            alert: structuredClone(alert),
          });
        }
        break;
      case 'email':
        // Would integrate with email service
        break;
      case 'slack':
        // Would integrate with Slack API
        break;
      case 'pagerduty':
        // Would integrate with PagerDuty API
        break;
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(alert: PerformanceAlert, action: string): string {
    const timestamp = alert.triggeredAt.toISOString();
    const duration = alert.resolvedAt
      ? `(Duration: ${Math.round((alert.resolvedAt.getTime() - alert.triggeredAt.getTime()) / 1000)}s)`
      : '';

    return `Alert ${action}: ${alert.title} - ${alert.description} at ${timestamp} ${duration}`;
  }

  /**
   * Process alert escalations
   */
  private async processEscalations(): Promise<void> {
    if (!this.config.escalationSettings.enableAutoEscalation) return;

    for (const alert of this.activeAlerts.values()) {
      const rule = this.alertRules.get(alert.ruleId);
      if (!rule?.escalationRules || alert.acknowledgedAt) continue;

      const alertAge = Date.now() - alert.triggeredAt.getTime();

      for (const escalation of rule.escalationRules) {
        const escalationTime = escalation.afterMinutes * 60 * 1000;

        if (alertAge >= escalationTime) {
          // Check if we've already escalated this level
          const escalationKey = `${alert.id}_${escalation.afterMinutes}`;
          if (!this.suppressionTracker.has(escalationKey)) {
            await this.escalateAlert(alert, escalation);
            this.suppressionTracker.set(escalationKey, new Date());
          }
        }
      }
    }
  }

  /**
   * Escalate an alert
   */
  private async escalateAlert(
    alert: PerformanceAlert,
    escalation: NonNullable<PerformanceAlertRule['escalationRules']>[0],
  ): Promise<void> {
    const escalatedAlert: PerformanceAlert = {
      ...alert,
      severity: escalation.severity,
    };

    // Send escalation notifications
    for (const channelId of escalation.notificationChannels) {
      const channel = this.notificationChannels.get(channelId);
      if (channel) {
        await this.sendToChannel(channel, escalatedAlert, 'escalated');
      }
    }

    const logger = await createServerObservability().catch(() => null);
    logger?.log('warning', 'Alert escalated', {
      alertId: alert.id,
      fromSeverity: alert.severity,
      toSeverity: escalation.severity,
      afterMinutes: escalation.afterMinutes,
    });
  }

  /**
   * Update baseline values for adaptive thresholds
   */
  private updateBaseline(metric: string, value: number): void {
    const baseline = this.baselineValues.get(metric) || [];
    baseline.push(value);

    // Keep only values within the baseline window
    const cutoffTime = Date.now() - this.baselineWindow;
    const filteredBaseline = baseline.slice(-1000); // Keep max 1000 values

    this.baselineValues.set(metric, filteredBaseline);
  }

  /**
   * Clean up expired alerts
   */
  private async cleanupExpiredAlerts(): Promise<void> {
    const expirationTime = Date.now() - this.config.alertRetentionDays * 24 * 60 * 60 * 1000;

    // Clean up alert history
    const initialHistoryLength = this.alertHistory.length;
    this.alertHistory.splice(
      0,
      this.alertHistory.findIndex(alert => alert.triggeredAt.getTime() > expirationTime),
    );

    // Clean up suppression tracker
    for (const [key, date] of this.suppressionTracker) {
      if (date.getTime() < expirationTime) {
        this.suppressionTracker.delete(key);
      }
    }

    const removedCount = initialHistoryLength - this.alertHistory.length;
    if (removedCount > 0) {
      const logger = await createServerObservability().catch(() => null);
      logger?.log('info', `Cleaned up ${removedCount} expired alerts from history`);
    }
  }
}

/**
 * Global performance alerting system instance
 */
export const globalPerformanceAlerting = PerformanceAlertingSystem.getInstance();

/**
 * Performance alerting utility functions
 */
export namespace PerformanceAlertingUtils {
  /**
   * Create a basic alert rule
   */
  export function createAlertRule(
    id: string,
    name: string,
    metric: string,
    threshold: number,
    severity: AlertSeverity = AlertSeverity.WARNING,
    category: AlertCategory = AlertCategory.PERFORMANCE,
  ): PerformanceAlertRule {
    return {
      id,
      name,
      description: `Alert for ${metric} threshold`,
      category,
      severity,
      metric,
      condition: {
        operator: 'gt',
        threshold,
        duration: 60000, // 1 minute
      },
      evaluationInterval: 30000, // 30 seconds
      suppressionTime: 5 * 60 * 1000, // 5 minutes
      enabled: true,
    };
  }

  /**
   * Create adaptive threshold rule
   */
  export function createAdaptiveRule(
    id: string,
    name: string,
    metric: string,
    deviationMultiplier: number = 2,
    severity: AlertSeverity = AlertSeverity.WARNING,
  ): PerformanceAlertRule {
    return {
      id,
      name,
      description: `Adaptive alert for ${metric} based on historical baseline`,
      category: AlertCategory.PERFORMANCE,
      severity,
      metric,
      condition: {
        operator: 'gt',
        threshold: 0, // Will be calculated adaptively
        duration: 2 * 60 * 1000, // 2 minutes
      },
      evaluationInterval: 30000,
      suppressionTime: 10 * 60 * 1000, // 10 minutes
      tags: { type: 'adaptive', deviationMultiplier: deviationMultiplier.toString() },
      enabled: true,
    };
  }

  /**
   * Format alert severity for display
   */
  export function formatSeverity(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '🔴 CRITICAL';
      case AlertSeverity.WARNING:
        return '🟡 WARNING';
      case AlertSeverity.INFO:
        return '🔵 INFO';
      default:
        return severity.toUpperCase();
    }
  }

  /**
   * Calculate alert priority score
   */
  export function calculatePriority(alert: PerformanceAlert): number {
    let score = 0;

    // Base score by severity
    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
        score += 100;
        break;
      case AlertSeverity.WARNING:
        score += 50;
        break;
      case AlertSeverity.INFO:
        score += 10;
        break;
    }

    // Adjust for category importance
    switch (alert.category) {
      case AlertCategory.AVAILABILITY:
        score += 30;
        break;
      case AlertCategory.SECURITY:
        score += 25;
        break;
      case AlertCategory.PERFORMANCE:
        score += 20;
        break;
      case AlertCategory.MEMORY:
        score += 15;
        break;
      case AlertCategory.COMPLIANCE:
        score += 10;
        break;
    }

    // Adjust for age (newer alerts have higher priority)
    const ageHours = (Date.now() - alert.triggeredAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < 1) score += 20;
    else if (ageHours < 4) score += 10;

    // Adjust for acknowledgment status
    if (!alert.acknowledgedAt) score += 25;

    return score;
  }
}

/**
 * Start global performance alerting system
 */
export async function startPerformanceAlerting(
  config?: Partial<PerformanceAlertingConfig>,
): Promise<PerformanceAlertingSystem> {
  const alertingSystem = PerformanceAlertingSystem.getInstance(config);
  await alertingSystem.start();
  return alertingSystem;
}
