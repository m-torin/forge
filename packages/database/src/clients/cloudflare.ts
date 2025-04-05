import { PrismaClient, Prisma } from "../../generated/client-cloudflare";

const prismaClientOptions = {
  log: ["error"] as ("query" | "info" | "warn" | "error")[],
} satisfies Prisma.PrismaClientOptions;

const prisma = new PrismaClient(prismaClientOptions);

function createPrismaClient(options = {}) {
  return new PrismaClient({
    ...prismaClientOptions,
    ...options,
  });
}

export { Prisma, PrismaClient, prisma, createPrismaClient };
export type * from "../../generated/client-cloudflare";

/**
 * IMPORTANT NOTES FOR CLOUDFLARE WORKERS RUNTIME:
 *
 * 1. This client requires Prisma 5.11.0 or later
 * 2. Your database must be accessible via HTTP (not direct TCP)
 *    - Use Prisma Accelerate: https://www.prisma.io/data-platform/accelerate
 *    - Use Neon Serverless Driver: https://neon.tech
 *    - Or another HTTP-compatible database service
 * 3. For Prisma Accelerate, set the env var: DATABASE_URL=prisma://...
 * 4. Bundle size is limited in Workers environment
 * 5. Not all Prisma features are available in Cloudflare Workers
 */
