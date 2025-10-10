// Centralized test data factories for all tests in the monorepo

/**
 * Base factory interface
 */
interface Factory<T> {
  (overrides?: Partial<T>): T;
  sequence: (field: keyof T, start?: number) => Factory<T>;
  trait: (name: string, modifications: Partial<T>) => Factory<T>;
  sequenceCounters: Record<string, number>;
  traits: Record<string, Partial<T>>;
}

/**
 * Create a factory with sequence and trait support
 */
function createFactory<T>(defaultData: T): Factory<T> {
  let sequenceCounters: Record<string, number> = {};
  let traits: Record<string, Partial<T>> = {};

  const factory = (overrides: Partial<T> = {}): T => {
    return {
      ...defaultData,
      ...overrides,
    };
  };

  factory.sequence = (field: keyof T, start = 1) => {
    const newFactory = createFactory(defaultData);
    newFactory.sequenceCounters = { ...sequenceCounters };
    newFactory.traits = { ...traits };

    const originalFactory = newFactory;
    const sequenceFactory = (overrides: Partial<T> = {}): T => {
      if (!newFactory.sequenceCounters[field as string]) {
        newFactory.sequenceCounters[field as string] = start;
      }
      const sequenceValue = newFactory.sequenceCounters[field as string]++;

      return originalFactory({
        [field]: sequenceValue,
        ...overrides,
      } as Partial<T>);
    };

    Object.assign(sequenceFactory, newFactory);
    return sequenceFactory as Factory<T>;
  };

  factory.trait = (name: string, modifications: Partial<T>) => {
    traits[name] = modifications;
    return factory;
  };

  // Assign properties to make factory conform to interface
  factory.sequenceCounters = sequenceCounters;
  factory.traits = traits;

  return factory;
}

/**
 * Current timestamp for consistent test data
 */
const testTimestamp = new Date('2024-01-01T00:00:00.000Z');

/**
 * Common ID generators
 */
const generateId = {
  uuid: (prefix = '') => `${prefix}${Math.random().toString(36).substr(2, 9)}`,
  sequential: (prefix = '', start = 1) => {
    let counter = start;
    return () => `${prefix}${counter++}`;
  },
  timestamp: (prefix = '') => `${prefix}${Date.now()}`,
};

/**
 * User factory
 */
interface TestUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

const userFactory = createFactory<TestUser>({
  id: 'user_123',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  role: 'USER',
  status: 'ACTIVE',
  image: null,
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
  metadata: {},
});

/**
 * Organization factory
 */
interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
    projects: number;
  };
}

const organizationFactory = createFactory<TestOrganization>({
  id: 'org_123',
  name: 'Test Organization',
  slug: 'test-org',
  logo: null,
  status: 'ACTIVE',
  plan: 'PRO',
  metadata: {},
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
  _count: {
    members: 5,
    projects: 3,
  },
});

/**
 * Brand factory
 */
interface TestBrand {
  id: string;
  name: string;
  slug: string;
  type: 'LABEL' | 'RETAILER' | 'MANUFACTURER';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  baseUrl: string | null;
  displayOrder: number;
  copy: {
    description: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
    collections: number;
  };
}

const brandFactory = createFactory<TestBrand>({
  id: 'brand_123',
  name: 'Test Brand',
  slug: 'test-brand',
  type: 'LABEL',
  status: 'PUBLISHED',
  baseUrl: 'https://testbrand.com',
  displayOrder: 1,
  copy: {
    description: 'Test brand description',
    metaTitle: 'Test Brand - Meta Title',
    metaDescription: 'Test brand meta description',
    metaKeywords: 'test, brand, example',
  },
  parentId: null,
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
  _count: {
    products: 5,
    collections: 3,
  },
});

/**
 * Product factory
 */
interface TestProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE' | 'SUBSCRIPTION';
  brandId: string;
  price: number;
  currency: string;
  inventory: {
    tracked: boolean;
    quantity: number;
    lowStockThreshold: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: Date;
  updatedAt: Date;
  _count: {
    variants: number;
    media: number;
    reviews: number;
  };
}

