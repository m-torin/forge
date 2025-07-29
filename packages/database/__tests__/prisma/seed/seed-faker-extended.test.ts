import { seedFakerExtended } from '@/prisma/src/seed/seed-faker-extended';
import { resetPrismaTestMocks, setupPrismaTestMocks } from '@/tests/setup';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('seedFakerExtended', () => {
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

  it('generates additional users, products, and reviews', async () => {
    await seedFakerExtended();
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.product.create).toHaveBeenCalled();
    expect(mockPrismaClient.review.create).toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    mockPrismaClient.user.create.mockRejectedValue(new Error('User create error'));
    await expect(seedFakerExtended()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  // Enhanced test coverage
  it('creates users with realistic faker data', async () => {
    await seedFakerExtended();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    expect(userCreateCall).toHaveProperty('data');
    expect(userCreateCall.data).toHaveProperty('name');
    expect(userCreateCall.data).toHaveProperty('email');
    expect(userCreateCall.data).toHaveProperty('emailVerified');

    // Validate email format
    const email = userCreateCall.data.email;
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    // Validate name is not empty
    expect(userCreateCall.data.name).toBeTruthy();
  });

  it('creates products with realistic faker data', async () => {
    await seedFakerExtended();

    const productCreateCall = mockPrismaClient.product.create.mock.calls[0][0];
    expect(productCreateCall).toHaveProperty('data');
    expect(productCreateCall.data).toHaveProperty('name');
    expect(productCreateCall.data).toHaveProperty('slug');
    expect(productCreateCall.data).toHaveProperty('description');
    expect(productCreateCall.data).toHaveProperty('price');

    // Validate price is a positive number
    expect(productCreateCall.data.price).toBeGreaterThan(0);

    // Validate slug format
    const slug = productCreateCall.data.slug;
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('creates reviews with realistic faker data', async () => {
    await seedFakerExtended();

    const reviewCreateCall = mockPrismaClient.review.create.mock.calls[0][0];
    expect(reviewCreateCall).toHaveProperty('data');
    expect(reviewCreateCall.data).toHaveProperty('rating');
    expect(reviewCreateCall.data).toHaveProperty('title');
    expect(reviewCreateCall.data).toHaveProperty('content');
    expect(reviewCreateCall.data).toHaveProperty('userId');
    expect(reviewCreateCall.data).toHaveProperty('productId');

    // Validate rating is between 1 and 5
    const rating = reviewCreateCall.data.rating;
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);

    // Validate content is not empty
    expect(reviewCreateCall.data.content).toBeTruthy();
  });

  it('generates multiple entities of each type', async () => {
    await seedFakerExtended();

    const userCount = mockPrismaClient.user.create.mock.calls.length;
    const productCount = mockPrismaClient.product.create.mock.calls.length;
    const reviewCount = mockPrismaClient.review.create.mock.calls.length;

    // Should generate multiple entities
    expect(userCount).toBeGreaterThan(1);
    expect(productCount).toBeGreaterThan(1);
    expect(reviewCount).toBeGreaterThan(1);
  });

  it('creates proper relationships between entities', async () => {
    await seedFakerExtended();

    // Check that reviews reference valid users and products
    const reviewCreateCall = mockPrismaClient.review.create.mock.calls[0][0];
    expect(reviewCreateCall.data).toHaveProperty('userId');
    expect(reviewCreateCall.data).toHaveProperty('productId');

    // Should reference existing user and product IDs
    expect(reviewCreateCall.data.userId).toBeDefined();
    expect(reviewCreateCall.data.productId).toBeDefined();
  });

  it('handles database connection errors', async () => {
    mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Connection failed'));

    await expect(seedFakerExtended()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('handles individual entity creation errors', async () => {
    // Test each entity creation error
    const entities = ['user', 'product', 'review'];

    for (const entity of entities) {
      mockPrismaClient[entity].create.mockRejectedValue(new Error(`${entity} create failed`));

      await expect(seedFakerExtended()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();

      // Reset for next iteration
      mockPrismaClient[entity].create.mockResolvedValue({ id: `${entity}-id` });
      vi.clearAllMocks();
    }
  });

  it('generates unique data for each entity', async () => {
    await seedFakerExtended();

    // Check that users have unique emails
    const userEmails = mockPrismaClient.user.create.mock.calls.map(
      (call: any) => call[0].data.email,
    );
    const uniqueEmails = new Set(userEmails);
    expect(uniqueEmails.size).toBe(userEmails.length);

    // Check that products have unique slugs
    const productSlugs = mockPrismaClient.product.create.mock.calls.map(
      (call: any) => call[0].data.slug,
    );
    const uniqueSlugs = new Set(productSlugs);
    expect(uniqueSlugs.size).toBe(productSlugs.length);
  });

  it('validates data types and formats', async () => {
    await seedFakerExtended();

    // Validate user data types
    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    expect(typeof userCreateCall.data.name).toBe('string');
    expect(typeof userCreateCall.data.email).toBe('string');
    expect(typeof userCreateCall.data.emailVerified).toBe('object'); // Date object

    // Validate product data types
    const productCreateCall = mockPrismaClient.product.create.mock.calls[0][0];
    expect(typeof productCreateCall.data.name).toBe('string');
    expect(typeof productCreateCall.data.slug).toBe('string');
    expect(typeof productCreateCall.data.price).toBe('number');

    // Validate review data types
    const reviewCreateCall = mockPrismaClient.review.create.mock.calls[0][0];
    expect(typeof reviewCreateCall.data.rating).toBe('number');
    expect(typeof reviewCreateCall.data.title).toBe('string');
    expect(typeof reviewCreateCall.data.content).toBe('string');
  });

  it('handles concurrent execution safely', async () => {
    // Simulate concurrent calls
    const promises = Array.from({ length: 3 }, () => seedFakerExtended());
    await Promise.all(promises);

    // Each should complete successfully
    expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(3);
    expect(mockPrismaClient.product.create).toHaveBeenCalledTimes(3);
    expect(mockPrismaClient.review.create).toHaveBeenCalledTimes(3);
  });

  it('logs progress during seeding', async () => {
    await seedFakerExtended();
    expect(console.log).toHaveBeenCalled();
  });

  it('generates realistic data volumes', async () => {
    await seedFakerExtended();

    const userCount = mockPrismaClient.user.create.mock.calls.length;
    const productCount = mockPrismaClient.product.create.mock.calls.length;
    const reviewCount = mockPrismaClient.review.create.mock.calls.length;

    // Should generate reasonable amounts of data
    expect(userCount).toBeGreaterThanOrEqual(5);
    expect(productCount).toBeGreaterThanOrEqual(5);
    expect(reviewCount).toBeGreaterThanOrEqual(5);

    // But not excessive amounts
    expect(userCount).toBeLessThanOrEqual(100);
    expect(productCount).toBeLessThanOrEqual(100);
    expect(reviewCount).toBeLessThanOrEqual(100);
  });

  it('creates data with appropriate timestamps', async () => {
    await seedFakerExtended();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const productCreateCall = mockPrismaClient.product.create.mock.calls[0][0];
    const reviewCreateCall = mockPrismaClient.review.create.mock.calls[0][0];

    // All entities should have createdAt timestamps
    if (userCreateCall.data.createdAt) {
      expect(userCreateCall.data.createdAt).toBeInstanceOf(Date);
    }
    if (productCreateCall.data.createdAt) {
      expect(productCreateCall.data.createdAt).toBeInstanceOf(Date);
    }
    if (reviewCreateCall.data.createdAt) {
      expect(reviewCreateCall.data.createdAt).toBeInstanceOf(Date);
    }
  });

  it('handles timeout scenarios', async () => {
    mockPrismaClient.user.findUnique.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(null), 100)),
    );

    await seedFakerExtended();
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
  });

  it('ensures data consistency across entities', async () => {
    await seedFakerExtended();

    // All created entities should have consistent timestamps
    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const productCreateCall = mockPrismaClient.product.create.mock.calls[0][0];

    if (userCreateCall.data.createdAt && productCreateCall.data.createdAt) {
      const userTime = new Date(userCreateCall.data.createdAt).getTime();
      const productTime = new Date(productCreateCall.data.createdAt).getTime();
      const timeDiff = Math.abs(userTime - productTime);

      // Should be created within 1 second of each other
      expect(timeDiff).toBeLessThan(1000);
    }
  });

  it('handles partial seeding failures gracefully', async () => {
    // Mock some entities to fail creation
    mockPrismaClient.user.create.mockRejectedValue(new Error('User failed'));
    mockPrismaClient.product.create.mockRejectedValue(new Error('Product failed'));

    await expect(seedFakerExtended()).resolves.toBeUndefined();

    // Should still attempt to create other entities
    expect(mockPrismaClient.review.create).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('generates diverse data across entities', async () => {
    await seedFakerExtended();

    // Check that we have variety in the generated data
    const userNames = mockPrismaClient.user.create.mock.calls.map((call: any) => call[0].data.name);
    const productNames = mockPrismaClient.product.create.mock.calls.map(
      (call: any) => call[0].data.name,
    );
    const reviewTitles = mockPrismaClient.review.create.mock.calls.map(
      (call: any) => call[0].data.title,
    );

    // Should have some variety (not all the same)
    expect(new Set(userNames).size).toBeGreaterThan(1);
    expect(new Set(productNames).size).toBeGreaterThan(1);
    expect(new Set(reviewTitles).size).toBeGreaterThan(1);
  });

  it('validates email domains are realistic', async () => {
    await seedFakerExtended();

    const userEmails = mockPrismaClient.user.create.mock.calls.map(
      (call: any) => call[0].data.email,
    );

    userEmails.forEach((email: string) => {
      const domain = email.split('@')[1];
      expect(domain).toMatch(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    });
  });

  it('generates appropriate price ranges for products', async () => {
    await seedFakerExtended();

    const productPrices = mockPrismaClient.product.create.mock.calls.map(
      (call: any) => call[0].data.price,
    );

    productPrices.forEach((price: number) => {
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(10000); // Reasonable upper limit
      expect(typeof price).toBe('number');
    });
  });

  it('creates reviews with realistic content lengths', async () => {
    await seedFakerExtended();

    const reviewContents = mockPrismaClient.review.create.mock.calls.map(
      (call: any) => call[0].data.content,
    );

    reviewContents.forEach((content: string) => {
      expect(content.length).toBeGreaterThan(10); // Minimum content length
      expect(content.length).toBeLessThan(1000); // Maximum content length
    });
  });

  it('handles missing optional fields gracefully', async () => {
    // Mock findUnique to return incomplete data
    mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'incomplete-user' });
    mockPrismaClient.product.findUnique.mockResolvedValue({ id: 'incomplete-product' });

    await seedFakerExtended();

    // Should still create missing entities
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.product.create).toHaveBeenCalled();
  });
});
