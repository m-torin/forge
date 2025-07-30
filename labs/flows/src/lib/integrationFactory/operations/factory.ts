// factory.ts
import { FactoryError, ErrorCode, ErrorSeverity, wrapError, loadConfig } from '../core';
import type { FactoryConfig } from '../core';
import type {
  OperationContext,
  OperationMiddleware,
  OperationOptions,
  OperationResult,
} from './types';
import { OperationBuilder, createOperation } from './builder';

export interface FactoryOptions {
  readonly defaultTimeout?: number;
  readonly defaultRetries?: number;
  readonly defaultCacheTtl?: number;
  readonly middleware?: readonly OperationMiddleware[];
}

export class OperationFactory {
  private static readonly MAX_MIDDLEWARE = 50;
  private middleware: OperationMiddleware[] = [];
  private readonly config: FactoryConfig;

  constructor(private readonly options: FactoryOptions = {}) {
    this.config = loadConfig();

    // Initialize with config defaults
    this.options = {
      defaultTimeout:
        options.defaultTimeout ?? this.config.operationDefaults.timeout,
      defaultRetries:
        options.defaultRetries ?? this.config.operationDefaults.retries,
      defaultCacheTtl:
        options.defaultCacheTtl ?? this.config.operationDefaults.cacheTtl,
      ...(options.middleware && { middleware: options.middleware }),
    };

    if (options.middleware) {
      this.useMiddleware(options.middleware);
    }
  }

  createOperation<TResult = unknown>(
    name: string,
    service: string,
    executor: (context: OperationContext) => Promise<TResult>,
    options: Partial<OperationOptions> = {},
  ): OperationBuilder<TResult> {
    const builder = createOperation<TResult>(
      name,
      service,
      async (context: OperationContext) => {
        try {
          for (const m of this.middleware) {
            await wrapError(
              async () => m.before?.(context),
              ErrorCode.MIDDLEWARE,
              context.metadata,
              context.signal,
            );

            if (context.signal?.aborted) {
              throw new FactoryError(
                'Operation aborted during middleware execution',
                ErrorCode.ABORTED,
                ErrorSeverity.MEDIUM,
              );
            }
          }

          const result = await wrapError(
            () => executor(context),
            ErrorCode.OPERATION,
            context.metadata,
            context.signal,
          );

          const operationResult: OperationResult<TResult> = {
            success: true,
            data: result,
            duration: Date.now() - context.startTime,
            metadata: context.metadata,
            attempts: context.attempt + 1,
            cached: false,
          };

          // Run post-execution middleware in reverse order
          for (const m of [...this.middleware].reverse()) {
            await wrapError(
              async () => m.after?.(operationResult, context),
              ErrorCode.MIDDLEWARE,
              context.metadata,
              context.signal,
            );
          }

          return result;
        } catch (error) {
          const factoryError =
            error instanceof Error
              ? FactoryError.from(
                  error,
                  ErrorCode.OPERATION,
                  ErrorSeverity.MEDIUM,
                )
              : new FactoryError(
                  String(error),
                  ErrorCode.OPERATION,
                  ErrorSeverity.MEDIUM,
                  context.metadata,
                );

          // Run error middleware
          for (const m of this.middleware) {
            await wrapError(
              async () => m.onError?.(factoryError, context),
              ErrorCode.MIDDLEWARE,
              context.metadata,
              context.signal,
            );
          }
          throw factoryError;
        }
      },
    );

    if (this.options.defaultTimeout && !options.timeout) {
      builder.withTimeout(this.options.defaultTimeout);
    }

    if (this.options.defaultRetries && !options.retries) {
      builder.withRetries(this.options.defaultRetries);
    }

    if (options.cache?.key) {
      builder.withCache(
        options.cache.key,
        options.cache.ttl ?? this.options.defaultCacheTtl,
      );
    }

    if (options.metadata) {
      builder.withMetadata({
        ...options.metadata,
        factoryId: this.config.telemetry?.serviceName,
        factoryVersion: this.config.telemetry?.serviceVersion,
      });
    }

    return builder;
  }

  use(middleware: OperationMiddleware): this {
    if (this.middleware.length >= OperationFactory.MAX_MIDDLEWARE) {
      throw new FactoryError(
        'Middleware limit exceeded',
        ErrorCode.INVALID_STATE,
        ErrorSeverity.HIGH,
      );
    }
    this.middleware.push(middleware);
    return this;
  }

  useMiddleware(middlewares: readonly OperationMiddleware[]): this {
    if (
      this.middleware.length + middlewares.length >
      OperationFactory.MAX_MIDDLEWARE
    ) {
      throw new FactoryError(
        'Combined middleware would exceed limit',
        ErrorCode.INVALID_STATE,
        ErrorSeverity.HIGH,
      );
    }
    this.middleware.push(...middlewares);
    return this;
  }

  getMiddleware(): readonly OperationMiddleware[] {
    return [...this.middleware];
  }

  clearMiddleware(): this {
    this.middleware = [];
    return this;
  }

  async dispose(): Promise<void> {
    const disposableMiddleware = this.middleware.filter(
      (
        m,
      ): m is OperationMiddleware &
        Required<Pick<OperationMiddleware, 'dispose'>> =>
        typeof m.dispose === 'function',
    );

    await Promise.all(
      disposableMiddleware.map((m) =>
        wrapError(() => m.dispose(), ErrorCode.MIDDLEWARE_CLEANUP, {
          middleware: m.constructor.name,
        }),
      ),
    );

    this.clearMiddleware();
  }
}

export const createOperationFactory = (
  options?: FactoryOptions,
): OperationFactory => new OperationFactory(options);
