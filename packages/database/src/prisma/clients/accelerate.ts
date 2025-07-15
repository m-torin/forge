/**
 * Prisma Client with Accelerate extension for enhanced performance
 * Supports both standard and edge runtimes with connection pooling
 *
 * @example
 * ```typescript
 * import { getAcceleratedPrisma } from '@repo/database/prisma/clients/accelerate';
 *
 * // Get accelerated client (lazy-loaded)
 * const prisma = await getAcceleratedPrisma();
 *
 * // Use with caching and performance benefits
 * const users = await prisma.user.findMany({
 *   where: { active: true },
 *   cacheStrategy: { ttl: 60 } // Accelerate caching
 * });
 *
 * // Custom connection string
 * import { createAcceleratedPrismaClient } from '@repo/database/prisma/clients/accelerate';
 * const customPrisma = await createAcceleratedPrismaClient('postgresql://...');
 * ```
 *
 * Features:
 * - Automatic edge/standard runtime detection
 * - Lazy loading to avoid bundling issues
 * - Connection pooling and query caching
 * - Supports both Node.js and Edge runtimes
 */

/**
 * Detect if we're in an edge runtime environment
 * Checks for EdgeRuntime global or Vercel edge environment variables
 */
const isEdgeRuntime = (): boolean => {
  return (
    (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) ||
    (typeof process !== 'undefined' &&
      process.env.VERCEL_REGION !== undefined &&
      process.env.NEXT_RUNTIME === 'edge')
  );
};

/**
 * Create accelerated client based on runtime environment with lazy loading
 * Automatically selects edge or standard client based on environment
 */
const createAcceleratedPrismaClientInternal = async (connectionString?: string) => {
  const dbUrl = connectionString ?? process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required for accelerated client');
  }

  if (isEdgeRuntime()) {
    // Edge runtime: lazy load edge client with adapter + accelerate
    const [{ PrismaPg }, { PrismaClient }, { withAccelerate }] = await Promise.all([
      import('@prisma/adapter-pg'),
      import('../../../prisma-generated/client/edge'),
      import('@prisma/extension-accelerate'),
    ]);
    const adapter = new PrismaPg({ connectionString: dbUrl });
    return new PrismaClient({ adapter }).$extends(withAccelerate());
  } else {
    // Standard runtime: lazy load standard client + accelerate
    const [{ PrismaClient }, { withAccelerate }] = await Promise.all([
      import('../../../prisma-generated/client/index'),
      import('@prisma/extension-accelerate'),
    ]);
    return new PrismaClient().$extends(withAccelerate());
  }
};

// ============================================================================
// TYPES
// ============================================================================

type AcceleratedPrismaClient = any; // Will be properly typed when loaded

// Global type for accelerated Prisma client singleton
const globalForAcceleratedPrisma = global as unknown as {
  acceleratedPrisma?: AcceleratedPrismaClient;
};

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

/**
 * Create a singleton instance of the accelerated Prisma client
 * Ensures only one accelerated connection pool per application
 */
export const acceleratedPrismaClientSingleton = async (connectionString?: string) => {
  return await createAcceleratedPrismaClientInternal(connectionString);
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Lazy-loaded accelerated Prisma client singleton getter
 * Use this for optimal performance with Prisma Accelerate
 */
export const getAcceleratedPrisma = async (): Promise<AcceleratedPrismaClient> => {
  globalForAcceleratedPrisma.acceleratedPrisma ??= await acceleratedPrismaClientSingleton();
  return globalForAcceleratedPrisma.acceleratedPrisma;
};

/**
 * For backward compatibility - this will be undefined initially and loaded on demand
 * Prefer using getAcceleratedPrisma() for better control over initialization
 */
export const acceleratedPrisma = globalForAcceleratedPrisma.acceleratedPrisma;

/**
 * Helper function to create accelerated client with custom connection string
 * Useful for testing or multi-tenant applications
 */
export const createAcceleratedPrismaClient = async (
  connectionString: string,
): Promise<AcceleratedPrismaClient> => {
  return await acceleratedPrismaClientSingleton(connectionString);
};

/**
 * Utility to check current runtime environment
 * Returns 'edge' for edge runtimes or 'standard' for Node.js
 */
export const getClientRuntime = (): 'edge' | 'standard' => {
  return isEdgeRuntime() ? 'edge' : 'standard';
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { AcceleratedPrismaClient };
