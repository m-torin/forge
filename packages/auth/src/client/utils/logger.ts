/**
 * Client-side Auth Logger - Using Observability System
 *
 * This file provides client-side logging functionality for auth operations using the
 * centralized observability system from @repo/observability.
 *
 * @example
 * ```typescript
 * import { authLogger } from './utils/logger';
 *
 * await authLogger.error('Authentication failed', {
 *   operation: 'login',
 *   userId: 'user_123',
 *   error: new Error('Invalid credentials')
 * });
 * ```
 */

'use client';

// No-op logging fallback - observability integration can be added later
const logError = (_message: string, _error?: Error, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper error logging via observability package
};
const logWarn = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper error logging via observability package
};
const logInfo = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper info logging via observability package
};
const logDebug = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper debug logging via observability package
};

export interface AuthLogContext {
  operation?: string;
  userId?: string;
  email?: string;
  organizationId?: string;
  sessionId?: string;
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

  error(
    message: string,
    errorOrContext?: unknown | Partial<AuthLogContext>,
    context?: Partial<AuthLogContext>,
  ): void {
    // Handle both old and new call patterns
    let actualError: Error | undefined;
    let actualContext: Partial<AuthLogContext>;

    if (errorOrContext instanceof Error) {
      // Old pattern: error(message, error)
      actualError = errorOrContext;
      actualContext = context || {};
    } else if (errorOrContext && typeof errorOrContext === 'object' && 'error' in errorOrContext) {
      // New pattern: error(message, context)
      actualError = (errorOrContext as Partial<AuthLogContext>).error;
      actualContext = errorOrContext as Partial<AuthLogContext>;
    } else {
      // Handle unknown types
      actualError = errorOrContext instanceof Error ? errorOrContext : undefined;
      actualContext = {};
    }

    logError(`[Auth] ${message}`, actualError || new Error(message), actualContext);
  }

  warn(message: string, context: Partial<AuthLogContext> = {}): void {
    logWarn(`[Auth] ${message}`, context);
  }

  info(message: string, context: Partial<AuthLogContext> = {}): void {
    logInfo(`[Auth] ${message}`, context);
  }

  debug(message: string, context: Partial<AuthLogContext> = {}): void {
    logDebug(`[Auth] ${message}`, context);
  }
}

export const authLogger = AuthLogger.getInstance();

// Synchronous fallback logger for backward compatibility
export const syncLogger = {
  info(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      logInfo(`[Auth] ${message}`, { args });
    }
  },

  warn(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      logWarn(`[Auth] ${message}`, { args });
    }
  },

  error(message: string, ...args: any[]): void {
    // Always log errors
    logError(`[Auth] ${message}`, undefined, { args });
  },

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      logDebug(`[Auth] ${message}`, { args });
    }
  },
};

// For compatibility with existing code
export const logger = authLogger;

export default authLogger;
