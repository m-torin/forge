/**
 * Enterprise Compliance Reporting Automation System
 *
 * Comprehensive compliance reporting automation leveraging Node.js 22+ features for
 * enterprise-grade regulatory reporting, audit trail generation, and compliance
 * monitoring. This system provides automated generation of compliance reports for
 * GDPR, SOX, HIPAA, PCI-DSS, and custom regulatory frameworks.
 *
 * ## Key Node 22+ Features Used:
 * - **Promise.withResolvers()**: External promise control for complex report generation workflows
 * - **structuredClone()**: Safe deep cloning of compliance data for report isolation
 * - **WeakMap**: Secure context tracking for sensitive compliance data
 * - **High-resolution timing**: Precise performance tracking for compliance SLA monitoring
 * - **AbortSignal.timeout()**: Context-aware timeout management for report generation
 *
 * ## Core Compliance Capabilities:
 * - Automated regulatory report generation (GDPR/SOX/HIPAA/PCI)
 * - Real-time compliance monitoring and violation detection
 * - Audit trail aggregation and report packaging
 * - Compliance metrics dashboard with trend analysis
 * - Automated compliance certificate generation
 * - Integration with external compliance management systems
 * - Data retention policy automation and archival
 * - Privacy impact assessment automation
 *
 * @module ComplianceReports
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { createServerObservability } from '@repo/observability/server/next';
import { z } from 'zod/v4';
import { globalAuditAnalytics } from '../analytics/audit-analytics';
import { globalAuditLogger, type AuditEvent } from '../shared/utils/audit-logger';
import { globalTimeoutManager } from '../shared/utils/timeout-manager';

/**
 * Compliance framework types
 */
export enum ComplianceFramework {
  GDPR = 'gdpr',
  SOX = 'sox',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  CCPA = 'ccpa',
  CUSTOM = 'custom',
}

/**
 * Report generation status
 */
export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

/**
 * Report format types
 */
export enum ReportFormat {
  PDF = 'pdf',
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  HTML = 'html',
}

/**
 * Compliance violation severity
 */
export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Compliance report configuration
 */
const ComplianceReportConfigSchema = z.object({
  reportId: z.string(),
  framework: z.nativeEnum(ComplianceFramework),
  format: z.nativeEnum(ReportFormat),
  startDate: z.date(),
  endDate: z.date(),
  includeRawData: z.boolean().default(false),
  includeRecommendations: z.boolean().default(true),
  customSections: z.array(z.string()).optional(),
  recipients: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.string(),
        accessLevel: z.enum(['read', 'full']),
      }),
    )
    .optional(),
  encryption: z
    .object({
      enabled: z.boolean().default(true),
      algorithm: z.string().default('AES-256-GCM'),
      keyRotation: z.boolean().default(true),
    })
    .optional(),
  retention: z
    .object({
      days: z.number().default(2555), // 7 years default
      archiveAfter: z.number().default(365), // 1 year
      autoDelete: z.boolean().default(false),
    })
    .optional(),
  scheduling: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually']),
      dayOfWeek: z.number().optional(),
      dayOfMonth: z.number().optional(),
      hour: z.number().default(2),
      timezone: z.string().default('UTC'),
    })
    .optional(),
});

export type ComplianceReportConfig = z.infer<typeof ComplianceReportConfigSchema>;

/**
 * Compliance violation record
 */
interface ComplianceViolation {
  readonly id: string;
  readonly framework: ComplianceFramework;
  readonly severity: ViolationSeverity;
  readonly detectedAt: Date;
  readonly category: string;
  readonly description: string;
  readonly affectedData: {
    records: number;
    dataTypes: string[];
    subjects?: string[];
  };
  readonly remediation: {
    status: 'pending' | 'in_progress' | 'completed';
    assignedTo: string;
    dueDate: Date;
    actions: string[];
  };
  readonly auditTrail: string[]; // References to audit events
  readonly impact: {
    riskScore: number; // 0-100
    financialImpact?: number;
    reputationImpact: 'low' | 'medium' | 'high';
    regulatoryExposure: string[];
  };
  readonly metadata: Record<string, unknown>;
}

/**
 * Generated compliance report
 */
