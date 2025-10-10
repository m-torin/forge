/**
 * Prisma client for auth package
 * Uses @repo/db-prisma client directly for better-auth compatibility
 */

import { PrismaClient } from '@repo/db-prisma/client';

// Global type for development hot-reload
const globalForPrisma = global as unknown as { authPrisma?: PrismaClient };

/**
 * Create a singleton instance of the Prisma client for auth
 * Uses direct client instantiation for ESM compatibility
 */
function createAuthPrismaClient() {
  try {
    // Create client with environment-based connection
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('[Auth Prisma] Failed to create client:', error);
    throw new Error('Failed to initialize Prisma client for auth');
  }
}

/**
 * Auth Prisma client singleton instance
 * Used by better-auth and auth server actions
 */
export const prisma = globalForPrisma.authPrisma ?? createAuthPrismaClient();

// In development, attach to global to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.authPrisma = prisma;
}

// Also export as getPrisma for async usage patterns
export const getPrisma = () => prisma;
