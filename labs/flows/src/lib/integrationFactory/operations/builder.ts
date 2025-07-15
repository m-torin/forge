// builder.ts
import {
  FactoryError,
  ErrorCode,
  ErrorSeverity,
  wrapError,
  type CacheConfig,
} from '../core';
import type {
  OperationContext,
  OperationOptions,
  OperationResult,
  OperationExecutor,
} from './types';

export class OperationBuilder<TResult = unknown> {
  private metadata: Record<string, unknown> = {};
  private timeoutMs?: number;
  private retryCount?: number;
  private cacheKey?: string;
  private cacheTtl?: number;

  constructor(
    private readonly name: string,
    private readonly service: string,
    private readonly executor: OperationExecutor<TResult>,
  ) {}

  withTimeout(ms: number): this {
    if (ms <= 0 || ms > 300_000) {
      throw new FactoryError('Invalid timeout value', ErrorCode.INVALID_INPUT);
    }
    this.timeoutMs = ms;
    return this;
  }

  withRetries(count: number): this {
    if (count < 0 || count > 10) {
      throw new FactoryError('Invalid retry count', ErrorCode.INVALID_INPUT);
    }
    this.retryCount = count;
    return this;
  }

  withCache(key: string, ttl: number = 300): this {
    if (!key) {
      throw new FactoryError('Cache key required', ErrorCode.INVALID_INPUT);
    }
    this.cacheKey = key;
    this.cacheTtl = ttl;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  getOptions(): OperationOptions {
    const cache: CacheConfig | undefined =
      this.cacheKey && this.cacheTtl
        ? {
            enabled: true,
            key: this.cacheKey,
            ttl: this.cacheTtl,
          }
        : undefined;

    return {
      ...(this.timeoutMs !== undefined && { timeout: this.timeoutMs }),
      ...(this.retryCount !== undefined && { retries: this.retryCount }),
      ...(cache && { cache }),
      metadata: this.metadata,
    };
  }

  async execute(): Promise<OperationResult<TResult>> {
    const controller = new AbortController();
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | undefined;

    const context: OperationContext = {
      id: crypto.randomUUID(),
      name: this.name,
      service: this.service,
      startTime,
      attempt: 0,
      signal: controller.signal,
      metadata: Object.freeze({
        ...this.metadata,
        timeout: this.timeoutMs,
        retries: this.retryCount,
        cacheKey: this.cacheKey,
        cacheTtl: this.cacheTtl,
      }),
    };

    try {
      if (this.timeoutMs) {
        timeoutId = setTimeout(() => {
          controller.abort(
            new FactoryError(
              'Operation timeout',
              ErrorCode.TIMEOUT,
              ErrorSeverity.MEDIUM,
            ),
          );
        }, this.timeoutMs);
      }

      const data = await wrapError(
        async () => this.executor(context),
        ErrorCode.OPERATION,
        context.metadata,
        controller.signal,
      );

      return {
        success: true,
        data,
        duration: Date.now() - startTime,
        metadata: context.metadata,
        attempts: context.attempt + 1,
        cached: false,
      };
    } catch (error) {
      const factoryError =
        error instanceof Error
          ? FactoryError.from(error, ErrorCode.OPERATION, ErrorSeverity.MEDIUM)
          : new FactoryError(
              String(error),
              ErrorCode.OPERATION,
              ErrorSeverity.MEDIUM,
              this.metadata,
            );

      return {
        success: false,
        error: factoryError,
        duration: Date.now() - startTime,
        metadata: context.metadata,
        attempts: context.attempt + 1,
        cached: false,
      };
    } finally {
      clearTimeout(timeoutId);
      controller.abort();
    }
  }
}

export const createOperation = <TResult = unknown>(
  name: string,
  service: string,
  executor: OperationExecutor<TResult>,
): OperationBuilder<TResult> => new OperationBuilder(name, service, executor);