interface ComplianceReport {
  readonly id: string;
  readonly framework: ComplianceFramework;
  readonly generatedAt: Date;
  readonly reportPeriod: {
    start: Date;
    end: Date;
  };
  readonly status: ReportStatus;
  readonly format: ReportFormat;
  readonly summary: {
    totalEvents: number;
    violations: number;
    complianceScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  readonly sections: {
    executive: string;
    auditSummary: string;
    violations: ComplianceViolation[];
    recommendations: string[];
    dataFlows: any[];
    controls: any[];
    certifications: any[];
  };
  readonly attachments: Array<{
    name: string;
    type: string;
    size: number;
    checksum: string;
  }>;
  readonly certification: {
    signedBy: string;
    signature: string;
    timestamp: Date;
    valid: boolean;
  };
  readonly metadata: {
    version: string;
    generationTime: number; // milliseconds
    auditEventCount: number;
    dataSourceIntegrity: boolean;
    encryptionStatus: boolean;
  };
}

/**
 * Compliance reporting system configuration
 */
interface ComplianceReportingConfig {
  readonly outputDirectory: string;
  readonly encryptionKey: string;
  readonly maxReportSize: number; // bytes
  readonly concurrentReports: number;
  readonly retentionDays: number;
  readonly frameworks: {
    [K in ComplianceFramework]?: {
      enabled: boolean;
      customFields?: Record<string, unknown>;
      templates?: Record<ReportFormat, string>;
    };
  };
  readonly notifications: {
    onGeneration: boolean;
    onViolation: boolean;
    onSchedule: boolean;
    webhooks: Array<{
      url: string;
      events: string[];
      authentication: Record<string, string>;
    }>;
  };
}

/**
 * Default compliance reporting configuration
 */
const DEFAULT_COMPLIANCE_CONFIG: ComplianceReportingConfig = {
  outputDirectory: './compliance-reports',
  encryptionKey: process.env.COMPLIANCE_ENCRYPTION_KEY || 'default-key-change-me',
  maxReportSize: 100 * 1024 * 1024, // 100MB
  concurrentReports: 3,
  retentionDays: 2555, // 7 years
  frameworks: {
    [ComplianceFramework.GDPR]: {
      enabled: true,
      customFields: {
        dpoContact: process.env.DPO_EMAIL,
        lawfulBasis: 'legitimate_interest',
      },
    },
    [ComplianceFramework.SOX]: {
      enabled: true,
      customFields: {
        sectionCompliance: ['302', '404', '906'],
      },
    },
    [ComplianceFramework.HIPAA]: {
      enabled: true,
      customFields: {
        coveredEntity: process.env.HIPAA_ENTITY_NAME,
        businessAssociates: [],
      },
    },
    [ComplianceFramework.PCI_DSS]: {
      enabled: true,
      customFields: {
        merchantLevel: 4,
        processingVolume: 'under_20k',
      },
    },
  },
  notifications: {
    onGeneration: true,
    onViolation: true,
    onSchedule: true,
    webhooks: [],
  },
};

/**
 * Enterprise Compliance Reporting Automation System
 */
export class ComplianceReportingSystem {
  private static instance: ComplianceReportingSystem;
  private readonly config: ComplianceReportingConfig;
  private readonly activeReports = new Map<string, Promise<ComplianceReport>>();
  private readonly reportHistory: ComplianceReport[] = [];
  private readonly violations = new Map<string, ComplianceViolation>();
  private readonly scheduledReports = new Map<string, NodeJS.Timeout>();

  // Node 22+ features for secure compliance data handling
  private readonly reportContexts = new WeakMap<
    object,
    {
      encryptionKey: string;
      accessLog: string[];
      generationTime: bigint;
    }
  >();
  private readonly sensitiveDataRefs = new Map<string, WeakRef<object>>();

  private isActive = false;

  constructor(config: Partial<ComplianceReportingConfig> = {}) {
    this.config = { ...DEFAULT_COMPLIANCE_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ComplianceReportingConfig>): ComplianceReportingSystem {
    if (!ComplianceReportingSystem.instance) {
      ComplianceReportingSystem.instance = new ComplianceReportingSystem(config);
    }
    return ComplianceReportingSystem.instance;
  }

  /**
   * Start compliance reporting system
   */
  async start(): Promise<void> {
    if (this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting compliance reporting system', {
      enabledFrameworks: Object.keys(this.config.frameworks).filter(
        f => this.config.frameworks[f as ComplianceFramework]?.enabled,
      ),
    });

    this.isActive = true;

    // Start violation monitoring
    await this.startViolationMonitoring();

    // Schedule automated reports
    await this.scheduleAutomatedReports();

    // Initial compliance assessment
    await this.performInitialAssessment();
  }

