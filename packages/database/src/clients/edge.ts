import { PrismaClient, Prisma } from "../../generated/client-vercel";

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
export type * from "../../generated/client-vercel";

/**
 * IMPORTANT NOTES FOR EDGE RUNTIME:
 *
 * 1. This client requires Prisma 5.11.0 or later
 * 2. Your database must be accessible via HTTP (not direct TCP)
 *    - Use Prisma Accelerate: https://www.prisma.io/data-platform/accelerate
 *    - Use Neon Serverless Driver: https://neon.tech
 *    - Or another HTTP-compatible database service
 * 3. For Prisma Accelerate, set the env var: DATABASE_URL=prisma://...
 * 4. Bundle size is limited to ~4MB in Edge runtime
 * 5. Not all Prisma features are available in Edge
 *
 * Configure in next.config.mjs:
 * ```
 * experimental: {
 *   serverComponentsExternalPackages: ['@prisma/client/edge'],
 * }
 * ```
 */
