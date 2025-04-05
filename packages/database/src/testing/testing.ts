/**
 * Database Testing Utilities
 *
 * Provides Prismock client implementation and testing utilities
 */
import { beforeEach, afterEach, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { PrismockClient } from "prismock";

// Helper for creating a prismock client
export function createPrismockClient() {
  return new PrismockClient({
    prismaSchemaPath: "./prisma/schema.prisma",
  });
}

// Global instances for tests
export let prismock: ReturnType<typeof createPrismockClient>;
export let txClient: ReturnType<typeof createPrismockClient>;

// Setup the prismock testing environment
export function setupPrismockTests() {
  beforeEach(() => {
    prismock = createPrismockClient();
    txClient = prismock;

    // Set up transaction support
    prismock.$transaction = async (callback: (tx: any) => Promise<any>) => {
      return await callback(txClient);
    };
  });

  afterEach(async () => {
    if (prismock) {
      await clearAllData(prismock);
    }
  });
}

// Clean all data between tests
export async function clearAllData(
  client: ReturnType<typeof createPrismockClient>,
) {
  try {
    await client.session?.deleteMany({});
    await client.account?.deleteMany({});
    await client.authenticator?.deleteMany({});
    await client.verificationToken?.deleteMany({});
    await client.user?.deleteMany({});
  } catch (error) {
    console.warn("Error clearing data:", error);
  }
}

// Create a mocked PrismaClient for non-database tests
export function createMockPrismaClient() {
  return mockDeep<PrismaClient>();
}

// Utility for generating random IDs
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 7);
}

// Create multiple related records
export async function createManyRelated<T>(
  countFn: () => number,
  createFn: () => Promise<T>,
): Promise<T[]> {
  const count = countFn();
  const results: T[] = [];
  for (let i = 0; i < count; i++) {
    results.push(await createFn());
  }
  return results;
}

// Build an include object for Prisma queries
export function buildIncludeObject(
  options: Record<string, boolean | object | undefined>,
): object | undefined {
  const include: Record<string, boolean | object> = {};
  let hasIncludes = false;
  for (const key in options) {
    const value = options[key];
    if (value === true) {
      include[key] = true;
      hasIncludes = true;
    } else if (typeof value === "object" && value !== null) {
      include[key] = value;
      hasIncludes = true;
    }
  }
  return hasIncludes ? include : undefined;
}
