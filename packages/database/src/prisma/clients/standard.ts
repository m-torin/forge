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

// Global type for Prisma client singleton
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

/**
 * Create a singleton instance of the standard Prisma client
 * Ensures only one connection pool is created per application
 */
export const prismaClientSingleton = () => {
  return new PrismaClient();
};

/**
 * Standard Prisma client singleton instance
 * Use this for all database operations in server environments
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
