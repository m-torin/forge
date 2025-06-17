// Prisma Client with Accelerate extension for enhanced performance
// Supports both standard and edge runtimes with connection pooling
// All imports are lazy-loaded to avoid bundling cloudflare modules in Next.js

// Detect if we're in an edge runtime environment
const isEdgeRuntime = (): boolean => {
  return (
    (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) ||
    (typeof process !== 'undefined' &&
      process.env.VERCEL_REGION !== undefined &&
      process.env.NEXT_RUNTIME === 'edge')
  );
};

// Create accelerated client based on runtime environment with lazy loading
const createAcceleratedPrismaClientInternal = async (connectionString?: string) => {
  const dbUrl = connectionString ?? process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required for accelerated client');
  }

  if (isEdgeRuntime()) {
    // Edge runtime: lazy load edge client with adapter + accelerate
    const [{ PrismaPg }, { PrismaClient }, { withAccelerate }] = await Promise.all([
      import('@prisma/adapter-pg'),
      import('../../prisma-generated/client/edge'),
      import('@prisma/extension-accelerate'),
    ]);
    const adapter = new PrismaPg({ connectionString: dbUrl });
    return new PrismaClient({ adapter }).$extends(withAccelerate());
  } else {
    // Standard runtime: lazy load standard client + accelerate
    const [{ PrismaClient }, { withAccelerate }] = await Promise.all([
      import('../../prisma-generated/client'),
      import('@prisma/extension-accelerate'),
    ]);
    return new PrismaClient().$extends(withAccelerate());
  }
};

type AcceleratedPrismaClient = any; // Will be properly typed when loaded

// Global type for accelerated Prisma client singleton
const globalForAcceleratedPrisma = global as unknown as {
  acceleratedPrisma?: AcceleratedPrismaClient;
};

// Create a singleton instance of the accelerated Prisma client
export const acceleratedPrismaClientSingleton = async (connectionString?: string) => {
  return await createAcceleratedPrismaClientInternal(connectionString);
};

// Lazy-loaded accelerated Prisma client singleton getter
export const getAcceleratedPrisma = async (_: any): Promise<AcceleratedPrismaClient> => {
  globalForAcceleratedPrisma.acceleratedPrisma ??= await acceleratedPrismaClientSingleton();
  return globalForAcceleratedPrisma.acceleratedPrisma;
};

// For backward compatibility - this will be undefined initially and loaded on demand
export const acceleratedPrisma = globalForAcceleratedPrisma.acceleratedPrisma;

// Helper function to create accelerated client with custom connection string
export const createAcceleratedPrismaClient = async (
  connectionString: string,
): Promise<AcceleratedPrismaClient> => {
  return await acceleratedPrismaClientSingleton(connectionString);
};

// Utility to check current runtime
export const getClientRuntime = (): 'edge' | 'standard' => {
  return isEdgeRuntime() ? 'edge' : 'standard';
};

// Type exports
export type { AcceleratedPrismaClient };
