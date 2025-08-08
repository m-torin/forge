/**
 * Types for Memory Adapter
 *
 * Provides TypeScript interfaces for the in-memory Better Auth adapter
 */

/**
 * Demo user configuration for pre-populating the memory adapter
 */
export interface DemoUser {
  /** User ID (optional, will be generated if not provided) */
  id?: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** User's password (will be hashed) */
  password: string;
  /** Whether the email is verified (default: true) */
  emailVerified?: boolean;
  /** User's avatar image URL */
  image?: string;
  /** User's role (default: 'user') */
  role?: string;
  /** Additional custom fields */
  [key: string]: any;
}

/**
 * Logger interface for memory adapter
 */
export interface Logger {
  /** Log informational messages */
  info: (message: string, ...args: any[]) => void;
  /** Log warning messages */
  warn: (message: string, ...args: any[]) => void;
  /** Log error messages */
  error: (message: string, ...args: any[]) => void;
}

/**
 * Configuration options for the memory adapter
 */
export interface MemoryAdapterOptions {
  /** Demo users to pre-populate (optional) */
  demoUsers?: DemoUser[];
  /** Custom logger implementation (optional, defaults to console) */
  logger?: Logger;
  /** Enable debug logging (default: false) */
  debugMode?: boolean;
  /** Initialize demo users eagerly on adapter creation (default: true) */
  eagerInit?: boolean;
  /** Adapter name for identification (default: 'Memory Adapter') */
  adapterName?: string;
}

/**
 * Internal storage record with metadata
 */
export interface StorageRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

/**
 * Where clause condition for Better Auth queries
 */
export interface WhereCondition {
  field: string;
  value: any;
  operator?:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notIn'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
