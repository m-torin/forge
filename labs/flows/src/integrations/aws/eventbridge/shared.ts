// src/integrations/aws/eventbridge/shared.ts

import { z } from 'zod/v4';
import { createHash } from 'crypto';
import { logInfo, logError, logWarn } from '@repo/observability';

/**
 * Constants
 */
export const EVENTBRIDGE_CONFIG = Object.freeze({
  limits: {
    maxRulesPerBus: 300,
    maxTargetsPerRule: 5,
    maxBatchSize: 10,
    maxEventDetailSize: 256 * 1024, // 256 KB
    maxTotalEventSize: 1 * 1024 * 1024, // 1 MB
  },
  region: process.env.AWS_REGION ?? 'us-east-1',
  accountId: process.env.AWS_ACCOUNT_ID ?? '',
} as const);

/**
 * Type Definitions
 */

/**
 * Represents a resource type in EventBridge.
 */
export type ResourceType = 'bus' | 'rule' | 'target';

/**
 * Identifies a resource with its type and unique identifier.
 */
export interface ResourceIdentifier {
  readonly type: ResourceType;
  readonly id: string;
  readonly region?: string;
}

/**
 * Describes the structure of an error context.
 */
export interface ErrorContext {
  readonly operation: string;
  readonly resourceId?: string;
  readonly timestamp: number;
  readonly retryable: boolean;
  readonly code: string;
  /**
   * Details about the error. Can be a key-value pair or an array of Zod issues.
   */
  readonly details?: Record<string, unknown> | z.ZodIssue[];
}

/**
 * Represents configuration options for operations.
 */
export interface OperationOptions {
  readonly timeout?: number;
  readonly concurrency?: number;
  readonly retryable?: boolean;
  readonly skipDeduplication?: boolean;
}

/**
 * Describes the response of an operation.
 */
export interface OperationResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ErrorContext;
  readonly timestamp: number;
  readonly duration: number;
}

/**
 * Schema Definitions using Zod
 */

/**
 * Schema for validating resource identifiers.
 */
export const ResourceIdentifierSchema = z.object({
  type: z.enum(['bus', 'rule', 'target']),
  id: z.string().min(1),
  region: z.string().optional(),
});

/**
 * Schema for validating error contexts.
 */
export const ErrorContextSchema = z.object({
  operation: z.string(),
  resourceId: z.string().min(1).optional(),
  timestamp: z.number(),
  retryable: z.boolean(),
  code: z.string(),
  details: z.union([z.record(z.string(), z.unknown()), z.array(z.any())]).optional(),
});

/**
 * Validation function for ResourceIdentifier.
 * @param resource The resource identifier to validate.
 * @returns The validated resource identifier.
 * @throws ErrorContext if validation fails.
 */
export const validateResourceIdentifier = (
  resource: any,
): ResourceIdentifier => {
  const result = ResourceIdentifierSchema.safeParse(resource);
  if (!result.success) {
    throw {
      operation: 'validateResourceIdentifier',
      timestamp: Date.now(),
      retryable: false,
      code: 'VALIDATION_ERROR',
      details: result.error.issues,
    } as ErrorContext;
  }
  // Clean up undefined values to satisfy exactOptionalPropertyTypes
  const data = result.data;
  return {
    type: data.type,
    id: data.id,
    ...(data.region && { region: data.region }),
  };
};

/**
 * Utility Functions
 */

/**
 * Sanitizes a resource name by removing invalid characters and enforcing length constraints.
 * @param name The original resource name.
 * @returns The sanitized resource name.
 */
export const sanitizeName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 64)
    .toLowerCase();
};

/**
 * Constructs an AWS ARN for a given resource.
 * @param resource The resource identifier.
 * @returns The constructed ARN.
 */
export const constructArn = (resource: ResourceIdentifier): string => {
  const region = resource.region ?? EVENTBRIDGE_CONFIG.region;
  return `arn:aws:events:${region}:${EVENTBRIDGE_CONFIG.accountId}:${resource.type}/${resource.id}`;
};

/**
 * Generates a SHA-256 hash for a given input.
 * @param input The input string to hash.
 * @returns The hexadecimal representation of the hash.
 */
export const generateHash = (input: string): string => {
  return createHash('sha256').update(input).digest('hex');
};

/**
 * Sleep function to pause execution for a specified duration.
 * @param ms Milliseconds to sleep.
 * @returns A promise that resolves after the specified duration.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Logging Utility (Placeholder)
 * Replace with your logging framework or middleware integration.
 */
export const log = {
  info: (message: string, meta?: Record<string, unknown>) => {
    logInfo(message, meta);
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    logError(message, meta);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    logWarn(message, meta);
  },
};

/**
 * Cache Manager Utility (Placeholder)
 * Implement caching logic as needed or integrate with existing middleware.
 */
export class CacheManager {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private readonly ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  /**
   * Retrieves a value from the cache if it exists and hasn't expired.
   * @param key The key associated with the cached value.
   * @returns The cached value or null if not found or expired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.value as T;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Stores a value in the cache with the specified key.
   * @param key The key to associate with the cached value.
   * @param value The value to cache.
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  /**
   * Clears all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Instance of CacheManager for shared use.
 */
export const cacheManager = new CacheManager();
