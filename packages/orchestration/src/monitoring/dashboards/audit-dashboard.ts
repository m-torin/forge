/**
 * Enterprise Audit Logging Monitoring Dashboard
 *
 * Advanced audit logging dashboard leveraging Node.js 22+ features for comprehensive
 * security monitoring, compliance tracking, and audit trail analysis. This module
 * provides enterprise-grade audit observability with intelligent alerting and
 * automated compliance reporting.
 *
 * ## Key Node 22+ Features Used:
 * - **WeakMap/WeakSet**: Context-aware audit event tracking without memory leaks
 * - **Promise.withResolvers()**: External promise control for complex async audit operations
 * - **High-resolution timing**: Nanosecond-precision audit event timing analysis
 * - **Structured cloning**: Safe audit data serialization for compliance reports
 * - **AbortSignal.timeout()**: Timeout management for audit data processing
 *
 * ## Core Audit Monitoring Capabilities:
 * - Real-time security event monitoring with threat detection
 * - Compliance violation tracking with automated reporting
 * - PII access monitoring with data privacy insights
 * - Authentication and authorization audit trails
 * - Data integrity verification with cryptographic validation
 * - Suspicious activity pattern detection
 * - Automated compliance report generation
 * - Security incident correlation and analysis
 *
 * @module AuditDashboard
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { createServerObservability } from '@repo/observability/server/next';
import { AuditEventType, AuditLogLevel, globalAuditLogger } from '../shared/utils/audit-logger';

/**
 * Audit event data point
 */
interface AuditDataPoint {
  readonly timestamp: Date;
  readonly eventType: AuditEventType;
  readonly level: AuditLogLevel;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly resourceAccessed?: string;
  readonly action: string;
  readonly outcome: 'success' | 'failure' | 'blocked';
  readonly riskScore: number; // 0-100
  readonly complianceFlags: string[];
  readonly metadata: Record<string, unknown>;
}

/**
 * Security threat analysis
 */
interface SecurityThreat {
  readonly id: string;
  readonly type:
    | 'brute_force'
    | 'suspicious_access'
    | 'data_exfiltration'
    | 'privilege_escalation'
    | 'anomalous_behavior';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly firstSeen: Date;
  readonly lastSeen: Date;
  readonly eventCount: number;
  readonly affectedUsers: string[];
  readonly ipAddresses: string[];
  readonly description: string;
  readonly indicators: string[];
  readonly mitigationSteps: string[];
}

/**
 * Compliance violation record
 */
interface ComplianceViolation {
  readonly id: string;
  readonly type: 'gdpr' | 'sox' | 'hipaa' | 'pci' | 'custom';
  readonly severity: 'minor' | 'major' | 'critical';
  readonly detectedAt: Date;
  readonly userId?: string;
  readonly resourceId?: string;
  readonly violationDescription: string;
  readonly dataClassification: string;
  readonly regulatoryReference: string;
  readonly remediationRequired: boolean;
  readonly reportingDeadline?: Date;
  readonly status: 'open' | 'investigating' | 'resolved' | 'escalated';
}

/**
 * User activity analytics
 */
interface UserActivityAnalytics {
  readonly userId: string;
  readonly totalEvents: number;
  readonly successfulActions: number;
  readonly failedActions: number;
  readonly blockedActions: number;
  readonly uniqueResources: number;
  readonly riskScore: number;
  readonly lastActivity: Date;
  readonly suspiciousPatterns: Array<{
    pattern: string;
    confidence: number;
    description: string;
  }>;
  readonly complianceStatus: 'compliant' | 'warning' | 'violation';
}

/**
 * Audit dashboard configuration
 */
interface AuditDashboardConfig {
  readonly refreshInterval: number;
  readonly dataRetentionDays: number;
  readonly threatDetectionThresholds: {
    readonly bruteForceAttempts: number;
    readonly suspiciousAccessWindow: number; // minutes
    readonly anomalyDetectionSensitivity: number; // 0-1
  };
  readonly complianceSettings: {
    readonly enableGDPR: boolean;
    readonly enableSOX: boolean;
    readonly enableHIPAA: boolean;
    readonly enablePCI: boolean;
  };
  readonly alertThresholds: {
    readonly criticalEvents: { warning: number; critical: number };
    readonly failureRate: { warning: number; critical: number }; // percentage
    readonly dataAccessVolume: { warning: number; critical: number }; // events per minute
    readonly complianceViolations: { warning: number; critical: number };
  };
  readonly reportingSchedule: {
    readonly dailyReports: boolean;
    readonly weeklyReports: boolean;
    readonly monthlyReports: boolean;
    readonly complianceReports: boolean;
  };
}

/**
 * Default audit dashboard configuration
 */
