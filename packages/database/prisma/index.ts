// Export standard Prisma client directly
export { prisma, prismaClientSingleton } from './clients/standard';
export type { PrismaClient } from './clients/standard';

// Re-export from the generated Prisma client
export * from '../prisma-generated/client';

// Export observability utilities (server-only)
export * as observability from './observability';

// Export server actions
export * from './src/actions';

// Export ORM functions
export * from './src/orm';
