import { logError, logInfo } from '@repo/observability';
// Note: LanguageModelMiddleware may not be exported in some AI SDK versions
// Using 'any' type for compatibility while maintaining functionality

/**
 * AI SDK v5 Telemetry Middleware
 *
 * Provides comprehensive logging and monitoring for AI SDK v5 operations.
 * Replaces custom AILogger implementations with v5-compatible telemetry patterns
 * that integrate with the SDK's built-in observability features.
 *
 * @module TelemetryMiddleware
 *
 * @example Basic Usage
 * ```typescript
 * import { wrapLanguageModel } from 'ai';
 * import { telemetryMiddleware } from '@repo/ai/shared';
 * import { openai } from '@ai-sdk/openai';
 *
 * const model = wrapLanguageModel({
 *   model: openai('gpt-4o'),
 *   middleware: telemetryMiddleware,
 * });
 * ```
 *
 * @example Advanced Configuration
 * ```typescript
 * import { createTelemetryMiddleware, telemetryConfigs } from '@repo/ai/shared';
 *
 * const customMiddleware = createTelemetryMiddleware({
 *   ...telemetryConfigs.production,
 *   functionId: 'my-ai-feature',
 *   metadata: { userId: 'user123', feature: 'chat' },
 * });
 * ```
 *
 * @since 1.0.0
 * @author AI SDK v5 Migration Team
 */
/**
 * Basic telemetry middleware for AI SDK v5 operations
 *
 * Provides standard logging for both generate and stream operations,
 * including request details, response metadata, timing, and error tracking.
 * Uses the @repo/observability package for consistent logging across the application.
 *
 * @remarks
 * - Logs all requests with model parameters and timestamps
 * - Tracks response timing and token usage
 * - Captures errors with context for debugging
 * - Integrates with streaming operations for real-time monitoring
 *
 * @example
 * ```typescript
 * import { wrapLanguageModel } from 'ai';
 * import { telemetryMiddleware } from '@repo/ai/shared';
 *
 * const monitoredModel = wrapLanguageModel({
 *   model: baseModel,
 *   middleware: telemetryMiddleware,
 * });
 * ```
 */
