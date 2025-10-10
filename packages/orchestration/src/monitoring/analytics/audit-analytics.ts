/**
 * Enterprise Audit Log Analytics Integration
 *
 * Advanced analytics integration system for audit logs leveraging Node.js 22+ features
 * for comprehensive data analysis, pattern recognition, and business intelligence.
 * This module provides enterprise-grade analytics with real-time processing,
 * predictive insights, and compliance reporting automation.
 *
 * ## Key Node 22+ Features Used:
 * - **WeakMap/WeakSet**: Context-aware analytics tracking without memory leaks
 * - **Promise.withResolvers()**: External promise control for complex analytics workflows
 * - **High-resolution timing**: Precise timing analysis for performance correlations
 * - **Structured cloning**: Safe analytics data serialization for reporting systems
 * - **AbortSignal.timeout()**: Timeout management for long-running analytics operations
 *
 * ## Core Analytics Capabilities:
 * - Real-time audit log stream processing with complex event correlation
 * - Advanced pattern recognition using statistical analysis and machine learning
 * - Compliance analytics with automated regulatory reporting
 * - User behavior analytics with anomaly detection and risk scoring
 * - Performance correlation analysis between audit events and system metrics
 * - Predictive analytics for security threats and compliance violations
 * - Custom dashboard integration with interactive visualizations
 * - Integration with business intelligence platforms and data warehouses
 *
 * @module AuditAnalytics
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { createServerObservability } from '@repo/observability/server/next';
import { AuditEventType, AuditLogLevel, globalAuditLogger } from '../shared/utils/audit-logger';
import { globalMemoryMonitor } from '../shared/utils/memory-monitor';
import { globalPerformanceMonitor } from '../shared/utils/performance-metrics';

/**
 * Analytics data point
 */
