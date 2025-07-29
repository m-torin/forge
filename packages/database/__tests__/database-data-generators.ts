/**
 * Database Test Data Generators - Centralized DRY Utilities
 *
 * Provides comprehensive test data generation for all database entities.
 * Eliminates 300+ lines of hardcoded test data across database tests.
 *
 * Based on the successful DRY patterns from packages/orchestration.
 */

import { faker } from '@faker-js/faker';
import {
  AddressType,
  BrandType,
  ContentStatus,
  MediaType,
  OrderStatus,
  ProductStatus,
  ProductType,
  RegistryUserRole,
  TransactionStatus,
  TransactionType,
} from '../prisma-generated/client';

/**
 * User data generators
 * Replaces manual user creation across 15+ test files
 */
export const userGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: faker.date.recent(),
    image: faker.image.avatar(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  admin: (overrides = {}) =>
    userGenerators.basic({
      email: 'admin@example.com',
      name: 'Admin User',
      ...overrides,
    }),

  testUser: (overrides = {}) =>
    userGenerators.basic({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      ...overrides,
    }),

  withProfile: (overrides = {}) =>
    userGenerators.basic({
      bio: faker.lorem.paragraph(),
      location: faker.location.city(),
      website: faker.internet.url(),
      ...overrides,
    }),

  unverified: (overrides = {}) =>
    userGenerators.basic({
      emailVerified: null,
      ...overrides,
    }),
};

/**
 * Organization data generators
 * Standardizes organization test data creation
 */
export const organizationGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    image: faker.image.url(),
    description: faker.company.catchPhrase(),
    website: faker.internet.url(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  testOrg: (overrides = {}) =>
    organizationGenerators.basic({
      id: 'test-org-id',
      name: 'Test Organization',
      slug: 'test-org',
      ...overrides,
    }),

  enterprise: (overrides = {}) =>
    organizationGenerators.basic({
      name: 'Enterprise Corp',
      description: 'Large enterprise organization',
      ...overrides,
    }),
};

/**
 * Brand data generators
 * Replaces 200+ lines of manual brand creation in mapper tests
 */
export const brandGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    type: faker.helpers.enumValue(BrandType),
    status: ContentStatus.PUBLISHED,
    baseUrl: faker.internet.url(),
    copy: {
      description: `${faker.company.name()} is a premium fashion brand that delivers exceptional quality and style.`,
      mission: 'Creating timeless fashion that empowers and inspires.',
      values: ['Quality', 'Sustainability', 'Innovation', 'Style'],
    },
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  retailer: (overrides = {}) =>
    brandGenerators.basic({
      type: BrandType.RETAILER,
      name: faker.helpers.arrayElement(['Target', 'Walmart', 'Best Buy', "Macy's"]),
      ...overrides,
    }),

  marketplace: (overrides = {}) =>
    brandGenerators.basic({
      type: BrandType.MARKETPLACE,
      name: faker.helpers.arrayElement(['Amazon', 'eBay', 'Etsy', 'Mercari']),
      ...overrides,
    }),

  label: (overrides = {}) =>
    brandGenerators.basic({
      type: BrandType.LABEL,
      name: faker.helpers.arrayElement(['Nike', 'Adidas', 'Apple', 'Samsung']),
      ...overrides,
    }),

  fromVendor: (vendorName: string, overrides = {}) => ({
    name: vendorName,
    slug: vendorName.toLowerCase().replace(/\s+/g, '-'),
    type: BrandType.LABEL,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: `${vendorName} is a premium fashion brand that delivers exceptional quality and style.`,
      mission: 'Creating timeless fashion that empowers and inspires.',
      values: ['Quality', 'Sustainability', 'Innovation', 'Style'],
    },
    ...overrides,
  }),
};

/**
 * Product data generators
 * Centralizes product test data creation
 */
export const productGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
    description: faker.commerce.productDescription(),
    status: ProductStatus.ACTIVE,
    type: faker.helpers.enumValue(ProductType),
    price: parseFloat(faker.commerce.price()),
    currency: 'USD',
    sku: faker.string.alphanumeric(10).toUpperCase(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  clothing: (overrides = {}) =>
    productGenerators.basic({
      type: ProductType.PHYSICAL,
      name: faker.helpers.arrayElement(['T-Shirt', 'Jeans', 'Dress', 'Hoodie']),
      ...overrides,
    }),

  digital: (overrides = {}) =>
    productGenerators.basic({
      type: ProductType.DIGITAL,
      name: faker.helpers.arrayElement(['E-book', 'Software', 'Course', 'Music']),
      ...overrides,
    }),

  withBrand: (brandId: string, overrides = {}) =>
    productGenerators.basic({
      brandId,
      ...overrides,
    }),

  draft: (overrides = {}) =>
    productGenerators.basic({
      status: ProductStatus.DRAFT,
      ...overrides,
    }),

  discontinued: (overrides = {}) =>
    productGenerators.basic({
      status: ProductStatus.DISCONTINUED,
      ...overrides,
    }),
};

