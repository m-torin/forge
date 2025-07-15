// /operations/types.ts
import type {
  BaseContext,
  BaseResult,
  Metadata,
  TimeoutConfig,
  RetryConfig,
  CacheConfig,
  FactoryError,
} from '../core';

export interface OperationContext extends BaseContext {
  readonly name: string;
  readonly service: string;
  attempt: number;
  readonly signal: AbortSignal;
  readonly timeoutConfig?: TimeoutConfig;
  readonly retryConfig?: RetryConfig;
  readonly cacheConfig?: CacheConfig;
}

export interface OperationResult<T = unknown> extends BaseResult<T> {
  readonly attempts: number;
  readonly cached: boolean;
}

export type CloudOperationOptions = OperationOptions & {
  readonly name?: string;
  readonly service?: string;
};

export interface OperationMiddleware {
  readonly before?: (context: OperationContext) => Promise<void>;
  readonly after?: (
    result: OperationResult,
    context: OperationContext,
  ) => Promise<void>;
  readonly onError?: (
    error: FactoryError,
    context: OperationContext,
  ) => Promise<void>;
  readonly dispose?: () => Promise<void>;
}

export type OperationExecutor<T = unknown> = (
  context: OperationContext,
) => Promise<T>;

export interface OperationOptions {
  readonly timeout?: number;
  readonly retries?: number;
  readonly cache?: CacheConfig;
  readonly metadata?: Metadata;
  readonly signal?: AbortSignal;
}
