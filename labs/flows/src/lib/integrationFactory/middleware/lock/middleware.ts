// lock/middleware.ts
import {
  BaseMiddleware,
  MiddlewareContext,
  MiddlewareResult,
  NextFunction,
} from '../base';
import type { Lock, LockClient, LockOptions } from './types';
import { logError } from '@repo/observability';

export const DEFAULT_OPTIONS = {
  ttl: 30000,
  retries: 3,
  retryDelay: 1000,
  prefix: 'lock:',
} as const;

type ResolvedOptions = {
  ttl: number;
  retries: number;
  retryDelay: number;
  prefix: string;
};

export class LockMiddleware extends BaseMiddleware {
  private locks = new Map<string, Lock>();
  private readonly resolvedOptions: ResolvedOptions;

  constructor(
    private readonly client: LockClient,
    options: LockOptions = {},
  ) {
    super(options);
    this.resolvedOptions = {
      ttl: options.ttl ?? DEFAULT_OPTIONS.ttl,
      retries: options.retries ?? DEFAULT_OPTIONS.retries,
      retryDelay: options.retryDelay ?? DEFAULT_OPTIONS.retryDelay,
      prefix: options.prefix ?? DEFAULT_OPTIONS.prefix,
    };
  }

  async execute(
    context: MiddlewareContext,
    next: NextFunction,
  ): Promise<MiddlewareResult> {
    const lockKey = context.metadata.lockKey as string;
    if (!lockKey) {
      return next();
    }

    const resource = this.getResourceKey(lockKey);
    const { ttl, retries, retryDelay } = this.resolvedOptions;

    let lock: Lock | null = null;
    let attempts = 0;

    while (!lock && attempts < retries) {
      attempts++;
      lock = await this.client.acquire(resource, ttl);

      if (!lock && attempts < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    if (!lock) {
      return {
        error: new Error(`Failed to acquire lock for ${resource}`),
        metadata: {
          ...context.metadata,
          lockAttempts: attempts,
          lockResource: resource,
        },
        duration: Date.now() - context.startTime,
      };
    }

    this.locks.set(resource, lock);

    try {
      const result = await next();
      return {
        ...result,
        metadata: {
          ...result.metadata,
          lockId: lock.id,
          lockResource: resource,
        },
      };
    } finally {
      await this.releaseLock(lock);
      this.locks.delete(resource);
    }
  }

  private getResourceKey(key: string): string {
    return `${this.resolvedOptions.prefix}${key}`;
  }

  private async releaseLock(lock: Lock): Promise<void> {
    try {
      await this.client.release(lock);
    } catch (error) {
      logError('Failed to release lock', { error });
    }
  }

  async isLocked(resource: string): Promise<boolean> {
    return this.locks.has(this.getResourceKey(resource));
  }

  getLocks(): Map<string, Lock> {
    return new Map(this.locks);
  }
}

export const createLockMiddleware = (
  client: LockClient,
  options: LockOptions = {},
): LockMiddleware => {
  return new LockMiddleware(client, options);
};

export const isResourceLocked = async (
  client: LockClient,
  resource: string,
): Promise<boolean> => {
  return client.isLocked(resource);
};
