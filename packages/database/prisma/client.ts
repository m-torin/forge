import { PrismaClient } from '../generated/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Global type for Prisma client singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a singleton instance of the Prisma client
export const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

// Export the Prisma client singleton
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
