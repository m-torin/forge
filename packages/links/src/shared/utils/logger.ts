/**
 * Links Logger - Using Observability System
 *
 * This file provides logging functionality for links operations using the centralized
 * observability system from @repo/observability.
 *
 * @example
 * ```typescript
 * import { linksLogger } from './utils/logger';
 *
 * await linksLogger.info('Link created successfully', {
 *   operation: 'create_link',
 *   shortUrl: 'https://short.ly/abc123',
 *   originalUrl: 'https://example.com/very/long/url',
 *   provider: 'dub'
 * });
 * ```
 */

import { createServerObservability } from '@repo/observability/shared-env';

import type { ObservabilityManager } from '@repo/observability/server';

let observabilityInstance: ObservabilityManager | null = null;

export interface LinksLogContext {
  operation?: string;
  linkId?: string;
  shortUrl?: string;
  originalUrl?: string;
  domain?: string;
  key?: string;
  provider?: string;
  workspaceId?: string;
  tags?: string[];
  utm?: Record<string, string>;
  expiresAt?: string;
  metadata?: Record<string, any>;
  error?: Error;
  timestamp?: string;
}

export class LinksLogger {
  private static instance?: LinksLogger;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): LinksLogger {
    LinksLogger.instance ??= new LinksLogger();
    return LinksLogger.instance;
  }

  async error(
    message: string,
    error?: Error,
    context: Partial<LinksLogContext> = {},
  ): Promise<void> {
    try {
      const observability = await getObservability();

      if (error) {
        void observability.captureException(error, {
          extra: {
            operation: context.operation,
            linkId: context.linkId,
            shortUrl: context.shortUrl,
            originalUrl: context.originalUrl,
            domain: context.domain,
            key: context.key,
            provider: context.provider,
            workspaceId: context.workspaceId,
            tags: context.tags,
            utm: context.utm,
            expiresAt: context.expiresAt,
            metadata: context.metadata,
            timestamp: context.timestamp ?? new Date().toISOString(),
          },
          tags: {
            component: 'links',
            operation: context.operation ?? 'unknown',
            provider: context.provider ?? 'unknown',
          },
        });
      } else {
        void observability.captureMessage(message, 'error', {
          extra: context,
          tags: {
            component: 'links',
            operation: context.operation ?? 'unknown',
          },
        });
      }
    } catch (logError: any) {
      console.error('[Links] Failed to log error:', logError);

      console.error('[Links] Original error:', error || message);
    }
  }

  async warn(message: string, context: Partial<LinksLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        linkId: context.linkId,
        shortUrl: context.shortUrl,
        originalUrl: context.originalUrl,
        domain: context.domain,
        key: context.key,
        provider: context.provider,
        workspaceId: context.workspaceId,
        tags: context.tags,
        utm: context.utm,
        expiresAt: context.expiresAt,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('warn', `[Links] ${message}`, logData);
    } catch (logError: any) {
      console.warn('[Links] Failed to log warning:', logError);

      console.warn('[Links] Original message:', message);
    }
  }

  async info(message: string, context: Partial<LinksLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        linkId: context.linkId,
        shortUrl: context.shortUrl,
        originalUrl: context.originalUrl,
        domain: context.domain,
        key: context.key,
        provider: context.provider,
        workspaceId: context.workspaceId,
        tags: context.tags,
        utm: context.utm,
        expiresAt: context.expiresAt,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('info', `[Links] ${message}`, logData);
    } catch (logError: any) {
      console.info('[Links] Failed to log info:', logError);

      console.info('[Links] Original message:', message);
    }
  }

  async debug(message: string, context: Partial<LinksLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        linkId: context.linkId,
        shortUrl: context.shortUrl,
        originalUrl: context.originalUrl,
        domain: context.domain,
        key: context.key,
        provider: context.provider,
        workspaceId: context.workspaceId,
        tags: context.tags,
        utm: context.utm,
        expiresAt: context.expiresAt,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('debug', `[Links] ${message}`, logData);
    } catch (logError: any) {
      console.debug('[Links] Failed to log debug:', logError);

      console.debug('[Links] Original message:', message);
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

export const linksLogger = LinksLogger.getInstance();

// Synchronous fallback logger for backward compatibility
export const syncLinksLogger = {
  info(message: string, ...args: any[]): void {
    console.info(`[Links] ${message}`, ...args);
  },

  warn(message: string, ...args: any[]): void {
    console.warn(`[Links] ${message}`, ...args);
  },

  error(message: string, ...args: any[]): void {
    console.error(`[Links] ${message}`, ...args);
  },

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[Links] ${message}`, ...args);
    }
  },
};

// For compatibility with existing code
export const logger = linksLogger;

export default linksLogger;