const productFactory = createFactory<TestProduct>({
  id: 'product_123',
  name: 'Test Product',
  slug: 'test-product',
  sku: 'TEST-001',
  category: 'Test Category',
  status: 'ACTIVE',
  type: 'PHYSICAL',
  brandId: 'brand_123',
  price: 99.99,
  currency: 'USD',
  inventory: {
    tracked: true,
    quantity: 100,
    lowStockThreshold: 10,
  },
  seo: {
    title: 'Test Product - SEO Title',
    description: 'Test product SEO description',
    keywords: 'test, product, example',
  },
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
  _count: {
    variants: 3,
    media: 5,
    reviews: 12,
  },
});

/**
 * Collection factory
 */
interface TestCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'MANUAL' | 'AUTOMATIC' | 'SMART';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  rules: Record<string, any>;
  sortOrder: string;
  featuredImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

const collectionFactory = createFactory<TestCollection>({
  id: 'collection_123',
  name: 'Test Collection',
  slug: 'test-collection',
  description: 'Test collection description',
  type: 'MANUAL',
  status: 'PUBLISHED',
  rules: {},
  sortOrder: 'created_at_desc',
  featuredImage: null,
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
  _count: {
    products: 10,
  },
});

/**
 * Order factory
 */
interface TestOrder {
  id: string;
  number: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  userId: string;
  email: string;
  total: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderFactory = createFactory<TestOrder>({
  id: 'order_123',
  number: 'ORD-001',
  status: 'CONFIRMED',
  userId: 'user_123',
  email: 'test@example.com',
  total: 199.98,
  currency: 'USD',
  items: [
    {
      productId: 'product_123',
      quantity: 2,
      price: 99.99,
    },
  ],
  shippingAddress: {
    name: 'Test User',
    line1: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'US',
  },
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
});

/**
 * Analytics event factory
 */
interface TestAnalyticsEvent {
  id: string;
  event: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  context: {
    page: {
      url: string;
      title: string;
      path: string;
    };
    userAgent: string;
    ip: string;
  };
  timestamp: Date;
}

const analyticsEventFactory = createFactory<TestAnalyticsEvent>({
  id: 'event_123',
  event: 'page_view',
  userId: 'user_123',
  sessionId: 'session_123',
  properties: {},
  context: {
    page: {
      url: 'https://example.com/test',
      title: 'Test Page',
      path: '/test',
    },
    userAgent: 'Mozilla/5.0 (Test Browser)',
    ip: '192.168.1.1',
  },
  timestamp: testTimestamp,
});

/**
 * Workflow execution factory
 */
interface TestWorkflowExecution {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: Record<string, any>;
  output: Record<string, any> | null;
  error: string | null;
  progress: number;
  metadata: Record<string, any>;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
}

const workflowExecutionFactory = createFactory<TestWorkflowExecution>({
  id: 'workflow_123',
  type: 'seo-generation',
  status: 'completed',
  input: { productId: 'product_123' },
  output: { seoTitle: 'Generated SEO Title' },
  error: null,
  progress: 100,
  metadata: {},
  startedAt: testTimestamp,
  completedAt: new Date(testTimestamp.getTime() + 30000), // 30 seconds later
  duration: 30000,
});

/**
 * Export all factories
 */
const factories = {
  user: userFactory,
  organization: organizationFactory,
  brand: brandFactory,
  product: productFactory,
  collection: collectionFactory,
  order: orderFactory,
  analyticsEvent: analyticsEventFactory,
  workflowExecution: workflowExecutionFactory,
};

/**
 * Helper to create multiple instances
 */
function createMany<T>(factory: Factory<T>, count: number, overrides?: Partial<T>[]): T[] {
  return Array.from({ length: count }, (_, index) => factory(overrides?.[index] || {}));
}

/**
 * Helper to create related data
 */
function createRelatedData() {
  const user = userFactory();
  const organization = organizationFactory();
  const brand = brandFactory();
  const product = productFactory({ brandId: brand.id });
  const collection = collectionFactory();
  const order = orderFactory({
    userId: user.id,
    items: [{ productId: product.id, quantity: 1, price: product.price }],
    total: product.price,
  });

  return {
    user,
    organization,
    brand,
    product,
    collection,
    order,
  };
}

// Types are already exported with their interface declarations above
