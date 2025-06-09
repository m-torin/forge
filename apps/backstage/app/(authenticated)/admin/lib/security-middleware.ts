/**
 * Security middleware for protecting sensitive data in the admin interface
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';

import {
  getFieldSecurityRule,
  getModelSecurityConfig,
  hasFieldPermission,
  maskSensitiveData,
  SecurityHelpers,
  shouldAuditField,
} from './security-config';

export interface SecurityContext {
  ipAddress?: string;
  permissions: string[];
  sessionId: string;
  userAgent?: string;
  userId: string;
  userRole: string;
}

/**
 * Extract security context from request
 */
async function getSecurityContext(request: NextRequest): Promise<SecurityContext | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return null;

    // Extract user permissions (this would come from your auth system)
    const permissions = [
      session.user.role,
      ...(session.user.role === 'admin'
        ? ['admin', 'manage_api_keys', 'manage_security', 'manage_accounts']
        : []),
    ];

    return {
      ipAddress:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      permissions,
      sessionId: session.session.id,
      userAgent: request.headers.get('user-agent') || undefined,
      userId: session.user.id,
      userRole: session.user.role || 'user',
    };
  } catch (error) {
    console.error('Failed to get security context:', error);
    return null;
  }
}

/**
 * Audit log entry
 */
interface AuditEntry {
  action: string;
  error?: string;
  fieldName?: string;
  ipAddress?: string;
  modelName: string;
  newValue?: any;
  oldValue?: any;
  recordId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high';
  success: boolean;
  timestamp: string;
  userAgent?: string;
  userId: string;
}

/**
 * Simple audit logger (in production, this would write to a secure audit database)
 */
class AuditLogger {
  private static logs: AuditEntry[] = [];

  static async log(entry: AuditEntry): Promise<void> {
    // Add timestamp
    entry.timestamp = new Date().toISOString();

    // Store in memory for now (in production, write to secure database)
    this.logs.push(entry);

    // Keep only last 1000 entries in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Log to console for development
    console.log(
      `[AUDIT] ${entry.severity.toUpperCase()}: ${entry.action} on ${entry.modelName}${entry.fieldName ? `.${entry.fieldName}` : ''} by user ${entry.userId}`,
    );
  }

  static getLogs(userId?: string): AuditEntry[] {
    if (userId) {
      return this.logs.filter((log) => log.userId === userId);
    }
    return [...this.logs];
  }

  static getRecentLogs(limit = 100): AuditEntry[] {
    return this.logs.slice(-limit);
  }
}

/**
 * Filter sensitive data from response based on user permissions
 */
export function filterSensitiveData(data: any, modelName: string, context: SecurityContext): any {
  if (!data) return data;

  const modelConfig = getModelSecurityConfig(modelName);
  if (!modelConfig) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => filterSensitiveData(item, modelName, context));
  }

  // Handle objects
  if (typeof data === 'object') {
    const filtered = { ...data };

    modelConfig.rules.forEach((rule) => {
      if (filtered[rule.fieldName] !== undefined) {
        const hasPermission = hasFieldPermission(modelName, rule.fieldName, context.permissions);

        if (!hasPermission) {
          // Remove field entirely if user doesn't have permission
          delete filtered[rule.fieldName];
        } else if (rule.sensitivity === 'high' || rule.sensitivity === 'medium') {
          // Mask sensitive data even for authorized users
          filtered[rule.fieldName] = maskSensitiveData(
            filtered[rule.fieldName],
            rule.maskingStrategy,
          );
        }
      }
    });

    return filtered;
  }

  return data;
}

/**
 * Validate field access for write operations
 */
