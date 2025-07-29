import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock sub-seed modules
vi.mock('@/prisma/src/seed/seed-auth', () => ({
  seedAuth: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/prisma/src/seed/seed-products', () => ({
  seedProducts: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/prisma/src/seed/seed-ecommerce', () => ({
  seedEcommerce: vi.fn().mockResolvedValue(undefined),
}));

// We'll dynamically import seed-faker-extended only if needed
const seedFakerExtendedMock = vi.fn();
vi.mock('@/prisma/src/seed/seed-faker-extended', () => ({
  seedFakerExtended: seedFakerExtendedMock,
}));

// Mock PrismaClient
vi.mock('@/prisma-generated/client', () => {
  return {
    PrismaClient: vi.fn(() => ({
      product: {
        count: vi.fn(),
      },
      $disconnect: vi.fn(),
    })),
  };
});

// Import after mocks
import * as seedAuthModule from '@/prisma/src/seed/seed-auth';
import * as seedEcommerceModule from '@/prisma/src/seed/seed-ecommerce';
import * as seedProductsModule from '@/prisma/src/seed/seed-products';

// Import the main function from seed.ts
import { main as seedMain } from '@/prisma/src/seed/seed';

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

  it('runs all seeds if no products exist', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    process.env.SEED_EXTENDED = undefined;
    await seedMain();
    expect(seedAuthModule.seedAuth).toHaveBeenCalled();
    expect(seedProductsModule.seedProducts).toHaveBeenCalled();
    expect(seedEcommerceModule.seedEcommerce).toHaveBeenCalled();
    expect(seedFakerExtendedMock).not.toHaveBeenCalled();
  });

  it('runs extended faker seed if SEED_EXTENDED is true', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    process.env.SEED_EXTENDED = 'true';
    await seedMain();
    expect(seedFakerExtendedMock).toHaveBeenCalled();
  });

  it('skips product seeding if products exist', async () => {
    mockPrisma.product.count.mockResolvedValue(5);
    await seedMain();
    expect(seedProductsModule.seedProducts).not.toHaveBeenCalled();
    expect(seedEcommerceModule.seedEcommerce).not.toHaveBeenCalled();
    // Should still call seedAuth
    expect(seedAuthModule.seedAuth).toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    mockPrisma.product.count.mockRejectedValue(new Error('Count error'));
    await expect(seedMain()).resolves.toBeUndefined();
  });

  // Enhanced test coverage
  it('handles different SEED_EXTENDED values', async () => {
    mockPrisma.product.count.mockResolvedValue(0);

    // Test with 'true' (string)
    process.env.SEED_EXTENDED = 'true';
    await seedMain();
    expect(seedFakerExtendedMock).toHaveBeenCalled();

    vi.clearAllMocks();

    // Test with '1' (string)
    process.env.SEED_EXTENDED = '1';
    await seedMain();
    expect(seedFakerExtendedMock).toHaveBeenCalled();

    vi.clearAllMocks();

    // Test with 'false' (string)
    process.env.SEED_EXTENDED = 'false';
    await seedMain();
    expect(seedFakerExtendedMock).not.toHaveBeenCalled();

    vi.clearAllMocks();

    // Test with '0' (string)
    process.env.SEED_EXTENDED = '0';
    await seedMain();
    expect(seedFakerExtendedMock).not.toHaveBeenCalled();
  });

  it('handles edge case product counts', async () => {
    // Test with exactly 1 product
    mockPrisma.product.count.mockResolvedValue(1);
    await seedMain();
    expect(seedProductsModule.seedProducts).not.toHaveBeenCalled();
    expect(seedEcommerceModule.seedEcommerce).not.toHaveBeenCalled();

    vi.clearAllMocks();

    // Test with large number of products
    mockPrisma.product.count.mockResolvedValue(1000);
    await seedMain();
    expect(seedProductsModule.seedProducts).not.toHaveBeenCalled();
    expect(seedEcommerceModule.seedEcommerce).not.toHaveBeenCalled();
  });

  it('always calls seedAuth regardless of product count', async () => {
    const productCounts = [0, 1, 5, 10, 100];

    for (const count of productCounts) {
      mockPrisma.product.count.mockResolvedValue(count);
      await seedMain();
      expect(seedAuthModule.seedAuth).toHaveBeenCalled();
      vi.clearAllMocks();
    }
  });

  it('disconnects from database after completion', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    await seedMain();
    expect(mockPrisma.$disconnect).toHaveBeenCalled();
  });

  it('handles database connection errors', async () => {
    mockPrisma.product.count.mockRejectedValue(new Error('Connection failed'));
    await expect(seedMain()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('handles individual seed function errors gracefully', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    (seedAuthModule.seedAuth as any).mockRejectedValue(new Error('Auth seed failed'));

    await expect(seedMain()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('logs progress during seeding', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    await seedMain();
    expect(console.log).toHaveBeenCalled();
  });

  it('handles missing environment variables', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    delete process.env.SEED_EXTENDED;

    await seedMain();
    expect(seedAuthModule.seedAuth).toHaveBeenCalled();
    expect(seedProductsModule.seedProducts).toHaveBeenCalled();
    expect(seedEcommerceModule.seedEcommerce).toHaveBeenCalled();
    expect(seedFakerExtendedMock).not.toHaveBeenCalled();
  });

  it('handles case-insensitive SEED_EXTENDED values', async () => {
    mockPrisma.product.count.mockResolvedValue(0);

    // Test with uppercase
    process.env.SEED_EXTENDED = 'TRUE';
    await seedMain();
    expect(seedFakerExtendedMock).toHaveBeenCalled();

    vi.clearAllMocks();

    // Test with mixed case
    process.env.SEED_EXTENDED = 'True';
    await seedMain();
    expect(seedFakerExtendedMock).toHaveBeenCalled();
  });

  it('handles invalid SEED_EXTENDED values', async () => {
    mockPrisma.product.count.mockResolvedValue(0);

    // Test with invalid values
    const invalidValues = ['invalid', 'yes', 'no', 'maybe'];

    for (const value of invalidValues) {
      process.env.SEED_EXTENDED = value;
      await seedMain();
      expect(seedFakerExtendedMock).not.toHaveBeenCalled();
      vi.clearAllMocks();
    }
  });

  it('ensures proper execution order', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    process.env.SEED_EXTENDED = 'true';

    const executionOrder: string[] = [];

    (seedAuthModule.seedAuth as any).mockImplementation(async () => {
      executionOrder.push('auth');
    });

    (seedProductsModule.seedProducts as any).mockImplementation(async () => {
      executionOrder.push('products');
    });

    (seedEcommerceModule.seedEcommerce as any).mockImplementation(async () => {
      executionOrder.push('ecommerce');
    });

    seedFakerExtendedMock.mockImplementation(async () => {
      executionOrder.push('faker');
    });

    await seedMain();

    expect(executionOrder).toStrictEqual(['auth', 'products', 'ecommerce', 'faker']);
  });

  it('handles concurrent execution safely', async () => {
    mockPrisma.product.count.mockResolvedValue(0);

    // Simulate concurrent calls
    const promises = Array.from({ length: 3 }, () => seedMain());
    await Promise.all(promises);

    // Each should complete successfully
    expect(seedAuthModule.seedAuth).toHaveBeenCalledTimes(3);
    expect(seedProductsModule.seedProducts).toHaveBeenCalledTimes(3);
    expect(seedEcommerceModule.seedEcommerce).toHaveBeenCalledTimes(3);
  });

  it('handles timeout scenarios', async () => {
    mockPrisma.product.count.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(0), 100)),
    );

    await seedMain();
    expect(seedAuthModule.seedAuth).toHaveBeenCalled();
  });

  it('validates database state before seeding', async () => {
    mockPrisma.product.count.mockResolvedValue(0);

    await seedMain();

    // Verify that count was called to check database state
    expect(mockPrisma.product.count).toHaveBeenCalled();
  });

  it('handles partial seeding failures', async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    (seedProductsModule.seedProducts as any).mockRejectedValue(new Error('Products failed'));
    (seedEcommerceModule.seedEcommerce as any).mockRejectedValue(new Error('Ecommerce failed'));

    await expect(seedMain()).resolves.toBeUndefined();

    // Auth should still be called
    expect(seedAuthModule.seedAuth).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
