// Standard Prisma Client for server-side usage
import { PrismaClient } from '../../prisma-generated/client';

// Global type for Prisma client singleton
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Create a singleton instance of the standard Prisma client
export const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Export the standard Prisma client singleton
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Type exports
export type { PrismaClient } from '../../prisma-generated/client';
