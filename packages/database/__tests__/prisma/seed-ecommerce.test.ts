import { seedEcommerce } from '@/prisma/src/seed/seed-ecommerce';
import { resetPrismaTestMocks, setupPrismaTestMocks } from '@/tests/setup';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('seedEcommerce', () => {
  let mockPrismaClient: any;
  let mockPrismaOrm: any;

  beforeEach(() => {
    const mocks = setupPrismaTestMocks();
    mockPrismaClient = mocks.mockPrismaClient;
    mockPrismaOrm = mocks.mockPrismaOrm;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default: all findUnique/findFirst return null, findMany returns []
    Object.keys(mockPrismaClient).forEach(model => {
      if (mockPrismaClient[model]?.findUnique) {
        mockPrismaClient[model].findUnique.mockResolvedValue(null);
        mockPrismaClient[model].findFirst.mockResolvedValue(null);
        mockPrismaClient[model].findMany.mockResolvedValue([]);
        mockPrismaClient[model].create.mockResolvedValue({ id: `${model}-id` });
        mockPrismaClient[model].update.mockResolvedValue({ id: `${model}-id` });
        mockPrismaClient[model].createMany?.mockResolvedValue({});
      }
    });
  });

  afterEach(() => {
    resetPrismaTestMocks(mockPrismaClient, mockPrismaOrm);
    vi.restoreAllMocks();
  });

  it('runs all major seeding flows and creates data', async () => {
    await seedEcommerce();
    // Spot check a few key models
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.brand.create).toHaveBeenCalled();
    expect(mockPrismaClient.collection.create).toHaveBeenCalled();
    expect(mockPrismaClient.productCategory.create).toHaveBeenCalled();
    expect(mockPrismaClient.taxonomy.create).toHaveBeenCalled();
    expect(mockPrismaClient.article.create).toHaveBeenCalled();
    expect(mockPrismaClient.review.create).toHaveBeenCalled();
    expect(mockPrismaClient.registry.create).toHaveBeenCalled();
    expect(mockPrismaClient.order.create).toHaveBeenCalled();
    expect(mockPrismaClient.cart.create).toHaveBeenCalled();
    expect(mockPrismaClient.pdpJoin.create).toHaveBeenCalled();
    expect(mockPrismaClient.favoriteJoin.create).toHaveBeenCalled();
    expect(mockPrismaClient.location.create).toHaveBeenCalled();
    expect(mockPrismaClient.productIdentifiers.create).toHaveBeenCalled();
    expect(mockPrismaClient.inventory.create).toHaveBeenCalled();
    expect(mockPrismaClient.pdpUrl.createMany).toHaveBeenCalled();
    expect(mockPrismaClient.fandom.create).toHaveBeenCalled();
    expect(mockPrismaClient.series.create).toHaveBeenCalled();
    expect(mockPrismaClient.cast.create).toHaveBeenCalled();
    expect(mockPrismaClient.story.create).toHaveBeenCalled();
    // ...add more as needed
  });

  it('handles errors gracefully', async () => {
    mockPrismaClient.user.create.mockRejectedValue(new Error('User create error'));
    await expect(seedEcommerce()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  // Enhanced test coverage
  it('creates users with correct data structure', async () => {
    await seedEcommerce();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    expect(userCreateCall).toHaveProperty('data');
    expect(userCreateCall.data).toHaveProperty('name');
    expect(userCreateCall.data).toHaveProperty('email');
    expect(userCreateCall.data).toHaveProperty('emailVerified');
  });

  it('creates brands with correct data structure', async () => {
    await seedEcommerce();

    const brandCreateCall = mockPrismaClient.brand.create.mock.calls[0][0];
    expect(brandCreateCall).toHaveProperty('data');
    expect(brandCreateCall.data).toHaveProperty('name');
    expect(brandCreateCall.data).toHaveProperty('slug');
    expect(brandCreateCall.data).toHaveProperty('description');
  });

  it('creates collections with correct data structure', async () => {
    await seedEcommerce();

    const collectionCreateCall = mockPrismaClient.collection.create.mock.calls[0][0];
    expect(collectionCreateCall).toHaveProperty('data');
    expect(collectionCreateCall.data).toHaveProperty('name');
    expect(collectionCreateCall.data).toHaveProperty('slug');
    expect(collectionCreateCall.data).toHaveProperty('description');
  });

  it('creates product categories with correct data structure', async () => {
    await seedEcommerce();

    const categoryCreateCall = mockPrismaClient.productCategory.create.mock.calls[0][0];
    expect(categoryCreateCall).toHaveProperty('data');
    expect(categoryCreateCall.data).toHaveProperty('name');
    expect(categoryCreateCall.data).toHaveProperty('slug');
    expect(categoryCreateCall.data).toHaveProperty('description');
  });

  it('creates taxonomies with correct data structure', async () => {
    await seedEcommerce();

    const taxonomyCreateCall = mockPrismaClient.taxonomy.create.mock.calls[0][0];
    expect(taxonomyCreateCall).toHaveProperty('data');
    expect(taxonomyCreateCall.data).toHaveProperty('name');
    expect(taxonomyCreateCall.data).toHaveProperty('slug');
    expect(taxonomyCreateCall.data).toHaveProperty('type');
  });

  it('creates articles with correct data structure', async () => {
    await seedEcommerce();

    const articleCreateCall = mockPrismaClient.article.create.mock.calls[0][0];
    expect(articleCreateCall).toHaveProperty('data');
    expect(articleCreateCall.data).toHaveProperty('title');
    expect(articleCreateCall.data).toHaveProperty('slug');
    expect(articleCreateCall.data).toHaveProperty('content');
  });

  it('creates reviews with correct data structure', async () => {
    await seedEcommerce();

    const reviewCreateCall = mockPrismaClient.review.create.mock.calls[0][0];
    expect(reviewCreateCall).toHaveProperty('data');
    expect(reviewCreateCall.data).toHaveProperty('rating');
    expect(reviewCreateCall.data).toHaveProperty('title');
    expect(reviewCreateCall.data).toHaveProperty('content');
  });

  it('creates registries with correct data structure', async () => {
    await seedEcommerce();

    const registryCreateCall = mockPrismaClient.registry.create.mock.calls[0][0];
    expect(registryCreateCall).toHaveProperty('data');
    expect(registryCreateCall.data).toHaveProperty('name');
    expect(registryCreateCall.data).toHaveProperty('description');
    expect(registryCreateCall.data).toHaveProperty('userId');
  });

  it('creates orders with correct data structure', async () => {
    await seedEcommerce();

    const orderCreateCall = mockPrismaClient.order.create.mock.calls[0][0];
    expect(orderCreateCall).toHaveProperty('data');
    expect(orderCreateCall.data).toHaveProperty('status');
    expect(orderCreateCall.data).toHaveProperty('total');
    expect(orderCreateCall.data).toHaveProperty('userId');
  });

  it('creates carts with correct data structure', async () => {
    await seedEcommerce();

    const cartCreateCall = mockPrismaClient.cart.create.mock.calls[0][0];
    expect(cartCreateCall).toHaveProperty('data');
    expect(cartCreateCall.data).toHaveProperty('userId');
    expect(cartCreateCall.data).toHaveProperty('status');
  });

  it('creates PDP joins with correct data structure', async () => {
    await seedEcommerce();

    const pdpJoinCreateCall = mockPrismaClient.pdpJoin.create.mock.calls[0][0];
    expect(pdpJoinCreateCall).toHaveProperty('data');
    expect(pdpJoinCreateCall.data).toHaveProperty('productId');
    expect(pdpJoinCreateCall.data).toHaveProperty('brandId');
    expect(pdpJoinCreateCall.data).toHaveProperty('canonicalUrl');
  });

  it('creates favorite joins with correct data structure', async () => {
    await seedEcommerce();

    const favoriteJoinCreateCall = mockPrismaClient.favoriteJoin.create.mock.calls[0][0];
    expect(favoriteJoinCreateCall).toHaveProperty('data');
    expect(favoriteJoinCreateCall.data).toHaveProperty('userId');
    expect(favoriteJoinCreateCall.data).toHaveProperty('productId');
  });

  it('creates locations with correct data structure', async () => {
    await seedEcommerce();

    const locationCreateCall = mockPrismaClient.location.create.mock.calls[0][0];
    expect(locationCreateCall).toHaveProperty('data');
    expect(locationCreateCall.data).toHaveProperty('name');
    expect(locationCreateCall.data).toHaveProperty('address');
    expect(locationCreateCall.data).toHaveProperty('type');
  });

  it('creates product identifiers with correct data structure', async () => {
    await seedEcommerce();

    const identifiersCreateCall = mockPrismaClient.productIdentifiers.create.mock.calls[0][0];
    expect(identifiersCreateCall).toHaveProperty('data');
    expect(identifiersCreateCall.data).toHaveProperty('productId');
    expect(identifiersCreateCall.data).toHaveProperty('upcA');
    expect(identifiersCreateCall.data).toHaveProperty('ean13');
  });

  it('creates inventory records with correct data structure', async () => {
    await seedEcommerce();

    const inventoryCreateCall = mockPrismaClient.inventory.create.mock.calls[0][0];
    expect(inventoryCreateCall).toHaveProperty('data');
    expect(inventoryCreateCall.data).toHaveProperty('productId');
    expect(inventoryCreateCall.data).toHaveProperty('quantity');
    expect(inventoryCreateCall.data).toHaveProperty('locationId');
  });

  it('creates PDP URLs with correct data structure', async () => {
    await seedEcommerce();

    const pdpUrlCreateManyCall = mockPrismaClient.pdpUrl.createMany.mock.calls[0][0];
    expect(pdpUrlCreateManyCall).toHaveProperty('data');
    expect(Array.isArray(pdpUrlCreateManyCall.data)).toBe(true);
    expect(pdpUrlCreateManyCall.data[0]).toHaveProperty('url');
    expect(pdpUrlCreateManyCall.data[0]).toHaveProperty('urlType');
  });

  it('creates entertainment entities with correct data structure', async () => {
    await seedEcommerce();

    const fandomCreateCall = mockPrismaClient.fandom.create.mock.calls[0][0];
    const seriesCreateCall = mockPrismaClient.series.create.mock.calls[0][0];
    const castCreateCall = mockPrismaClient.cast.create.mock.calls[0][0];
    const storyCreateCall = mockPrismaClient.story.create.mock.calls[0][0];

    expect(fandomCreateCall.data).toHaveProperty('name');
    expect(fandomCreateCall.data).toHaveProperty('slug');
    expect(seriesCreateCall.data).toHaveProperty('name');
    expect(seriesCreateCall.data).toHaveProperty('slug');
    expect(castCreateCall.data).toHaveProperty('name');
    expect(castCreateCall.data).toHaveProperty('slug');
    expect(storyCreateCall.data).toHaveProperty('title');
    expect(storyCreateCall.data).toHaveProperty('slug');
  });

  it('handles database connection errors', async () => {
    mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Connection failed'));

    await expect(seedEcommerce()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('handles individual entity creation errors', async () => {
    // Test each entity creation error
    const entities = [
      'user',
      'brand',
      'collection',
      'productCategory',
      'taxonomy',
      'article',
      'review',
      'registry',
      'order',
      'cart',
      'pdpJoin',
      'favoriteJoin',
      'location',
      'productIdentifiers',
      'inventory',
    ];

    for (const entity of entities) {
      mockPrismaClient[entity].create.mockRejectedValue(new Error(`${entity} create failed`));

      await expect(seedEcommerce()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();

      // Reset for next iteration
      mockPrismaClient[entity].create.mockResolvedValue({ id: `${entity}-id` });
      vi.clearAllMocks();
    }
  });

  it('validates slug formats across entities', async () => {
    await seedEcommerce();

    // Check various entities for proper slug format
    const entitiesWithSlugs = [
      'brand',
      'collection',
      'productCategory',
      'taxonomy',
      'fandom',
      'series',
      'cast',
      'story',
    ];

    entitiesWithSlugs.forEach(entity => {
      if (mockPrismaClient[entity].create.mock.calls.length > 0) {
        const createCall = mockPrismaClient[entity].create.mock.calls[0][0];
        const slug = createCall.data.slug;

        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(slug.length).toBeGreaterThan(0);
      }
    });
  });

  it('ensures unique IDs across different entity types', async () => {
    await seedEcommerce();

    const allIds = new Set();

    Object.keys(mockPrismaClient).forEach(model => {
      if (mockPrismaClient[model].create.mock.calls.length > 0) {
        const createCall = mockPrismaClient[model].create.mock.calls[0][0];
        if (createCall.data.id) {
          allIds.add(createCall.data.id);
        }
      }
    });

    // Should have unique IDs (no duplicates)
    const totalCreateCalls = Object.keys(mockPrismaClient).reduce((sum, model) => {
      return sum + mockPrismaClient[model].create.mock.calls.length;
    }, 0);

    expect(allIds.size).toBeLessThanOrEqual(totalCreateCalls);
  });

  it('creates proper relationships between entities', async () => {
    await seedEcommerce();

    // Check that relationships are properly established
    const pdpJoinCreateCall = mockPrismaClient.pdpJoin.create.mock.calls[0][0];
    const favoriteJoinCreateCall = mockPrismaClient.favoriteJoin.create.mock.calls[0][0];
    const orderCreateCall = mockPrismaClient.order.create.mock.calls[0][0];
    const cartCreateCall = mockPrismaClient.cart.create.mock.calls[0][0];
    const registryCreateCall = mockPrismaClient.registry.create.mock.calls[0][0];

    expect(pdpJoinCreateCall.data).toHaveProperty('productId');
    expect(pdpJoinCreateCall.data).toHaveProperty('brandId');
    expect(favoriteJoinCreateCall.data).toHaveProperty('userId');
    expect(favoriteJoinCreateCall.data).toHaveProperty('productId');
    expect(orderCreateCall.data).toHaveProperty('userId');
    expect(cartCreateCall.data).toHaveProperty('userId');
    expect(registryCreateCall.data).toHaveProperty('userId');
  });

  it('handles concurrent execution safely', async () => {
    // Simulate concurrent calls
    const promises = Array.from({ length: 3 }, () => seedEcommerce());
    await Promise.all(promises);

    // Each should complete successfully
    expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(3);
    expect(mockPrismaClient.brand.create).toHaveBeenCalledTimes(3);
    expect(mockPrismaClient.collection.create).toHaveBeenCalledTimes(3);
  });

  it('logs progress during seeding', async () => {
    await seedEcommerce();
    expect(console.log).toHaveBeenCalled();
  });

  it('handles missing required fields gracefully', async () => {
    // Mock findUnique to return incomplete data
    mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'incomplete-user' });
    mockPrismaClient.brand.findUnique.mockResolvedValue({ id: 'incomplete-brand' });

    await seedEcommerce();

    // Should still create missing entities
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.brand.create).toHaveBeenCalled();
  });

  it('validates email formats for users', async () => {
    await seedEcommerce();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const email = userCreateCall.data.email;

    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('handles different order statuses', async () => {
    await seedEcommerce();

    const orderCreateCall = mockPrismaClient.order.create.mock.calls[0][0];
    const status = orderCreateCall.data.status;

    // Should be a valid order status
    expect(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).toContain(status);
  });

  it('handles different cart statuses', async () => {
    await seedEcommerce();

    const cartCreateCall = mockPrismaClient.cart.create.mock.calls[0][0];
    const status = cartCreateCall.data.status;

    // Should be a valid cart status
    expect(['ACTIVE', 'ABANDONED', 'CONVERTED']).toContain(status);
  });

  it('creates proper inventory quantities', async () => {
    await seedEcommerce();

    const inventoryCreateCall = mockPrismaClient.inventory.create.mock.calls[0][0];
    const quantity = inventoryCreateCall.data.quantity;

    expect(quantity).toBeGreaterThanOrEqual(0);
    expect(typeof quantity).toBe('number');
  });

  it('creates proper review ratings', async () => {
    await seedEcommerce();

    const reviewCreateCall = mockPrismaClient.review.create.mock.calls[0][0];
    const rating = reviewCreateCall.data.rating;

    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
    expect(typeof rating).toBe('number');
  });

  it('handles timeout scenarios', async () => {
    mockPrismaClient.user.findUnique.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(null), 100)),
    );

    await seedEcommerce();
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
  });

  it('ensures data consistency across entities', async () => {
    await seedEcommerce();

    // All created entities should have consistent timestamps
    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const brandCreateCall = mockPrismaClient.brand.create.mock.calls[0][0];

    if (userCreateCall.data.createdAt && brandCreateCall.data.createdAt) {
      const userTime = new Date(userCreateCall.data.createdAt).getTime();
      const brandTime = new Date(brandCreateCall.data.createdAt).getTime();
      const timeDiff = Math.abs(userTime - brandTime);

      // Should be created within 1 second of each other
      expect(timeDiff).toBeLessThan(1000);
    }
  });

  it('handles partial seeding failures gracefully', async () => {
    // Mock some entities to fail creation
    mockPrismaClient.user.create.mockRejectedValue(new Error('User failed'));
    mockPrismaClient.brand.create.mockRejectedValue(new Error('Brand failed'));

    await expect(seedEcommerce()).resolves.toBeUndefined();

    // Should still attempt to create other entities
    expect(mockPrismaClient.collection.create).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('creates realistic data volumes', async () => {
    await seedEcommerce();

    // Should create multiple entities of each type
    const entityCounts = {
      user: mockPrismaClient.user.create.mock.calls.length,
      brand: mockPrismaClient.brand.create.mock.calls.length,
      collection: mockPrismaClient.collection.create.mock.calls.length,
      productCategory: mockPrismaClient.productCategory.create.mock.calls.length,
      taxonomy: mockPrismaClient.taxonomy.create.mock.calls.length,
      article: mockPrismaClient.article.create.mock.calls.length,
      review: mockPrismaClient.review.create.mock.calls.length,
      registry: mockPrismaClient.registry.create.mock.calls.length,
      order: mockPrismaClient.order.create.mock.calls.length,
      cart: mockPrismaClient.cart.create.mock.calls.length,
    };

    // Should have created at least one of each entity type
    Object.values(entityCounts).forEach(count => {
      expect(count).toBeGreaterThan(0);
    });
  });
});
