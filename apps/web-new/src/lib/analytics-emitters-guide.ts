import { analytics } from './analytics-setup';

/**
 * Guide for using all 6 Segment-style emitters
 */

// 1. PAGE - Track page views (for web applications)
export async function trackPageView(category: string, name: string, properties?: Record<string, any>) {
  await analytics.page(category, name, {
    path: window.location.pathname,
    url: window.location.href,
    search: window.location.search,
    title: document.title,
    referrer: document.referrer,
    ...properties,
  });
}

// Examples:
// trackPageView('product', 'nike-air-max', { productId: '123' });
// trackPageView('category', 'shoes', { itemCount: 45 });
// trackPageView('checkout', 'shipping', { step: 2 });

// 2. TRACK - Track custom events
export async function trackEvent(eventName: string, properties?: Record<string, any>) {
  await analytics.track(eventName, properties);
}

// Examples:
// trackEvent('Product Added to Cart', { productId: '123', price: 99.99 });
// trackEvent('Search Performed', { query: 'nike shoes', results: 25 });
// trackEvent('Video Played', { videoId: 'abc', duration: 120 });

// 3. IDENTIFY - Identify users with traits
export async function identifyUser(userId: string, traits: Record<string, any>) {
  await analytics.identify(userId, {
    ...traits,
    identifiedAt: new Date().toISOString(),
  });
}

// Examples:
// identifyUser('user-123', { 
//   email: 'john@example.com',
//   name: 'John Doe',
//   plan: 'premium',
//   createdAt: '2024-01-01'
// });

// 4. GROUP - Associate users with groups (organizations, teams, etc.)
export async function associateUserWithGroup(groupId: string, traits?: Record<string, any>) {
  await analytics.group(groupId, traits);
}

// Examples:
// associateUserWithGroup('company-456', {
//   name: 'Acme Corp',
//   industry: 'Technology',
//   employees: 100
// });

// 5. ALIAS - Create an alias for a user (link anonymous to known user)
export async function createUserAlias(userId: string, previousId: string) {
  await analytics.alias(userId, previousId);
}

// Examples:
// When user signs up/logs in, link their anonymous ID to their user ID:
// createUserAlias('user-123', 'anonymous-456');

// 6. SCREEN - Track screen views (for mobile/native applications)
// In a web app, you might use this for modal/overlay tracking
export async function trackScreenView(category: string, name: string, properties?: Record<string, any>) {
  await analytics.screen(category, name, properties);
}

// Examples (for modals/overlays in web):
// trackScreenView('modal', 'product-quick-view', { productId: '123' });
// trackScreenView('overlay', 'size-guide', { category: 'shoes' });
// trackScreenView('drawer', 'shopping-cart', { itemCount: 3 });

/**
 * Common e-commerce tracking patterns using the 6 emitters
 */

// User journey tracking
export const userJourneyTracking = {
  // When user first visits (anonymous)
  async trackAnonymousVisit() {
    await trackPageView('home', 'landing');
  },

  // When user signs up
  async trackSignup(userId: string, email: string, method: string) {
    // Track the event
    await trackEvent('User Signed Up', { method });
    
    // Identify the user
    await identifyUser(userId, { email, signupMethod: method });
    
    // Link to their previous anonymous ID if available
    const anonymousId = localStorage.getItem('anonymousId');
    if (anonymousId) {
      await createUserAlias(userId, anonymousId);
    }
  },

  // When user joins an organization
  async trackOrganizationJoin(userId: string, orgId: string, orgName: string) {
    await associateUserWithGroup(orgId, { name: orgName });
  },
};

// Product interaction tracking
export const productTracking = {
  // Product list view
  async trackProductListView(category: string, products: any[]) {
    await trackPageView('category', category, {
      productCount: products.length,
      productIds: products.map(p => p.id),
    });
  },

  // Product detail view
  async trackProductView(product: any) {
    await trackPageView('product', product.handle, {
      productId: product.id,
      productName: product.title,
      price: product.price,
      category: product.category,
    });
  },

  // Quick view modal
  async trackQuickView(product: any) {
    await trackScreenView('modal', 'product-quick-view', {
      productId: product.id,
      productName: product.title,
    });
  },
};

// Checkout flow tracking
export const checkoutTracking = {
  // Each checkout step as a page view
  async trackCheckoutStep(step: number, stepName: string) {
    await trackPageView('checkout', stepName, { step });
  },

  // Checkout completion
  async trackPurchase(orderId: string, total: number, products: any[]) {
    await trackEvent('Order Completed', {
      orderId,
      total,
      currency: 'USD',
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
    });
  },
};