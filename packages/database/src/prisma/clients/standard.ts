/**
 * Standard Prisma Client for server-side usage
 * Provides singleton instance with development hot-reload support
 *
 * @example
 * ```typescript
 * import { prisma } from '@repo/database/prisma/clients/standard';
 *
 * // Basic query
 * const users = await prisma.user.findMany({
 *   where: { active: true },
 *   include: { profile: true }
 * });
 *
 * // Transaction example
 * const result = await prisma.$transaction(async (tx) => {
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

import { PrismaClient } from '../../../prisma-generated/client';
import { validationExtension } from '../extensions';

// Create the extended client type
type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

// Global type for Prisma client singleton with validation extension
const globalForPrisma = global as unknown as { prisma?: ExtendedPrismaClient };

/**
 * Create a singleton instance of the standard Prisma client with validation extension
 * Ensures only one connection pool is created per application
 * Includes runtime validation for data integrity
 */
export function prismaClientSingleton() {
  return new PrismaClient().$extends(validationExtension);
}

/**
 * Standard Prisma client singleton instance with validation
 * Use this for all database operations in server environments
 * Automatically validates data on create/update/upsert operations
 */
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, attach to global to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { PrismaClient } from '../../../prisma-generated/client';
export type { ExtendedPrismaClient };
