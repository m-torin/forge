// lock/types.ts
import type { MiddlewareOptions } from '../base';

export interface LockOptions extends MiddlewareOptions {
  ttl?: number; // Lock TTL in ms
  retries?: number; // Number of lock acquisition attempts
  retryDelay?: number; // Delay between retries in ms
  prefix?: string; // Lock key prefix
  [key: string]: unknown; // Index signature to match MiddlewareOptions
}

export interface Lock {
  id: string;
  resource: string;
  acquired: number;
  ttl: number;
}

export interface LockClient {
  isLocked(key: string): Promise<boolean>;
  acquire: (resource: string, ttl: number) => Promise<Lock | null>;
  release: (lock: Lock) => Promise<boolean>;
  extend: (lock: Lock, ttl: number) => Promise<boolean>;
}
