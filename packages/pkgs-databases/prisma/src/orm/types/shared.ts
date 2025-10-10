import type { PrismaClient } from '../../../generated/client/client';
export type { Prisma as PrismaNamespace } from '@repo/db-prisma/client';

export type { PaginatedResult, PaginationOptions, PrismaTransactionClient } from '../types';

// Re-export PrismaClient for convenience
export type { PrismaClient };

// Union type that accepts both base and extended clients (permissive to allow any Prisma client variant)
export type AnyPrismaClient = any;
