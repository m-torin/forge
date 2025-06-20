/**
 * Storage Logger - Using Observability System
 *
 * This file provides logging functionality for storage operations using the centralized
 * observability system from @repo/observability.
 *
 * @example
 * ```typescript
 * import { storageLogger } from './utils/logger';
 *
 * await storageLogger.error('Upload failed', error, {
 *   operation: 'upload',
 *   provider: 'cloudflare-r2',
 *   key: 'uploads/image.jpg',
 *   size: 1024000
 * });
 * ```
 */

import { createServerObservability } from '@repo/observability/shared-env';

import type { ObservabilityManager } from '@repo/observability/server';

let observabilityInstance: ObservabilityManager | null = null;

export interface StorageLogContext {
  operation?: string;
  provider?: string;
  key?: string;
  bucket?: string;
  size?: number;
  contentType?: string;
  duration?: number;
  multipartId?: string;
  partNumber?: number;
  metadata?: Record<string, any>;
  error?: Error;
  timestamp?: string;
}

export class StorageLogger {
  private static instance?: StorageLogger;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): StorageLogger {
    StorageLogger.instance ??= new StorageLogger();
    return StorageLogger.instance;
  }

  async error(
    message: string,
    error?: Error,
    context: Partial<StorageLogContext> = {},
  ): Promise<void> {
    try {
      const observability = await getObservability();

      if (error) {
        void observability.captureException(error, {
          extra: {
            operation: context.operation,
            provider: context.provider,
            key: context.key,
            bucket: context.bucket,
            size: context.size,
            contentType: context.contentType,
            duration: context.duration,
            multipartId: context.multipartId,
            partNumber: context.partNumber,
            metadata: context.metadata,
            timestamp: context.timestamp ?? new Date().toISOString(),
          },
          tags: {
            component: 'storage',
            operation: context.operation ?? 'unknown',
            provider: context.provider ?? 'unknown',
          },
        });
      } else {
        void observability.captureMessage(message, 'error', {
          extra: context,
          tags: {
            component: 'storage',
            operation: context.operation ?? 'unknown',
          },
        });
      }
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.error('[Storage] Failed to log error:', logError);
      // eslint-disable-next-line no-console
      console.error('[Storage] Original error:', error || message);
    }
  }

  async warn(message: string, context: Partial<StorageLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        provider: context.provider,
        key: context.key,
        bucket: context.bucket,
        size: context.size,
        contentType: context.contentType,
        duration: context.duration,
        multipartId: context.multipartId,
        partNumber: context.partNumber,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('warn', `[Storage] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.warn('[Storage] Failed to log warning:', logError);
      // eslint-disable-next-line no-console
      console.warn('[Storage] Original message:', message);
    }
  }

  async info(message: string, context: Partial<StorageLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        provider: context.provider,
        key: context.key,
        bucket: context.bucket,
        size: context.size,
        contentType: context.contentType,
        duration: context.duration,
        multipartId: context.multipartId,
        partNumber: context.partNumber,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('info', `[Storage] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.info('[Storage] Failed to log info:', logError);
      // eslint-disable-next-line no-console
      console.info('[Storage] Original message:', message);
    }
  }

  async debug(message: string, context: Partial<StorageLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        operation: context.operation,
        provider: context.provider,
        key: context.key,
        bucket: context.bucket,
        size: context.size,
        contentType: context.contentType,
        duration: context.duration,
        multipartId: context.multipartId,
        partNumber: context.partNumber,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('debug', `[Storage] ${message}`, logData);
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.debug('[Storage] Failed to log debug:', logError);
      // eslint-disable-next-line no-console
      console.debug('[Storage] Original message:', message);
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

export const storageLogger = StorageLogger.getInstance();

// Synchronous fallback logger for backward compatibility
export const syncStorageLogger = {
  info(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.info(`[Storage] ${message}`, ...args);
  },

  warn(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.warn(`[Storage] ${message}`, ...args);
  },

  error(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.error(`[Storage] ${message}`, ...args);
  },

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[Storage] ${message}`, ...args);
    }
  },
};

// For compatibility with existing code
export const logger = storageLogger;

export default storageLogger;
