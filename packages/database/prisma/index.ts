import { PrismaAdapter } from './adapter';

// Re-export everything from the generated client
export * from './generated/client';

// Export our custom adapter and client
export { PrismaAdapter } from './adapter';
export { prisma, prismaClientSingleton } from './client';

// Export ORM functions
export * as orm from './orm/index';

// Export a function to create a new adapter instance
export function createPrismaAdapter(): PrismaAdapter {
  return new PrismaAdapter();
}
