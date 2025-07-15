/**
 * Audit logging plugin for better-auth
 * Logs all authentication and security events
 */

import { prisma } from '@repo/database/prisma/server/next';
import { logError, logInfo } from '@repo/observability/server/next';

export interface AuditLoggerOptions {
  enabled?: boolean;
  logSuccessfulAuth?: boolean;
  logFailedAuth?: boolean;
  logPasswordChanges?: boolean;
  logProfileUpdates?: boolean;
  logApiKeyEvents?: boolean;
  logOrganizationEvents?: boolean;
  logAdminActions?: boolean;
  retentionDays?: number;
  customLogger?: (event: AuditEvent) => Promise<void>;
}

export interface AuditEvent {
  type: string;
  action: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

const DEFAULT_OPTIONS: AuditLoggerOptions = {
  enabled: true,
  logSuccessfulAuth: true,
  logFailedAuth: true,
  logPasswordChanges: true,
  logProfileUpdates: true,
  logApiKeyEvents: true,
  logOrganizationEvents: true,
  logAdminActions: true,
  retentionDays: 90,
};

const AUDIT_EVENTS = {
  // Authentication events
  SIGN_IN: 'auth.sign_in',
  SIGN_UP: 'auth.sign_up',
  SIGN_OUT: 'auth.sign_out',
  SIGN_IN_FAILED: 'auth.sign_in_failed',

  // Password events
  PASSWORD_RESET_REQUESTED: 'password.reset_requested',
  PASSWORD_RESET_COMPLETED: 'password.reset_completed',
  PASSWORD_CHANGED: 'password.changed',

  // Profile events
  PROFILE_UPDATED: 'profile.updated',
  EMAIL_VERIFIED: 'email.verified',
  EMAIL_CHANGED: 'email.changed',

  // Two-factor events
  TWO_FACTOR_ENABLED: '2fa.enabled',
  TWO_FACTOR_DISABLED: '2fa.disabled',
  TWO_FACTOR_VERIFIED: '2fa.verified',
  TWO_FACTOR_FAILED: '2fa.failed',

  // API key events
  API_KEY_CREATED: 'api_key.created',
  API_KEY_DELETED: 'api_key.deleted',
  API_KEY_UPDATED: 'api_key.updated',
  API_KEY_USED: 'api_key.used',

  // Organization events
  ORG_CREATED: 'org.created',
  ORG_UPDATED: 'org.updated',
  ORG_DELETED: 'org.deleted',
  ORG_MEMBER_ADDED: 'org.member_added',
  ORG_MEMBER_REMOVED: 'org.member_removed',
  ORG_MEMBER_ROLE_CHANGED: 'org.member_role_changed',

  // Admin events
  USER_BANNED: 'admin.user_banned',
  USER_UNBANNED: 'admin.user_unbanned',
  USER_IMPERSONATED: 'admin.user_impersonated',
  ADMIN_PERMISSION_GRANTED: 'admin.permission_granted',
  ADMIN_PERMISSION_REVOKED: 'admin.permission_revoked',
};

export function auditLoggerPlugin(options: AuditLoggerOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const getClientInfo = (request: Request) => {
    const headers = request.headers;
    const ipAddress =
      headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
    const userAgent = headers.get('user-agent') || 'unknown';
    return { ipAddress, userAgent };
  };

  const logEvent = async (event: AuditEvent) => {
    if (!config.enabled) return;

    // Use custom logger if provided
    if (config.customLogger) {
      await config.customLogger(event);
      return;
    }

    // Default: Log to database
    try {
      await prisma.auditLog.create({
        data: {
          type: event.type,
          action: event.action,
          userId: event.userId,
          email: event.email,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          metadata: event.metadata as any,
          success: event.success,
          errorMessage: event.errorMessage,
          timestamp: event.timestamp,
        },
      });
    } catch (error) {
      void logError(
        'Failed to write audit log:',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const shouldLogEvent = (eventType: string): boolean => {
    if (!config.enabled) return false;

    switch (eventType) {
      case AUDIT_EVENTS.SIGN_IN:
      case AUDIT_EVENTS.SIGN_UP:
      case AUDIT_EVENTS.SIGN_OUT:
        return config.logSuccessfulAuth ?? true;

      case AUDIT_EVENTS.SIGN_IN_FAILED:
        return config.logFailedAuth ?? true;

      case AUDIT_EVENTS.PASSWORD_RESET_REQUESTED:
      case AUDIT_EVENTS.PASSWORD_RESET_COMPLETED:
      case AUDIT_EVENTS.PASSWORD_CHANGED:
        return config.logPasswordChanges ?? true;

      case AUDIT_EVENTS.PROFILE_UPDATED:
      case AUDIT_EVENTS.EMAIL_VERIFIED:
      case AUDIT_EVENTS.EMAIL_CHANGED:
        return config.logProfileUpdates ?? true;

      case AUDIT_EVENTS.API_KEY_CREATED:
      case AUDIT_EVENTS.API_KEY_DELETED:
      case AUDIT_EVENTS.API_KEY_UPDATED:
      case AUDIT_EVENTS.API_KEY_USED:
        return config.logApiKeyEvents ?? true;

      case AUDIT_EVENTS.ORG_CREATED:
      case AUDIT_EVENTS.ORG_UPDATED:
      case AUDIT_EVENTS.ORG_DELETED:
      case AUDIT_EVENTS.ORG_MEMBER_ADDED:
      case AUDIT_EVENTS.ORG_MEMBER_REMOVED:
      case AUDIT_EVENTS.ORG_MEMBER_ROLE_CHANGED:
        return config.logOrganizationEvents ?? true;

      case AUDIT_EVENTS.USER_BANNED:
      case AUDIT_EVENTS.USER_UNBANNED:
      case AUDIT_EVENTS.USER_IMPERSONATED:
      case AUDIT_EVENTS.ADMIN_PERMISSION_GRANTED:
      case AUDIT_EVENTS.ADMIN_PERMISSION_REVOKED:
        return config.logAdminActions ?? true;

      default:
        return true;
    }
  };

  return {
    id: 'audit-logger',
    hooks: {
      after: [
        {
          matcher: () => true, // Match all routes
          handler: async (context: any) => {
            const { ipAddress, userAgent } = getClientInfo(context.request);
            const path = context.path;
            const success = !context.error;

            let eventType: string | null = null;
            let metadata: Record<string, any> = {};

            // Map paths to audit events
            switch (path) {
              case '/sign-in':
                eventType = success ? AUDIT_EVENTS.SIGN_IN : AUDIT_EVENTS.SIGN_IN_FAILED;
                break;
              case '/sign-up':
                eventType = AUDIT_EVENTS.SIGN_UP;
                break;
              case '/sign-out':
                eventType = AUDIT_EVENTS.SIGN_OUT;
                break;
              case '/forgot-password':
                eventType = AUDIT_EVENTS.PASSWORD_RESET_REQUESTED;
                break;
              case '/reset-password':
                eventType = AUDIT_EVENTS.PASSWORD_RESET_COMPLETED;
                break;
              case '/update-password':
                eventType = AUDIT_EVENTS.PASSWORD_CHANGED;
                break;
              case '/update-user':
                eventType = AUDIT_EVENTS.PROFILE_UPDATED;
                break;
              case '/verify-email':
                eventType = AUDIT_EVENTS.EMAIL_VERIFIED;
                break;
            }

            // Check for organization events
            if (path.includes('/organization')) {
              if (path.includes('/create')) eventType = AUDIT_EVENTS.ORG_CREATED;
              else if (path.includes('/update')) eventType = AUDIT_EVENTS.ORG_UPDATED;
              else if (path.includes('/delete')) eventType = AUDIT_EVENTS.ORG_DELETED;
              else if (path.includes('/invite')) eventType = AUDIT_EVENTS.ORG_MEMBER_ADDED;
              else if (path.includes('/remove-member')) eventType = AUDIT_EVENTS.ORG_MEMBER_REMOVED;
            }

            // Check for API key events
            if (path.includes('/api-key')) {
              if (path.includes('/create')) eventType = AUDIT_EVENTS.API_KEY_CREATED;
              else if (path.includes('/delete')) eventType = AUDIT_EVENTS.API_KEY_DELETED;
              else if (path.includes('/update')) eventType = AUDIT_EVENTS.API_KEY_UPDATED;
            }

            // Check for admin events
            if (path.includes('/admin')) {
              if (path.includes('/ban')) eventType = AUDIT_EVENTS.USER_BANNED;
              else if (path.includes('/unban')) eventType = AUDIT_EVENTS.USER_UNBANNED;
              else if (path.includes('/impersonate')) eventType = AUDIT_EVENTS.USER_IMPERSONATED;
            }

            if (eventType && shouldLogEvent(eventType)) {
              await logEvent({
                type: eventType,
                action: path,
                userId: context.context?.user?.id,
                email: context.context?.user?.email || context.body?.email,
                ipAddress,
                userAgent,
                metadata: {
                  ...metadata,
                  requestBody: context.body,
                  responseStatus: context.response?.status,
                },
                timestamp: new Date(),
                success,
                errorMessage: context.error?.message,
              });
            }

            return context;
          },
        },
      ],
    },
  };
}

// Cleanup function for old audit logs
export async function cleanupOldAuditLogs(retentionDays: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    void logInfo(`Cleaned up ${result.count} audit log entries older than ${retentionDays} days`);
  } catch (error) {
    void logError(
      'Failed to cleanup audit logs:',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}
