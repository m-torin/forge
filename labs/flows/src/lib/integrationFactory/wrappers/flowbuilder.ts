// src/lib/integrationFactory/wrappers/flowbuilder.ts

import { FactoryError, ErrorCode, ErrorSeverity } from '../core';
import type { CacheConfig, WrapperConfig } from '../core';
import {
  createLoggingMiddleware,
  ConsoleLogger,
  createCircuitBreakerMiddleware,
  Middleware,
} from '../middleware';
import {
  OperationFactory,
  OperationContext,
  createOperationFactory,
  OperationMiddleware,
  OperationOptions,
  OperationResult,
} from '../operations';

const OPERATION_DEFAULTS = {
  TIMEOUT: 30000,
  RETRIES: 3,
  CACHE_TTL: 300,
} as const;

const DEFAULT_WRAPPER_CONFIG: Required<WrapperConfig> = Object.freeze({
  timeout: OPERATION_DEFAULTS.TIMEOUT,
  retries: OPERATION_DEFAULTS.RETRIES,
  cache: {
    enabled: false,
    ttl: OPERATION_DEFAULTS.CACHE_TTL,
    key: 'default-cache-key',
  },
  logging: {
    enabled: true,
    redactKeys: ['password', 'secret', 'token'],
  },
  circuit: {
    enabled: true,
    bucketSize: 1000, // 1 second windows
    bucketCount: 60, // 1 minute total window
    errorThresholdPercentage: 25,
    resetTimeout: 60000, // 1 minute reset timeout
    halfOpenLimit: 5, // Allow 5 requests in half-open
    degradationThreshold: 10000, // 10 second degradation threshold
  },
  metadata: {}, // Add empty object as default metadata
});

/**
 * OperationMetadata provides additional context about the operation.
 * Extending Record<string, unknown> allows it to be assignable to Readonly<Record<string, unknown>>.
 */
interface OperationMetadata extends Record<string, unknown> {
  inputType: string;
  operationName: string;
  serviceName: string;
  configuredAt: string;
}

const factoryCache: Map<string, OperationFactory> = new Map();

/**
 * Validates the WrapperConfig
 * @param config Configuration to validate
 */
const validateConfig = (config: Required<WrapperConfig>): void => {
  if (config.timeout <= 0) {
    throw new FactoryError(
      'Timeout must be a positive number',
      ErrorCode.INVALID_ARGUMENT,
      ErrorSeverity.HIGH,
      { timeout: config.timeout },
    );
  }
  if (config.retries < 0) {
    throw new FactoryError(
      'Retries cannot be negative',
      ErrorCode.INVALID_ARGUMENT,
      ErrorSeverity.HIGH,
      { retries: config.retries },
    );
  }
  // Add more validations as needed
};

/**
 * Creates a wrapped operation with middleware, error handling, and resource management
 * @param name Operation name (format: "service/operation")
 * @param handler The operation handler function
 * @param config Optional configuration overrides
 */