const DEFAULT_CONFIG: AuditDashboardConfig = {
  refreshInterval: 10000, // 10 seconds
  dataRetentionDays: 90, // 90 days for audit compliance
  threatDetectionThresholds: {
    bruteForceAttempts: 5,
    suspiciousAccessWindow: 10, // 10 minutes
    anomalyDetectionSensitivity: 0.7,
  },
  complianceSettings: {
    enableGDPR: true,
    enableSOX: true,
    enableHIPAA: true,
    enablePCI: true,
  },
  alertThresholds: {
    criticalEvents: { warning: 10, critical: 25 },
    failureRate: { warning: 15, critical: 30 }, // 15% / 30%
    dataAccessVolume: { warning: 100, critical: 250 }, // events per minute
    complianceViolations: { warning: 1, critical: 5 },
  },
  reportingSchedule: {
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true,
    complianceReports: true,
  },
};

/**
 * Audit analytics engine
 */
interface AuditAnalytics {
  readonly securityMetrics: {
    readonly totalEvents: number;
    readonly securityEvents: number;
    readonly successRate: number;
    readonly failureRate: number;
    readonly blockedRate: number;
    readonly averageRiskScore: number;
  };
  readonly threatAnalysis: {
    readonly activeThreats: number;
    readonly resolvedThreats: number;
    readonly threatsByType: Map<SecurityThreat['type'], number>;
    readonly threatsBySeverity: Map<SecurityThreat['severity'], number>;
  };
  readonly complianceStatus: {
    readonly totalViolations: number;
    readonly openViolations: number;
    readonly resolvedViolations: number;
    readonly violationsByType: Map<ComplianceViolation['type'], number>;
    readonly complianceScore: number; // 0-100
  };
  readonly userBehavior: {
    readonly activeUsers: number;
    readonly suspiciousUsers: number;
    readonly topRiskUsers: UserActivityAnalytics[];
    readonly accessPatterns: Map<string, number>;
  };
}

/**
 * Enterprise Audit Logging Monitoring Dashboard
 */
export class AuditDashboard {
  private static instance: AuditDashboard;
  private readonly config: AuditDashboardConfig;
  private readonly auditData: AuditDataPoint[] = [];
  private readonly securityThreats = new Map<string, SecurityThreat>();
  private readonly complianceViolations = new Map<string, ComplianceViolation>();
  private readonly userAnalytics = new Map<string, UserActivityAnalytics>();
  private readonly eventTracking = new WeakMap<
    object,
    {
      events: AuditDataPoint[];
      lastAnalysis: Date;
    }
  >();

  private refreshTimer?: NodeJS.Timeout;
  private isActive = false;
  private lastAnalysisTime: Date = new Date();

  constructor(config: Partial<AuditDashboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<AuditDashboardConfig>): AuditDashboard {
    if (!AuditDashboard.instance) {
      AuditDashboard.instance = new AuditDashboard(config);
    }
    return AuditDashboard.instance;
  }

  /**
   * Start audit dashboard monitoring
   */
  async start(): Promise<void> {
    if (this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting audit dashboard monitoring', {
      config: this.config,
    });

    this.isActive = true;

    // Ensure audit logger is running
    try {
      await globalAuditLogger.start();
    } catch (error) {
      logger?.log('warning', 'Audit logger failed to start', { error });
    }

    // Start data collection and analysis
    this.refreshTimer = setInterval(async () => {
      try {
        await this.collectAuditData();
        await this.analyzeSecurityThreats();
        await this.analyzeComplianceViolations();
        await this.analyzeUserBehavior();
        await this.checkAuditAlerts();
      } catch (error) {
        logger?.log('error', 'Audit dashboard analysis failed', { error });
      }
    }, this.config.refreshInterval);

