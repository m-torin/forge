import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from './generated/client';

// Create the extended Prisma client type
const createExtendedPrismaClient = () => {
  return new PrismaClient().$extends(withAccelerate());
};

type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;

// Global type for Prisma client singleton
const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient };

// Create a singleton instance of the Prisma client
export const prismaClientSingleton = () => {
  return createExtendedPrismaClient();
};

// Export the Prisma client singleton
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
