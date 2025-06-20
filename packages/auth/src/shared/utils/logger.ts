/**
 * Auth Logger - Using Observability System
 *
 * This file provides logging functionality for auth operations using the centralized
 * observability system from @repo/observability.
 *
 * @example
 * ```typescript
 * import { authLogger } from './utils/logger';
 *
 * await authLogger.error('Authentication failed', error, {
 *   operation: 'login',
 *   userId: 'user_123',
 *   email: 'user@example.com'
 * });
 * ```
 */

import 'server-only';

import { createServerObservability } from '@repo/observability/server/next';

import type { ObservabilityManager } from '@repo/observability/server/next';

let observabilityInstance: ObservabilityManager | null = null;

export interface AuthLogContext {
  operation?: string;
  userId?: string;
  email?: string;
  organizationId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  provider?: string;
  metadata?: Record<string, any>;
  error?: Error;
  timestamp?: string;
}

export class AuthLogger {
  private static instance?: AuthLogger;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): AuthLogger {
    AuthLogger.instance ??= new AuthLogger();
    return AuthLogger.instance;
  }

  async error(
    message: string,
    errorOrContext?: unknown | Partial<AuthLogContext>,
    context?: Partial<AuthLogContext>,
  ): Promise<void> {
    try {
      const observability = await getObservability();

      // Handle both old and new call patterns
      let actualError: Error | undefined;
      let actualContext: Partial<AuthLogContext>;

      if (errorOrContext instanceof Error) {
        // Old pattern: error(message, error)
        actualError = errorOrContext;
        actualContext = context || {};
      } else if (
        errorOrContext &&
        typeof errorOrContext === 'object' &&
        'error' in errorOrContext
      ) {
        // New pattern: error(message, context)
        actualError = (errorOrContext as Partial<AuthLogContext>).error;
        actualContext = errorOrContext as Partial<AuthLogContext>;
      } else {
        // Handle unknown types
        actualError = errorOrContext instanceof Error ? errorOrContext : undefined;
        actualContext = {};
      }

      if (actualError) {
        void observability.captureException(actualError, {
          extra: {
            operation: actualContext.operation,
            userId: actualContext.userId,
            email: actualContext.email,
            organizationId: actualContext.organizationId,
            sessionId: actualContext.sessionId,
            ipAddress: actualContext.ipAddress,
            userAgent: actualContext.userAgent,
            provider: actualContext.provider,
            metadata: actualContext.metadata,
            timestamp: actualContext.timestamp ?? new Date().toISOString(),
          },
          tags: {
            component: 'auth',
            operation: actualContext.operation ?? 'unknown',
            provider: actualContext.provider ?? 'unknown',
          },
        });
      } else {
        void observability.captureMessage(message, 'error', {
          extra: actualContext,
          tags: {
            component: 'auth',
            operation: actualContext.operation ?? 'unknown',
          },
        });
      }
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.error('[Auth] Failed to log error:', logError);
      // eslint-disable-next-line no-console
      console.error('[Auth] Original error:', errorOrContext || message);
    }
  }

  async warn(message: string, context: Partial<AuthLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        userId: context.userId,
        email: context.email,
        organizationId: context.organizationId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        provider: context.provider,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('warn', `[Auth] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.warn('[Auth] Failed to log warning:', logError);
      // eslint-disable-next-line no-console
      console.warn('[Auth] Original message:', message);
    }
  }

  async info(message: string, context: Partial<AuthLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        userId: context.userId,
        email: context.email,
        organizationId: context.organizationId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        provider: context.provider,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('info', `[Auth] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.info('[Auth] Failed to log info:', logError);
      // eslint-disable-next-line no-console
      console.info('[Auth] Original message:', message);
    }
  }

  async debug(message: string, context: Partial<AuthLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        userId: context.userId,
        email: context.email,
        organizationId: context.organizationId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        provider: context.provider,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('debug', `[Auth] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.debug('[Auth] Failed to log debug:', logError);
      // eslint-disable-next-line no-console
      console.debug('[Auth] Original message:', message);
    }
  }
}

async function getObservability(): Promise<ObservabilityManager> {
  if (!observabilityInstance) {
    observabilityInstance = await createServerObservability({
      providers: {
        console: { enabled: true },
      },
    });
  }
  return observabilityInstance;
}

export const authLogger = AuthLogger.getInstance();

// Synchronous fallback logger for backward compatibility
// Use this only where async is not supported
export const syncLogger = {
  info(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.info(`[Auth] ${message}`, ...args);
  },

  warn(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.warn(`[Auth] ${message}`, ...args);
  },

  error(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.error(`[Auth] ${message}`, ...args);
  },

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[Auth] ${message}`, ...args);
    }
  },
};

// For compatibility with existing code
export const logger = authLogger;

// Default export
export default authLogger;
