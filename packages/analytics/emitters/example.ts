import { Analytics } from './analytics';

/**
 * Example: Basic Analytics Setup
 */
async function basicExample() {
  // Initialize analytics with multiple providers
  const analytics = new Analytics({
    providers: {
      googleAnalytics: {
        measurementId: process.env.GA_MEASUREMENT_ID || 'G-DEMO',
      },
      posthog: {
        apiKey: process.env.POSTHOG_API_KEY || 'demo-key',
      },
      segment: {
        writeKey: process.env.SEGMENT_WRITE_KEY || 'demo-key',
      },
    },
    debug: true,
  });

  // Identify a user
  await analytics.identify('user-123', {
    name: 'John Doe',
    createdAt: new Date('2023-01-01'),
    email: 'john@example.com',
    plan: 'premium',
  });

  // Track various events
  await analytics.track('Account Created', {
    method: 'email',
    referrer: 'organic',
  });

  await analytics.track('Feature Used', {
    feature: 'Export',
    format: 'PDF',
    items: 25,
  });

  // Track page view
  await analytics.page('Documentation', 'Getting Started', {
    section: 'Installation',
  });

  // Associate user with a group
  await analytics.group('company-456', {
    name: 'Acme Corp',
    employees: 100,
    industry: 'Technology',
  });

  // Flush any remaining events
  await analytics.flush();
}

/**
 * Example: E-commerce Tracking
 */
async function ecommerceExample() {
  const analytics = new Analytics({
    providers: {
      segment: { writeKey: 'your-key' },
    },
  });

  // Track product view
  await analytics.track('Product Viewed', {
    name: 'Wireless Headphones',
    brand: 'TechBrand',
    category: 'Electronics/Audio',
    currency: 'USD',
    price: 99.99,
    productId: 'SKU-123',
  });

  // Track add to cart
  await analytics.track('Product Added', {
    currency: 'USD',
    price: 99.99,
    productId: 'SKU-123',
    quantity: 1,
  });

  // Track checkout
  await analytics.track('Checkout Started', {
    cartId: 'cart-789',
    currency: 'USD',
    products: [{
      price: 99.99,
      productId: 'SKU-123',
      quantity: 1,
    }],
    revenue: 99.99,
  });

  // Track purchase
  await analytics.track('Order Completed', {
    coupon: 'SAVE10',
    currency: 'USD',
    orderId: 'order-012',
    products: [{
      name: 'Wireless Headphones',
      category: 'Electronics/Audio',
      price: 99.99,
      productId: 'SKU-123',
      quantity: 1,
    }],
    revenue: 99.99,
    shipping: 5.00,
    tax: 8.99,
  });
}

/**
 * Example: Server-side API Usage
 */
async function serverSideExample() {
  const analytics = new Analytics({
    providers: {
      segment: {
        config: {
          flushAt: 20,
          flushInterval: 10000,
        },
        writeKey: process.env.SEGMENT_WRITE_KEY!,
      },
    },
  });

  // Track API usage
  await analytics.track('API Request', {
    duration: 125,
    endpoint: '/api/users',
    method: 'GET',
    status: 200,
    userId: 'user-123',
  });

  // Track errors
  await analytics.track('API Error', {
    endpoint: '/api/users',
    error: 'Internal Server Error',
    method: 'POST',
    stack: 'Error stack trace...',
    status: 500,
  });

  // Always flush before process exits
  process.on('beforeExit', async () => {
    await analytics.flush();
  });
}

/**
 * Example: React Component
 */
export function AnalyticsExample() {
  const analytics = new Analytics({
    providers: {
      googleAnalytics: {
        measurementId: 'G-XXXXXXXXXX',
      },
    },
  });

  const handleClick = () => {
    analytics.track('Button Clicked', {
      button: 'cta-hero',
      location: 'hero-section',
      text: 'Get Started',
    });
  };

  const handleFormSubmit = (formData: any) => {
    analytics.track('Form Submitted', {
      fields: Object.keys(formData),
      formId: 'contact-form',
    });
  };

  return {
    analytics,
    handleClick,
    handleFormSubmit,
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    console.log('Running analytics examples...');
    await basicExample();
    await ecommerceExample();
    await serverSideExample();
    console.log('Examples completed!');
  })();
}