import { PrismaClient, Prisma } from "../../generated/client-node";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientOptions = {
  ...(process.env.DATABASE_URL?.startsWith("postgresql://") && {
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?pgbouncer=true&connection_limit=10&pool_timeout=5`,
      },
    },
  }),
};

const prisma = global.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

function createPrismaClient(options = {}) {
  return new PrismaClient({
    ...options,
  });
}

export { prisma, createPrismaClient, Prisma, PrismaClient };
export type * from "../../generated/client-node";