/**
 * Order data generators
 * Standardizes e-commerce order testing
 */
export const orderGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    orderNumber: faker.string.alphanumeric(10).toUpperCase(),
    status: faker.helpers.enumValue(OrderStatus),
    total: parseFloat(faker.commerce.price()),
    subtotal: parseFloat(faker.commerce.price()),
    tax: parseFloat(faker.commerce.price({ min: 1, max: 50 })),
    shipping: parseFloat(faker.commerce.price({ min: 5, max: 25 })),
    currency: 'USD',
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  pending: (overrides = {}) =>
    orderGenerators.basic({
      status: OrderStatus.PENDING,
      ...overrides,
    }),

  confirmed: (overrides = {}) =>
    orderGenerators.basic({
      status: OrderStatus.CONFIRMED,
      ...overrides,
    }),

  shipped: (overrides = {}) =>
    orderGenerators.basic({
      status: OrderStatus.SHIPPED,
      trackingNumber: faker.string.alphanumeric(15).toUpperCase(),
      ...overrides,
    }),

  delivered: (overrides = {}) =>
    orderGenerators.basic({
      status: OrderStatus.DELIVERED,
      deliveredAt: faker.date.recent(),
      ...overrides,
    }),

  withUser: (userId: string, overrides = {}) =>
    orderGenerators.basic({
      userId,
      ...overrides,
    }),
};

/**
 * Address data generators
 * Centralizes address testing patterns
 */
export const addressGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    type: faker.helpers.enumValue(AddressType),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.company.name(),
    street1: faker.location.streetAddress(),
    street2: faker.location.secondaryAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: faker.location.countryCode(),
    phone: faker.phone.number(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  shipping: (overrides = {}) =>
    addressGenerators.basic({
      type: AddressType.SHIPPING,
      ...overrides,
    }),

  billing: (overrides = {}) =>
    addressGenerators.basic({
      type: AddressType.BILLING,
      ...overrides,
    }),

  residential: (overrides = {}) =>
    addressGenerators.basic({
      type: AddressType.RESIDENTIAL,
      company: null,
      ...overrides,
    }),

  business: (overrides = {}) =>
    addressGenerators.basic({
      type: AddressType.BUSINESS,
      company: faker.company.name(),
      ...overrides,
    }),
};

/**
 * Media data generators
 * Standardizes media/content testing
 */
export const mediaGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    url: faker.image.url(),
    type: faker.helpers.enumValue(MediaType),
    filename: faker.system.fileName(),
    mimeType: faker.system.mimeType(),
    size: faker.number.int({ min: 1000, max: 5000000 }),
    alt: faker.lorem.sentence(),
    caption: faker.lorem.paragraph(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  image: (overrides = {}) =>
    mediaGenerators.basic({
      type: MediaType.IMAGE,
      mimeType: faker.helpers.arrayElement(['image/jpeg', 'image/png', 'image/webp']),
      ...overrides,
    }),

  video: (overrides = {}) =>
    mediaGenerators.basic({
      type: MediaType.VIDEO,
      mimeType: faker.helpers.arrayElement(['video/mp4', 'video/webm', 'video/ogg']),
      ...overrides,
    }),

  document: (overrides = {}) =>
    mediaGenerators.basic({
      type: MediaType.DOCUMENT,
      mimeType: faker.helpers.arrayElement(['application/pdf', 'text/plain', 'application/docx']),
      ...overrides,
    }),
};

/**
 * API Key data generators
 * Standardizes API key testing
 */
export const apiKeyGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.hacker.noun(),
    key: faker.string.alphanumeric(32),
    permissions: ['read', 'write'],
    lastUsed: faker.date.recent(),
    expiresAt: faker.date.future(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  readOnly: (overrides = {}) =>
    apiKeyGenerators.basic({
      name: 'Read Only Key',
      permissions: ['read'],
      ...overrides,
    }),

  fullAccess: (overrides = {}) =>
    apiKeyGenerators.basic({
      name: 'Full Access Key',
      permissions: ['read', 'write', 'delete', 'admin'],
      ...overrides,
    }),

  expired: (overrides = {}) =>
    apiKeyGenerators.basic({
      expiresAt: faker.date.past(),
      ...overrides,
    }),
};