export const telemetryMiddleware: any = {
  wrapGenerate: async ({ doGenerate, params }: any) => {
    const startTime = Date.now();

    // Log request details
    logInfo('[AI] Generate request', {
      model: params.model,
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await doGenerate();
      const duration = Date.now() - startTime;

      // Log success response
      logInfo('[AI] Generate response', {
        model: params.model,
        finishReason: result.finishReason,
        usage: result.usage,
        duration,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      // Log errors
      logError('[AI] Generate error', {
        model: params.model,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  wrapStream: async ({ doStream, params }: any) => {
    const startTime = Date.now();

    logInfo('[AI] Stream request', {
      model: params.model,
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
      timestamp: new Date().toISOString(),
    });

    try {
      const { stream, ...rest } = await doStream();

      // Transform stream to add logging
      const transformStream = new TransformStream({
        start() {
          logInfo('[AI] Stream started', {
            model: params.model,
            timestamp: new Date().toISOString(),
          });
        },

        flush() {
          const duration = Date.now() - startTime;
          logInfo('[AI] Stream completed', {
            model: params.model,
            duration,
            timestamp: new Date().toISOString(),
          });
        },
      });

      return {
        stream: stream.pipeThrough(transformStream),
        ...rest,
      };
    } catch (error) {
      logError('[AI] Stream error', {
        model: params.model,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },
};

/**
 * Advanced Telemetry Configuration Options
 *
 * Defines the configuration interface for customizing telemetry behavior.
 * Allows fine-grained control over what data is collected and how it's processed.
 *
 * @interface TelemetryConfig
 *
 * @property isEnabled - Whether telemetry collection is active
 * @property tracer - Optional OpenTelemetry tracer instance for distributed tracing
 * @property functionId - Unique identifier for the function or feature being monitored
 * @property metadata - Custom key-value pairs to include with all telemetry events
 * @property collectUsage - Whether to collect token usage and model performance data
 * @property collectTiming - Whether to collect request/response timing information
 * @property collectErrors - Whether to collect detailed error information
 *
 * @example
 * ```typescript
 * const config: TelemetryConfig = {
 *   isEnabled: true,
 *   functionId: 'chat-completion',
 *   metadata: {
 *     userId: 'user123',
 *     feature: 'customer-support',
 *     environment: 'production',
 *   },
 *   collectUsage: true,
 *   collectTiming: true,
 *   collectErrors: true,
 * };
 * ```
 */
export interface TelemetryConfig {
  isEnabled: boolean;
  tracer?: any;
  functionId?: string;
  metadata?: Record<string, string | number | boolean>;
  collectUsage?: boolean;
  collectTiming?: boolean;
  collectErrors?: boolean;
}

/**
 * V5 Telemetry Configuration Presets
 *
 * Provides pre-configured telemetry settings for common deployment scenarios.
 * These presets balance observability needs with performance considerations.
 *
 * @namespace telemetryConfigs
 *
 * @example Using Presets
 * ```typescript
 * // Use production preset for live environments
 * const prodMiddleware = createTelemetryMiddleware(telemetryConfigs.production);
 *
 * // Use development preset for local testing
 * const devMiddleware = createTelemetryMiddleware(telemetryConfigs.development);
 *
 * // Disable telemetry for testing
 * const testMiddleware = createTelemetryMiddleware(telemetryConfigs.disabled);
 * ```
 */
export const telemetryConfigs = {
  // Basic telemetry (default)
  default: {
    isEnabled: true,
    collectUsage: true,
    collectTiming: true,
    collectErrors: true,
  } as TelemetryConfig,

  // Production telemetry with custom metadata
  production: {
    isEnabled: true,
    functionId: 'ai-sdk-production',
    collectUsage: true,
    collectTiming: true,
    collectErrors: true,
    metadata: {
      environment: 'production',
      version: '1.0.0',
    },
  } as TelemetryConfig,

  // Development telemetry (minimal)
  development: {
    isEnabled: true,
    functionId: 'ai-sdk-dev',
    collectUsage: false,
    collectTiming: true,
    collectErrors: true,
    metadata: {
      environment: 'development',
    },
  } as TelemetryConfig,

  // Disabled telemetry
  disabled: {
    isEnabled: false,
  } as TelemetryConfig,
};

/**
 * Enhanced Telemetry Middleware with custom configuration
 *
 * Creates a customized telemetry middleware instance with specific configuration options.
 * Provides more granular control over telemetry collection than the basic middleware.
 *
 * @param config - Telemetry configuration options (defaults to telemetryConfigs.default)
 *
 * @returns Configured LanguageModelMiddleware instance
 *
 * @example Basic Custom Configuration
 * ```typescript
 * const middleware = createTelemetryMiddleware({
 *   isEnabled: true,
 *   functionId: 'document-analysis',
 *   collectUsage: true,
 *   collectTiming: true,
 *   collectErrors: true,
 * });
 * ```
 *
 * @example Production Configuration
 * ```typescript
 * const prodMiddleware = createTelemetryMiddleware({
 *   ...telemetryConfigs.production,
 *   functionId: 'ai-chat-service',
 *   metadata: {
 *     service: 'customer-support',
 *     version: '2.1.0',
 *     region: 'us-east-1',
 *   },
 * });
 * ```
 *
 * @see {@link TelemetryConfig} For configuration options
 * @see {@link telemetryConfigs} For preset configurations
 */
export function createTelemetryMiddleware(config: TelemetryConfig = telemetryConfigs.default): any {
  return {
    wrapGenerate: async ({ doGenerate, params }: any) => {
      const startTime = Date.now();
      const metadata = {
        ...config.metadata,
        model: params.model,
        temperature: params.temperature,
        maxOutputTokens: params.maxOutputTokens,
      };

      if (config.collectTiming) {
        logInfo('[AI] Generate request started', {
          ...metadata,
          functionId: config.functionId,
          timestamp: new Date().toISOString(),
        });
      }

      try {
        const result = await doGenerate();
        const duration = Date.now() - startTime;

        if (config.collectUsage && result.usage) {
          logInfo('[AI] Generate usage', {
            ...metadata,
            functionId: config.functionId,
            usage: result.usage,
            finishReason: result.finishReason,
            duration,
            timestamp: new Date().toISOString(),
          });
        }

        if (config.collectTiming) {
          logInfo('[AI] Generate completed', {
            ...metadata,
            functionId: config.functionId,
            duration,
            success: true,
            timestamp: new Date().toISOString(),
          });
        }

        return result;
      } catch (error) {
        if (config.collectErrors) {
          logError('[AI] Generate error', {
            ...metadata,
            functionId: config.functionId,
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          });
        }
        throw error;
      }
    },

    wrapStream: async ({ doStream, params }: any) => {
      const startTime = Date.now();
      const metadata = {
        ...config.metadata,
        model: params.model,
        temperature: params.temperature,
        maxOutputTokens: params.maxOutputTokens,
      };

      if (config.collectTiming) {
        logInfo('[AI] Stream request started', {
          ...metadata,
          functionId: config.functionId,
          timestamp: new Date().toISOString(),
        });
      }

      try {
        const { stream, ...rest } = await doStream();
        let chunkCount = 0;
        let totalTokens = 0;

        const transformStream = new TransformStream({
          start() {
            logInfo('[AI] Stream started', {
              ...metadata,
              functionId: config.functionId,
              timestamp: new Date().toISOString(),
            });
          },

          transform(chunk, controller) {
            chunkCount++;

            // Collect usage data if enabled
            if (config.collectUsage && chunk.type === 'finish' && chunk.usage) {
              totalTokens = chunk.usage.totalTokens || 0;
            }

            controller.enqueue(chunk);
          },

          flush() {
            const duration = Date.now() - startTime;

            if (config.collectTiming || config.collectUsage) {
              logInfo('[AI] Stream completed', {
                ...metadata,
                functionId: config.functionId,
                duration,
                chunkCount,
                ...(config.collectUsage && { totalTokens }),
                timestamp: new Date().toISOString(),
              });
            }
          },
        });

        return {
          stream: stream.pipeThrough(transformStream),
          ...rest,
        };
      } catch (error) {
        if (config.collectErrors) {
          logError('[AI] Stream error', {
            ...metadata,
            functionId: config.functionId,
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          });
        }
        throw error;
      }
    },
  };
}

/**
 * Performance Monitoring Middleware
 *
 * Specialized telemetry middleware focused on detailed performance tracking.
 * Collects comprehensive metrics for request timing, token usage, and model performance.
 * Ideal for production monitoring and performance optimization.
 *
 * @remarks
 * - Enables all telemetry collection options
 * - Includes detailed metadata for performance analysis
 * - Uses 'ai-performance-monitor' as function identifier
 * - Suitable for high-traffic production environments
 *
 * @example
 * ```typescript
 * import { wrapLanguageModel } from 'ai';
 * import { performanceMiddleware } from '@repo/ai/shared';
 *
 * const monitoredModel = wrapLanguageModel({
 *   model: baseModel,
 *   middleware: performanceMiddleware,
 * });
 *
 * // All requests will include detailed performance metrics
 * const result = await generateText({
 *   model: monitoredModel,
 *   prompt: 'Your prompt here',
 * });
 * ```
 *
 * @see {@link createTelemetryMiddleware} For custom performance monitoring
 */
export const performanceMiddleware: any = createTelemetryMiddleware({
  isEnabled: true,
  functionId: 'ai-performance-monitor',
  collectUsage: true,
  collectTiming: true,
  collectErrors: true,
  metadata: {
    monitoring: 'performance',
    detailed: true,
  },
});

/**
 * Error Tracking Middleware
 *
 * Specialized telemetry middleware focused on error collection and debugging.
 * Optimized for error tracking with minimal performance overhead by disabling
 * usage and timing collection while maintaining comprehensive error logging.
 *
 * @remarks
 * - Disables usage and timing collection for better performance
 * - Focuses exclusively on error detection and logging
 * - Uses 'ai-error-tracker' as function identifier
 * - Includes debug metadata for troubleshooting
 *
 * @example
 * ```typescript
 * import { wrapLanguageModel } from 'ai';
 * import { errorTrackingMiddleware } from '@repo/ai/shared';
 *
 * const errorTrackedModel = wrapLanguageModel({
 *   model: baseModel,
 *   middleware: errorTrackingMiddleware,
 * });
 *
 * // Errors will be comprehensively logged with context
 * try {
 *   const result = await generateText({
 *     model: errorTrackedModel,
 *     prompt: 'Your prompt here',
 *   });
 * } catch (error) {
 *   // Error details are automatically logged
 * }
 * ```
 *
 * @see {@link createTelemetryMiddleware} For custom error tracking
 */
export const errorTrackingMiddleware: any = createTelemetryMiddleware({
  isEnabled: true,
  functionId: 'ai-error-tracker',
  collectUsage: false,
  collectTiming: false,
  collectErrors: true,
  metadata: {
    monitoring: 'errors',
    debug: true,
  },
});

// Note: The main telemetryMiddleware export is defined above
// This prevents duplicate exports while maintaining the factory pattern

/**
 * Get telemetry config based on environment
 *
 * Automatically selects appropriate telemetry configuration based on the
 * current NODE_ENV environment variable. Provides sensible defaults for
 * different deployment environments.
 *
 * @returns Appropriate TelemetryConfig for the current environment
 *
 * @remarks
 * - Production: Full telemetry with metadata
 * - Development: Minimal telemetry for debugging
 * - Test: Disabled telemetry for clean test runs
 * - Default: Basic telemetry configuration
 *
 * @example
 * ```typescript
 * // Automatically configure based on environment
 * const config = getTelemetryConfig();
 * const middleware = createTelemetryMiddleware(config);
 *
 * // Use environment-appropriate telemetry
 * const model = wrapLanguageModel({
 *   model: baseModel,
 *   middleware,
 * });
 * ```
 *
 * @example Manual Environment Handling
 * ```typescript
 * const config = getTelemetryConfig();
 *
 * if (config === telemetryConfigs.production) {
 *   // Add additional production-specific configuration
 *   config.metadata = {
 *     ...config.metadata,
 *     deployment: 'blue-green',
 *     cluster: 'main',
 *   };
 * }
 * ```
 *
 * @see {@link telemetryConfigs} For available preset configurations
 */
export function getTelemetryConfig(): TelemetryConfig {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'production':
      return telemetryConfigs.production;
    case 'development':
      return telemetryConfigs.development;
    case 'test':
      return telemetryConfigs.disabled;
    default:
      return telemetryConfigs.default;
  }
}