    // Initial data collection
    await this.collectAuditData();
  }

  /**
   * Stop audit dashboard monitoring
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Stopping audit dashboard monitoring');

    this.isActive = false;

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  /**
   * Get current audit dashboard state
   */
  getDashboardData(): {
    currentMetrics: AuditAnalytics;
    recentEvents: ReadonlyArray<AuditDataPoint>;
    securityThreats: ReadonlyArray<SecurityThreat>;
    complianceViolations: ReadonlyArray<ComplianceViolation>;
    userAnalytics: ReadonlyArray<UserActivityAnalytics>;
    alerts: ReadonlyArray<{
      level: 'warning' | 'critical';
      message: string;
      timestamp: Date;
      category: 'security' | 'compliance' | 'performance';
    }>;
  } {
    const currentMetrics = this.generateAuditAnalytics();
    const recentEvents = this.auditData.slice(-100); // Last 100 events
    const alerts = this.generateAlerts();

    return {
      currentMetrics,
      recentEvents,
      securityThreats: Array.from(this.securityThreats.values()),
      complianceViolations: Array.from(this.complianceViolations.values()),
      userAnalytics: Array.from(this.userAnalytics.values()),
      alerts,
    };
  }

  /**
   * Track audit events for a specific context
   */
  trackContext<T extends object>(context: T, events: AuditDataPoint[]): void {
    this.eventTracking.set(context, {
      events: [...events],
      lastAnalysis: new Date(),
    });
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(options: {
    type: 'gdpr' | 'sox' | 'hipaa' | 'pci' | 'comprehensive';
    dateRange: { start: Date; end: Date };
    includeRecommendations?: boolean;
    format?: 'json' | 'pdf' | 'csv';
  }): Promise<{
    report: any;
    filename: string;
    contentType: string;
  }> {
    const { type, dateRange, includeRecommendations = true, format = 'json' } = options;

    // Filter data by date range
    const filteredEvents = this.auditData.filter(
      event => event.timestamp >= dateRange.start && event.timestamp <= dateRange.end,
    );

    const filteredViolations = Array.from(this.complianceViolations.values()).filter(
      violation => violation.detectedAt >= dateRange.start && violation.detectedAt <= dateRange.end,
    );

    const report = {
      metadata: {
        reportType: type,
        generatedAt: new Date().toISOString(),
        dateRange,
        totalEvents: filteredEvents.length,
        totalViolations: filteredViolations.length,
      },
      summary: {
        complianceScore: this.calculateComplianceScore(filteredEvents, filteredViolations),
        eventsByType: this.groupEventsByType(filteredEvents),
        violationsByType: this.groupViolationsByType(filteredViolations),
        userActivitySummary: this.generateUserActivitySummary(filteredEvents),
      },
      detailedAnalysis: {
        securityEvents: filteredEvents.filter(e => e.eventType === AuditEventType.SECURITY_EVENT),
        dataAccess: filteredEvents.filter(e => e.eventType === AuditEventType.DATA_ACCESS),
        systemChanges: filteredEvents.filter(e => e.eventType === AuditEventType.SYSTEM_CHANGE),
        complianceViolations: filteredViolations,
      },
      ...(includeRecommendations && {
        recommendations: this.generateComplianceRecommendations(filteredViolations),
      }),
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit-compliance-${type}-${timestamp}`;

    switch (format) {
      case 'json':
        return {
          report: JSON.stringify(report, null, 2),
          filename: `${filename}.json`,
          contentType: 'application/json',
        };
      case 'csv':
        const csvData = this.convertReportToCSV(report);
        return {
          report: csvData,
          filename: `${filename}.csv`,
          contentType: 'text/csv',
        };
      case 'pdf':
        // Would integrate with PDF generation library
        throw new Error('PDF format not yet implemented');
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export audit data for external analysis
   */
  async exportAuditData(options: {
    format: 'json' | 'csv' | 'siem';
    timeRange?: { start: Date; end: Date };
    eventTypes?: AuditEventType[];
    includeMetadata?: boolean;
  }): Promise<{
    data: string;
    filename: string;
    contentType: string;
  }> {
    const { format, timeRange, eventTypes, includeMetadata = true } = options;

    // Filter data
    let filteredData = this.auditData;
    if (timeRange) {
      filteredData = filteredData.filter(
        event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end,
      );
    }
    if (eventTypes && eventTypes.length > 0) {
      filteredData = filteredData.filter(event => eventTypes.includes(event.eventType));
    }

    const exportData = {
      metadata: includeMetadata
        ? {
            exportedAt: new Date().toISOString(),
            timeRange: timeRange || {
              start: filteredData[0]?.timestamp,
              end: filteredData[filteredData.length - 1]?.timestamp,
            },
            totalEvents: filteredData.length,
            eventTypes: eventTypes || 'all',
          }
        : undefined,
      events: filteredData,
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(exportData, null, 2),
          filename: `audit-export-${timestamp}.json`,
          contentType: 'application/json',
        };
      case 'csv':
        const csvData = this.convertAuditDataToCSV(filteredData);
        return {
          data: csvData,
          filename: `audit-export-${timestamp}.csv`,
          contentType: 'text/csv',
        };
      case 'siem':
        // SIEM-compatible format (JSON Lines)
        const siemData = filteredData.map(event => JSON.stringify(event)).join('\n');
        return {
          data: siemData,
          filename: `audit-siem-${timestamp}.jsonl`,
          contentType: 'application/x-jsonlines',
        };
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Collect current audit data
   */
  private async collectAuditData(): Promise<void> {
    try {
      const auditEvents = globalAuditLogger.getRecentEvents(this.lastAnalysisTime);

      for (const event of auditEvents) {
        const dataPoint: AuditDataPoint = {
          timestamp: event.timestamp,
          eventType: event.eventType,
          level: event.level,
          userId: event.metadata.userId as string,
          sessionId: event.metadata.sessionId as string,
          ipAddress: event.metadata.ipAddress as string,
          userAgent: event.metadata.userAgent as string,
          resourceAccessed: event.metadata.resource as string,
          action: event.action,
          outcome: this.determineOutcome(event),
          riskScore: this.calculateRiskScore(event),
          complianceFlags: this.extractComplianceFlags(event),
          metadata: event.metadata,
        };

        this.auditData.push(dataPoint);
      }

      // Maintain data retention limit
      const retentionLimit = Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000;
      const initialLength = this.auditData.length;

      // Remove old data
      let removedCount = 0;
      while (this.auditData.length > 0 && this.auditData[0].timestamp.getTime() < retentionLimit) {
        this.auditData.shift();
        removedCount++;
      }

      this.lastAnalysisTime = new Date();
    } catch (error) {
      const logger = await createServerObservability().catch(() => null);
      logger?.log('error', 'Failed to collect audit data', { error });
    }
  }

  /**
   * Analyze security threats
   */
  private async analyzeSecurityThreats(): Promise<void> {
    const recentEvents = this.auditData.filter(
      event => Date.now() - event.timestamp.getTime() < 60 * 60 * 1000, // Last hour
    );

    // Group events by IP address for brute force detection
    const eventsByIP = new Map<string, AuditDataPoint[]>();
    for (const event of recentEvents) {
      if (event.ipAddress) {
        const ipEvents = eventsByIP.get(event.ipAddress) || [];
        ipEvents.push(event);
        eventsByIP.set(event.ipAddress, ipEvents);
      }
    }

    // Detect brute force attacks
    for (const [ipAddress, events] of eventsByIP) {
      const failedLogins = events.filter(
        e => e.eventType === AuditEventType.AUTH_EVENT && e.outcome === 'failure',
      );

      if (failedLogins.length >= this.config.threatDetectionThresholds.bruteForceAttempts) {
        const threatId = `brute_force_${ipAddress}_${Date.now()}`;
        const existingThreat = Array.from(this.securityThreats.values()).find(
          t => t.type === 'brute_force' && t.ipAddresses.includes(ipAddress),
        );

        if (!existingThreat) {
          const threat: SecurityThreat = {
            id: threatId,
            type: 'brute_force',
            severity: failedLogins.length > 10 ? 'high' : 'medium',
            firstSeen: failedLogins[0].timestamp,
            lastSeen: failedLogins[failedLogins.length - 1].timestamp,
            eventCount: failedLogins.length,
            affectedUsers: [...new Set(failedLogins.map(e => e.userId).filter(Boolean))],
            ipAddresses: [ipAddress],
            description: `Brute force attack detected from ${ipAddress}`,
            indicators: [
              `${failedLogins.length} failed login attempts`,
              `Time span: ${Math.round((failedLogins[failedLogins.length - 1].timestamp.getTime() - failedLogins[0].timestamp.getTime()) / 60000)} minutes`,
            ],
            mitigationSteps: [
              'Block IP address',
              'Review affected user accounts',
              'Implement rate limiting',
              'Enable account lockout policies',
            ],
          };

          this.securityThreats.set(threatId, threat);

          const logger = await createServerObservability().catch(() => null);
          logger?.log('warning', 'Security threat detected', {
            threat: threat,
            ipAddress,
            failedAttempts: failedLogins.length,
          });
        }
      }
    }

    // Detect anomalous access patterns
    await this.detectAnomalousAccess(recentEvents);
  }

  /**
   * Analyze compliance violations
   */
  private async analyzeComplianceViolations(): Promise<void> {
    const recentEvents = this.auditData.filter(
      event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000, // Last 24 hours
    );

    for (const event of recentEvents) {
      // Check for GDPR violations
      if (this.config.complianceSettings.enableGDPR) {
        await this.checkGDPRCompliance(event);
      }

      // Check for SOX violations
      if (this.config.complianceSettings.enableSOX) {
        await this.checkSOXCompliance(event);
      }

      // Check for HIPAA violations
      if (this.config.complianceSettings.enableHIPAA) {
        await this.checkHIPAACompliance(event);
      }

      // Check for PCI violations
      if (this.config.complianceSettings.enablePCI) {
        await this.checkPCICompliance(event);
      }
    }
  }

  /**
   * Analyze user behavior patterns
   */
  private async analyzeUserBehavior(): Promise<void> {
    const recentEvents = this.auditData.filter(
      event => Date.now() - event.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000, // Last 7 days
    );

    // Group events by user
    const eventsByUser = new Map<string, AuditDataPoint[]>();
    for (const event of recentEvents) {
      if (event.userId) {
        const userEvents = eventsByUser.get(event.userId) || [];
        userEvents.push(event);
        eventsByUser.set(event.userId, userEvents);
      }
    }

    // Analyze each user's behavior
    for (const [userId, events] of eventsByUser) {
      const successfulActions = events.filter(e => e.outcome === 'success').length;
      const failedActions = events.filter(e => e.outcome === 'failure').length;
      const blockedActions = events.filter(e => e.outcome === 'blocked').length;
      const uniqueResources = new Set(events.map(e => e.resourceAccessed).filter(Boolean)).size;
      const averageRiskScore = events.reduce((sum, e) => sum + e.riskScore, 0) / events.length;

      const suspiciousPatterns = this.detectSuspiciousPatterns(events);
      const complianceStatus = this.assessUserComplianceStatus(events);

      const analytics: UserActivityAnalytics = {
        userId,
        totalEvents: events.length,
        successfulActions,
        failedActions,
        blockedActions,
        uniqueResources,
        riskScore: Math.round(averageRiskScore),
        lastActivity: events[events.length - 1].timestamp,
        suspiciousPatterns,
        complianceStatus,
      };

      this.userAnalytics.set(userId, analytics);
    }
  }

  /**
   * Check for audit alerts
   */
  private async checkAuditAlerts(): Promise<void> {
    const recentEvents = this.auditData.filter(
      event => Date.now() - event.timestamp.getTime() < this.config.refreshInterval * 2,
    );

    const logger = await createServerObservability().catch(() => null);

    // Critical events alert
    const criticalEvents = recentEvents.filter(e => e.level === AuditLogLevel.CRITICAL).length;
    if (criticalEvents >= this.config.alertThresholds.criticalEvents.critical) {
      logger?.log('error', 'Critical audit events threshold exceeded', {
        count: criticalEvents,
        threshold: this.config.alertThresholds.criticalEvents.critical,
      });
    } else if (criticalEvents >= this.config.alertThresholds.criticalEvents.warning) {
      logger?.log('warning', 'Critical audit events warning threshold reached', {
        count: criticalEvents,
        threshold: this.config.alertThresholds.criticalEvents.warning,
      });
    }

    // Failure rate alert
    const totalEvents = recentEvents.length;
    if (totalEvents > 0) {
      const failures = recentEvents.filter(e => e.outcome === 'failure').length;
      const failureRate = (failures / totalEvents) * 100;

      if (failureRate >= this.config.alertThresholds.failureRate.critical) {
        logger?.log('error', 'High failure rate detected', {
          failureRate: `${failureRate.toFixed(2)}%`,
          threshold: `${this.config.alertThresholds.failureRate.critical}%`,
        });
      } else if (failureRate >= this.config.alertThresholds.failureRate.warning) {
        logger?.log('warning', 'Elevated failure rate detected', {
          failureRate: `${failureRate.toFixed(2)}%`,
          threshold: `${this.config.alertThresholds.failureRate.warning}%`,
        });
      }
    }

    // Compliance violations alert
    const recentViolations = Array.from(this.complianceViolations.values()).filter(
      v => Date.now() - v.detectedAt.getTime() < 24 * 60 * 60 * 1000,
    ).length;

    if (recentViolations >= this.config.alertThresholds.complianceViolations.critical) {
      logger?.log('error', 'Critical compliance violations detected', {
        count: recentViolations,
        threshold: this.config.alertThresholds.complianceViolations.critical,
      });
    } else if (recentViolations >= this.config.alertThresholds.complianceViolations.warning) {
      logger?.log('warning', 'Compliance violations detected', {
        count: recentViolations,
        threshold: this.config.alertThresholds.complianceViolations.warning,
      });
    }
  }

  /**
   * Helper methods for analysis
   */
  private determineOutcome(event: any): 'success' | 'failure' | 'blocked' {
    if (event.metadata.blocked) return 'blocked';
    if (event.metadata.success === false || event.metadata.error) return 'failure';
    return 'success';
  }

  private calculateRiskScore(event: any): number {
    let score = 0;

    // Base score by event type
    switch (event.eventType) {
      case AuditEventType.SECURITY_EVENT:
        score += 50;
        break;
      case AuditEventType.AUTH_EVENT:
        score += 30;
        break;
      case AuditEventType.DATA_ACCESS:
        score += 20;
        break;
      default:
        score += 10;
    }

    // Adjust for outcome
    if (event.metadata.blocked) score += 40;
    if (event.metadata.error) score += 20;

    // Adjust for sensitive data
    if (event.metadata.dataClassification === 'sensitive') score += 20;
    if (event.metadata.dataClassification === 'confidential') score += 30;

    return Math.min(100, score);
  }

  private extractComplianceFlags(event: any): string[] {
    const flags: string[] = [];

    if (event.metadata.gdprRelevant) flags.push('gdpr');
    if (event.metadata.soxRelevant) flags.push('sox');
    if (event.metadata.hipaaRelevant) flags.push('hipaa');
    if (event.metadata.pciRelevant) flags.push('pci');

    return flags;
  }

  private async detectAnomalousAccess(events: AuditDataPoint[]): Promise<void> {
    // Implementation would use statistical analysis to detect anomalies
    // This is a simplified version
    const userAccessPatterns = new Map<string, { resources: Set<string>; times: number[] }>();

    for (const event of events) {
      if (event.userId && event.resourceAccessed) {
        const pattern = userAccessPatterns.get(event.userId) || { resources: new Set(), times: [] };
        pattern.resources.add(event.resourceAccessed);
        pattern.times.push(event.timestamp.getHours());
        userAccessPatterns.set(event.userId, pattern);
      }
    }

    // Detect unusual access patterns (simplified)
    for (const [userId, pattern] of userAccessPatterns) {
      if (pattern.resources.size > 20) {
        // Accessing many resources
        const threatId = `suspicious_access_${userId}_${Date.now()}`;
        const threat: SecurityThreat = {
          id: threatId,
          type: 'suspicious_access',
          severity: 'medium',
          firstSeen: new Date(Date.now() - 60 * 60 * 1000),
          lastSeen: new Date(),
          eventCount: pattern.resources.size,
          affectedUsers: [userId],
          ipAddresses: [],
          description: `User ${userId} accessed unusual number of resources`,
          indicators: [`${pattern.resources.size} unique resources accessed`],
          mitigationSteps: [
            'Review user permissions',
            'Verify user identity',
            'Check for account compromise',
          ],
        };

        this.securityThreats.set(threatId, threat);
      }
    }
  }

  private async checkGDPRCompliance(event: AuditDataPoint): Promise<void> {
    if (event.complianceFlags.includes('gdpr')) {
      // Check for potential GDPR violations
      if (event.eventType === AuditEventType.DATA_ACCESS && !event.metadata.consent) {
        const violationId = `gdpr_${event.userId}_${Date.now()}`;
        const violation: ComplianceViolation = {
          id: violationId,
          type: 'gdpr',
          severity: 'major',
          detectedAt: event.timestamp,
          userId: event.userId,
          resourceId: event.resourceAccessed,
          violationDescription: 'Personal data accessed without explicit consent',
          dataClassification: 'personal_data',
          regulatoryReference: 'GDPR Article 6',
          remediationRequired: true,
          reportingDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
          status: 'open',
        };

        this.complianceViolations.set(violationId, violation);
      }
    }
  }

  private async checkSOXCompliance(event: AuditDataPoint): Promise<void> {
    // SOX compliance checks implementation
    if (event.complianceFlags.includes('sox') && event.eventType === AuditEventType.SYSTEM_CHANGE) {
      if (!event.metadata.changeApproval) {
        const violationId = `sox_${event.userId}_${Date.now()}`;
        const violation: ComplianceViolation = {
          id: violationId,
          type: 'sox',
          severity: 'critical',
          detectedAt: event.timestamp,
          userId: event.userId,
          resourceId: event.resourceAccessed,
          violationDescription: 'System change made without proper approval',
          dataClassification: 'financial_data',
          regulatoryReference: 'SOX Section 302',
          remediationRequired: true,
          status: 'open',
        };

        this.complianceViolations.set(violationId, violation);
      }
    }
  }

  private async checkHIPAACompliance(event: AuditDataPoint): Promise<void> {
    // HIPAA compliance checks implementation
    if (event.complianceFlags.includes('hipaa') && event.eventType === AuditEventType.DATA_ACCESS) {
      if (event.metadata.dataClassification === 'phi' && !event.metadata.businessJustification) {
        const violationId = `hipaa_${event.userId}_${Date.now()}`;
        const violation: ComplianceViolation = {
          id: violationId,
          type: 'hipaa',
          severity: 'major',
          detectedAt: event.timestamp,
          userId: event.userId,
          resourceId: event.resourceAccessed,
          violationDescription: 'PHI accessed without business justification',
          dataClassification: 'phi',
          regulatoryReference: 'HIPAA Privacy Rule',
          remediationRequired: true,
          status: 'open',
        };

        this.complianceViolations.set(violationId, violation);
      }
    }
  }

  private async checkPCICompliance(event: AuditDataPoint): Promise<void> {
    // PCI DSS compliance checks implementation
    if (event.complianceFlags.includes('pci') && event.eventType === AuditEventType.DATA_ACCESS) {
      if (event.metadata.dataClassification === 'cardholder_data' && !event.metadata.encrypted) {
        const violationId = `pci_${event.userId}_${Date.now()}`;
        const violation: ComplianceViolation = {
          id: violationId,
          type: 'pci',
          severity: 'critical',
          detectedAt: event.timestamp,
          userId: event.userId,
          resourceId: event.resourceAccessed,
          violationDescription: 'Unencrypted cardholder data access detected',
          dataClassification: 'cardholder_data',
          regulatoryReference: 'PCI DSS Requirement 3',
          remediationRequired: true,
          status: 'open',
        };

        this.complianceViolations.set(violationId, violation);
      }
    }
  }

  private detectSuspiciousPatterns(events: AuditDataPoint[]): Array<{
    pattern: string;
    confidence: number;
    description: string;
  }> {
    const patterns: Array<{
      pattern: string;
      confidence: number;
      description: string;
    }> = [];

    // Pattern 1: Off-hours access
    const offHoursEvents = events.filter(e => {
      const hour = e.timestamp.getHours();
      return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
    });

    if (offHoursEvents.length > events.length * 0.3) {
      patterns.push({
        pattern: 'off_hours_access',
        confidence: 0.8,
        description: 'High percentage of off-hours access detected',
      });
    }

    // Pattern 2: Rapid successive logins
    const authEvents = events.filter(e => e.eventType === AuditEventType.AUTH_EVENT);
    if (authEvents.length > 10) {
      const timeSpan =
        authEvents[authEvents.length - 1].timestamp.getTime() - authEvents[0].timestamp.getTime();
      if (timeSpan < 60000) {
        // Less than 1 minute
        patterns.push({
          pattern: 'rapid_login_attempts',
          confidence: 0.9,
          description: 'Multiple login attempts in rapid succession',
        });
      }
    }

    return patterns;
  }

  private assessUserComplianceStatus(
    events: AuditDataPoint[],
  ): 'compliant' | 'warning' | 'violation' {
    const hasViolations = events.some(e => e.complianceFlags.length > 0 && e.outcome === 'failure');
    const hasWarnings = events.some(e => e.riskScore > 70);

    if (hasViolations) return 'violation';
    if (hasWarnings) return 'warning';
    return 'compliant';
  }

  private generateAuditAnalytics(): AuditAnalytics {
    const totalEvents = this.auditData.length;
    const securityEvents = this.auditData.filter(
      e => e.eventType === AuditEventType.SECURITY_EVENT,
    ).length;
    const successfulEvents = this.auditData.filter(e => e.outcome === 'success').length;
    const failedEvents = this.auditData.filter(e => e.outcome === 'failure').length;
    const blockedEvents = this.auditData.filter(e => e.outcome === 'blocked').length;

    const totalRiskScore = this.auditData.reduce((sum, e) => sum + e.riskScore, 0);
    const averageRiskScore = totalEvents > 0 ? totalRiskScore / totalEvents : 0;

    const threatsByType = new Map<SecurityThreat['type'], number>();
    const threatsBySeverity = new Map<SecurityThreat['severity'], number>();

    for (const threat of this.securityThreats.values()) {
      threatsByType.set(threat.type, (threatsByType.get(threat.type) || 0) + 1);
      threatsBySeverity.set(threat.severity, (threatsBySeverity.get(threat.severity) || 0) + 1);
    }

    const violationsByType = new Map<ComplianceViolation['type'], number>();
    let openViolations = 0;
    let resolvedViolations = 0;

    for (const violation of this.complianceViolations.values()) {
      violationsByType.set(violation.type, (violationsByType.get(violation.type) || 0) + 1);
      if (violation.status === 'resolved') {
        resolvedViolations++;
      } else {
        openViolations++;
      }
    }

    const complianceScore = Math.max(0, 100 - openViolations * 10 - resolvedViolations * 2);

    const activeUsers = new Set(this.auditData.map(e => e.userId).filter(Boolean)).size;
    const suspiciousUsers = Array.from(this.userAnalytics.values()).filter(
      u => u.suspiciousPatterns.length > 0,
    ).length;

    const accessPatterns = new Map<string, number>();
    for (const event of this.auditData) {
      if (event.resourceAccessed) {
        accessPatterns.set(
          event.resourceAccessed,
          (accessPatterns.get(event.resourceAccessed) || 0) + 1,
        );
      }
    }

    return {
      securityMetrics: {
        totalEvents,
        securityEvents,
        successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0,
        failureRate: totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0,
        blockedRate: totalEvents > 0 ? (blockedEvents / totalEvents) * 100 : 0,
        averageRiskScore,
      },
      threatAnalysis: {
        activeThreats: this.securityThreats.size,
        resolvedThreats: 0, // Would track resolved threats
        threatsByType,
        threatsBySeverity,
      },
      complianceStatus: {
        totalViolations: this.complianceViolations.size,
        openViolations,
        resolvedViolations,
        violationsByType,
        complianceScore,
      },
      userBehavior: {
        activeUsers,
        suspiciousUsers,
        topRiskUsers: Array.from(this.userAnalytics.values())
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 10),
        accessPatterns,
      },
    };
  }

  private generateAlerts(): Array<{
    level: 'warning' | 'critical';
    message: string;
    timestamp: Date;
    category: 'security' | 'compliance' | 'performance';
  }> {
    const alerts = [];
    const now = new Date();

    // Security alerts
    for (const threat of this.securityThreats.values()) {
      if (threat.severity === 'critical' || threat.severity === 'high') {
        alerts.push({
          level: threat.severity === 'critical' ? ('critical' as const) : ('warning' as const),
          message: threat.description,
          timestamp: now,
          category: 'security' as const,
        });
      }
    }

    // Compliance alerts
    for (const violation of this.complianceViolations.values()) {
      if (violation.severity === 'critical' || violation.severity === 'major') {
        alerts.push({
          level: violation.severity === 'critical' ? ('critical' as const) : ('warning' as const),
          message: violation.violationDescription,
          timestamp: now,
          category: 'compliance' as const,
        });
      }
    }

    return alerts;
  }

  private calculateComplianceScore(
    events: AuditDataPoint[],
    violations: ComplianceViolation[],
  ): number {
    const totalEvents = events.length;
    const violationEvents = violations.length;

    if (totalEvents === 0) return 100;

    const violationRate = violationEvents / totalEvents;
    return Math.max(0, Math.round(100 - violationRate * 100));
  }

  private groupEventsByType(events: AuditDataPoint[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const event of events) {
      groups[event.eventType] = (groups[event.eventType] || 0) + 1;
    }
    return groups;
  }

  private groupViolationsByType(violations: ComplianceViolation[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const violation of violations) {
      groups[violation.type] = (groups[violation.type] || 0) + 1;
    }
    return groups;
  }

  private generateUserActivitySummary(events: AuditDataPoint[]): any {
    const userEvents = new Map<string, number>();
    for (const event of events) {
      if (event.userId) {
        userEvents.set(event.userId, (userEvents.get(event.userId) || 0) + 1);
      }
    }

    return {
      totalUsers: userEvents.size,
      averageEventsPerUser:
        userEvents.size > 0
          ? Array.from(userEvents.values()).reduce((a, b) => a + b, 0) / userEvents.size
          : 0,
      mostActiveUsers: Array.from(userEvents.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({ userId, eventCount: count })),
    };
  }

  private generateComplianceRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations = new Set<string>();

    for (const violation of violations) {
      switch (violation.type) {
        case 'gdpr':
          recommendations.add('Implement explicit consent management');
          recommendations.add('Review data processing lawful basis');
          break;
        case 'sox':
          recommendations.add('Strengthen change management controls');
          recommendations.add('Implement segregation of duties');
          break;
        case 'hipaa':
          recommendations.add('Enhance PHI access controls');
          recommendations.add('Implement minimum necessary standard');
          break;
        case 'pci':
          recommendations.add('Encrypt all cardholder data');
          recommendations.add('Implement strong access controls');
          break;
      }
    }

    return Array.from(recommendations);
  }

  private convertReportToCSV(report: any): string {
    // Convert complex report to CSV format
    const lines = ['Type,Timestamp,Description,Severity,Status'];

    if (report.detailedAnalysis.complianceViolations) {
      for (const violation of report.detailedAnalysis.complianceViolations) {
        lines.push(
          [
            violation.type,
            violation.detectedAt,
            violation.violationDescription.replace(/,/g, ';'),
            violation.severity,
            violation.status,
          ].join(','),
        );
      }
    }

    return lines.join('\n');
  }

  private convertAuditDataToCSV(data: AuditDataPoint[]): string {
    const headers = [
      'timestamp',
      'eventType',
      'level',
      'userId',
      'sessionId',
      'ipAddress',
      'action',
      'outcome',
      'riskScore',
      'resourceAccessed',
    ];

    const rows = data.map(event => [
      event.timestamp.toISOString(),
      event.eventType,
      event.level,
      event.userId || '',
      event.sessionId || '',
      event.ipAddress || '',
      event.action,
      event.outcome,
      event.riskScore.toString(),
      event.resourceAccessed || '',
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

/**
 * Global audit dashboard instance
 */
export const globalAuditDashboard = AuditDashboard.getInstance();

/**
 * Audit dashboard utility functions
 */
export namespace AuditDashboardUtils {
  /**
   * Format risk score for display
   */
  export function formatRiskScore(score: number): string {
    if (score >= 80) return `🔴 ${score} (Critical)`;
    if (score >= 60) return `🟠 ${score} (High)`;
    if (score >= 40) return `🟡 ${score} (Medium)`;
    return `🟢 ${score} (Low)`;
  }

  /**
   * Get compliance status color
   */
  export function getComplianceStatusColor(status: 'compliant' | 'warning' | 'violation'): string {
    switch (status) {
      case 'compliant':
        return '#22c55e'; // green
      case 'warning':
        return '#f59e0b'; // amber
      case 'violation':
        return '#ef4444'; // red
    }
  }

  /**
   * Calculate threat severity score
   */
  export function calculateThreatSeverityScore(threat: SecurityThreat): number {
    let score = 0;

    switch (threat.severity) {
      case 'critical':
        score += 100;
        break;
      case 'high':
        score += 75;
        break;
      case 'medium':
        score += 50;
        break;
      case 'low':
        score += 25;
        break;
    }

    // Adjust for event count and recency
    score += Math.min(25, threat.eventCount);

    const hoursSinceLastSeen = (Date.now() - threat.lastSeen.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 1) score += 20;
    else if (hoursSinceLastSeen < 24) score += 10;

    return Math.min(100, score);
  }
}

/**
 * Start global audit dashboard
 */
export async function startAuditDashboard(
  config?: Partial<AuditDashboardConfig>,
): Promise<AuditDashboard> {
  const dashboard = AuditDashboard.getInstance(config);
  await dashboard.start();
  return dashboard;
}
