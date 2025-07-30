import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const createPrismaClient = () => {
  return new PrismaClient();
};

// Use global caching for regular server-side code
const prismaGlobal = globalThis as GlobalWithPrisma;
export const prisma = prismaGlobal.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma;
}

export default prisma;
