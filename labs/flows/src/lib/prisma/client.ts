import { PrismaClient } from '@prisma/client';
import { logWarn } from '@repo/observability';
import { env } from '../../../env';

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

class NoOpPrismaClient {
  // Create a no-op client that returns empty results for all operations
  flow = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
  };
  tag = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
  };
  node = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
  };
  edge = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
  };
  instance = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
  };
  user = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
  };
  tagGroup = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
  };
  secret = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
  };
  auditLog = {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
  };
  flowEvent = {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
  };
  flowRun = {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
  };
  $transaction = async (_fn: any) => {
    logWarn('[Flows] Transaction attempted with no database - returning null');
    return null;
  };
}

const createPrismaClient = (): PrismaClient => {
  // Follow CLAUDE.md guidance: packages should return fallbacks, not throw
  if (!env.PRISMA_DB_URL && !env.DATABASE_URL) {
    logWarn('[Flows] No database URL configured - using no-op client');
    return new NoOpPrismaClient() as unknown as PrismaClient;
  }
  return new PrismaClient();
};

// Use global caching for regular server-side code
const prismaGlobal = globalThis as GlobalWithPrisma;
export const prisma = prismaGlobal.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma;
}

export default prisma;
