// import { createTestProduct, createTestVariant } from '@repo/qa'; // Not available

// Create simple test factories
const createTestProduct = (overrides = {}) => ({
  id: '123',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  sku: 'TEST-001',
  createdAt: new Date(),
  ...overrides,
});

const createTestVariant = (overrides = {}) => ({
  id: '456',
  productId: '123',
  name: 'Test Variant',
  price: 29.99,
  sku: 'TEST-VAR-001',
  createdAt: new Date(),
  ...overrides,
});
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma client
const mockPrisma = {
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  variant: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('#/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Product ORM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product Creation', () => {
    it('should create a product with basic information', async () => {
      const { createProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productData = createTestProduct({
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        sku: 'TEST-001',
      });

      const expectedProduct = { id: 'prod-1', ...productData };
      mockPrisma.product.create.mockResolvedValue(expectedProduct);

      const result = await createProduct(productData);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productData,
          slug: expect.stringMatching(/^test-product/),
          status: 'DRAFT',
          createdAt: expect.any(Date),
        },
        include: {
          variants: true,
          categories: true,
          images: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });

    it('should create product with variants', async () => {
      const { createProductWithVariants } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productData = createTestProduct();
      const variantsData = [
        createTestVariant({ size: 'S', color: 'Red', price: 29.99 }),
        createTestVariant({ size: 'M', color: 'Red', price: 29.99 }),
        createTestVariant({ size: 'L', color: 'Red', price: 31.99 }),
      ];

      const expectedResult = {
        product: { id: 'prod-1', ...productData },
        variants: variantsData.map((v, i) => ({ id: `var-${i + 1}`, ...v })),
      };

      mockPrisma.$transaction.mockResolvedValue(expectedResult);

      const result = await createProductWithVariants(productData, variantsData);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should generate unique slug for products with same name', async () => {
      const { createProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productData = createTestProduct({ name: 'Duplicate Product' });

      // Mock existing product with same slug
      mockPrisma.product.findUnique
        .mockResolvedValueOnce({ id: 'existing', slug: 'duplicate-product' })
        .mockResolvedValueOnce(null);

      const expectedProduct = {
        id: 'prod-1',
        ...productData,
        slug: 'duplicate-product-1',
      };
      mockPrisma.product.create.mockResolvedValue(expectedProduct);

      const result = await createProduct(productData);

      expect(result.slug).toBe('duplicate-product-1');
    });
  });

  describe('Product Retrieval', () => {
    it('should find product by ID with all relations', async () => {
      const { getProductById } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const expectedProduct = {
        ...createTestProduct({ id: productId }),
        variants: [createTestVariant()],
        categories: [{ id: 'cat-1', name: 'Electronics' }],
        images: [{ id: 'img-1', url: 'https://example.com/image.jpg' }],
        reviews: [{ id: 'rev-1', rating: 5, comment: 'Great product!' }],
      };

      mockPrisma.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await getProductById(productId);

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          variants: {
            include: {
              inventory: true,
            },
          },
          categories: true,
          images: {
            orderBy: { order: 'asc' },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
              wishlistItems: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedProduct);
    });

    it('should find product by slug', async () => {
      const { getProductBySlug } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const slug = 'test-product';
      const expectedProduct = createTestProduct({ slug });

      mockPrisma.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await getProductBySlug(slug);

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug },
        include: expect.any(Object),
      });
      expect(result).toEqual(expectedProduct);
    });

    it('should search products with filters', async () => {
      const { searchProducts } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const filters = {
        query: 'electronics',
        categoryIds: ['cat-1', 'cat-2'],
        priceRange: { min: 10, max: 100 },
        inStock: true,
        sortBy: 'price',
        sortOrder: 'asc' as const,
        limit: 20,
        offset: 0,
      };

      const expectedProducts = [
        createTestProduct({ id: 'prod-1', name: 'Electronics Product 1' }),
        createTestProduct({ id: 'prod-2', name: 'Electronics Product 2' }),
      ];

      mockPrisma.product.findMany.mockResolvedValue(expectedProducts);

      const result = await searchProducts(filters);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: 'electronics', mode: 'insensitive' } },
                { description: { contains: 'electronics', mode: 'insensitive' } },
                { tags: { hasSome: ['electronics'] } },
              ],
            },
            {
              categories: {
                some: {
                  id: { in: ['cat-1', 'cat-2'] },
                },
              },
            },
            {
              price: {
                gte: 10,
                lte: 100,
              },
            },
            {
              variants: {
                some: {
                  inventory: {
                    quantity: { gt: 0 },
                  },
                },
              },
            },
          ],
        },
        include: {
          variants: {
            include: {
              inventory: true,
            },
          },
          categories: true,
          images: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { price: 'asc' },
        take: 20,
        skip: 0,
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('Product Updates', () => {
    it('should update basic product information', async () => {
      const { updateProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const updateData = {
        name: 'Updated Product Name',
        description: 'Updated description',
        price: 39.99,
        status: 'PUBLISHED' as const,
      };

      const updatedProduct = { id: productId, ...updateData };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const result = await updateProduct(productId, updateData);

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
        include: {
          variants: true,
          categories: true,
          images: true,
        },
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should update product categories', async () => {
      const { updateProductCategories } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const categoryIds = ['cat-1', 'cat-3', 'cat-5'];

      const updatedProduct = {
        id: productId,
        categories: categoryIds.map(id => ({ id, name: `Category ${id}` })),
      };

      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const result = await updateProductCategories(productId, categoryIds);

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          categories: {
            set: [],
            connect: categoryIds.map(id => ({ id })),
          },
          updatedAt: expect.any(Date),
        },
        include: {
          categories: true,
        },
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should update product inventory across variants', async () => {
      const { updateProductInventory } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const inventoryUpdates = [
        { variantId: 'var-1', quantity: 100, reservedQuantity: 5 },
        { variantId: 'var-2', quantity: 50, reservedQuantity: 2 },
      ];

      mockPrisma.$transaction.mockResolvedValue({ success: true, updatedVariants: 2 });

      const result = await updateProductInventory(productId, inventoryUpdates);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
      expect(result.success).toBe(true);
    });
  });

  describe('Product Deletion', () => {
    it('should soft delete product', async () => {
      const { deleteProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const deletedProduct = {
        id: productId,
        status: 'DELETED',
        deletedAt: new Date(),
      };

      mockPrisma.product.update.mockResolvedValue(deletedProduct);

      const result = await deleteProduct(productId);

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          status: 'DELETED',
          deletedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(deletedProduct);
    });

    it('should permanently delete product with cascade', async () => {
      const { permanentlyDeleteProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';

      mockPrisma.$transaction.mockResolvedValue({
        deletedVariants: 3,
        deletedImages: 5,
        deletedProduct: true,
      });

      const result = await permanentlyDeleteProduct(productId);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.deletedProduct).toBe(true);
    });
  });

  describe('Product Analytics', () => {
    it('should get product performance metrics', async () => {
      const { getProductMetrics } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const expectedMetrics = {
        views: 1250,
        orders: 45,
        revenue: 1899.55,
        conversionRate: 0.036,
        averageRating: 4.2,
        reviewCount: 23,
        wishlistCount: 78,
      };

      // Mock complex aggregation query
      mockPrisma.product.findUnique.mockResolvedValue({
        id: productId,
        _count: { reviews: 23, wishlistItems: 78 },
        reviews: [{ rating: 4.2 }],
        // ... other aggregated data
      });

      const result = await getProductMetrics(productId, dateRange);

      expect(result).toMatchObject(expectedMetrics);
    });

    it('should get top selling products', async () => {
      const { getTopSellingProducts } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const options = {
        limit: 10,
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
        categoryId: 'cat-1',
      };

      const expectedProducts = [
        { ...createTestProduct(), orderCount: 150, revenue: 4500 },
        { ...createTestProduct(), orderCount: 120, revenue: 3600 },
      ];

      mockPrisma.product.findMany.mockResolvedValue(expectedProducts);

      const result = await getTopSellingProducts(options);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          categories: {
            some: { id: 'cat-1' },
          },
          orderItems: {
            some: {
              order: {
                createdAt: {
                  gte: options.dateRange.start,
                  lte: options.dateRange.end,
                },
                status: { not: 'CANCELLED' },
              },
            },
          },
        },
        include: {
          _count: {
            select: {
              orderItems: {
                where: {
                  order: {
                    createdAt: {
                      gte: options.dateRange.start,
                      lte: options.dateRange.end,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          orderItems: {
            _count: 'desc',
          },
        },
        take: 10,
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate SKU errors', async () => {
      const { createProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productData = createTestProduct({ sku: 'DUPLICATE-SKU' });

      const error = new Error('Unique constraint violation: sku');
      error.code = 'P2002';
      mockPrisma.product.create.mockRejectedValue(error);

      await expect(createProduct(productData)).rejects.toThrow('SKU already exists');
    });

    it('should handle invalid category assignments', async () => {
      const { updateProductCategories } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productId = 'prod-1';
      const invalidCategoryIds = ['invalid-cat-1', 'invalid-cat-2'];

      const error = new Error('Foreign key constraint violation');
      error.code = 'P2003';
      mockPrisma.product.update.mockRejectedValue(error);

      await expect(updateProductCategories(productId, invalidCategoryIds)).rejects.toThrow(
        'One or more categories do not exist',
      );
    });

    it('should validate price ranges', async () => {
      const { createProduct } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const productData = createTestProduct({ price: -10 });

      await expect(createProduct(productData)).rejects.toThrow('Price must be greater than 0');
    });
  });

  describe('Performance Optimizations', () => {
    it('should use efficient queries for large product catalogs', async () => {
      const { getProductsForCatalog } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const options = {
        limit: 100,
        cursor: 'prod-50',
        include: ['variants', 'mainImage'],
      };

      mockPrisma.product.findMany.mockResolvedValue([]);

      await getProductsForCatalog(options);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        take: 101, // +1 for next cursor
        cursor: { id: 'prod-50' },
        skip: 1,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          status: true,
          variants: {
            select: {
              id: true,
              price: true,
              inventory: {
                select: { quantity: true },
              },
            },
          },
          images: {
            take: 1,
            select: {
              url: true,
              alt: true,
            },
          },
        },
        where: {
          status: { not: 'DELETED' },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should batch update operations efficiently', async () => {
      const { batchUpdateProductPrices } = await import('#/prisma/src/orm/ecommerce/productOrm');

      const priceUpdates = [
        { productId: 'prod-1', price: 29.99 },
        { productId: 'prod-2', price: 39.99 },
        { productId: 'prod-3', price: 49.99 },
      ];

      mockPrisma.$transaction.mockResolvedValue({ updatedCount: 3 });

      const result = await batchUpdateProductPrices(priceUpdates);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            where: { id: 'prod-1' },
            data: { price: 29.99 },
          }),
        ]),
      );
      expect(result.updatedCount).toBe(3);
    });
  });
});