export function validateFieldWrite(
  modelName: string,
  fieldName: string,
  value: any,
  context: SecurityContext,
): { allowed: boolean; reason?: string } {
  const rule = getFieldSecurityRule(modelName, fieldName);

  if (!rule) return { allowed: true };

  // Check permissions
  const accessResult = SecurityHelpers.validateFieldAccess(
    modelName,
    fieldName,
    context.permissions,
    'write',
  );

  if (!accessResult.allowed) {
    return accessResult;
  }

  // Check for sensitive patterns in the data
  if (typeof value === 'string') {
    const sensitivePatterns = SecurityHelpers.detectSensitivePatterns(value);
    if (sensitivePatterns.length > 0 && rule.sensitivity !== 'high') {
      return {
        allowed: false,
        reason: `Value contains sensitive patterns: ${sensitivePatterns.join(', ')}`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Audit field access
 */
export async function auditFieldAccess(
  action: 'read' | 'write' | 'delete',
  modelName: string,
  fieldName: string,
  context: SecurityContext,
  recordId?: string,
  oldValue?: any,
  newValue?: any,
  success = true,
  error?: string,
): Promise<void> {
  if (!shouldAuditField(modelName, fieldName)) return;

  const rule = getFieldSecurityRule(modelName, fieldName);
  const severity =
    rule?.sensitivity === 'high' ? 'high' : rule?.sensitivity === 'medium' ? 'medium' : 'low';

  await AuditLogger.log({
    action,
    error,
    fieldName,
    ipAddress: context.ipAddress,
    modelName,
    newValue: newValue
      ? SecurityHelpers.sanitizeForLogging({ [fieldName]: newValue }, modelName)[fieldName]
      : undefined,
    oldValue: oldValue
      ? SecurityHelpers.sanitizeForLogging({ [fieldName]: oldValue }, modelName)[fieldName]
      : undefined,
    recordId,
    sessionId: context.sessionId,
    severity,
    success,
    timestamp: new Date().toISOString(),
    userAgent: context.userAgent,
    userId: context.userId,
  });
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware(modelName: string) {
  return async function securityMiddleware(request: NextRequest, response: NextResponse) {
    const context = await getSecurityContext(request);

    if (!context) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const modelConfig = getModelSecurityConfig(modelName);

    // Check model-level permissions
    if (
      modelConfig?.requiresPermission &&
      !context.permissions.includes(modelConfig.requiresPermission)
    ) {
      await AuditLogger.log({
        action: 'access_denied',
        error: `Missing required permission: ${modelConfig.requiresPermission}`,
        ipAddress: context.ipAddress,
        modelName,
        sessionId: context.sessionId,
        severity: 'medium',
        success: false,
        timestamp: new Date().toISOString(),
        userAgent: context.userAgent,
        userId: context.userId,
      });

      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Add security context to request for use in handlers
    (request as any).securityContext = context;

    return response;
  };
}

/**
 * Secure field validator for form submissions
 */
export async function validateSecureFields(
  modelName: string,
  data: Record<string, any>,
  context: SecurityContext,
  recordId?: string,
): Promise<{ valid: boolean; errors: string[]; sanitizedData: Record<string, any> }> {
  const errors: string[] = [];
  const sanitizedData = { ...data };

  const modelConfig = getModelSecurityConfig(modelName);
  if (!modelConfig) {
    return { valid: true, errors: [], sanitizedData };
  }

  for (const [fieldName, value] of Object.entries(data)) {
    const rule = getFieldSecurityRule(modelName, fieldName);

    if (rule) {
      // Validate write access
      const writeValidation = validateFieldWrite(modelName, fieldName, value, context);
      if (!writeValidation.allowed) {
        errors.push(`${fieldName}: ${writeValidation.reason}`);

        // Audit failed write attempt
        await auditFieldAccess(
          'write',
          modelName,
          fieldName,
          context,
          recordId,
          undefined,
          value,
          false,
          writeValidation.reason,
        );

        continue;
      }

      // Audit successful write
      await auditFieldAccess(
        'write',
        modelName,
        fieldName,
        context,
        recordId,
        undefined,
        value,
        true,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Rate limiting for sensitive operations
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  operation: string,
  limit = 10,
  windowMs = 60000,
): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const key = `${userId}:${operation}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
  }

  record.count++;

  const allowed = record.count <= limit;
  const remainingAttempts = Math.max(0, limit - record.count);

  return { allowed, remainingAttempts, resetTime: record.resetTime };
}

/**
 * Export audit functions for use in components
 */
export const Security = {
  validateSecureFields,
  auditFieldAccess,
  checkRateLimit,
  filterSensitiveData,
  getAuditLogs: AuditLogger.getLogs,
  getRecentAuditLogs: AuditLogger.getRecentLogs,
};
