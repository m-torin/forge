/**
 * Centralized Test Data Generators
 *
 * Provides consistent test data generation across analytics test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

// Common test data patterns
export const testPatterns = {
  // User identifiers
  userIds: [
    'user-123',
    'user@example.com',
    'uuid-1234-5678-9012',
    'special-id!@#$%',
    '',
    'a'.repeat(100), // Long ID
  ],

  // Event names
  eventNames: [
    'Button Clicked',
    'Page Viewed',
    'Product Added',
    'Event with spaces',
    'Event-with-dashes',
    'Event_with_underscores',
    'Event.with.dots',
    'Event (with parentheses)',
    'Event/with/slashes',
    'Event:with:colons',
    '',
    'a'.repeat(200), // Long event name
  ],

  // Email addresses
  emails: [
    'test@example.com',
    'user.name@domain.co.uk',
    'user+tag@example.com',
    'user@subdomain.example.com',
    'test@localhost',
    'invalid-email',
    '',
  ],

  // URLs
  urls: [
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path?param=value',
    'https://example.com/path#fragment',
    'http://localhost:3000',
    'https://subdomain.example.com/deep/path',
    'invalid-url',
    '',
  ],

  // Currencies
  currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],

  // Countries
  countries: [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Japan',
    'Australia',
    'Brazil',
  ],

  // Timezones
  timezones: [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'UTC',
  ],

  // Device types
  deviceTypes: ['mobile', 'tablet', 'desktop', 'tv', 'watch', 'unknown'],

  // Operating systems
  operatingSystems: [
    { name: 'iOS', version: '17.0' },
    { name: 'Android', version: '14.0' },
    { name: 'Windows', version: '11' },
    { name: 'macOS', version: '14.0' },
    { name: 'Linux', version: '5.4' },
  ],

  // Browsers
  browsers: [
    { name: 'Chrome', version: '120.0' },
    { name: 'Safari', version: '17.0' },
    { name: 'Firefox', version: '119.0' },
    { name: 'Edge', version: '120.0' },
  ],

  // Screen sizes
  screenSizes: [
    { width: 375, height: 812 }, // iPhone
    { width: 414, height: 896 }, // iPhone Plus
    { width: 768, height: 1024 }, // iPad
    { width: 1920, height: 1080 }, // Desktop
    { width: 1366, height: 768 }, // Laptop
  ],
};

/**
 * Generates realistic ecommerce test data
 */
export const ecommerceTestData = {
  products: [
    {
      product_id: 'prod-running-shoes-001',
      name: 'Ultra Running Shoes',
      brand: 'SportsBrand',
      category: 'Footwear',
      subcategory: 'Running Shoes',
      price: 129.99,
      currency: 'USD',
      sku: 'URS-001-BLK-10',
      variant: 'Black',
      size: '10',
      color: 'Black',
      material: 'Synthetic',
      weight: 0.8,
      availability: 'in_stock',
      rating: 4.5,
      review_count: 1247,
      image_url: 'https://example.com/products/running-shoes.jpg',
      url: 'https://example.com/products/ultra-running-shoes',
    },
    {
      product_id: 'prod-laptop-002',
      name: 'Professional Laptop',
      brand: 'TechBrand',
      category: 'Electronics',
      subcategory: 'Laptops',
      price: 1299.99,
      currency: 'USD',
      sku: 'PL-002-SIL-16GB',
      variant: 'Silver',
      memory: '16GB',
      storage: '512GB SSD',
      processor: 'Intel i7',
      screen_size: '15.6"',
      availability: 'in_stock',
      rating: 4.3,
      review_count: 856,
      image_url: 'https://example.com/products/laptop.jpg',
      url: 'https://example.com/products/professional-laptop',
    },
    {
      product_id: 'prod-coffee-003',
      name: 'Premium Coffee Beans',
      brand: 'CoffeeBrand',
      category: 'Food & Beverage',
      subcategory: 'Coffee',
      price: 24.99,
      currency: 'USD',
      sku: 'PCB-003-DAR-1LB',
      variant: 'Dark Roast',
      weight: 1.0,
      origin: 'Colombia',
      roast_level: 'Dark',
      grind: 'Whole Bean',
      availability: 'in_stock',
      rating: 4.7,
      review_count: 2341,
      image_url: 'https://example.com/products/coffee.jpg',
      url: 'https://example.com/products/premium-coffee-beans',
    },
  ],

  orders: [
    {
      order_id: 'order-2024-001',
      order_number: 'ORD-2024-001',
      total: 164.98,
      subtotal: 154.98,
      tax: 10.0,
      shipping: 0.0,
      discount: 0.0,
      currency: 'USD',
      status: 'completed',
      payment_method: 'credit_card',
      shipping_method: 'standard',
      products: [
        {
          product_id: 'prod-running-shoes-001',
          quantity: 1,
          price: 129.99,
        },
        {
          product_id: 'prod-coffee-003',
          quantity: 1,
          price: 24.99,
        },
      ],
    },
  ],

  carts: [
    {
      cart_id: 'cart-temp-123',
      total: 154.98,
      currency: 'USD',
      products: [
        {
          product_id: 'prod-running-shoes-001',
          quantity: 1,
          price: 129.99,
        },
        {
          product_id: 'prod-coffee-003',
          quantity: 1,
          price: 24.99,
        },
      ],
    },
  ],

  categories: [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Health & Beauty',
    'Food & Beverage',
    'Toys & Games',
    'Automotive',
    'Office Supplies',
  ],

  brands: [
    'Apple',
    'Samsung',
    'Nike',
    'Adidas',
    'Amazon',
    'Google',
    'Microsoft',
    'Sony',
    'Dell',
    'HP',
  ],

  searchQueries: [
    'running shoes',
    'laptop',
    'coffee',
    'wireless headphones',
    'gaming chair',
    'smartphone',
    'tablet',
    'backpack',
    'water bottle',
    'bluetooth speaker',
  ],

  filters: [
    { brand: 'Nike', price_range: '50-150' },
    { category: 'Electronics', rating: '4+' },
    { size: 'Large', color: 'Black' },
    { availability: 'in_stock' },
    { price_range: '100-500', brand: 'Apple' },
  ],

  coupons: [
    {
      coupon_id: 'SAVE10',
      coupon_name: 'Save 10%',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order: 50,
      expiry_date: '2024-12-31',
    },
    {
      coupon_id: 'FREESHIP',
      coupon_name: 'Free Shipping',
      discount_type: 'shipping',
      discount_value: 0,
      minimum_order: 25,
      expiry_date: '2024-12-31',
    },
  ],
};

