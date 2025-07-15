import { logError, logInfo } from '@repo/observability';

export interface TelemetryMiddlewareOptions {
  isEnabled?: boolean;
  functionId: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetryTrackOptions {
  metadata?: Record<string, unknown>;
}

/**
 * Creates telemetry middleware for AI SDK v5 operations
 * Provides consistent telemetry tracking across all AI operations
 */
export function createTelemetryMiddleware(options: TelemetryMiddlewareOptions) {
  return {
    async track<T>(operation: () => Promise<T>, trackOptions?: TelemetryTrackOptions): Promise<T> {
      if (!options.isEnabled) {
        return operation();
      }

      const startTime = Date.now();
      const metadata = {
        ...options.metadata,
        ...trackOptions?.metadata,
        functionId: options.functionId,
      };

      try {
        logInfo(`AI operation started: ${options.functionId}`, metadata);
        const result = await operation();

        const duration = Date.now() - startTime;
        logInfo(`AI operation completed: ${options.functionId}`, {
          ...metadata,
          duration,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logError(`AI operation failed: ${options.functionId}`, {
          error,
          ...metadata,
          duration,
        });
        throw error;
      }
    },
  };
}

/**
 * Simple telemetry settings interface for AI operations
 */
export interface TelemetrySettings {
  isEnabled: boolean;
  functionId: string;
  metadata?: Record<string, string | number | boolean | null>;
  recordInputs?: boolean;
  recordOutputs?: boolean;
}

/**
 * Creates telemetry settings for AI operations
 */
export function createTelemetrySettings(
  isEnabled: boolean,
  functionId: string,
  metadata?: Record<string, string | number | boolean | null>,
): TelemetrySettings {
  return {
    isEnabled,
    functionId,
    metadata,
    recordInputs: true,
    recordOutputs: true,
  };
}
