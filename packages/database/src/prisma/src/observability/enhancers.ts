import { createLogConfiguration, createQueryMiddleware, setupEventListeners } from './middleware';

import { PrismaClient } from '../../../../prisma-generated/client';

/**
 * Factory function to create an accelerated Prisma client with observability
 * @param baseClient - Base PrismaClient instance
 * @param accelerateExtension - Accelerate extension function
 * @returns Enhanced accelerated PrismaClient instance
 */
export function createAcceleratedClientWithObservability<T extends PrismaClient>(
  baseClient: T,
  accelerateExtension: any,
) {
  const enhancedClient = withObservability(baseClient);
  return enhancedClient.$extends(accelerateExtension);
}

/**
 * Factory function to create an edge Prisma client with observability
 * @param connectionString - Database connection string
 * @param adapter - Database adapter for edge runtime
 * @returns Enhanced edge PrismaClient instance
 */
export async function createEdgeClientWithObservability(connectionString: string, adapter: any) {
  const { PrismaClient } = await import('../../../../prisma-generated/client/edge');
  const client = new PrismaClient({
    adapter,
    ...createObservabilityConfig(),
  });
  return withObservability(client);
}

/**
 * Creates observability-enhanced configuration for PrismaClient constructor
 * @returns Configuration object with logging setup
 */
export function createObservabilityConfig() {
  return {
    log: createLogConfiguration(),
  };
}

/**
 * Factory function to create a standard Prisma client with observability
 * @returns Enhanced PrismaClient instance
 */
export async function createStandardClientWithObservability() {
  const { PrismaClient } = await import('../../../../prisma-generated/client');
  const client = new PrismaClient(createObservabilityConfig());
  return withObservability(client);
}

/**
 * Enhances a Prisma client with observability features
 * @param client - The Prisma client instance to enhance
 * @returns The enhanced client with observability
 */
export function withObservability<T extends PrismaClient>(client: T): T {
  // Add query middleware for observability
  client.$use(createQueryMiddleware());

  // Setup event listeners for database events
  setupEventListeners(client);

  return client;
}
