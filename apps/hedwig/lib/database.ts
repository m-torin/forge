// Database client configuration for Hedwig
// API routes run on server, so this should work with proper imports

import { PrismaClient } from '../generated/client';

// Global type for Prisma client singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a singleton instance of the Prisma client
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Export the Prisma client singleton
export const database = globalForPrisma.prisma || prismaClientSingleton();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = database;
}

// Re-export commonly used types
export type {
  AssetType,
  BarcodeType,
  Product,
  ProductAsset,
  ProductBarcode,
  ProductStatus,
  ScanHistory,
  User,
} from '../generated/client';