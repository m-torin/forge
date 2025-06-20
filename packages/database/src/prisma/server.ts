/**
 * Database exports for server-side environments (non-Next.js)
 * Use this in Node.js applications, workers, and standalone server environments.
 *
 * For Next.js applications, use '@repo/database-new/prisma/server/next' instead.
 */

// Export standard Prisma client directly
export { prisma, prismaClientSingleton } from './clients/standard';
export type { PrismaClient } from './clients/standard';

// Re-export from the generated Prisma client
export * from '../../prisma-generated/client';

// Export observability utilities (server-only)
export * as observability from './src/observability';

// Export ORM functions
export * from './src/orm';