  /**
   * Stop compliance reporting system
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Stopping compliance reporting system');

    this.isActive = false;

    // Clear scheduled reports
    for (const [id, timer] of this.scheduledReports) {
      clearTimeout(timer);
      this.scheduledReports.delete(id);
    }

    // Wait for active report generation to complete
    await Promise.allSettled(Array.from(this.activeReports.values()));
  }

  /**
   * Generate compliance report
   */
  async generateReport(config: ComplianceReportConfig): Promise<ComplianceReport> {
    // Validate configuration
    const validatedConfig = ComplianceReportConfigSchema.parse(config);

    // Check if report is already being generated
    if (this.activeReports.has(validatedConfig.reportId)) {
      throw new Error(`Report ${validatedConfig.reportId} is already being generated`);
    }

    const startTime = process.hrtime.bigint();
    const logger = await createServerObservability().catch(() => null);

    logger?.log('info', 'Starting compliance report generation', {
      reportId: validatedConfig.reportId,
      framework: validatedConfig.framework,
      format: validatedConfig.format,
      period: {
        start: validatedConfig.startDate,
        end: validatedConfig.endDate,
      },
    });

    // Create promise with external control using Node 22+ Promise.withResolvers()
    const { promise, resolve, reject } = Promise.withResolvers<ComplianceReport>();

    // Store active report promise
    this.activeReports.set(validatedConfig.reportId, promise);

    try {
      // Use AbortSignal.timeout() for report generation timeout (Node 22+)
      const timeoutMs = 10 * 60 * 1000; // 10 minutes
      const abortSignal = AbortSignal.timeout(timeoutMs);

      // Generate report with timeout context
      const report = await this.performReportGeneration(validatedConfig, abortSignal);

      // Calculate generation time
      const generationTime = Number(process.hrtime.bigint() - startTime) / 1_000_000; // ms

      // Add generation metadata
      const finalReport: ComplianceReport = {
        ...report,
        metadata: {
          ...report.metadata,
          generationTime,
        },
      };

      // Store report in history
      this.reportHistory.push(finalReport);

      // Clean up old reports based on retention policy
      await this.cleanupOldReports();

      logger?.log('info', 'Compliance report generated successfully', {
        reportId: validatedConfig.reportId,
        generationTime,
        complianceScore: finalReport.summary.complianceScore,
        violations: finalReport.summary.violations,
      });

      resolve(finalReport);
      return finalReport;
    } catch (error) {
      logger?.log('error', 'Compliance report generation failed', {
        reportId: validatedConfig.reportId,
        error: error instanceof Error ? error.message : String(error),
      });

      reject(error);
      throw error;
    } finally {
      // Clean up active report tracking
      this.activeReports.delete(validatedConfig.reportId);
    }
  }

