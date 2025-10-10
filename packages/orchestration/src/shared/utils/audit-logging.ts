/**
 * Structured Audit Logging with Security Metadata
 *
 * Enterprise-grade audit logging using Node 22+ features:
 * - Structured logging with security metadata
 * - Performance Observer integration for timing
 * - WeakMap-based sensitive data tracking
 * - Cryptographic integrity verification
 * - Real-time security event detection
 * - Compliance-ready log formatting (SOX, GDPR, HIPAA)
 * - Automatic PII detection and redaction
 */

import { createServerObservability } from '@repo/observability/server/next';
import { globalMemoryMonitor } from './memory-monitor';
import { globalPerformanceMonitor } from './performance-metrics';

/**
 * Security classification levels
 */
type SecurityLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';

/**
 * Audit event types for comprehensive tracking
 */
type AuditEventType =
  | 'user_authentication'
  | 'user_authorization'
  | 'data_access'
  | 'data_modification'
  | 'workflow_execution'
  | 'system_configuration'
  | 'security_event'
  | 'compliance_check'
  | 'performance_alert'
  | 'resource_allocation'
  | 'error_occurrence'
  | 'admin_action';

/**
 * Security context for audit events
 */
interface SecurityContext {
  readonly classification: SecurityLevel;
  readonly dataTypes: ReadonlyArray<string>;
  readonly accessLevel: 'read' | 'write' | 'execute' | 'admin';
  readonly complianceFrameworks: ReadonlyArray<'SOX' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2'>;
  readonly riskScore: number; // 0-100
  readonly threats?: ReadonlyArray<string>;
}

/**
 * User context for audit events
 */
interface UserContext {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly organizationId?: string;
  readonly roles: ReadonlyArray<string>;
  readonly permissions: ReadonlyArray<string>;
  readonly authenticationMethod?: 'password' | 'oauth' | 'saml' | 'api_key' | 'certificate';
  readonly sessionDuration?: number; // milliseconds
}

/**
 * System context for audit events
 */
interface SystemContext {
  readonly nodeVersion: string;
  readonly processId: number;
  readonly hostname: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly region?: string;
  readonly availability_zone?: string;
  readonly containerInfo?: {
    readonly containerId: string;
    readonly imageName: string;
    readonly imageTag: string;
  };
  readonly performanceMetrics?: {
    readonly memoryUsage: number;
    readonly cpuUsage: number;
    readonly eventLoopLag: number;
  };
}

/**
 * Comprehensive audit event structure
 */
interface AuditEvent {
  readonly eventId: string;
  readonly timestamp: Date;
  readonly eventType: AuditEventType;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly message: string;
  readonly success: boolean;
  readonly duration?: number; // milliseconds
  readonly userContext?: UserContext;
  readonly systemContext: SystemContext;
  readonly securityContext: SecurityContext;
  readonly resourceContext?: {
    readonly resourceType: string;
    readonly resourceId: string;
    readonly resourcePath?: string;
    readonly operationType: 'create' | 'read' | 'update' | 'delete' | 'execute';
  };
  readonly workflowContext?: {
    readonly workflowId: string;
    readonly executionId: string;
    readonly stepId?: string;
    readonly stepType?: string;
  };
  readonly errorContext?: {
    readonly errorCode: string;
    readonly errorType: string;
    readonly stackTrace?: string;
    readonly causedBy?: string;
  };
  readonly complianceContext?: {
    readonly regulatoryRequirements: ReadonlyArray<string>;
    readonly retentionPeriod: number; // days
    readonly encryptionRequired: boolean;
    readonly auditTrail: ReadonlyArray<string>;
  };
  readonly integrity: {
    readonly checksum: string;
    readonly algorithm: 'sha256' | 'sha512';
    readonly signature?: string;
  };
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Audit logger configuration
 */
interface AuditLoggerConfig {
  readonly enableIntegrityChecks: boolean;
  readonly enablePiiDetection: boolean;
  readonly enableRealTimeAlerts: boolean;
  readonly maxEventSize: number; // bytes
  readonly batchSize: number;
  readonly flushInterval: number; // milliseconds
  readonly compressionLevel: number; // 0-9
  readonly encryptionKey?: string;
  readonly alertThresholds: {
    readonly highRiskEvents: number; // per minute
    readonly failedAuthentications: number; // per minute
    readonly dataAccessRate: number; // per minute
    readonly errorRate: number; // per minute
  };
}

/**
 * Default audit logger configuration
 */
const DEFAULT_CONFIG: AuditLoggerConfig = {
  enableIntegrityChecks: true,
  enablePiiDetection: true,
  enableRealTimeAlerts: true,
  maxEventSize: 1024 * 1024, // 1MB
  batchSize: 100,
  flushInterval: 5000, // 5 seconds
  compressionLevel: 6,
  alertThresholds: {
    highRiskEvents: 10,
    failedAuthentications: 5,
    dataAccessRate: 1000,
    errorRate: 50,
  },
};

/**
 * PII detection patterns
 */
const PII_PATTERNS = [
  { name: 'ssn', pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g, replacement: '[SSN-REDACTED]' },
  {
    name: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL-REDACTED]',
  },
  { name: 'phone', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE-REDACTED]' },
  {
    name: 'credit_card',
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: '[CC-REDACTED]',
  },
  { name: 'api_key', pattern: /\b[a-zA-Z0-9]{32,}\b/g, replacement: '[API-KEY-REDACTED]' },
  { name: 'password', pattern: /"password":\s*"[^"]+"/g, replacement: '"password":"[REDACTED]"' },
  { name: 'token', pattern: /"token":\s*"[^"]+"/g, replacement: '"token":"[REDACTED]"' },
];