/**
 * Collection data generators
 * Standardizes collection/category testing
 */
export const collectionGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
    description: faker.lorem.paragraph(),
    status: ContentStatus.PUBLISHED,
    featured: faker.datatype.boolean(),
    sortOrder: faker.number.int({ min: 1, max: 100 }),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  clothing: (overrides = {}) =>
    collectionGenerators.basic({
      name: 'Clothing',
      slug: 'clothing',
      ...overrides,
    }),

  accessories: (overrides = {}) =>
    collectionGenerators.basic({
      name: 'Accessories',
      slug: 'accessories',
      ...overrides,
    }),

  featured: (overrides = {}) =>
    collectionGenerators.basic({
      featured: true,
      sortOrder: 1,
      ...overrides,
    }),
};

/**
 * Transaction data generators
 * Standardizes payment/transaction testing
 */
export const transactionGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    type: faker.helpers.enumValue(TransactionType),
    status: faker.helpers.enumValue(TransactionStatus),
    amount: parseFloat(faker.commerce.price()),
    currency: 'USD',
    reference: faker.string.alphanumeric(20).toUpperCase(),
    description: faker.lorem.sentence(),
    metadata: {},
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  payment: (overrides = {}) =>
    transactionGenerators.basic({
      type: TransactionType.PAYMENT,
      status: TransactionStatus.COMPLETED,
      ...overrides,
    }),

  refund: (overrides = {}) =>
    transactionGenerators.basic({
      type: TransactionType.REFUND,
      status: TransactionStatus.COMPLETED,
      ...overrides,
    }),

  pending: (overrides = {}) =>
    transactionGenerators.basic({
      status: TransactionStatus.PENDING,
      ...overrides,
    }),

  failed: (overrides = {}) =>
    transactionGenerators.basic({
      status: TransactionStatus.FAILED,
      ...overrides,
    }),
};

/**
 * Review data generators
 * Standardizes review/rating testing
 */
export const reviewGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    rating: faker.number.int({ min: 1, max: 5 }),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    verified: faker.datatype.boolean(),
    helpful: faker.number.int({ min: 0, max: 50 }),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  positive: (overrides = {}) =>
    reviewGenerators.basic({
      rating: faker.number.int({ min: 4, max: 5 }),
      title: 'Great product!',
      content: 'Really happy with this purchase. High quality and fast shipping.',
      ...overrides,
    }),

  negative: (overrides = {}) =>
    reviewGenerators.basic({
      rating: faker.number.int({ min: 1, max: 2 }),
      title: 'Not satisfied',
      content: 'Product did not meet expectations. Quality could be better.',
      ...overrides,
    }),

  verified: (overrides = {}) =>
    reviewGenerators.basic({
      verified: true,
      ...overrides,
    }),
};

/**
 * Inventory data generators
 * Standardizes inventory/stock testing
 */
export const inventoryGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    sku: faker.string.alphanumeric(10).toUpperCase(),
    quantity: faker.number.int({ min: 0, max: 1000 }),
    reserved: faker.number.int({ min: 0, max: 100 }),
    available: faker.number.int({ min: 0, max: 900 }),
    reorderPoint: faker.number.int({ min: 10, max: 50 }),
    maxStock: faker.number.int({ min: 500, max: 2000 }),
    location: faker.location.city(),
    lastUpdated: faker.date.recent(),
    ...overrides,
  }),

  inStock: (overrides = {}) =>
    inventoryGenerators.basic({
      quantity: faker.number.int({ min: 100, max: 1000 }),
      available: faker.number.int({ min: 100, max: 900 }),
      ...overrides,
    }),

  lowStock: (overrides = {}) =>
    inventoryGenerators.basic({
      quantity: faker.number.int({ min: 1, max: 10 }),
      available: faker.number.int({ min: 1, max: 10 }),
      ...overrides,
    }),

  outOfStock: (overrides = {}) =>
    inventoryGenerators.basic({
      quantity: 0,
      available: 0,
      ...overrides,
    }),
};

/**
 * Composite data generators
 * Creates related entities together for complex testing scenarios
 */
