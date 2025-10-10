import type * as Prisma from '../../generated/client/client';

// Transaction client type
export type PrismaTransactionClient = Omit<
  Prisma.PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Generic query options for better type safety
export interface FindManyOptions<T> {
  where?: T;
  orderBy?: any;
  skip?: number;
  take?: number;
  cursor?: any;
}

export interface FindManyWithSelectOptions<T, S> extends FindManyOptions<T> {
  select?: S;
}

export interface FindManyWithIncludeOptions<T, I> extends FindManyOptions<T> {
  include?: I;
}

// Pagination types
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export interface CursorPaginationOptions {
  cursor?: string;
  take?: number;
  skip?: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    previousCursor?: string;
    hasNext: boolean;
    hasPrevious: boolean;
    count: number;
  };
}

// Batch operation types
export interface BatchOptions {
  batchSize?: number;
  continueOnError?: boolean;
}

export interface BatchResult {
  successful: number;
  failed: number;
  errors: Error[];
}

// Search options with PostgreSQL support
export interface SearchOptions extends PaginationOptions {
  fields?: string[];
  fuzzy?: boolean;
  exact?: boolean;
  published?: boolean;
  authorId?: string;
}

export interface SearchResult<T> extends PaginatedResult<T> {
  query: string;
  searchTime: number;
  totalMatches: number;
}

// Connection pool monitoring
export interface PoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
}

// Query performance metrics
export interface QueryMetrics {
  query: string;
  duration: number;
  affectedRows?: number;
  timestamp: Date;
}

// Validation result types
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

// Audit log types
export interface AuditLogEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  recordId: string;
  userId?: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

// Soft delete support
export interface SoftDeleteOptions {
  deletedAt?: Date;
  deletedBy?: string;
}

// Bulk operation input types
export type BulkCreateInput<T> = T[];
export type BulkUpdateInput<TData, TWhere> = {
  where: TWhere;
  data: TData;
}[];

// Utility types for better DX
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Database health check
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  connections: PoolMetrics;
  lastCheck: Date;
  version?: string;
}

// Connection configuration for different environments
export interface ConnectionConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}
