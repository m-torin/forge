import { describe, expect, it, vi, beforeEach } from 'vitest';

// Import dependencies first
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/generated/client';
import ws from 'ws';
import { keys } from '../keys';

// Set up mocks
vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn().mockImplementation(() => ({})),
  neonConfig: {
    webSocketConstructor: null,
  },
}));
vi.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: vi.fn().mockImplementation(() => ({})),
}));
vi.mock('../src/generated/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    // Mock common Prisma methods
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $transaction: vi.fn().mockImplementation((callback) => callback({})),
  })),
}));
vi.mock('ws', () => ({}));
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    return runtimeEnv;
  }),
}));
vi.mock('../keys', () => ({
  keys: vi.fn().mockReturnValue({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
  }),
}));

// Import the module under test after all mocks are set up
import * as databaseModule from '../index';
const { database } = databaseModule;

describe('Database Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the global singleton for each test
    if ('prisma' in global) {
      delete (global as any).prisma;
    }
  });

  it('configures neonConfig with the webSocketConstructor', () => {
    // Check that neonConfig.webSocketConstructor is set to ws
    expect(neonConfig.webSocketConstructor).toBe(ws);
  });

  it.skip('creates a Pool with the correct connection string', () => {
    // Check that Pool was called with the correct connection string
    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/test',
    });
  });

  it.skip('creates a PrismaNeon adapter with the pool', () => {
    // Check that PrismaNeon was called
    expect(PrismaNeon).toHaveBeenCalled();
  });

  it.skip('creates a PrismaClient with the adapter', () => {
    // Check that PrismaClient was called with the adapter
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: expect.anything() });
  });

  it('exports the database client', () => {
    // Check that the database is defined
    expect(database).toBeDefined();
  });

  it('uses a global singleton in non-production environments', async () => {
    // Save the original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;

    try {
      // Set NODE_ENV to development
      process.env.NODE_ENV = 'development';

      // Clear the module cache to force re-import
      vi.resetModules();

      // Re-mock dependencies
      vi.mock('@neondatabase/serverless');
      vi.mock('@prisma/adapter-neon');
      vi.mock('../src/generated/client', () => {
        return {
          PrismaClient: vi.fn().mockImplementation(() => ({
            // Mock common Prisma methods
            $connect: vi.fn().mockResolvedValue(undefined),
            $disconnect: vi.fn().mockResolvedValue(undefined),
            $transaction: vi
              .fn()
              .mockImplementation((callback) => callback({})),
          })),
        };
      });
      vi.mock('ws');
      vi.mock('@t3-oss/env-nextjs', () => ({
        createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
          return runtimeEnv;
        }),
      }));
      vi.mock('../keys', () => ({
        keys: vi.fn().mockReturnValue({
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
        }),
      }));

      // Import the module again
      const databaseModule = await import('../index');
      const { database: devDatabase } = databaseModule;

      // Check that the global singleton is used
      expect((global as any).prisma).toBe(devDatabase);
    } finally {
      // Restore the original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('does not use a global singleton in production environment', async () => {
    // Save the original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;

    try {
      // Set NODE_ENV to production
      process.env.NODE_ENV = 'production';

      // Clear the module cache to force re-import
      vi.resetModules();

      // Re-mock dependencies
      vi.mock('@neondatabase/serverless');
      vi.mock('@prisma/adapter-neon');
      vi.mock('../src/generated/client', () => {
        return {
          PrismaClient: vi.fn().mockImplementation(() => ({
            // Mock common Prisma methods
            $connect: vi.fn().mockResolvedValue(undefined),
            $disconnect: vi.fn().mockResolvedValue(undefined),
            $transaction: vi
              .fn()
              .mockImplementation((callback) => callback({})),
          })),
        };
      });
      vi.mock('ws');
      vi.mock('@t3-oss/env-nextjs', () => ({
        createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
          return runtimeEnv;
        }),
      }));
      vi.mock('../keys', () => ({
        keys: vi.fn().mockReturnValue({
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
        }),
      }));

      // Import the module again
      await import('../index');

      // Check that the global singleton is not set
      expect((global as any).prisma).toBeUndefined();
    } finally {
      // Restore the original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