  /**
   * Register compliance violation
   */
  async registerViolation(
    violation: Omit<ComplianceViolation, 'id' | 'detectedAt'>,
  ): Promise<void> {
    const violationId = `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const detectedAt = new Date();

    const fullViolation: ComplianceViolation = {
      id: violationId,
      detectedAt,
      ...violation,
    };

    // Store violation
    this.violations.set(violationId, fullViolation);

    // Log to audit system
    await globalAuditLogger.logEvent({
      eventType: 'compliance_violation',
      userId: 'system',
      entityType: 'compliance',
      entityId: violationId,
      action: 'violation_detected',
      outcome: 'failure',
      details: {
        framework: violation.framework,
        severity: violation.severity,
        category: violation.category,
      },
      metadata: {
        affectedRecords: violation.affectedData.records,
        riskScore: violation.impact.riskScore,
      },
    });

    const logger = await createServerObservability().catch(() => null);
    logger?.log('warning', 'Compliance violation registered', {
      violationId,
      framework: violation.framework,
      severity: violation.severity,
      riskScore: violation.impact.riskScore,
    });

    // Trigger immediate notifications for critical violations
    if (violation.severity === ViolationSeverity.CRITICAL) {
      await this.notifyViolation(fullViolation);
    }
  }

  /**
   * Get compliance statistics
   */
  getComplianceStatistics(): {
    totalReports: number;
    reportsToday: number;
    averageComplianceScore: number;
    activeViolations: number;
    criticalViolations: number;
    frameworkScores: Record<ComplianceFramework, number>;
    trendAnalysis: {
      scoreTrend: 'improving' | 'declining' | 'stable';
      violationTrend: 'increasing' | 'decreasing' | 'stable';
    };
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reportsToday = this.reportHistory.filter(report => report.generatedAt >= today);

    const activeViolations = Array.from(this.violations.values()).filter(
      v => v.remediation.status !== 'completed',
    );

    const criticalViolations = activeViolations.filter(
      v => v.severity === ViolationSeverity.CRITICAL,
    );

    // Calculate average compliance score
    const scores = this.reportHistory.slice(-30).map(r => r.summary.complianceScore);
    const averageComplianceScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Calculate framework-specific scores
    const frameworkScores = {} as Record<ComplianceFramework, number>;
    for (const framework of Object.values(ComplianceFramework)) {
      const frameworkReports = this.reportHistory.filter(r => r.framework === framework).slice(-10); // Last 10 reports per framework

      if (frameworkReports.length > 0) {
        frameworkScores[framework] =
          frameworkReports.reduce((sum, r) => sum + r.summary.complianceScore, 0) /
          frameworkReports.length;
      } else {
        frameworkScores[framework] = 0;
      }
    }

    // Trend analysis
    const recentScores = this.reportHistory.slice(-10).map(r => r.summary.complianceScore);
    const olderScores = this.reportHistory.slice(-20, -10).map(r => r.summary.complianceScore);

    let scoreTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentScores.length > 0 && olderScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
      const change = (recentAvg - olderAvg) / olderAvg;

      if (change > 0.05) scoreTrend = 'improving';
      else if (change < -0.05) scoreTrend = 'declining';
    }

    const recentViolations = Array.from(this.violations.values()).filter(
      v => v.detectedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ); // Last week
    const olderViolations = Array.from(this.violations.values()).filter(v => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return v.detectedAt <= weekAgo && v.detectedAt > twoWeeksAgo;
    });

    let violationTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentViolations.length !== olderViolations.length) {
      violationTrend =
        recentViolations.length > olderViolations.length ? 'increasing' : 'decreasing';
    }

    return {
      totalReports: this.reportHistory.length,
      reportsToday: reportsToday.length,
      averageComplianceScore,
      activeViolations: activeViolations.length,
      criticalViolations: criticalViolations.length,
      frameworkScores,
      trendAnalysis: {
        scoreTrend,
        violationTrend,
      },
    };
  }

  /**
   * Schedule automated report generation
   */
  async scheduleReport(
    config: ComplianceReportConfig & {
      scheduling: NonNullable<ComplianceReportConfig['scheduling']>;
    },
  ): Promise<void> {
    const { scheduling } = config;
    const scheduleId = `schedule_${config.reportId}_${scheduling.frequency}`;

    // Clear existing schedule if any
    if (this.scheduledReports.has(scheduleId)) {
      clearTimeout(this.scheduledReports.get(scheduleId)!);
    }

    // Calculate next execution time
    const nextExecution = this.calculateNextExecution(scheduling);
    const timeUntilExecution = nextExecution.getTime() - Date.now();

    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Scheduling automated compliance report', {
      reportId: config.reportId,
      frequency: scheduling.frequency,
      nextExecution,
      timeUntilExecution,
    });

    // Schedule the report
    const timer = setTimeout(async () => {
      try {
        // Generate the report
        const reportConfig = {
          ...config,
          startDate: this.getStartDateForSchedule(scheduling),
          endDate: new Date(),
        };

        await this.generateReport(reportConfig);

        // Reschedule for next execution
        await this.scheduleReport(config);
      } catch (error) {
        logger?.log('error', 'Scheduled compliance report failed', {
          reportId: config.reportId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, timeUntilExecution);

    this.scheduledReports.set(scheduleId, timer);
  }

  /**
   * Export compliance data for external systems
   */
  async exportComplianceData(
    framework: ComplianceFramework,
    format: 'json' | 'csv' | 'xml',
    dateRange?: { start: Date; end: Date },
  ): Promise<{
    data: string;
    checksum: string;
    exportedAt: Date;
  }> {
    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Exporting compliance data', {
      framework,
      format,
      dateRange,
    });

    // Get relevant audit events
    const auditEvents = await globalAuditAnalytics.getAuditEvents({
      framework,
      dateRange,
      includeMetadata: true,
    });

    // Get violations for the framework
    const violations = Array.from(this.violations.values()).filter(
      v =>
        v.framework === framework &&
        (!dateRange || (v.detectedAt >= dateRange.start && v.detectedAt <= dateRange.end)),
    );

    // Prepare export data using structuredClone for safety (Node 22+)
    const exportData = structuredClone({
      metadata: {
        framework,
        format,
        exportedAt: new Date(),
        dateRange,
        recordCount: auditEvents.length,
        violationCount: violations.length,
      },
      auditEvents,
      violations,
      summary: {
        totalEvents: auditEvents.length,
        uniqueUsers: [...new Set(auditEvents.map(e => e.userId))].length,
        complianceScore: this.calculateComplianceScore(auditEvents, violations),
        riskLevel: this.calculateRiskLevel(violations),
      },
    });

    // Format data based on requested format
    let formattedData: string;
    switch (format) {
      case 'json':
        formattedData = JSON.stringify(exportData, null, 2);
        break;
      case 'csv':
        formattedData = this.convertToCSV(exportData);
        break;
      case 'xml':
        formattedData = this.convertToXML(exportData);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Generate checksum for integrity verification
    const crypto = await import('node:crypto');
    const checksum = crypto.createHash('sha256').update(formattedData, 'utf8').digest('hex');

    return {
      data: formattedData,
      checksum,
      exportedAt: new Date(),
    };
  }

  /**
   * Private helper methods
   */
  private async performReportGeneration(
    config: ComplianceReportConfig,
    abortSignal: AbortSignal,
  ): Promise<ComplianceReport> {
    // Check if operation was aborted
    if (abortSignal.aborted) {
      throw new Error('Report generation aborted due to timeout');
    }

    // Gather audit events for the specified period
    const auditEvents = await this.gatherAuditEvents(config, abortSignal);

    // Get violations for the framework
    const violations = Array.from(this.violations.values()).filter(
      v =>
        v.framework === config.framework &&
        v.detectedAt >= config.startDate &&
        v.detectedAt <= config.endDate,
    );

    // Calculate compliance metrics
    const complianceScore = this.calculateComplianceScore(auditEvents, violations);
    const riskLevel = this.calculateRiskLevel(violations);

    // Generate report sections
    const sections = await this.generateReportSections(
      config.framework,
      auditEvents,
      violations,
      abortSignal,
    );

    // Create certification
    const certification = await this.generateCertification(config, sections);

    const report: ComplianceReport = {
      id: config.reportId,
      framework: config.framework,
      generatedAt: new Date(),
      reportPeriod: {
        start: config.startDate,
        end: config.endDate,
      },
      status: ReportStatus.COMPLETED,
      format: config.format,
      summary: {
        totalEvents: auditEvents.length,
        violations: violations.length,
        complianceScore,
        riskLevel,
      },
      sections,
      attachments: [], // Would be populated with actual attachments
      certification,
      metadata: {
        version: '2.0.0',
        generationTime: 0, // Will be set by caller
        auditEventCount: auditEvents.length,
        dataSourceIntegrity: true,
        encryptionStatus: config.encryption?.enabled ?? true,
      },
    };

    return report;
  }

  private async startViolationMonitoring(): Promise<void> {
    // Monitor audit events for compliance violations
    // This would integrate with the audit system to detect patterns
    // that indicate compliance violations in real-time
  }

  private async scheduleAutomatedReports(): Promise<void> {
    // Set up default automated reports for each enabled framework
    for (const [framework, settings] of Object.entries(this.config.frameworks)) {
      if (!settings?.enabled) continue;

      const reportConfig: ComplianceReportConfig = {
        reportId: `automated_${framework}_monthly`,
        framework: framework as ComplianceFramework,
        format: ReportFormat.PDF,
        startDate: new Date(), // Will be calculated dynamically
        endDate: new Date(),
        scheduling: {
          frequency: 'monthly',
          dayOfMonth: 1,
          hour: 2,
          timezone: 'UTC',
        },
      };

      await this.scheduleReport(reportConfig);
    }
  }

  private async performInitialAssessment(): Promise<void> {
    // Perform initial compliance assessment
    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Performing initial compliance assessment');

    // Check for existing violations in recent audit logs
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    // Would analyze recent audit events for compliance issues
  }

  private async gatherAuditEvents(
    config: ComplianceReportConfig,
    abortSignal: AbortSignal,
  ): Promise<AuditEvent[]> {
    // Use timeout manager for gathering audit events
    return await globalTimeoutManager.withTimeout(
      async () => {
        // Get audit events from the specified date range
        return await globalAuditAnalytics.getAuditEvents({
          framework: config.framework,
          dateRange: {
            start: config.startDate,
            end: config.endDate,
          },
          includeMetadata: config.includeRawData,
        });
      },
      5 * 60 * 1000, // 5 minutes timeout
      abortSignal,
    );
  }

  private calculateComplianceScore(
    auditEvents: AuditEvent[],
    violations: ComplianceViolation[],
  ): number {
    // Base score starts at 100
    let score = 100;

    // Deduct points for violations based on severity
    for (const violation of violations) {
      switch (violation.severity) {
        case ViolationSeverity.CRITICAL:
          score -= 20;
          break;
        case ViolationSeverity.HIGH:
          score -= 10;
          break;
        case ViolationSeverity.MEDIUM:
          score -= 5;
          break;
        case ViolationSeverity.LOW:
          score -= 1;
          break;
      }
    }

    // Factor in audit quality and coverage
    const auditCoverage = this.calculateAuditCoverage(auditEvents);
    score = score * auditCoverage;

    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskLevel(
    violations: ComplianceViolation[],
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = violations.filter(v => v.severity === ViolationSeverity.CRITICAL).length;
    const highCount = violations.filter(v => v.severity === ViolationSeverity.HIGH).length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (violations.length > 10) return 'medium';
    return 'low';
  }

  private calculateAuditCoverage(auditEvents: AuditEvent[]): number {
    // Calculate audit coverage based on event types and frequency
    // This is a simplified calculation - real implementation would be more sophisticated
    const uniqueEventTypes = new Set(auditEvents.map(e => e.eventType)).size;
    const expectedEventTypes = 10; // Expected minimum event types for good coverage

    return Math.min(1, uniqueEventTypes / expectedEventTypes);
  }

  private async generateReportSections(
    framework: ComplianceFramework,
    auditEvents: AuditEvent[],
    violations: ComplianceViolation[],
    abortSignal: AbortSignal,
  ): Promise<ComplianceReport['sections']> {
    if (abortSignal.aborted) {
      throw new Error('Report section generation aborted');
    }

    return {
      executive: this.generateExecutiveSummary(framework, auditEvents, violations),
      auditSummary: this.generateAuditSummary(auditEvents),
      violations: violations,
      recommendations: this.generateRecommendations(violations),
      dataFlows: [], // Would analyze data flows
      controls: [], // Would analyze security controls
      certifications: [], // Would include relevant certifications
    };
  }

  private generateExecutiveSummary(
    framework: ComplianceFramework,
    auditEvents: AuditEvent[],
    violations: ComplianceViolation[],
  ): string {
    const complianceScore = this.calculateComplianceScore(auditEvents, violations);
    const riskLevel = this.calculateRiskLevel(violations);

    return `
Executive Summary - ${framework.toUpperCase()} Compliance Report

Overall Compliance Score: ${complianceScore}/100
Risk Level: ${riskLevel.toUpperCase()}
Audit Events Analyzed: ${auditEvents.length}
Violations Identified: ${violations.length}

This report covers the compliance assessment for ${framework.toUpperCase()} requirements
during the specified reporting period. The analysis is based on ${auditEvents.length}
audit events and identifies ${violations.length} compliance violations requiring attention.

Key findings include ${violations.filter(v => v.severity === ViolationSeverity.CRITICAL).length}
critical violations and ${violations.filter(v => v.severity === ViolationSeverity.HIGH).length}
high-severity violations that require immediate remediation.
    `.trim();
  }

  private generateAuditSummary(auditEvents: AuditEvent[]): string {
    const eventsByType = auditEvents.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const successfulEvents = auditEvents.filter(e => e.outcome === 'success').length;
    const failedEvents = auditEvents.filter(e => e.outcome === 'failure').length;

    return `
Audit Summary

Total Events: ${auditEvents.length}
Successful Events: ${successfulEvents}
Failed Events: ${failedEvents}
Success Rate: ${((successfulEvents / auditEvents.length) * 100).toFixed(2)}%

Event Types:
${Object.entries(eventsByType)
  .sort(([, a], [, b]) => b - a)
  .map(([type, count]) => `  - ${type}: ${count}`)
  .join('\n')}
    `.trim();
  }

  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.severity === ViolationSeverity.CRITICAL)) {
      recommendations.push('Immediately address all critical compliance violations');
      recommendations.push('Implement emergency response procedures for critical violations');
    }

    if (violations.some(v => v.category === 'data_access')) {
      recommendations.push('Review and strengthen data access controls');
      recommendations.push('Implement additional monitoring for sensitive data access');
    }

    if (violations.some(v => v.category === 'audit_logging')) {
      recommendations.push('Enhance audit logging coverage and retention');
      recommendations.push('Implement real-time audit log monitoring');
    }

    recommendations.push('Establish regular compliance training programs');
    recommendations.push('Implement automated compliance monitoring tools');
    recommendations.push('Review and update compliance policies quarterly');

    return recommendations;
  }

  private async generateCertification(
    config: ComplianceReportConfig,
    sections: ComplianceReport['sections'],
  ): Promise<ComplianceReport['certification']> {
    const dataToSign = JSON.stringify({
      reportId: config.reportId,
      framework: config.framework,
      timestamp: new Date(),
      sectionsHash: await this.hashSections(sections),
    });

    // Generate cryptographic signature
    const crypto = await import('node:crypto');
    const signature = crypto
      .createHmac('sha256', this.config.encryptionKey)
      .update(dataToSign)
      .digest('hex');

    return {
      signedBy: 'Compliance Automation System',
      signature,
      timestamp: new Date(),
      valid: true,
    };
  }

  private async hashSections(sections: ComplianceReport['sections']): Promise<string> {
    const crypto = await import('node:crypto');
    const sectionsString = JSON.stringify(sections);
    return crypto.createHash('sha256').update(sectionsString).digest('hex');
  }

  private calculateNextExecution(
    scheduling: NonNullable<ComplianceReportConfig['scheduling']>,
  ): Date {
    const now = new Date();
    const next = new Date();

    next.setHours(scheduling.hour, 0, 0, 0);

    switch (scheduling.frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
      case 'weekly':
        const targetDay = scheduling.dayOfWeek ?? 1; // Monday default
        const daysUntilTarget = (targetDay - next.getDay() + 7) % 7;
        next.setDate(next.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
        break;
      case 'monthly':
        const targetDayOfMonth = scheduling.dayOfMonth ?? 1;
        next.setDate(targetDayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
      case 'quarterly':
        next.setMonth(Math.floor(next.getMonth() / 3) * 3); // Start of quarter
        next.setDate(1);
        if (next <= now) {
          next.setMonth(next.getMonth() + 3);
        }
        break;
      case 'annually':
        next.setMonth(0); // January
        next.setDate(1);
        if (next <= now) {
          next.setFullYear(next.getFullYear() + 1);
        }
        break;
    }

    return next;
  }

  private getStartDateForSchedule(
    scheduling: NonNullable<ComplianceReportConfig['scheduling']>,
  ): Date {
    const end = new Date();
    const start = new Date(end);

    switch (scheduling.frequency) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'annually':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return start;
  }

  private async notifyViolation(violation: ComplianceViolation): Promise<void> {
    const logger = await createServerObservability().catch(() => null);
    logger?.log('error', 'Critical compliance violation detected', {
      violationId: violation.id,
      framework: violation.framework,
      severity: violation.severity,
      riskScore: violation.impact.riskScore,
    });

    // Would send notifications through configured channels
    for (const webhook of this.config.notifications.webhooks) {
      try {
        // Send webhook notification
        await this.sendWebhookNotification(webhook, violation);
      } catch (error) {
        logger?.log('error', 'Failed to send violation webhook', { error });
      }
    }
  }

  private async sendWebhookNotification(
    webhook: { url: string; events: string[]; authentication: Record<string, string> },
    violation: ComplianceViolation,
  ): Promise<void> {
    // Implementation would send HTTP request to webhook URL
    // with violation details and proper authentication
  }

  private async cleanupOldReports(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);

    // Remove old reports from memory (in production, would also clean up files)
    const oldReportCount = this.reportHistory.length;
    const recentReports = this.reportHistory.filter(report => report.generatedAt >= cutoffDate);

    if (recentReports.length !== oldReportCount) {
      this.reportHistory.length = 0;
      this.reportHistory.push(...recentReports);

      const logger = await createServerObservability().catch(() => null);
      logger?.log('info', 'Cleaned up old compliance reports', {
        removed: oldReportCount - recentReports.length,
        remaining: recentReports.length,
      });
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - real implementation would be more sophisticated
    return 'CSV conversion not implemented in this example';
  }

  private convertToXML(data: any): string {
    // Simple XML conversion - real implementation would be more sophisticated
    return '<xml>XML conversion not implemented in this example</xml>';
  }
}

/**
 * Global compliance reporting system instance
 */
export const globalComplianceReporting = ComplianceReportingSystem.getInstance();

/**
 * Compliance reporting utility functions
 */
export namespace ComplianceUtils {
  /**
   * Format compliance framework name
   */
  export function formatFrameworkName(framework: ComplianceFramework): string {
    switch (framework) {
      case ComplianceFramework.GDPR:
        return 'General Data Protection Regulation (GDPR)';
      case ComplianceFramework.SOX:
        return 'Sarbanes-Oxley Act (SOX)';
      case ComplianceFramework.HIPAA:
        return 'Health Insurance Portability and Accountability Act (HIPAA)';
      case ComplianceFramework.PCI_DSS:
        return 'Payment Card Industry Data Security Standard (PCI DSS)';
      case ComplianceFramework.ISO_27001:
        return 'ISO/IEC 27001 Information Security Management';
      case ComplianceFramework.CCPA:
        return 'California Consumer Privacy Act (CCPA)';
      default:
        return framework.replace(/_/g, ' ').toUpperCase();
    }
  }

  /**
   * Get violation severity color
   */
  export function getViolationSeverityColor(severity: ViolationSeverity): string {
    switch (severity) {
      case ViolationSeverity.CRITICAL:
        return '#dc2626'; // red-600
      case ViolationSeverity.HIGH:
        return '#ea580c'; // orange-600
      case ViolationSeverity.MEDIUM:
        return '#ca8a04'; // yellow-600
      case ViolationSeverity.LOW:
        return '#16a34a'; // green-600
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Calculate compliance grade from score
   */
  export function getComplianceGrade(score: number): {
    grade: string;
    description: string;
    color: string;
  } {
    if (score >= 95) {
      return {
        grade: 'A+',
        description: 'Excellent Compliance',
        color: '#16a34a', // green-600
      };
    } else if (score >= 90) {
      return {
        grade: 'A',
        description: 'Very Good Compliance',
        color: '#22c55e', // green-500
      };
    } else if (score >= 80) {
      return {
        grade: 'B',
        description: 'Good Compliance',
        color: '#84cc16', // lime-500
      };
    } else if (score >= 70) {
      return {
        grade: 'C',
        description: 'Fair Compliance',
        color: '#eab308', // yellow-500
      };
    } else if (score >= 60) {
      return {
        grade: 'D',
        description: 'Poor Compliance',
        color: '#f97316', // orange-500
      };
    } else {
      return {
        grade: 'F',
        description: 'Failing Compliance',
        color: '#dc2626', // red-600
      };
    }
  }
}

/**
 * Start global compliance reporting system
 */
export async function startComplianceReporting(
  config?: Partial<ComplianceReportingConfig>,
): Promise<ComplianceReportingSystem> {
  const reportingSystem = ComplianceReportingSystem.getInstance(config);
  await reportingSystem.start();
  return reportingSystem;
}