export const compositeGenerators = {
  /**
   * Generate a complete user with organization and membership
   */
  userWithOrganization: (overrides = {}) => {
    const user = userGenerators.basic(overrides.user);
    const organization = organizationGenerators.basic(overrides.organization);
    const member = {
      id: faker.string.uuid(),
      role: RegistryUserRole.OWNER,
      userId: user.id,
      organizationId: organization.id,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      ...overrides.member,
    };

    return { user, organization, member };
  },

  /**
   * Generate a complete product with brand and category
   */
  productWithBrandAndCategory: (overrides = {}) => {
    const brand = brandGenerators.basic(overrides.brand);
    const category = collectionGenerators.basic(overrides.category);
    const product = productGenerators.basic({
      brandId: brand.id,
      categoryId: category.id,
      ...overrides.product,
    });

    return { brand, category, product };
  },

  /**
   * Generate a complete order with user and items
   */
  orderWithUserAndItems: (overrides = {}) => {
    const user = userGenerators.basic(overrides.user);
    const order = orderGenerators.basic({
      userId: user.id,
      ...overrides.order,
    });

    const items = Array.from({ length: overrides.itemCount || 2 }, (_, i) => ({
      id: faker.string.uuid(),
      orderId: order.id,
      productId: faker.string.uuid(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: parseFloat(faker.commerce.price()),
      ...overrides.items?.[i],
    }));

    return { user, order, items };
  },

  /**
   * Generate seed data for auth functionality
   */
  authSeedData: (overrides = {}) => {
    const user = userGenerators.testUser(overrides.user);
    const organization = organizationGenerators.testOrg(overrides.organization);
    const apiKey = apiKeyGenerators.fullAccess({
      userId: user.id,
      ...overrides.apiKey,
    });
    const member = {
      id: faker.string.uuid(),
      role: RegistryUserRole.OWNER,
      userId: user.id,
      organizationId: organization.id,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      ...overrides.member,
    };
    const account = {
      id: faker.string.uuid(),
      type: 'oauth',
      provider: 'google',
      providerAccountId: faker.string.uuid(),
      userId: user.id,
      ...overrides.account,
    };

    return { user, organization, apiKey, member, account };
  },
};

/**
 * Test data utilities
 * Helper functions for common data operations
 */
export const testDataUtils = {
  /**
   * Generate multiple entities of the same type
   */
  generateMany: <T>(generator: (overrides?: any) => T, count: number, overrides = {}): T[] => {
    return Array.from({ length: count }, (_, i) => generator({ ...overrides, index: i }));
  },

  /**
   * Create a realistic e-commerce dataset
   */
  createEcommerceDataset: (options = {}) => {
    const { brandCount = 5, productCount = 20, userCount = 10, orderCount = 15 } = options;

    const brands = testDataUtils.generateMany(brandGenerators.basic, brandCount);
    const categories = testDataUtils.generateMany(collectionGenerators.basic, 5);
    const users = testDataUtils.generateMany(userGenerators.basic, userCount);

    const products = testDataUtils
      .generateMany(productGenerators.basic, productCount)
      .map((product, i) => ({
        ...product,
        brandId: brands[i % brands.length].id,
        categoryId: categories[i % categories.length].id,
      }));

    const orders = testDataUtils
      .generateMany(orderGenerators.basic, orderCount)
      .map((order, i) => ({
        ...order,
        userId: users[i % users.length].id,
      }));

    return { brands, categories, products, users, orders };
  },

  /**
   * Create mapper test data
   */
  createMapperTestData: (entityType: string, overrides = {}) => {
    const generators: Record<string, any> = {
      brand: brandGenerators,
      product: productGenerators,
      user: userGenerators,
      order: orderGenerators,
      address: addressGenerators,
      media: mediaGenerators,
      collection: collectionGenerators,
      review: reviewGenerators,
      inventory: inventoryGenerators,
    };

    const generator = generators[entityType];
    if (!generator) {
      throw new Error(`No generator found for entity type: ${entityType}`);
    }

    return {
      valid: generator.basic(overrides.valid),
      invalid: generator.basic({ ...overrides.invalid, name: '' }),
      edge: generator.basic(overrides.edge),
      bulk: testDataUtils.generateMany(generator.basic, 5, overrides.bulk),
    };
  },

  /**
   * Generate realistic fake data with consistent relationships
   */
  seedConsistentData: () => {
    faker.seed(12345); // Use consistent seed for reproducible tests
    return compositeGenerators.authSeedData();
  },
};