/**
 * Generates realistic user test data
 */
export const userTestData = {
  profiles: [
    {
      userId: 'user-john-doe-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 32,
      gender: 'male',
      location: 'San Francisco, CA',
      occupation: 'Software Engineer',
      plan: 'premium',
      signup_date: '2023-01-15',
      last_login: '2024-01-01',
      preferences: {
        newsletter: true,
        notifications: true,
        theme: 'dark',
        language: 'en',
      },
    },
    {
      userId: 'user-jane-smith-002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      age: 28,
      gender: 'female',
      location: 'New York, NY',
      occupation: 'Marketing Manager',
      plan: 'basic',
      signup_date: '2023-06-20',
      last_login: '2024-01-01',
      preferences: {
        newsletter: false,
        notifications: true,
        theme: 'light',
        language: 'en',
      },
    },
  ],

  companies: [
    {
      groupId: 'company-acme-001',
      name: 'Acme Corporation',
      industry: 'Technology',
      size: 'large',
      employees: 5000,
      revenue: 100000000,
      location: 'San Francisco, CA',
      founded: 1995,
      plan: 'enterprise',
      features: ['analytics', 'reporting', 'integrations'],
    },
    {
      groupId: 'company-startup-002',
      name: 'Startup Inc',
      industry: 'SaaS',
      size: 'small',
      employees: 25,
      revenue: 1000000,
      location: 'Austin, TX',
      founded: 2020,
      plan: 'growth',
      features: ['analytics', 'basic_reporting'],
    },
  ],

  sessions: [
    {
      session_id: 'session-web-001',
      device_type: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
      duration: 1800, // 30 minutes
      page_views: 5,
      events: 12,
      bounced: false,
      converted: true,
      referrer: 'google.com',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'brand_search',
    },
    {
      session_id: 'session-mobile-002',
      device_type: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      duration: 900, // 15 minutes
      page_views: 3,
      events: 8,
      bounced: true,
      converted: false,
      referrer: 'facebook.com',
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: 'awareness',
    },
  ],
};

/**
 * Generates edge case test data
 */
