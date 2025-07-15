// Edge-compatible Prisma Client for edge runtime environments
// Supports Vercel Edge Functions, Cloudflare Workers, and other edge runtimes

// Type imports only - no runtime imports to avoid bundling cloudflare modules
type EdgePrismaClient = any; // Will be properly typed when loaded

// Global type for edge Prisma client singleton
const globalForEdgePrisma = global as unknown as {
  edgePrisma?: EdgePrismaClient;
};

// Lazy-loaded edge Prisma client creation
export const edgePrismaClientSingleton = async (connectionString?: string) => {
  const dbUrl = connectionString ?? process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required for edge client');
  }

  // Lazy load the modules to avoid bundling in Next.js
  const [{ PrismaPg }, { PrismaClient }] = await Promise.all([
    import('@prisma/adapter-pg'),
    import('../../../prisma-generated/client/edge'),
  ]);

  // Create adapter for traditional PostgreSQL
  const adapter = new PrismaPg({ connectionString: dbUrl });

  // Return PrismaClient with adapter
  return new PrismaClient({ adapter });
};

// Lazy-loaded edge Prisma client singleton getter
export const getEdgePrisma = async (): Promise<EdgePrismaClient> => {
  globalForEdgePrisma.edgePrisma ??= await edgePrismaClientSingleton();
  return globalForEdgePrisma.edgePrisma;
};

// For backward compatibility - this will be undefined initially and loaded on demand
export const edgePrisma = globalForEdgePrisma.edgePrisma;

// Helper function to create edge client with custom connection string
export const createEdgePrismaClient = async (
  connectionString: string,
): Promise<EdgePrismaClient> => {
  return await edgePrismaClientSingleton(connectionString);
};

// Type exports
export type { EdgePrismaClient };
