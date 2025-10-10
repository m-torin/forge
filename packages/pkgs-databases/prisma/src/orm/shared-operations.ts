/**
 * Shared ORM operation patterns and utilities
 * Standardizes compound key handling and common patterns across all ORM files
 */

import { executeOperation, executeWithPagination, OperationError, withRetry } from './shared/core';
import type { PrismaClient, PrismaTransactionClient } from './types/shared';
export { handleCompoundKeys } from './shared/compound';
export type { CompoundKeyPattern } from './shared/compound';
export { executeOperation, executeWithPagination, OperationError, withRetry };

/**
 * Standard compound key patterns
 */
// CompoundKeyPattern is re-exported from './shared/compound'

/**
 * Universal operation executor with standardized error handling
 */
/** executeOperation is re-exported from './shared/core' */

/** Compound key transformers moved to './shared/compound' */

/**
 * Standardized input sanitization
 */
/** sanitizeInput is handled internally by './shared/core' */

/**
 * Standardized pagination helper
 */
/** executeWithPagination is re-exported from './shared/core' */

/**
 * Enhanced operation error with context
 */
/** OperationError is re-exported from './shared/core' */

/**
 * Retry helper for operations that may fail temporarily
 */
/** withRetry is re-exported from './shared/core' */

/**
 * Common compound key patterns used across models
 */
export { COMPOUND_KEY_PATTERNS } from './shared/compound';

/**
 * Generic helpers for common CRUD patterns
 * These reduce duplication across domain ORM files.
 */
export async function deleteByIdGeneric<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
  modelName: string, // Lowercase Prisma client model property e.g. 'user', 'post'
  id: string,
  select?: any,
): Promise<T> {
  return executeOperation<T>(prisma, modelName, 'delete', { where: { id }, select });
}

export async function existsByIdGeneric(
  prisma: PrismaClient | PrismaTransactionClient,
  modelName: string,
  id: string,
): Promise<boolean> {
  const found = await executeOperation<{ id: string } | null>(prisma, modelName, 'findUnique', {
    where: { id },
    select: { id: true },
  });
  return !!found;
}

/**
 * Strongly typed generic wrappers leveraging delegate method signatures.
 * Callers pass the model delegate to preserve full type safety for args and return types.
 */
export async function deleteGeneric<D extends { delete: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['delete']>[0],
): Promise<Awaited<ReturnType<D['delete']>>> {
  return delegate.delete(args as any) as any;
}

export async function existsGeneric<D extends { findUnique: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['findUnique']>[0],
): Promise<boolean> {
  const result = await delegate.findUnique(args as any);
  return !!result;
}
// -------------------- Bulk & Aggregate generic wrappers --------------------
/**
 * Generic wrapper for createMany
 */
export async function createManyGeneric<D extends { createMany: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['createMany']>[0],
): Promise<Awaited<ReturnType<D['createMany']>>> {
  return (delegate.createMany as any)(args as any) as any;
}

/**
 * Generic wrapper for updateMany
 */
export async function updateManyGeneric<D extends { updateMany: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['updateMany']>[0],
): Promise<Awaited<ReturnType<D['updateMany']>>> {
  return (delegate.updateMany as any)(args as any) as any;
}

/**
 * Generic wrapper for deleteMany
 */
export async function deleteManyGeneric<D extends { deleteMany: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['deleteMany']>[0],
): Promise<Awaited<ReturnType<D['deleteMany']>>> {
  return (delegate.deleteMany as any)(args as any) as any;
}

/**
 * Generic wrapper for aggregate
 */
export async function aggregateGeneric<D extends { aggregate: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['aggregate']>[0],
): Promise<Awaited<ReturnType<D['aggregate']>>> {
  return (delegate.aggregate as any)(args as any) as any;
}

/**
 * Generic wrapper for groupBy
 */
export async function groupByGeneric<D extends { groupBy: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['groupBy']>[0],
): Promise<Awaited<ReturnType<D['groupBy']>>> {
  return (delegate.groupBy as any)(args as any) as any;
}

// -------------------- Transaction helpers --------------------
/**
 * Run an array of queries as a single transaction.
 */
export async function transactionArray<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
  queries: any[],
  options?: any,
): Promise<T[]> {
  return (prisma as any).$transaction(queries as any, options as any) as Promise<T[]>;
}

/**
 * Run an interactive transaction (function form).
 */
export async function transactionInteractive<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
  fn: (tx: PrismaTransactionClient) => Promise<T>,
  options?: any,
): Promise<T> {
  return (prisma as any).$transaction(
    async (tx: any) => fn(tx as any),
    options as any,
  ) as Promise<T>;
}

/**
 * Run an interactive transaction with retry on transient errors (e.g. P2034).
 * txOptions are passed to prisma.$transaction as the second parameter.
 * retryOptions control retry/backoff behavior.
 */
export async function transactionWithRetry<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
  fn: (tx: PrismaTransactionClient) => Promise<T>,
  txOptions: any = {},
  retryOptions: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    retryIf?: (err: any) => boolean;
  } = {},
): Promise<T> {
  const retryIf = retryOptions.retryIf || ((err: any) => !!(err && err.code === 'P2034'));
  return withRetry(() => (prisma as any).$transaction(fn as any, txOptions as any), {
    maxRetries: retryOptions.maxRetries,
    delay: retryOptions.delay,
    backoff: retryOptions.backoff,
    retryIf,
  });
}

// ==================== SLUG CASE-INSENSITIVE HELPERS ====================

export type SlugCIOptions = {
  select?: any;
  include?: any;
};

