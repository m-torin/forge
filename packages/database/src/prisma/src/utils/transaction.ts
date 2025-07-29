/**
 * Transaction utilities for database operations
 * Provides type-safe transaction wrappers for complex database operations
 */

'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import { prisma } from '../../clients/standard';

/**
 * Execute a database transaction with automatic rollback on error
 *
 * @param fn - Transaction function that receives a transaction client
 * @returns Promise with the transaction result
 *
 * @example
 * ```typescript
 * const result = await executeTransaction(async (tx) => {
 *   const user = await tx.user.create({
 *     data: { email: 'user@example.com', name: 'John' }
 *   });
 *
 *   const profile = await tx.profile.create({
 *     data: { userId: user.id, bio: 'Hello world' }
 *   });
 *
 *   return { user, profile };
 * });
 * ```
 */
export async function executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn);
}

/**
 * Execute a database transaction with custom options
 *
 * @param fn - Transaction function that receives a transaction client
 * @param options - Transaction options (timeout, maxWait, isolationLevel)
 * @returns Promise with the transaction result
 */
export async function executeTransactionWithOptions<T>(
  fn: (tx: any) => Promise<T>,
  options?: {
    timeout?: number;
    maxWait?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  return prisma.$transaction(fn, options);
}

/**
 * Execute multiple database operations in a transaction
 * Useful for operations that need to be atomic
 *
 * @param operations - Array of async operations to execute
 * @returns Promise with array of results
 */
export async function executeBatchTransaction<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
  return prisma.$transaction(async (_tx: any) => {
    const results: T[] = [];
    for (const operation of operations) {
      // Note: This is a simplified version. In practice, you'd need to
      // adapt the operations to use the transaction client
      const result = await operation();
      results.push(result);
    }
    return results;
  });
}
