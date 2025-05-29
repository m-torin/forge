import 'server-only';
import { prisma } from './client';
import { PrismaAdapter } from './adapter';

// Export the Prisma client for direct access
export { prisma };

// Export the PrismaAdapter for internal use
export { PrismaAdapter };

// Re-export types from Prisma client
export * from '../generated/client';

// Export a function to create a new adapter instance
export function createPrismaAdapter(): PrismaAdapter {
  return new PrismaAdapter();
}
