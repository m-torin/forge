import * as productMapper from '@/prisma/src/seed/mappers/product-mapper';
import { seedProducts } from '@/prisma/src/seed/seed-products';
import { createDatabaseTestSuite } from '@repo/qa/vitest/utils/prisma-test-setup';
import { describeSeedFunction } from '@repo/qa/vitest/utils/seed-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import real enums for type safety
import {
  BrandType,
  ContentStatus,
  MediaType,
  ProductStatus,
  ProductType,
} from '@/prisma-generated/client';

describe('seedProducts', () => {
  // Setup enhanced test suite with real enums
  const testSuite = createDatabaseTestSuite({
    enums: {
      BrandType,
      ContentStatus,
      ProductType,
      ProductStatus,
      MediaType,
    },
    importPaths: [
      '@/prisma-generated/client',
      '../prisma-generated/client',
      '../../../../prisma-generated/client',
    ],
  });

  beforeEach(() => {
    testSuite.beforeEach();
    testSuite.mockDefaults();
  });

  afterEach(() => {
    testSuite.afterEach();
  });

  // Use the standardized seed function test pattern
  const seedTestSuite = describeSeedFunction('seedProducts', seedProducts, testSuite.mockClient, {
    expectedModels: ['brand', 'product', 'media'],
    checkModels: ['brand', 'product'],
    includeErrorTests: true,
    includeExistingDataTests: true,
    includeLoggingTests: true,
    includeConcurrencyTests: true,
  });

  // Generate all standard test cases automatically
  seedTestSuite.tests.forEach(({ name, test }) => {
    it(name, test);
  });

  // Data structure validation tests using utilities
  it(
    'creates brand with correct data structure',
    seedTestSuite.utilities.testDataStructure('brand', ['id', 'name', 'slug', 'type', 'status']),
  );

  it(
    'creates product with correct data structure',
    seedTestSuite.utilities.testDataStructure('product', [
      'id',
      'name',
      'slug',
      'brandId',
      'type',
      'status',
    ]),
  );

  // Relationship tests using utilities
  it(
    'creates proper relationships between entities',
    seedTestSuite.utilities.testRelationships([
      {
        child: 'product',
        parent: 'brand',
        foreignKey: 'brandId',
      },
    ]),
  );

  // Custom tests for specific business logic
  it('creates variants and media for each product', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({
      id: 'parent-id',
      name: 'Test',
      slug: 'test',
    });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    expect(testSuite.mockClient.media.createMany).toHaveBeenCalled();
    expect(testSuite.mockClient.media.create).toHaveBeenCalled();
  });

  it('handles partial existing data correctly', async () => {
    // Brand exists but product doesn't
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'existing-brand' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    expect(testSuite.mockClient.brand.create).not.toHaveBeenCalled();
    expect(testSuite.mockClient.product.create).toHaveBeenCalled();
  });

  it("handles product exists but brand doesn't", async () => {
    // Product exists but brand doesn't
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue({ id: 'existing-product' });
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });

    await seedProducts();

    expect(testSuite.mockClient.brand.create).toHaveBeenCalled();
    expect(testSuite.mockClient.product.create).not.toHaveBeenCalled();
  });

  it('creates variants with correct parent relationship', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'parent-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    const spyVariants = vi.spyOn(productMapper, 'extractProductVariants');

    await seedProducts();

    expect(spyVariants).toHaveBeenCalled();
    const variantCreateCall = testSuite.mockClient.product.create.mock.calls[1][0];
    expect(variantCreateCall.data).toHaveProperty('parentId');
  });

  it('creates media with correct product relationship', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    const spyMedia = vi.spyOn(productMapper, 'extractProductMedia');

    await seedProducts();

    expect(spyMedia).toHaveBeenCalled();
    expect(testSuite.mockClient.media.createMany).toHaveBeenCalled();
  });

  it('handles database connection errors', async () => {
    testSuite.mockClient.brand.findUnique.mockRejectedValue(new Error('Connection failed'));

    await expect(seedProducts()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('handles individual entity creation errors', async () => {
    // Test each entity creation error
    const entities = ['brand', 'product', 'media'];

    for (const entity of entities) {
      testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
      testSuite.mockClient.product.findUnique.mockResolvedValue(null);
      testSuite.mockClient[entity].create.mockRejectedValue(new Error(`${entity} create failed`));

      await expect(seedProducts()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();

      // Reset for next iteration
      testSuite.mockClient[entity].create.mockResolvedValue({ id: `${entity}-id` });
      vi.clearAllMocks();
    }
  });

  it('validates product slug format', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    const productCreateCall = testSuite.mockClient.product.create.mock.calls[0][0];
    const slug = productCreateCall.data.slug;

    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  });

  it('ensures unique brand and product IDs', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    const brandCreateCall = testSuite.mockClient.brand.create.mock.calls[0][0];
    const productCreateCall = testSuite.mockClient.product.create.mock.calls[0][0];

    expect(brandCreateCall.data.id).toBeDefined();
    expect(productCreateCall.data.id).toBeDefined();
    expect(brandCreateCall.data.id).not.toBe(productCreateCall.data.id);
  });

  it('creates proper relationships between entities', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    const brandCreateCall = testSuite.mockClient.brand.create.mock.calls[0][0];
    const productCreateCall = testSuite.mockClient.product.create.mock.calls[0][0];

    // Product should reference brand
    expect(productCreateCall.data.brandId).toBe(brandCreateCall.data.id);
  });

  it('handles concurrent execution safely', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    // Simulate concurrent calls
    const promises = Array.from({ length: 3 }, () => seedProducts());
    await Promise.all(promises);

    // Each should complete successfully
    expect(testSuite.mockClient.brand.create).toHaveBeenCalledTimes(3);
    expect(testSuite.mockClient.product.create).toHaveBeenCalledTimes(3);
  });

  it('logs progress during seeding', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();
    expect(console.log).toHaveBeenCalled();
  });

  it('handles missing required fields gracefully', async () => {
    // Mock findUnique to return incomplete data
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'incomplete-brand' });
    testSuite.mockClient.product.findUnique.mockResolvedValue({ id: 'incomplete-product' });

    await seedProducts();

    // Should still create missing entities
    expect(testSuite.mockClient.brand.create).toHaveBeenCalled();
    expect(testSuite.mockClient.product.create).toHaveBeenCalled();
  });

  it('validates brand slug format', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    const brandCreateCall = testSuite.mockClient.brand.create.mock.calls[0][0];
    const slug = brandCreateCall.data.slug;

    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  });

  it('handles different product categories', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    const productCreateCall = testSuite.mockClient.product.create.mock.calls[0][0];
    const category = productCreateCall.data.category;

    // Should be a valid category
    expect(category).toBeDefined();
    expect(typeof category).toBe('string');
  });

  it('creates proper media data structure', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    const mediaCreateManyCall = testSuite.mockClient.media.createMany.mock.calls[0][0];
    expect(mediaCreateManyCall).toHaveProperty('data');
    expect(Array.isArray(mediaCreateManyCall.data)).toBe(true);
  });

  it('handles timeout scenarios', async () => {
    testSuite.mockClient.brand.findUnique.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(null), 100)),
    );
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();
    expect(testSuite.mockClient.brand.create).toHaveBeenCalled();
  });

  it('ensures data consistency across entities', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    // All created entities should have consistent timestamps
    const brandCreateCall = testSuite.mockClient.brand.create.mock.calls[0][0];
    const productCreateCall = testSuite.mockClient.product.create.mock.calls[0][0];

    if (brandCreateCall.data.createdAt && productCreateCall.data.createdAt) {
      const brandTime = new Date(brandCreateCall.data.createdAt).getTime();
      const productTime = new Date(productCreateCall.data.createdAt).getTime();
      const timeDiff = Math.abs(brandTime - productTime);

      // Should be created within 1 second of each other
      expect(timeDiff).toBeLessThan(1000);
    }
  });

  it('handles partial seeding failures gracefully', async () => {
    // Mock some entities to fail creation
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockRejectedValue(new Error('Brand failed'));
    testSuite.mockClient.product.create.mockRejectedValue(new Error('Product failed'));

    await expect(seedProducts()).resolves.toBeUndefined();

    // Should still attempt to create other entities
    expect(console.error).toHaveBeenCalled();
  });

  it('uses webapp data for seeding', async () => {
    testSuite.mockClient.brand.findUnique.mockResolvedValue(null);
    testSuite.mockClient.product.findUnique.mockResolvedValue(null);
    testSuite.mockClient.brand.create.mockResolvedValue({ id: 'brand-id' });
    testSuite.mockClient.product.create.mockResolvedValue({ id: 'product-id' });
    testSuite.mockClient.media.createMany.mockResolvedValue({});
    testSuite.mockClient.product.findFirst.mockResolvedValue({ id: 'variant-id' });
    testSuite.mockClient.media.create.mockResolvedValue({});

    await seedProducts();

    // Verify that the seeding process completes successfully
    expect(testSuite.mockClient.brand.create).toHaveBeenCalled();
    expect(testSuite.mockClient.product.create).toHaveBeenCalled();
  });
});
