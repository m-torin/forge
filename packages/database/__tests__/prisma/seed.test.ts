import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock sub-seed modules
vi.mock('#/prisma/src/seed/seed-auth', () => ({
  seedAuth: vi.fn().mockResolvedValue(undefined),
}));

// Mock PrismaClient
vi.mock('#/prisma-generated/client', () => {
  return {
    PrismaClient: vi.fn(() => ({
      user: {
        count: vi.fn(),
      },
      organization: {
        count: vi.fn(),
      },
      $disconnect: vi.fn(),
    })),
  };
});

// Import after mocks
import * as seedAuthModule from '#/prisma/src/seed/seed-auth';

// Import the main function from seed.ts
import { main as seedMain } from '#/prisma/src/seed/seed';

const getMockPrismaClient = () => {
  const { PrismaClient } = require('../../../../prisma-generated/client');
  return new PrismaClient();
};

describe('main seed entrypoint (seed.ts)', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockPrisma: any;

  beforeEach(() => {
    originalEnv = { ...process.env };
    mockPrisma = getMockPrismaClient();
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('runs auth seed', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.organization.count.mockResolvedValue(0);
    await seedMain();
    expect(seedAuthModule.seedAuth).toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    mockPrisma.user.count.mockRejectedValue(new Error('Count error'));
    await expect(seedMain()).resolves.toBeUndefined();
  });

  it('always calls seedAuth regardless of existing data', async () => {
    const userCounts = [0, 1, 5, 10, 100];
    const orgCounts = [0, 1, 5, 10, 100];

    for (const userCount of userCounts) {
      for (const orgCount of orgCounts) {
        mockPrisma.user.count.mockResolvedValue(userCount);
        mockPrisma.organization.count.mockResolvedValue(orgCount);
        await seedMain();
        expect(seedAuthModule.seedAuth).toHaveBeenCalled();
        vi.clearAllMocks();
      }
    }
  });

  it('disconnects from database after completion', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.organization.count.mockResolvedValue(0);
    await seedMain();
    expect(mockPrisma.$disconnect).toHaveBeenCalled();
  });

  it('handles database connection errors', async () => {
    mockPrisma.user.count.mockRejectedValue(new Error('Connection failed'));
    await expect(seedMain()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('handles individual seed function errors gracefully', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.organization.count.mockResolvedValue(0);
    (seedAuthModule.seedAuth as any).mockRejectedValue(new Error('Auth seed failed'));

    await expect(seedMain()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('logs progress during seeding', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.organization.count.mockResolvedValue(0);
    await seedMain();
    expect(console.log).toHaveBeenCalled();
  });

  it('validates database state before seeding', async () => {
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.organization.count.mockResolvedValue(0);

    await seedMain();

    // Verify that count was called to check database state
    expect(mockPrisma.user.count).toHaveBeenCalled();
    expect(mockPrisma.organization.count).toHaveBeenCalled();
  });
});
