import { logError, logInfo } from '@repo/observability';

/**
 * Telemetry middleware for AI requests
 */
interface TelemetryConfig {
  enableMetrics?: boolean;
  enableLogging?: boolean;
  enableTracing?: boolean;
  sampleRate?: number;
  excludeProviders?: string[];
  customTags?: Record<string, string>;
}

const telemetryMiddleware = (config: TelemetryConfig = {}) => {
  const {
    enableMetrics = true,
    enableLogging = true,
    enableTracing: _enableTracing = false,
    sampleRate = 1.0,
    excludeProviders = [],
    customTags = {},
  } = config;

  return (next: any) => async (request: any) => {
    // Skip if sampling rate doesn't match
    if (Math.random() > sampleRate) {
      return next(request);
    }

    // Skip excluded providers
    if (excludeProviders.includes(request?.provider)) {
      return next(request);
    }

    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (enableLogging) {
      logInfo('[AI] Starting request', {
        requestId,
        provider: request?.provider || 'unknown',
        model: request?.model || 'unknown',
        ...customTags,
      });
    }

    try {
      const response = await next(request);
      const duration = Date.now() - startTime;

      if (enableMetrics && enableLogging) {
        logInfo('[AI] Request completed', {
          requestId,
          duration,
          provider: request?.provider || 'unknown',
          model: request?.model || 'unknown',
          tokens: response?.usage?.totalTokens || 0,
          status: 'success',
          ...customTags,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (enableLogging) {
        logError('[AI] Request failed', {
          requestId,
          duration,
          provider: request?.provider || 'unknown',
          model: request?.model || 'unknown',
          error: error instanceof Error ? error.message : String(error),
          status: 'error',
          ...customTags,
        });
      }

      throw error;
    }
  };
};

// Export alias for index.ts
export const telemetry = telemetryMiddleware;
