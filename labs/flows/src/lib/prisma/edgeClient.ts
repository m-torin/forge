import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

type _GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const createDriver = () => {
  const connectionString = process.env.PRISMA_DB_URL;
  return new Pool({ connectionString });
};

export const createPrismaClient = () => {
  const neon = createDriver();
  // Always use edge configuration in middleware
  return new PrismaClient({
    // @ts-ignore Preview feature not yet in types
    adapter: new PrismaNeon(neon),
  });
};

// Don't use global caching in middleware
export const prismaEdge = createPrismaClient();

export default prismaEdge;