export const edgeCaseTestData = {
  // Empty/null/undefined values
  empty: {
    string: '',
    array: [],
    object: {},
    null: null,
    undefined: undefined,
  },

  // Special characters
  specialChars: [
    'test@#$%^&*()',
    'test with spaces',
    'test-with-dashes',
    'test_with_underscores',
    'test.with.dots',
    'test/with/slashes',
    'test\\with\\backslashes',
    'test"with"quotes',
    "test'with'apostrophes",
    'test<with>brackets',
    'test[with]square',
    'test{with}curly',
    'test=with=equals',
    'test+with+plus',
    'test?with?question',
    'test&with&ampersand',
  ],

  // Large data sets
  largeString: 'a'.repeat(10000),
  largeArray: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
  largeObject: Array.from({ length: 100 }, (_, i) => [`prop_${i}`, `value_${i}`]).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  ),

  // Unicode and international
  unicode: [
    'café',
    'naïve',
    'résumé',
    'Beijing 北京',
    'Tokyo 東京',
    'Moscow Москва',
    'Paris 🇫🇷',
    'emoji test 🎉🚀⭐',
    'Arabic العربية',
    'Chinese 中文',
    'Japanese 日本語',
    'Korean 한국어',
    'Russian Русский',
    'Thai ไทย',
    'Hebrew עברית',
  ],

  // Numeric edge cases
  numbers: [
    0,
    -1,
    1,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NaN,
    3.14159,
    -3.14159,
    1e10,
    1e-10,
  ],

  // Date edge cases
  dates: [
    new Date('1970-01-01T00:00:00Z'), // Unix epoch
    new Date('2038-01-19T03:14:07Z'), // Year 2038 problem
    new Date('1900-01-01T00:00:00Z'), // Early date
    new Date('2100-12-31T23:59:59Z'), // Future date
    new Date('invalid'), // Invalid date
    new Date(0), // Unix epoch
    new Date(Number.MAX_SAFE_INTEGER), // Far future
  ],
};

/**
 * Creates test data with specific patterns
 */
const createTestData = {
  /**
   * Creates a user with specific characteristics
   */
  user: (overrides = {}) => ({
    userId: 'user-test-001',
    name: 'Test User',
    email: 'test@example.com',
    age: 30,
    location: 'Test City, TS',
    plan: 'basic',
    ...overrides,
  }),

  /**
   * Creates a product with specific characteristics
   */
  product: (overrides = {}) => ({
    product_id: 'prod-test-001',
    name: 'Test Product',
    brand: 'Test Brand',
    category: 'Test Category',
    price: 99.99,
    currency: 'USD',
    ...overrides,
  }),

  /**
   * Creates an order with specific characteristics
   */
  order: (overrides = {}) => ({
    order_id: 'order-test-001',
    total: 199.98,
    currency: 'USD',
    status: 'completed',
    products: [createTestData.product()],
    ...overrides,
  }),

  /**
   * Creates a page view with specific characteristics
   */
  pageView: (overrides = {}) => ({
    url: 'https://example.com/test',
    path: '/test',
    title: 'Test Page',
    referrer: 'https://google.com',
    ...overrides,
  }),

  /**
   * Creates a campaign with specific characteristics
   */
  campaign: (overrides = {}) => ({
    name: 'test-campaign',
    source: 'google',
    medium: 'cpc',
    term: 'test keyword',
    content: 'test content',
    ...overrides,
  }),

  /**
   * Creates a device context with specific characteristics
   */
  device: (overrides = {}) => ({
    type: 'desktop',
    name: 'Test Device',
    manufacturer: 'Test Manufacturer',
    model: 'Test Model',
    version: '1.0',
    ...overrides,
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Large but manageable datasets for performance testing
    manyEvents: (count = 1000) =>
      Array.from({ length: count }, (_, i) => ({
        event: `Event ${i}`,
        properties: { index: i, batch: Math.floor(i / 100) },
      })),

    manyProducts: (count = 100) =>
      Array.from({ length: count }, (_, i) => ({
        product_id: `prod-${i}`,
        name: `Product ${i}`,
        price: 10 + i * 5,
        category: `Category ${i % 10}`,
      })),

    largeProperties: (propCount = 100) =>
      Array.from({ length: propCount }, (_, i) => [`prop_${i}`, `value_${i}`]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {},
      ),
  },
};

/**
 * Validation helpers for test data
 */
export const validateTestData = {
  /**
   * Validates that an object has all required properties
   */
  hasRequiredProperties: (obj: any, requiredProps: string[]) => {
    const missing = requiredProps.filter(
      prop => obj[prop] === undefined || obj[prop] === null || obj[prop] === '',
    );
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that an object has the expected property types
   */
  hasCorrectTypes: (obj: any, typeMap: Record<string, string>) => {
    const errors: string[] = [];

    Object.entries(typeMap).forEach(([prop, expectedType]) => {
      const value = obj[prop];
      const actualType = Array.isArray(value) ? 'array' : typeof value;

      if (value !== undefined && actualType !== expectedType) {
        errors.push(`${prop}: expected ${expectedType}, got ${actualType}`);
      }
    });

    return errors.length === 0 ? null : errors;
  },

  /**
   * Validates that a timestamp is reasonable
   */
  isValidTimestamp: (timestamp: any) => {
    if (!(timestamp instanceof Date)) return false;
    if (isNaN(timestamp.getTime())) return false;

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    return timestamp >= oneYearAgo && timestamp <= oneYearFromNow;
  },

  /**
   * Validates that a URL is properly formatted
   */
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates that an email is properly formatted
   */
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