/**
 * Case-insensitive slug finder using delegate.findFirst
 * Example usage:
 *   findBySlugCI(prisma.product as any, 'slug', 'My-Slug', { include })
 */
export async function findBySlugCI<D extends { findFirst: (args: any) => Promise<any> }>(
  delegate: D,
  slugField: string,
  slug: string,
  options: SlugCIOptions = {},
): Promise<Awaited<ReturnType<D['findFirst']>>> {
  const args: any = {
    where: {
      [slugField]: { equals: slug, mode: 'insensitive' },
    },
  };
  if (options.include) args.include = options.include;
  else if (options.select) args.select = options.select;

  return delegate.findFirst(args) as any;
}

/**
 * Generic exists via findFirst; returns boolean
 */
export async function existsFirstGeneric<D extends { findFirst: (args: any) => Promise<any> }>(
  delegate: D,
  args: Parameters<D['findFirst']>[0],
): Promise<boolean> {
  const result = await delegate.findFirst(args as any);
  return !!result;
}

/**
 * Generic case-insensitive "contains" search using a model delegate with pagination inputs.
 * Returns raw items and total count so callers can compose their own PaginatedResult.
 */
export async function searchByContainsCI<
  D extends {
    findMany: (args: any) => Promise<any[]>;
    count: (args: any) => Promise<number>;
  },
>(
  delegate: D,
  field: string,
  searchTerm: string,
  options: {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  } = {},
): Promise<{ items: any[]; total: number }> {
  const whereFilter = {
    AND: [options.where || {}, { [field]: { contains: searchTerm, mode: 'insensitive' } }],
  };

  const argsFindMany: any = { where: whereFilter };
  if (options.include) argsFindMany.include = options.include;
  else if (options.select) argsFindMany.select = options.select;
  if (options.orderBy) argsFindMany.orderBy = options.orderBy;
  if (options.skip !== undefined) argsFindMany.skip = options.skip;
  if (options.take !== undefined) argsFindMany.take = options.take;

  const [items, total] = await Promise.all([
    delegate.findMany(argsFindMany as any),
    delegate.count({ where: whereFilter } as any),
  ]);

  return { items: items as any[], total };
}
/**
 * Case-insensitive slug existence using delegate.findFirst
 */
export async function existsBySlugCI<D extends { findFirst: (args: any) => Promise<any> }>(
  delegate: D,
  slugField: string,
  slug: string,
): Promise<boolean> {
  return existsFirstGeneric(delegate, {
    where: {
      [slugField]: { equals: slug, mode: 'insensitive' },
    },
    select: { id: true },
  } as any);
}

/**
 * Case-insensitive update by slug.
 * Finds record by slug (CI) then updates by primary key id to preserve unique selector.
 */
export async function updateBySlugCI<
  D extends {
    findFirst: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
  },
>(
  delegate: D,
  slugField: string,
  slug: string,
  data: any,
  options: SlugCIOptions = {},
): Promise<Awaited<ReturnType<D['update']>>> {
  const found = await delegate.findFirst({
    where: { [slugField]: { equals: slug, mode: 'insensitive' } },
    select: { id: true },
  } as any);

  if (!found) {
    throw new Error(`Record not found for ${slugField} (case-insensitive)`);
  }

  const args: any = {
    where: { id: (found as any).id },
    data,
  };
  if (options.include) args.include = options.include;
  else if (options.select) args.select = options.select;

  return delegate.update(args) as any;
}

/**
 * Case-insensitive delete by slug.
 * Finds record by slug (CI) then deletes by primary key id to preserve unique selector.
 */
export async function deleteBySlugCI<
  D extends {
    findFirst: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  },
>(
  delegate: D,
  slugField: string,
  slug: string,
  options: SlugCIOptions = {},
): Promise<Awaited<ReturnType<D['delete']>>> {
  const found = await delegate.findFirst({
    where: { [slugField]: { equals: slug, mode: 'insensitive' } },
    select: { id: true },
  } as any);

  if (!found) {
    throw new Error(`Record not found for ${slugField} (case-insensitive)`);
  }

  const args: any = {
    where: { id: (found as any).id },
  };
  if (options.include) args.include = options.include;
  else if (options.select) args.select = options.select;

  return delegate.delete(args) as any;
}

/**
 * Generic case-insensitive upsert by arbitrary field.
 * Finds a record via delegate.findFirst using CI equality on the field, then updates by id or creates.
 */
export async function upsertByFieldCI<
  D extends {
    findFirst: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
  },
>(
  delegate: D,
  fieldName: string,
  value: string,
  createData: any,
  updateData: any,
  options: SlugCIOptions = {},
): Promise<Awaited<ReturnType<D['update']> | ReturnType<D['create']>>> {
  const found = await delegate.findFirst({
    where: { [fieldName]: { equals: value, mode: 'insensitive' } },
    select: { id: true },
  } as any);

  if (found) {
    const args: any = {
      where: { id: (found as any).id },
      data: updateData,
    };
    if (options.include) args.include = options.include;
    else if (options.select) args.select = options.select;
    return delegate.update(args) as any;
  }

  const args: any = {
    data: createData,
  };
  if (options.include) args.include = options.include;
  else if (options.select) args.select = options.select;
  return delegate.create(args) as any;
}

/**
 * Case-insensitive upsert by slug convenience wrapper.
 */
export async function upsertBySlugCI<
  D extends {
    findFirst: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
  },
>(
  delegate: D,
  slugField: string,
  slug: string,
  createData: any,
  updateData: any,
  options: SlugCIOptions = {},
): Promise<Awaited<ReturnType<D['update']> | ReturnType<D['create']>>> {
  return upsertByFieldCI(delegate, slugField, slug, createData, updateData, options);
}