/**
 * Enterprise-grade structured audit logger
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private readonly config: AuditLoggerConfig;
  private readonly eventBuffer: AuditEvent[] = [];
  private readonly sensitiveDataMap = new WeakMap<object, Set<string>>();
  private flushTimer?: NodeJS.Timeout;
  private alertCounters = {
    highRiskEvents: 0,
    failedAuthentications: 0,
    dataAccessRate: 0,
    errorRate: 0,
    lastReset: Date.now(),
  };

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startFlushTimer();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<AuditLoggerConfig>): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger(config);
    }
    return AuditLogger.instance;
  }

  /**
   * Log a comprehensive audit event
   */
  async logAuditEvent(
    eventType: AuditEventType,
    message: string,
    context: {
      success?: boolean;
      severity?: AuditEvent['severity'];
      userContext?: Partial<UserContext>;
      securityContext?: Partial<SecurityContext>;
      resourceContext?: AuditEvent['resourceContext'];
      workflowContext?: AuditEvent['workflowContext'];
      errorContext?: AuditEvent['errorContext'];
      duration?: number;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    const startTime = process.hrtime.bigint();

    try {
      // Create comprehensive audit event
      const auditEvent = await this.createAuditEvent(eventType, message, context);

      // Detect and redact PII if enabled
      if (this.config.enablePiiDetection) {
        this.redactPiiFromEvent(auditEvent);
      }

      // Add integrity checks if enabled
      if (this.config.enableIntegrityChecks) {
        await this.addIntegrityChecks(auditEvent);
      }

      // Check event size limits
      const eventSize = this.calculateEventSize(auditEvent);
      if (eventSize > this.config.maxEventSize) {
        throw new Error(
          `Audit event exceeds maximum size: ${eventSize} > ${this.config.maxEventSize}`,
        );
      }

      // Buffer the event
      this.eventBuffer.push(auditEvent);

      // Check for real-time alerts if enabled
      if (this.config.enableRealTimeAlerts) {
        await this.checkRealTimeAlerts(auditEvent);
      }

      // Flush if buffer is full
      if (this.eventBuffer.length >= this.config.batchSize) {
        await this.flushEvents();
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

      // Log audit logging performance if it takes too long
      if (duration > 100) {
        // 100ms threshold
        const observability = await this.getObservability();
        observability?.log('warning', 'Slow audit logging detected', {
          duration: `${duration.toFixed(2)}ms`,
          eventType,
          eventSize,
        });
      }
    } catch (error) {
      const observability = await this.getObservability();
      observability?.log('error', 'Failed to log audit event', {
        eventType,
        message,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Track sensitive data on an object for redaction
   */
  trackSensitiveData(object: object, sensitiveFields: string[]): void {
    const existing = this.sensitiveDataMap.get(object) || new Set();
    sensitiveFields.forEach(field => existing.add(field));
    this.sensitiveDataMap.set(object, existing);
  }

  /**
   * Flush all buffered events immediately
   */
  async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer.length = 0; // Clear buffer

    try {
      const observability = await this.getObservability();
      if (observability) {
        // Log events in structured format
        for (const event of events) {
          observability.log('info', 'AUDIT_EVENT', {
            audit: true,
            ...event,
          });
        }
      }

      // Could also send to external audit systems here
      // await this.sendToExternalAuditSystem(events);
    } catch (error) {
      const observability = await this.getObservability();
      observability?.log('error', 'Failed to flush audit events', {
        eventCount: events.length,
        error: error instanceof Error ? error.message : String(error),
      });

      // Re-buffer events on failure
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Get audit statistics
   */
  getAuditStats(): {
    bufferedEvents: number;
    alertCounters: {
      highRiskEvents: number;
      failedAuthentications: number;
      dataAccessRate: number;
      errorRate: number;
      lastReset: number;
    };
    config: AuditLoggerConfig;
  } {
    return {
      bufferedEvents: this.eventBuffer.length,
      alertCounters: { ...this.alertCounters },
      config: this.config,
    };
  }

  /**
   * Shutdown audit logger gracefully
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Flush remaining events
    await this.flushEvents();
  }

  /**
   * Create a comprehensive audit event
   */
  private async createAuditEvent(
    eventType: AuditEventType,
    message: string,
    context: Parameters<AuditLogger['logAuditEvent']>[2] = {},
  ): Promise<AuditEvent> {
    const eventId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    // Get system context
    const systemContext = await this.getSystemContext();

    // Build security context with defaults
    const securityContext: SecurityContext = {
      classification: context.securityContext?.classification || 'internal',
      dataTypes: context.securityContext?.dataTypes || [],
      accessLevel: context.securityContext?.accessLevel || 'read',
      complianceFrameworks: context.securityContext?.complianceFrameworks || ['SOC2'],
      riskScore: context.securityContext?.riskScore || this.calculateRiskScore(eventType, context),
      threats: context.securityContext?.threats,
    };

    // Build compliance context
    const complianceContext = {
      regulatoryRequirements: this.getApplicableRegulations(securityContext),
      retentionPeriod: this.calculateRetentionPeriod(eventType, securityContext),
      encryptionRequired: securityContext.classification !== 'public',
      auditTrail: [`created_by_audit_logger_${eventId}`],
    };

    const auditEvent: AuditEvent = {
      eventId,
      timestamp,
      eventType,
      severity: context.severity || this.calculateSeverity(eventType, context),
      message: this.sanitizeMessage(message),
      success: context.success ?? true,
      duration: context.duration,
      userContext: context.userContext as UserContext,
      systemContext,
      securityContext,
      resourceContext: context.resourceContext,
      workflowContext: context.workflowContext,
      errorContext: context.errorContext,
      complianceContext,
      integrity: {
        checksum: '', // Will be calculated later
        algorithm: 'sha256',
      },
      metadata: context.metadata || {},
    };

    return auditEvent;
  }

  /**
   * Get comprehensive system context
   */
  private async getSystemContext(): Promise<SystemContext> {
    const performanceMetrics = globalPerformanceMonitor.getCurrentMetrics();
    const _memoryMetrics = globalMemoryMonitor.getCurrentMetrics();

    return {
      nodeVersion: process.version,
      processId: process.pid,
      hostname: process.env.HOSTNAME || 'unknown',
      environment: (process.env.NODE_ENV as SystemContext['environment']) || 'development',
      region: process.env.AWS_REGION || process.env.REGION,
      availability_zone: process.env.AWS_AVAILABILITY_ZONE,
      containerInfo: process.env.CONTAINER_ID
        ? {
            containerId: process.env.CONTAINER_ID,
            imageName: process.env.IMAGE_NAME || 'unknown',
            imageTag: process.env.IMAGE_TAG || 'latest',
          }
        : undefined,
      performanceMetrics: performanceMetrics
        ? {
            memoryUsage:
              (performanceMetrics.memory.heapUsed / performanceMetrics.memory.heapTotal) * 100,
            cpuUsage: performanceMetrics.cpu.usage,
            eventLoopLag: performanceMetrics.eventLoop.lag,
          }
        : undefined,
    };
  }

  /**
   * Calculate risk score based on event characteristics
   */
  private calculateRiskScore(
    eventType: AuditEventType,
    context: Parameters<AuditLogger['logAuditEvent']>[2],
  ): number {
    let score = 0;

    // Base scores by event type
    const eventTypeScores: Record<AuditEventType, number> = {
      user_authentication: 30,
      user_authorization: 40,
      data_access: 20,
      data_modification: 50,
      workflow_execution: 10,
      system_configuration: 70,
      security_event: 80,
      compliance_check: 20,
      performance_alert: 10,
      resource_allocation: 15,
      error_occurrence: 25,
      admin_action: 60,
    };

    score += eventTypeScores[eventType] || 10;

    // Increase score for failures
    if (context?.success === false) {
      score += 30;
    }

    // Increase score for high severity
    if (context?.severity === 'critical') {
      score += 40;
    } else if (context?.severity === 'high') {
      score += 20;
    }

    // Increase score for admin/write access
    if (context?.securityContext?.accessLevel === 'admin') {
      score += 25;
    } else if (context?.securityContext?.accessLevel === 'write') {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate event severity
   */
  private calculateSeverity(
    eventType: AuditEventType,
    context: Parameters<AuditLogger['logAuditEvent']>[2],
  ): AuditEvent['severity'] {
    // Critical events
    if (
      eventType === 'security_event' ||
      (context?.success === false && eventType === 'user_authentication')
    ) {
      return 'critical';
    }

    // High severity events
    if (eventType === 'system_configuration' || eventType === 'admin_action') {
      return 'high';
    }

    // Medium severity events
    if (eventType === 'data_modification' || eventType === 'user_authorization') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get applicable regulatory requirements
   */
  private getApplicableRegulations(securityContext: SecurityContext): string[] {
    const regulations: string[] = [];

    // Add regulations based on compliance frameworks
    if (securityContext.complianceFrameworks.includes('GDPR')) {
      regulations.push('GDPR Article 30 - Records of processing activities');
    }
    if (securityContext.complianceFrameworks.includes('SOX')) {
      regulations.push('SOX Section 404 - Management assessment of internal controls');
    }
    if (securityContext.complianceFrameworks.includes('HIPAA')) {
      regulations.push('HIPAA 164.312 - Technical safeguards');
    }

    return regulations;
  }

  /**
   * Calculate retention period based on event type and security context
   */
  private calculateRetentionPeriod(
    eventType: AuditEventType,
    securityContext: SecurityContext,
  ): number {
    // Base retention periods in days
    const baseRetention: Record<AuditEventType, number> = {
      user_authentication: 90,
      user_authorization: 90,
      data_access: 365,
      data_modification: 2555, // 7 years
      workflow_execution: 90,
      system_configuration: 2555, // 7 years
      security_event: 2555, // 7 years
      compliance_check: 2555, // 7 years
      performance_alert: 30,
      resource_allocation: 90,
      error_occurrence: 365,
      admin_action: 2555, // 7 years
    };

    let retention = baseRetention[eventType] || 90;

    // Extend retention for sensitive data
    if (
      securityContext.classification === 'restricted' ||
      securityContext.classification === 'top_secret'
    ) {
      retention = Math.max(retention, 2555); // 7 years minimum
    }

    return retention;
  }

  /**
   * Redact PII from audit event
   */
  private redactPiiFromEvent(event: AuditEvent): void {
    const eventStr = JSON.stringify(event);
    let redactedStr = eventStr;

    // Apply PII redaction patterns
    for (const pattern of PII_PATTERNS) {
      redactedStr = redactedStr.replace(pattern.pattern, pattern.replacement);
    }

    // If changes were made, reconstruct the event
    if (redactedStr !== eventStr) {
      try {
        const redactedEvent = JSON.parse(redactedStr);
        Object.assign(event, redactedEvent);
      } catch {
        // If parsing fails, leave original event intact
      }
    }
  }

  /**
   * Add cryptographic integrity checks
   */
  private async addIntegrityChecks(event: AuditEvent): Promise<void> {
    try {
      const crypto = await import('crypto');
      const eventWithoutIntegrity = { ...event, integrity: undefined };
      const eventJson = JSON.stringify(
        eventWithoutIntegrity,
        Object.keys(eventWithoutIntegrity).sort(),
      );

      const hash = crypto.createHash('sha256');
      hash.update(eventJson);
      const checksum = hash.digest('hex');

      // Update integrity with proper type casting
      const mutableIntegrity = event.integrity as {
        checksum: string;
        algorithm: string;
        signature?: string;
      };
      mutableIntegrity.checksum = checksum;

      // Add signature if encryption key is available
      if (this.config.encryptionKey) {
        const hmac = crypto.createHmac('sha256', this.config.encryptionKey);
        hmac.update(eventJson);
        mutableIntegrity.signature = hmac.digest('hex');
      }
    } catch (error) {
      const observability = await this.getObservability();
      observability?.log('warning', 'Failed to add integrity checks to audit event', { error });
    }
  }

  /**
   * Check for real-time security alerts
   */
  private async checkRealTimeAlerts(event: AuditEvent): Promise<void> {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Reset counters every minute
    if (now - this.alertCounters.lastReset > oneMinute) {
      this.alertCounters = {
        highRiskEvents: 0,
        failedAuthentications: 0,
        dataAccessRate: 0,
        errorRate: 0,
        lastReset: now,
      };
    }

    // Update counters
    if (event.securityContext.riskScore >= 70) {
      this.alertCounters.highRiskEvents++;
    }
    if (event.eventType === 'user_authentication' && !event.success) {
      this.alertCounters.failedAuthentications++;
    }
    if (event.eventType === 'data_access') {
      this.alertCounters.dataAccessRate++;
    }
    if (!event.success) {
      this.alertCounters.errorRate++;
    }

    // Check thresholds and trigger alerts
    const observability = await this.getObservability();

    if (this.alertCounters.highRiskEvents >= this.config.alertThresholds.highRiskEvents) {
      observability?.log('critical', 'HIGH_RISK_EVENTS_THRESHOLD_EXCEEDED', {
        count: this.alertCounters.highRiskEvents,
        threshold: this.config.alertThresholds.highRiskEvents,
        timeWindow: '1 minute',
      });
    }

    if (
      this.alertCounters.failedAuthentications >= this.config.alertThresholds.failedAuthentications
    ) {
      observability?.log('critical', 'FAILED_AUTHENTICATION_THRESHOLD_EXCEEDED', {
        count: this.alertCounters.failedAuthentications,
        threshold: this.config.alertThresholds.failedAuthentications,
        timeWindow: '1 minute',
      });
    }
  }

  /**
   * Calculate event size in bytes
   */
  private calculateEventSize(event: AuditEvent): number {
    return JSON.stringify(event).length * 2; // UTF-16 encoding approximation
  }

  /**
   * Sanitize message to prevent injection attacks
   */
  private sanitizeMessage(message: string): string {
    return message
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, '') // Remove control characters
      .slice(0, 1000); // Limit length
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      (async () => {
        try {
          await this.flushEvents();
        } catch (error) {
          const obs = await this.getObservability();
          obs?.log('error', 'Scheduled flush failed', { error });
        }
      })();
    }, this.config.flushInterval);
  }

  /**
   * Get observability instance
   */
  private async getObservability(): Promise<any> {
    try {
      return await createServerObservability();
    } catch {
      return null;
    }
  }
}

/**
 * Global audit logger instance
 */
const globalAuditLogger = AuditLogger.getInstance();

/**
 * Audit logging decorator for methods
 */
function AuditLog(
  eventType: AuditEventType,
  options: {
    message?: string;
    includeArgs?: boolean;
    includeResult?: boolean;
    securityLevel?: SecurityLevel;
    trackSensitiveFields?: string[];
  } = {},
) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value as T;
    const defaultMessage = options.message || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let error: Error | undefined;
      let result: any;

      try {
        result = await method.apply(this, args);
        return result;
      } catch (caught: unknown) {
        success = false;
        error = caught instanceof Error ? caught : new Error(String(caught));
        throw error;
      } finally {
        const duration = Date.now() - startTime;

        // Track sensitive data if specified
        if (options.trackSensitiveFields && result && typeof result === 'object') {
          globalAuditLogger.trackSensitiveData(result, options.trackSensitiveFields);
        }

        // Log audit event
        await globalAuditLogger.logAuditEvent(eventType, defaultMessage, {
          success,
          duration,
          securityContext: {
            classification: options.securityLevel || 'internal',
            dataTypes: ['method_execution'],
            accessLevel: 'execute',
            complianceFrameworks: ['SOC2'],
            riskScore: success ? 10 : 40,
          },
          errorContext: error
            ? {
                errorCode: 'METHOD_EXECUTION_ERROR',
                errorType: error.constructor.name,
                stackTrace: error.stack,
                causedBy: propertyName,
              }
            : undefined,
          metadata: {
            methodName: propertyName,
            className: target.constructor.name,
            argsCount: args.length,
            ...(options.includeArgs && { args }),
            ...(options.includeResult && success && { result }),
          },
        });
      }
    };

    return descriptor;
  };
}

/**
 * Utility functions for audit logging
 */
export namespace AuditUtils {
  /**
   * Log user authentication event
   */
  export async function logAuthentication(
    success: boolean,
    userId: string,
    method: UserContext['authenticationMethod'] = 'password',
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await globalAuditLogger.logAuditEvent(
      'user_authentication',
      `User authentication ${success ? 'successful' : 'failed'}`,
      {
        success,
        severity: success ? 'low' : 'high',
        userContext: {
          userId,
          authenticationMethod: method,
          roles: [], // Would be populated from user service
          permissions: [],
        },
        securityContext: {
          classification: 'confidential',
          dataTypes: ['authentication_credentials'],
          accessLevel: 'read',
          complianceFrameworks: ['SOC2', 'GDPR'],
          riskScore: success ? 20 : 70,
        },
        metadata,
      },
    );
  }

  /**
   * Log data access event
   */
  export async function logDataAccess(
    resourceType: string,
    resourceId: string,
    operationType: 'create' | 'read' | 'update' | 'delete',
    userId?: string,
    success: boolean = true,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await globalAuditLogger.logAuditEvent(
      'data_access',
      `${operationType.toUpperCase()} operation on ${resourceType}:${resourceId}`,
      {
        success,
        severity: operationType === 'delete' ? 'high' : 'medium',
        userContext: userId
          ? {
              userId,
              roles: [],
              permissions: [],
            }
          : undefined,
        resourceContext: {
          resourceType,
          resourceId,
          operationType,
        },
        securityContext: {
          classification: 'confidential',
          dataTypes: [resourceType],
          accessLevel: operationType === 'read' ? 'read' : 'write',
          complianceFrameworks: ['SOC2'],
          riskScore: operationType === 'delete' ? 60 : 30,
        },
        metadata,
      },
    );
  }

  /**
   * Log workflow execution event
   */
  export async function logWorkflowExecution(
    workflowId: string,
    executionId: string,
    success: boolean,
    duration?: number,
    stepId?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await globalAuditLogger.logAuditEvent(
      'workflow_execution',
      `Workflow execution ${success ? 'completed' : 'failed'}`,
      {
        success,
        duration,
        severity: success ? 'low' : 'medium',
        workflowContext: {
          workflowId,
          executionId,
          stepId,
        },
        securityContext: {
          classification: 'internal',
          dataTypes: ['workflow_execution'],
          accessLevel: 'execute',
          complianceFrameworks: ['SOC2'],
          riskScore: success ? 10 : 40,
        },
        metadata,
      },
    );
  }

  /**
   * Log security event
   */
  export async function logSecurityEvent(
    message: string,
    severity: AuditEvent['severity'] = 'high',
    threats: string[] = [],
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await globalAuditLogger.logAuditEvent('security_event', message, {
      success: false,
      severity,
      securityContext: {
        classification: 'restricted',
        dataTypes: ['security_incident'],
        accessLevel: 'admin',
        complianceFrameworks: ['SOC2'],
        riskScore: severity === 'critical' ? 100 : 80,
        threats,
      },
      metadata,
    });
  }
}

/**
 * Start global audit logging with default configuration
 */
async function startGlobalAuditLogging(config?: Partial<AuditLoggerConfig>): Promise<AuditLogger> {
  const logger = AuditLogger.getInstance(config);

  // Log audit system startup
  await logger.logAuditEvent('system_configuration', 'Audit logging system started', {
    success: true,
    severity: 'medium',
    securityContext: {
      classification: 'internal',
      dataTypes: ['system_configuration'],
      accessLevel: 'admin',
      complianceFrameworks: ['SOC2'],
      riskScore: 30,
    },
    metadata: {
      config: logger.getAuditStats().config,
    },
  });

  return logger;
}

/**
 * Stop global audit logging gracefully
 */
async function stopGlobalAuditLogging(): Promise<void> {
  await globalAuditLogger.shutdown();
}