export const flowbuilderOperation = <TInput, TOutput>(
  name: string,
  handler: (input: TInput, context: OperationContext) => Promise<TOutput>,
  config: Partial<WrapperConfig> = DEFAULT_WRAPPER_CONFIG,
) => {
  // Extract service name from operation name (e.g., "sns/publish" -> "sns")
  const [serviceName] = name.split('/');

  // Merge default and custom configs
  const finalConfig: Required<WrapperConfig> = Object.freeze({
    ...DEFAULT_WRAPPER_CONFIG,
    ...config,
    cache: Object.freeze({
      ...DEFAULT_WRAPPER_CONFIG.cache,
      ...config.cache,
      ttl: config.cache?.ttl ?? DEFAULT_WRAPPER_CONFIG.cache.ttl, // Ensure ttl is a number
    }),
    logging: Object.freeze({
      ...DEFAULT_WRAPPER_CONFIG.logging,
      ...config.logging,
    }),
    circuit: Object.freeze({
      ...DEFAULT_WRAPPER_CONFIG.circuit,
      ...config.circuit,
    }),
    timeout: config.timeout ?? DEFAULT_WRAPPER_CONFIG.timeout,
    retries: config.retries ?? DEFAULT_WRAPPER_CONFIG.retries,
  });

  // Validate the config
  validateConfig(finalConfig);

  /**
   * Initializes or retrieves the factory from cache
   */
  const getFactory = (): OperationFactory => {
    if (factoryCache.has(name)) {
      const cached = factoryCache.get(name);
      if (!cached) {
        throw new Error(`Factory cache inconsistency for ${name}`);
      }
      return cached;
    }

    const factory = createOperationFactory({
      defaultTimeout: finalConfig.timeout,
      defaultRetries: finalConfig.retries,
      ...(finalConfig.cache.enabled && { defaultCacheTtl: finalConfig.cache.ttl }),
      middleware: [
        finalConfig.logging.enabled &&
          createLoggingMiddleware(new ConsoleLogger(), {
            redactKeys: finalConfig.logging.redactKeys,
          }),
        finalConfig.circuit.enabled &&
          createCircuitBreakerMiddleware({
            bucketSize: finalConfig.circuit.bucketSize,
            bucketCount: finalConfig.circuit.bucketCount,
            errorThresholdPercentage:
              finalConfig.circuit.errorThresholdPercentage,
            resetTimeout: finalConfig.circuit.resetTimeout,
            halfOpenLimit: finalConfig.circuit.halfOpenLimit,
            degradationThreshold: finalConfig.circuit.degradationThreshold,
            ...(finalConfig.circuit.onStateChange && { onStateChange: finalConfig.circuit.onStateChange }),
          }),
      ].filter(
        (m): m is Middleware => m !== false,
      ) as readonly OperationMiddleware[],
    });

    factoryCache.set(name, factory);
    return factory;
  };

  /**
   * Creates operation options with proper error handling
   */
  const createCloudOperationOptions = (
    input: TInput,
    customConfig?: Partial<WrapperConfig>,
  ): OperationOptions => {
    try {
      const cache: CacheConfig | undefined =
        finalConfig.cache.enabled && finalConfig.cache.key
          ? {
              enabled: true,
              key: finalConfig.cache.key,
              ttl: finalConfig.cache.ttl,
            }
          : undefined;

      const metadata: OperationMetadata = Object.freeze({
        inputType: typeof input,
        operationName: name,
        serviceName,
        configuredAt: new Date().toISOString(),
      });

      return {
        timeout: customConfig?.timeout ?? finalConfig.timeout,
        retries: customConfig?.retries ?? finalConfig.retries,
        ...(cache && { cache }),
        metadata,
      };
    } catch (error) {
      throw new FactoryError(
        'Failed to create operation options',
        ErrorCode.INITIALIZATION,
        ErrorSeverity.HIGH,
        { name, service: serviceName, input: typeof input },
        error instanceof Error ? error : undefined,
      );
    }
  };

  // Return the operation interface
  return {
    /**
     * Executes the operation with default configuration
     */
    execute: async (input: TInput): Promise<OperationResult<TOutput>> => {
      const factory = getFactory();
      const controller = new AbortController();

      const timeout = finalConfig.timeout ?? OPERATION_DEFAULTS.TIMEOUT;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const operation = factory.createOperation(
          name,
          serviceName,
          async (ctx) => handler(input, ctx),
          { ...createCloudOperationOptions(input), signal: controller.signal },
        );

        return await operation.execute();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new FactoryError(
            'Operation timed out',
            ErrorCode.TIMEOUT,
            ErrorSeverity.MEDIUM,
            { name, service: serviceName },
            error,
          );
        }
        throw error instanceof Error
          ? error
          : new FactoryError(
              String(error),
              ErrorCode.OPERATION,
              ErrorSeverity.MEDIUM,
              { name, service: serviceName },
              error as Error,
            );
      } finally {
        clearTimeout(timeoutId);
      }
    },

    /**
     * Executes the operation with custom configuration
     */
    withConfig: async (
      input: TInput,
      customConfig?: Partial<WrapperConfig>,
    ): Promise<OperationResult<TOutput>> => {
      const mergedConfig: Required<WrapperConfig> = Object.freeze({
        ...finalConfig,
        ...customConfig,
        cache: Object.freeze({
          ...finalConfig.cache,
          ...customConfig?.cache,
          ttl: customConfig?.cache?.ttl ?? finalConfig.cache.ttl, // Ensure ttl is a number
        }),
        logging: Object.freeze({
          ...finalConfig.logging,
          ...customConfig?.logging,
        }),
        circuit: Object.freeze({
          ...finalConfig.circuit,
          ...customConfig?.circuit,
        }),
        timeout: customConfig?.timeout ?? finalConfig.timeout,
        retries: customConfig?.retries ?? finalConfig.retries,
      });

      validateConfig(mergedConfig);

      const factory = factoryCache.get(name) || getFactory();
      const controller = new AbortController();

      const timeout =
        customConfig?.timeout ??
        finalConfig.timeout ??
        OPERATION_DEFAULTS.TIMEOUT;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const operation = factory.createOperation(
          name,
          serviceName,
          async (ctx) => handler(input, ctx),
          {
            ...createCloudOperationOptions(input, customConfig),
            signal: controller.signal,
          },
        );

        return await operation.execute();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new FactoryError(
            'Operation timed out',
            ErrorCode.TIMEOUT,
            ErrorSeverity.MEDIUM,
            { name, service: serviceName },
            error,
          );
        }
        throw error instanceof Error
          ? error
          : new FactoryError(
              String(error),
              ErrorCode.OPERATION,
              ErrorSeverity.MEDIUM,
              { name, service: serviceName },
              error as Error,
            );
      } finally {
        clearTimeout(timeoutId);
      }
    },

    /**
     * Cleanup resources associated with this operation
     */
    dispose: async (): Promise<void> => {
      if (factoryCache.has(name)) {
        const factory = factoryCache.get(name);
        if (factory) {
          await factory.dispose();
        }
        factoryCache.delete(name);
      }
    },
  };
};