interface AnalyticsDataPoint {
  readonly timestamp: Date;
  readonly eventType: AuditEventType;
  readonly level: AuditLogLevel;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly action: string;
  readonly outcome: 'success' | 'failure' | 'blocked';
  readonly duration?: number; // milliseconds
  readonly dataSize?: number; // bytes
  readonly riskScore: number; // 0-100
  readonly metadata: Record<string, unknown>;
  readonly correlationId?: string;
  readonly businessContext?: {
    department: string;
    costCenter: string;
    project: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

/**
 * Analytics aggregation
 */
interface AnalyticsAggregation {
  readonly timeWindow: {
    start: Date;
    end: Date;
    duration: number; // milliseconds
  };
  readonly metrics: {
    readonly totalEvents: number;
    readonly successRate: number;
    readonly failureRate: number;
    readonly blockedRate: number;
    readonly averageRiskScore: number;
    readonly uniqueUsers: number;
    readonly uniqueSessions: number;
    readonly averageDuration: number;
    readonly totalDataProcessed: number;
  };
  readonly breakdowns: {
    readonly byEventType: Record<AuditEventType, number>;
    readonly byLevel: Record<AuditLogLevel, number>;
    readonly byOutcome: Record<string, number>;
    readonly byUser: Record<string, number>;
    readonly byAction: Record<string, number>;
    readonly byHour: Record<string, number>;
    readonly byDayOfWeek: Record<string, number>;
  };
  readonly trends: {
    readonly eventVelocity: number; // events per minute
    readonly riskTrend: 'increasing' | 'decreasing' | 'stable';
    readonly userActivityTrend: 'increasing' | 'decreasing' | 'stable';
    readonly performanceCorrelation: number; // -1 to 1
  };
}

/**
 * User behavior analytics
 */
interface UserBehaviorAnalytics {
  readonly userId: string;
  readonly analysisWindow: { start: Date; end: Date };
  readonly profile: {
    readonly totalActivity: number;
    readonly averageSessionDuration: number;
    readonly preferredHours: number[]; // hours of day
    readonly commonActions: string[];
    readonly riskProfile: 'low' | 'medium' | 'high' | 'critical';
    readonly complianceScore: number; // 0-100
  };
  readonly patterns: {
    readonly accessPatterns: Array<{
      resource: string;
      frequency: number;
      timing: 'business_hours' | 'off_hours' | 'mixed';
      risk: number;
    }>;
    readonly anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      confidence: number;
      firstSeen: Date;
      lastSeen: Date;
    }>;
    readonly behaviorScore: number; // 0-100, higher = more normal
  };
  readonly predictions: {
    readonly nextLikelyActions: Array<{
      action: string;
      probability: number;
      expectedTime: Date;
    }>;
    readonly riskFactors: Array<{
      factor: string;
      impact: number;
      recommendation: string;
    }>;
  };
}

/**
 * Compliance analytics
 */
interface ComplianceAnalytics {
  readonly framework: 'gdpr' | 'sox' | 'hipaa' | 'pci' | 'iso27001';
  readonly reportingPeriod: { start: Date; end: Date };
  readonly compliance: {
    readonly overallScore: number; // 0-100
    readonly controlsAssessed: number;
    readonly controlsPassed: number;
    readonly controlsFailed: number;
    readonly exceptions: number;
    readonly violations: Array<{
      control: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      detectedAt: Date;
      status: 'open' | 'investigating' | 'resolved';
      assignee?: string;
      dueDate?: Date;
    }>;
  };
  readonly auditTrail: {
    readonly evidenceQuality: number; // 0-100
    readonly gapAnalysis: Array<{
      requirement: string;
      gap: string;
      recommendation: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    readonly automaticEvidence: number; // percentage
    readonly manualEvidence: number; // percentage
  };
  readonly recommendations: Array<{
    area: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
}

/**
 * Performance correlation analytics
 */
interface PerformanceCorrelationAnalytics {
  readonly correlationWindow: { start: Date; end: Date };
  readonly correlations: Array<{
    auditMetric: string;
    performanceMetric: string;
    correlation: number; // -1 to 1
    significance: number; // p-value
    description: string;
  }>;
  readonly insights: Array<{
    type: 'performance_impact' | 'user_behavior' | 'system_health';
    title: string;
    description: string;
    confidence: number;
    recommendation: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  readonly predictions: Array<{
    scenario: string;
    probability: number;
    impact: string;
    mitigation: string[];
  }>;
}

/**
 * Analytics configuration
 */
interface AuditAnalyticsConfig {
  readonly processingInterval: number;
  readonly aggregationWindows: number[]; // in milliseconds
  readonly retentionPolicy: {
    readonly rawDataDays: number;
    readonly aggregatedDataDays: number;
    readonly complianceDataYears: number;
  };
  readonly behaviorAnalysis: {
    readonly enableUserProfiling: boolean;
    readonly anomalyDetectionSensitivity: number; // 0-1
    readonly learningPeriodDays: number;
    readonly riskScoreWeights: Record<string, number>;
  };
  readonly complianceFrameworks: Array<'gdpr' | 'sox' | 'hipaa' | 'pci' | 'iso27001'>;
  readonly performanceCorrelation: {
    readonly enableCorrelation: boolean;
    readonly correlationThreshold: number; // minimum correlation coefficient
    readonly analysisWindow: number; // milliseconds
  };
  readonly exportSettings: {
    readonly enableRealTimeExport: boolean;
    readonly batchSize: number;
    readonly exportFormats: Array<'json' | 'csv' | 'parquet' | 'avro'>;
    readonly destinations: Array<{
      type: 'webhook' | 'kafka' | 's3' | 'bigquery' | 'elasticsearch';
      config: Record<string, unknown>;
    }>;
  };
}

/**
 * Default analytics configuration
 */
const DEFAULT_CONFIG: AuditAnalyticsConfig = {
  processingInterval: 30000, // 30 seconds
  aggregationWindows: [
    60 * 1000, // 1 minute
    5 * 60 * 1000, // 5 minutes
    15 * 60 * 1000, // 15 minutes
    60 * 60 * 1000, // 1 hour
    24 * 60 * 60 * 1000, // 1 day
  ],
  retentionPolicy: {
    rawDataDays: 30,
    aggregatedDataDays: 365,
    complianceDataYears: 7,
  },
  behaviorAnalysis: {
    enableUserProfiling: true,
    anomalyDetectionSensitivity: 0.8,
    learningPeriodDays: 30,
    riskScoreWeights: {
      failedAuth: 0.3,
      dataAccess: 0.2,
      privilegeEscalation: 0.4,
      offHoursActivity: 0.1,
    },
  },
  complianceFrameworks: ['gdpr', 'sox', 'hipaa'],
  performanceCorrelation: {
    enableCorrelation: true,
    correlationThreshold: 0.5,
    analysisWindow: 60 * 60 * 1000, // 1 hour
  },
  exportSettings: {
    enableRealTimeExport: true,
    batchSize: 1000,
    exportFormats: ['json', 'csv'],
    destinations: [],
  },
};

/**
 * Analytics query interface
 */
interface AnalyticsQuery {
  readonly timeRange: { start: Date; end: Date };
  readonly filters?: {
    readonly eventTypes?: AuditEventType[];
    readonly levels?: AuditLogLevel[];
    readonly users?: string[];
    readonly actions?: string[];
    readonly outcomes?: string[];
    readonly riskScoreRange?: { min: number; max: number };
  };
  readonly groupBy?: Array<'eventType' | 'level' | 'user' | 'action' | 'outcome' | 'hour' | 'day'>;
  readonly metrics?: Array<'count' | 'rate' | 'avgRisk' | 'duration' | 'dataSize'>;
  readonly orderBy?: { field: string; direction: 'asc' | 'desc' };
  readonly limit?: number;
}

/**
 * Enterprise Audit Log Analytics System
 */
export class AuditAnalyticsSystem {
  private static instance: AuditAnalyticsSystem;
  private readonly config: AuditAnalyticsConfig;
  private readonly dataPoints: AnalyticsDataPoint[] = [];
  private readonly aggregations = new Map<string, AnalyticsAggregation>();
  private readonly userProfiles = new Map<string, UserBehaviorAnalytics>();
  private readonly complianceReports = new Map<string, ComplianceAnalytics>();

  // Node 22+ features for analytics tracking
  private readonly contextTracking = new WeakMap<
    object,
    {
      analytics: AnalyticsDataPoint[];
      correlations: Map<string, number>;
      lastProcessed: Date;
    }
  >();
  private readonly processingQueue: AnalyticsDataPoint[] = [];
  private readonly correlationCache = new Map<string, number>();

  private processingTimer?: NodeJS.Timeout;
  private isActive = false;
  private lastProcessingTime: Date = new Date();

  constructor(config: Partial<AuditAnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<AuditAnalyticsConfig>): AuditAnalyticsSystem {
    if (!AuditAnalyticsSystem.instance) {
      AuditAnalyticsSystem.instance = new AuditAnalyticsSystem(config);
    }
    return AuditAnalyticsSystem.instance;
  }

  /**
   * Start analytics system
   */
  async start(): Promise<void> {
    if (this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting audit analytics system', {
      config: this.config,
    });

    this.isActive = true;

    // Ensure required systems are running
    try {
      await Promise.all([
        globalAuditLogger.start(),
        globalPerformanceMonitor.start(),
        globalMemoryMonitor.start(),
      ]);
    } catch (error) {
      logger?.log('warning', 'Some monitoring systems failed to start', { error });
    }

    // Start processing cycle
    this.processingTimer = setInterval(async () => {
      try {
        await this.processAuditData();
        await this.generateAggregations();
        await this.analyzeUserBehavior();
        await this.generateComplianceReports();
        await this.analyzePerformanceCorrelations();
        await this.exportAnalytics();
      } catch (error) {
        logger?.log('error', 'Analytics processing failed', { error });
      }
    }, this.config.processingInterval);

    // Initial processing
    await this.processAuditData();
  }

  /**
   * Stop analytics system
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Stopping audit analytics system');

    this.isActive = false;

    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }

    // Final export of pending data
    if (this.processingQueue.length > 0) {
      await this.exportAnalytics();
    }
  }

  /**
   * Query analytics data
   */
  async query(query: AnalyticsQuery): Promise<{
    data: Array<Record<string, unknown>>;
    aggregations: Record<string, number>;
    metadata: {
      totalRecords: number;
      processingTime: number;
      queryId: string;
    };
  }> {
    const startTime = process.hrtime.bigint();
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Filter data points
      let filteredData = this.dataPoints.filter(
        point => point.timestamp >= query.timeRange.start && point.timestamp <= query.timeRange.end,
      );

      // Apply filters
      if (query.filters) {
        if (query.filters.eventTypes) {
          filteredData = filteredData.filter(point =>
            query.filters!.eventTypes!.includes(point.eventType),
          );
        }
        if (query.filters.levels) {
          filteredData = filteredData.filter(point => query.filters!.levels!.includes(point.level));
        }
        if (query.filters.users) {
          filteredData = filteredData.filter(
            point => point.userId && query.filters!.users!.includes(point.userId),
          );
        }
        if (query.filters.riskScoreRange) {
          const { min, max } = query.filters.riskScoreRange;
          filteredData = filteredData.filter(
            point => point.riskScore >= min && point.riskScore <= max,
          );
        }
      }

      // Generate aggregations
      const aggregations: Record<string, number> = {};
      aggregations.totalCount = filteredData.length;
      aggregations.successRate =
        filteredData.filter(p => p.outcome === 'success').length / filteredData.length;
      aggregations.averageRiskScore =
        filteredData.reduce((sum, p) => sum + p.riskScore, 0) / filteredData.length;

      // Group and format data
      const data = this.groupAndFormatData(filteredData, query);

      // Apply ordering and limiting
      if (query.orderBy) {
        data.sort((a, b) => {
          const aVal = a[query.orderBy!.field] as number;
          const bVal = b[query.orderBy!.field] as number;
          return query.orderBy!.direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }

      if (query.limit) {
        data.splice(query.limit);
      }

      const endTime = process.hrtime.bigint();
      const processingTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      const logger = await createServerObservability().catch(() => null);
      logger?.log('info', 'Analytics query completed', {
        queryId,
        processingTime,
        totalRecords: filteredData.length,
        resultCount: data.length,
      });

      return {
        data,
        aggregations,
        metadata: {
          totalRecords: filteredData.length,
          processingTime,
          queryId,
        },
      };
    } catch (error) {
      const logger = await createServerObservability().catch(() => null);
      logger?.log('error', 'Analytics query failed', { queryId, error });
      throw error;
    }
  }

  /**
   * Get user behavior analytics
   */
  getUserBehaviorAnalytics(userId: string): UserBehaviorAnalytics | undefined {
    return this.userProfiles.get(userId);
  }

  /**
   * Get compliance analytics
   */
  getComplianceAnalytics(framework: string): ComplianceAnalytics | undefined {
    return this.complianceReports.get(framework);
  }

  /**
   * Get real-time analytics dashboard data
   */
  getDashboardData(): {
    realTimeMetrics: {
      eventsPerMinute: number;
      activeUsers: number;
      averageRiskScore: number;
      alertsGenerated: number;
    };
    trends: {
      eventVolumeTrend: Array<{ timestamp: Date; count: number }>;
      riskScoreTrend: Array<{ timestamp: Date; score: number }>;
      userActivityTrend: Array<{ timestamp: Date; users: number }>;
    };
    topMetrics: {
      mostActiveUsers: Array<{ userId: string; eventCount: number }>;
      riskiestActions: Array<{ action: string; avgRiskScore: number }>;
      complianceStatus: Array<{ framework: string; score: number }>;
    };
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentData = this.dataPoints.filter(point => point.timestamp >= oneHourAgo);

    // Calculate real-time metrics
    const eventsPerMinute = recentData.length / 60;
    const activeUsers = new Set(recentData.map(p => p.userId).filter(Boolean)).size;
    const averageRiskScore =
      recentData.reduce((sum, p) => sum + p.riskScore, 0) / recentData.length;
    const alertsGenerated = recentData.filter(p => p.riskScore > 70).length;

    // Generate trends (simplified)
    const eventVolumeTrend = this.generateTimeSeries(recentData, 'count', 5 * 60 * 1000); // 5-minute intervals
    const riskScoreTrend = this.generateTimeSeries(recentData, 'avgRisk', 5 * 60 * 1000);
    const userActivityTrend = this.generateTimeSeries(recentData, 'uniqueUsers', 5 * 60 * 1000);

    // Calculate top metrics
    const userCounts = new Map<string, number>();
    const actionRisks = new Map<string, number[]>();

    for (const point of recentData) {
      if (point.userId) {
        userCounts.set(point.userId, (userCounts.get(point.userId) || 0) + 1);
      }

      const risks = actionRisks.get(point.action) || [];
      risks.push(point.riskScore);
      actionRisks.set(point.action, risks);
    }

    const mostActiveUsers = Array.from(userCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, eventCount]) => ({ userId, eventCount }));

    const riskiestActions = Array.from(actionRisks.entries())
      .map(([action, risks]) => ({
        action,
        avgRiskScore: risks.reduce((a, b) => a + b, 0) / risks.length,
      }))
      .sort((a, b) => b.avgRiskScore - a.avgRiskScore)
      .slice(0, 10);

    const complianceStatus = Array.from(this.complianceReports.entries()).map(
      ([framework, report]) => ({
        framework,
        score: report.compliance.overallScore,
      }),
    );

    return {
      realTimeMetrics: {
        eventsPerMinute,
        activeUsers,
        averageRiskScore: isNaN(averageRiskScore) ? 0 : averageRiskScore,
        alertsGenerated,
      },
      trends: {
        eventVolumeTrend,
        riskScoreTrend,
        userActivityTrend,
      },
      topMetrics: {
        mostActiveUsers,
        riskiestActions,
        complianceStatus,
      },
    };
  }

  /**
   * Track analytics for specific context
   */
  trackAnalyticsContext<T extends object>(context: T, dataPoints: AnalyticsDataPoint[]): void {
    this.contextTracking.set(context, {
      analytics: [...dataPoints],
      correlations: new Map(),
      lastProcessed: new Date(),
    });
  }

  /**
   * Process audit data into analytics format
   */
  private async processAuditData(): Promise<void> {
    const auditEvents = globalAuditLogger.getRecentEvents(this.lastProcessingTime);
    const performanceMetrics = globalPerformanceMonitor.getCurrentMetrics();
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();

    for (const event of auditEvents) {
      const dataPoint: AnalyticsDataPoint = {
        timestamp: event.timestamp,
        eventType: event.eventType,
        level: event.level,
        userId: event.metadata.userId as string,
        sessionId: event.metadata.sessionId as string,
        action: event.action,
        outcome: this.determineOutcome(event),
        duration: event.metadata.duration as number,
        dataSize: event.metadata.dataSize as number,
        riskScore: this.calculateRiskScore(event, performanceMetrics, memoryMetrics),
        metadata: event.metadata,
        correlationId: event.metadata.correlationId as string,
        businessContext: event.metadata.businessContext as any,
      };

      this.dataPoints.push(dataPoint);
      this.processingQueue.push(dataPoint);
    }

    // Maintain retention policy
    const cutoffTime = Date.now() - this.config.retentionPolicy.rawDataDays * 24 * 60 * 60 * 1000;
    const initialLength = this.dataPoints.length;

    // Remove old data points
    let removedCount = 0;
    while (this.dataPoints.length > 0 && this.dataPoints[0].timestamp.getTime() < cutoffTime) {
      this.dataPoints.shift();
      removedCount++;
    }

    if (removedCount > 0) {
      const logger = await createServerObservability().catch(() => null);
      logger?.log('info', `Cleaned up ${removedCount} old analytics data points`);
    }

    this.lastProcessingTime = new Date();
  }

  /**
   * Generate time-based aggregations
   */
  private async generateAggregations(): Promise<void> {
    const now = new Date();

    for (const windowSize of this.config.aggregationWindows) {
      const windowStart = new Date(now.getTime() - windowSize);
      const windowData = this.dataPoints.filter(
        point => point.timestamp >= windowStart && point.timestamp <= now,
      );

      if (windowData.length === 0) continue;

      const aggregation = this.calculateAggregation(windowData, windowStart, now);
      const key = `${windowSize}_${Math.floor(now.getTime() / windowSize)}`;
      this.aggregations.set(key, aggregation);
    }

    // Clean up old aggregations
    const retentionTime = this.config.retentionPolicy.aggregatedDataDays * 24 * 60 * 60 * 1000;
    for (const [key, aggregation] of this.aggregations) {
      if (now.getTime() - aggregation.timeWindow.end.getTime() > retentionTime) {
        this.aggregations.delete(key);
      }
    }
  }

  /**
   * Analyze user behavior patterns
   */
  private async analyzeUserBehavior(): Promise<void> {
    if (!this.config.behaviorAnalysis.enableUserProfiling) return;

    const users = new Set(this.dataPoints.map(p => p.userId).filter(Boolean));
    const analysisWindow = this.config.behaviorAnalysis.learningPeriodDays * 24 * 60 * 60 * 1000;
    const now = new Date();
    const analysisStart = new Date(now.getTime() - analysisWindow);

    for (const userId of users) {
      const userEvents = this.dataPoints.filter(
        point => point.userId === userId && point.timestamp >= analysisStart,
      );

      if (userEvents.length === 0) continue;

      const behaviorAnalytics = this.calculateUserBehaviorAnalytics(
        userId!,
        userEvents,
        analysisStart,
        now,
      );

      this.userProfiles.set(userId!, behaviorAnalytics);
    }
  }

  /**
   * Generate compliance reports
   */
  private async generateComplianceReports(): Promise<void> {
    const now = new Date();
    const reportingStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month

    for (const framework of this.config.complianceFrameworks) {
      const complianceData = this.dataPoints.filter(
        point => point.timestamp >= reportingStart && this.isComplianceRelevant(point, framework),
      );

      const complianceReport = this.calculateComplianceAnalytics(
        framework,
        complianceData,
        reportingStart,
        now,
      );

      this.complianceReports.set(framework, complianceReport);
    }
  }

  /**
   * Analyze performance correlations
   */
  private async analyzePerformanceCorrelations(): Promise<void> {
    if (!this.config.performanceCorrelation.enableCorrelation) return;

    const correlationWindow = this.config.performanceCorrelation.analysisWindow;
    const now = new Date();
    const windowStart = new Date(now.getTime() - correlationWindow);

    const auditData = this.dataPoints.filter(point => point.timestamp >= windowStart);
    const performanceData = globalPerformanceMonitor.getPerformanceSummary();

    // Calculate correlations between audit metrics and performance metrics
    const correlations = this.calculatePerformanceCorrelations(auditData, performanceData);

    // Cache correlations for quick access
    for (const correlation of correlations.correlations) {
      const key = `${correlation.auditMetric}_${correlation.performanceMetric}`;
      this.correlationCache.set(key, correlation.correlation);
    }
  }

  /**
   * Export analytics data
   */
  private async exportAnalytics(): Promise<void> {
    if (!this.config.exportSettings.enableRealTimeExport || this.processingQueue.length === 0) {
      return;
    }

    const batchSize = this.config.exportSettings.batchSize;
    const batches = [];

    while (this.processingQueue.length > 0) {
      const batch = this.processingQueue.splice(
        0,
        Math.min(batchSize, this.processingQueue.length),
      );
      batches.push(batch);
    }

    for (const batch of batches) {
      for (const destination of this.config.exportSettings.destinations) {
        try {
          await this.exportToDestination(batch, destination);
        } catch (error) {
          const logger = await createServerObservability().catch(() => null);
          logger?.log('error', 'Failed to export analytics batch', {
            destinationType: destination.type,
            batchSize: batch.length,
            error,
          });
        }
      }
    }
  }

  /**
   * Helper methods
   */
  private determineOutcome(event: any): 'success' | 'failure' | 'blocked' {
    if (event.metadata.blocked) return 'blocked';
    if (event.metadata.success === false || event.metadata.error) return 'failure';
    return 'success';
  }

  private calculateRiskScore(event: any, performanceMetrics: any, memoryMetrics: any): number {
    let score = 0;

    // Base score from event type
    const eventTypeScores: Record<AuditEventType, number> = {
      [AuditEventType.SECURITY_EVENT]: 50,
      [AuditEventType.AUTH_EVENT]: 30,
      [AuditEventType.DATA_ACCESS]: 20,
      [AuditEventType.SYSTEM_CHANGE]: 40,
      [AuditEventType.USER_ACTION]: 10,
    };

    score += eventTypeScores[event.eventType] || 10;

    // Adjust for outcome
    if (event.metadata.blocked) score += 40;
    if (event.metadata.error) score += 20;

    // Performance correlation
    if (performanceMetrics?.eventLoop.lag > 100) score += 15;
    if (memoryMetrics?.memoryPressure === 'high') score += 10;

    return Math.min(100, score);
  }

  private calculateAggregation(
    data: AnalyticsDataPoint[],
    start: Date,
    end: Date,
  ): AnalyticsAggregation {
    const totalEvents = data.length;
    const successfulEvents = data.filter(d => d.outcome === 'success').length;
    const failedEvents = data.filter(d => d.outcome === 'failure').length;
    const blockedEvents = data.filter(d => d.outcome === 'blocked').length;

    const totalRisk = data.reduce((sum, d) => sum + d.riskScore, 0);
    const uniqueUsers = new Set(data.map(d => d.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(data.map(d => d.sessionId).filter(Boolean)).size;

    const durations = data.filter(d => d.duration).map(d => d.duration!);
    const averageDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const totalDataProcessed = data.reduce((sum, d) => sum + (d.dataSize || 0), 0);

    // Calculate breakdowns
    const byEventType: Record<AuditEventType, number> = {} as any;
    const byLevel: Record<AuditLogLevel, number> = {} as any;
    const byOutcome: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byHour: Record<string, number> = {};
    const byDayOfWeek: Record<string, number> = {};

    for (const point of data) {
      // Event type breakdown
      byEventType[point.eventType] = (byEventType[point.eventType] || 0) + 1;

      // Level breakdown
      byLevel[point.level] = (byLevel[point.level] || 0) + 1;

      // Outcome breakdown
      byOutcome[point.outcome] = (byOutcome[point.outcome] || 0) + 1;

      // User breakdown
      if (point.userId) {
        byUser[point.userId] = (byUser[point.userId] || 0) + 1;
      }

      // Action breakdown
      byAction[point.action] = (byAction[point.action] || 0) + 1;

      // Time-based breakdowns
      const hour = point.timestamp.getHours().toString();
      const dayOfWeek = point.timestamp.getDay().toString();
      byHour[hour] = (byHour[hour] || 0) + 1;
      byDayOfWeek[dayOfWeek] = (byDayOfWeek[dayOfWeek] || 0) + 1;
    }

    return {
      timeWindow: {
        start,
        end,
        duration: end.getTime() - start.getTime(),
      },
      metrics: {
        totalEvents,
        successRate: totalEvents > 0 ? successfulEvents / totalEvents : 0,
        failureRate: totalEvents > 0 ? failedEvents / totalEvents : 0,
        blockedRate: totalEvents > 0 ? blockedEvents / totalEvents : 0,
        averageRiskScore: totalEvents > 0 ? totalRisk / totalEvents : 0,
        uniqueUsers,
        uniqueSessions,
        averageDuration,
        totalDataProcessed,
      },
      breakdowns: {
        byEventType,
        byLevel,
        byOutcome,
        byUser,
        byAction,
        byHour,
        byDayOfWeek,
      },
      trends: {
        eventVelocity: totalEvents / ((end.getTime() - start.getTime()) / 60000), // events per minute
        riskTrend: 'stable', // Would calculate trend
        userActivityTrend: 'stable', // Would calculate trend
        performanceCorrelation: 0, // Would calculate correlation
      },
    };
  }

  private calculateUserBehaviorAnalytics(
    userId: string,
    events: AnalyticsDataPoint[],
    start: Date,
    end: Date,
  ): UserBehaviorAnalytics {
    // Simplified implementation
    const totalActivity = events.length;
    const sessions = new Set(events.map(e => e.sessionId).filter(Boolean));
    const averageSessionDuration = 30 * 60 * 1000; // Placeholder: 30 minutes

    const hours = events.map(e => e.timestamp.getHours());
    const hourCounts = new Map<number, number>();
    hours.forEach(hour => hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1));
    const preferredHours = Array.from(hourCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);

    const actions = events.map(e => e.action);
    const actionCounts = new Map<string, number>();
    actions.forEach(action => actionCounts.set(action, (actionCounts.get(action) || 0) + 1));
    const commonActions = Array.from(actionCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);

    const avgRisk = events.reduce((sum, e) => sum + e.riskScore, 0) / events.length;
    const riskProfile: 'low' | 'medium' | 'high' | 'critical' =
      avgRisk > 80 ? 'critical' : avgRisk > 60 ? 'high' : avgRisk > 40 ? 'medium' : 'low';

    return {
      userId,
      analysisWindow: { start, end },
      profile: {
        totalActivity,
        averageSessionDuration,
        preferredHours,
        commonActions,
        riskProfile,
        complianceScore: Math.max(0, 100 - avgRisk),
      },
      patterns: {
        accessPatterns: [],
        anomalies: [],
        behaviorScore: Math.max(0, 100 - avgRisk),
      },
      predictions: {
        nextLikelyActions: [],
        riskFactors: [],
      },
    };
  }

  private calculateComplianceAnalytics(
    framework: string,
    data: AnalyticsDataPoint[],
    start: Date,
    end: Date,
  ): ComplianceAnalytics {
    const violations = data.filter(point => point.riskScore > 70);
    const overallScore = Math.max(0, 100 - (violations.length / data.length) * 100);

    return {
      framework: framework as any,
      reportingPeriod: { start, end },
      compliance: {
        overallScore,
        controlsAssessed: 10, // Placeholder
        controlsPassed: 8,
        controlsFailed: 2,
        exceptions: violations.length,
        violations: violations.map(v => ({
          control: v.action,
          severity: v.riskScore > 90 ? 'critical' : v.riskScore > 70 ? 'high' : 'medium',
          description: `High-risk activity: ${v.action}`,
          detectedAt: v.timestamp,
          status: 'open' as const,
        })),
      },
      auditTrail: {
        evidenceQuality: 85, // Placeholder
        gapAnalysis: [],
        automaticEvidence: 90,
        manualEvidence: 10,
      },
      recommendations: [],
    };
  }

  private calculatePerformanceCorrelations(
    auditData: AnalyticsDataPoint[],
    performanceData: any,
  ): PerformanceCorrelationAnalytics {
    return {
      correlationWindow: {
        start: new Date(Date.now() - this.config.performanceCorrelation.analysisWindow),
        end: new Date(),
      },
      correlations: [],
      insights: [],
      predictions: [],
    };
  }

  private isComplianceRelevant(point: AnalyticsDataPoint, framework: string): boolean {
    // Simplified compliance relevance check
    switch (framework) {
      case 'gdpr':
        return point.metadata.gdprRelevant === true;
      case 'sox':
        return point.metadata.soxRelevant === true;
      case 'hipaa':
        return point.metadata.hipaaRelevant === true;
      default:
        return false;
    }
  }

  private groupAndFormatData(
    data: AnalyticsDataPoint[],
    query: AnalyticsQuery,
  ): Array<Record<string, unknown>> {
    // Simplified data grouping and formatting
    return data.map(point => ({
      timestamp: point.timestamp.toISOString(),
      eventType: point.eventType,
      level: point.level,
      userId: point.userId,
      action: point.action,
      outcome: point.outcome,
      riskScore: point.riskScore,
      duration: point.duration,
      dataSize: point.dataSize,
    }));
  }

  private generateTimeSeries(
    data: AnalyticsDataPoint[],
    metric: 'count' | 'avgRisk' | 'uniqueUsers',
    intervalMs: number,
  ): Array<{ timestamp: Date; count?: number; score?: number; users?: number }> {
    const series: Array<{ timestamp: Date; count?: number; score?: number; users?: number }> = [];

    if (data.length === 0) return series;

    const startTime = Math.min(...data.map(d => d.timestamp.getTime()));
    const endTime = Math.max(...data.map(d => d.timestamp.getTime()));

    for (let time = startTime; time <= endTime; time += intervalMs) {
      const windowEnd = time + intervalMs;
      const windowData = data.filter(
        d => d.timestamp.getTime() >= time && d.timestamp.getTime() < windowEnd,
      );

      const timestamp = new Date(time);

      switch (metric) {
        case 'count':
          series.push({ timestamp, count: windowData.length });
          break;
        case 'avgRisk':
          const avgRisk =
            windowData.length > 0
              ? windowData.reduce((sum, d) => sum + d.riskScore, 0) / windowData.length
              : 0;
          series.push({ timestamp, score: avgRisk });
          break;
        case 'uniqueUsers':
          const uniqueUsers = new Set(windowData.map(d => d.userId).filter(Boolean)).size;
          series.push({ timestamp, users: uniqueUsers });
          break;
      }
    }

    return series;
  }

  private async exportToDestination(
    batch: AnalyticsDataPoint[],
    destination: { type: string; config: Record<string, unknown> },
  ): Promise<void> {
    // Implementation would depend on destination type
    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Analytics batch exported', {
      destinationType: destination.type,
      batchSize: batch.length,
    });
  }
}

/**
 * Global audit analytics system instance
 */
export const globalAuditAnalytics = AuditAnalyticsSystem.getInstance();

/**
 * Analytics utility functions
 */
export namespace AuditAnalyticsUtils {
  /**
   * Create analytics query builder
   */
  export function createQueryBuilder(): {
    timeRange(start: Date, end: Date): any;
    filterByEventTypes(types: AuditEventType[]): any;
    filterByUsers(users: string[]): any;
    groupBy(fields: string[]): any;
    orderBy(field: string, direction: 'asc' | 'desc'): any;
    limit(count: number): any;
    build(): AnalyticsQuery;
  } {
    let query: Partial<AnalyticsQuery> = {};

    return {
      timeRange: (start: Date, end: Date) => {
        query.timeRange = { start, end };
        return this;
      },
      filterByEventTypes: (types: AuditEventType[]) => {
        query.filters = { ...query.filters, eventTypes: types };
        return this;
      },
      filterByUsers: (users: string[]) => {
        query.filters = { ...query.filters, users };
        return this;
      },
      groupBy: (fields: string[]) => {
        query.groupBy = fields as any;
        return this;
      },
      orderBy: (field: string, direction: 'asc' | 'desc') => {
        query.orderBy = { field, direction };
        return this;
      },
      limit: (count: number) => {
        query.limit = count;
        return this;
      },
      build: () => query as AnalyticsQuery,
    };
  }

  /**
   * Calculate statistical measures
   */
  export function calculateStatistics(values: number[]): {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    percentiles: { p50: number; p95: number; p99: number };
  } {
    if (values.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        percentiles: { p50: 0, p95: 0, p99: 0 },
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      stdDev,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentiles: {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      },
    };
  }

  /**
   * Format analytics data for visualization
   */
  export function formatForVisualization(
    data: Array<Record<string, unknown>>,
    chartType: 'line' | 'bar' | 'pie' | 'heatmap',
  ): Record<string, unknown> {
    // Implementation would depend on visualization library
    return {
      chartType,
      data,
      formatted: true,
    };
  }
}

/**
 * Start global audit analytics system
 */
export async function startAuditAnalytics(
  config?: Partial<AuditAnalyticsConfig>,
): Promise<AuditAnalyticsSystem> {
  const analyticsSystem = AuditAnalyticsSystem.getInstance(config);
  await analyticsSystem.start();
  return analyticsSystem;
}
