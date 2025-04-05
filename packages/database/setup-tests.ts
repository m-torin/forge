import { vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock @neondatabase/serverless
vi.mock("@neondatabase/serverless", () => ({
  neonConfig: {
    webSocketConstructor: null,
  },
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    end: vi.fn(),
    query: vi.fn(),
  })),
}));

// Mock @prisma/adapter-neon
vi.mock("@prisma/adapter-neon", () => ({
  PrismaNeon: vi.fn().mockImplementation(() => ({
    executeRaw: vi.fn(),
    // Mock adapter methods
    queryRaw: vi.fn(),
  })),
}));

// Mock PrismaClient
vi.mock("./generated/client", () => {
  const mockPrismaClient = vi.fn().mockImplementation(() => ({
    // Mock common Prisma methods
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $transaction: vi.fn().mockImplementation((callback) => callback({})),
    // Add other model methods as needed
    user: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    // Add other models as needed
  }));

  return {
    PrismaClient: mockPrismaClient,
  };
});

// Mock ws
vi.mock("ws", () => {
  return { default: vi.fn() };
});

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi.fn().mockImplementation(({ runtimeEnv, server }) => {
    // Simple implementation that validates DATABASE_URL
    if (!runtimeEnv.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    if (runtimeEnv.DATABASE_URL === "not-a-url") {
      throw new Error("DATABASE_URL must be a valid URL");
    }

    if (runtimeEnv.DATABASE_URL === "") {
      throw new Error("DATABASE_URL must not be empty");
    }

    return runtimeEnv;
  }),
}));

// Mock environment variables
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/test";
