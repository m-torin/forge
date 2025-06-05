import { analytics } from "./analytics-setup";

/**
 * Guide for using all 6 Segment-style emitters
 */

// 1. PAGE - Track page views (for web applications)
export async function trackPageView(
  category: string,
  name: string,
  properties?: Record<string, any>,
) {
  await analytics.page(category, name, {
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    search: window.location.search,
    title: document.title,
    ...properties,
  });
}

// Examples:
// trackPageView('product', 'nike-air-max', { productId: '123' });
// trackPageView('category', 'shoes', { itemCount: 45 });
// trackPageView('checkout', 'shipping', { step: 2 });

// 2. TRACK - Track custom events
export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  await analytics.track(eventName, properties);
}

// Examples:
// trackEvent('Product Added to Cart', { productId: '123', price: 99.99 });
// trackEvent('Search Performed', { query: 'nike shoes', results: 25 });
// trackEvent('Video Played', { videoId: 'abc', duration: 120 });

// 3. IDENTIFY - Identify guests with traits
export async function identifyGuest(
  guestId: string,
  traits: Record<string, any>,
) {
  await analytics.identify(guestId, {
    ...traits,
    identifiedAt: new Date().toISOString(),
  });
}

// Examples:
// identifyGuest('guest-123', {
//   email: 'john@example.com',
//   name: 'John Doe',
//   plan: 'premium',
//   createdAt: '2024-01-01',
//   isAuthenticated: true
// });

// 4. GROUP - Associate guests with groups (organizations, teams, etc.)
export async function associateGuestWithGroup(
  groupId: string,
  traits?: Record<string, any>,
) {
  await analytics.group(groupId, traits);
}

// Examples:
// associateGuestWithGroup('company-456', {
//   name: 'Acme Corp',
//   industry: 'Technology',
//   employees: 100
// });

// 5. ALIAS - Create an alias for a guest (link anonymous to authenticated guest)
export async function createGuestAlias(guestId: string, previousId: string) {
  await analytics.alias(guestId, previousId);
}

// Examples:
// When guest signs up/logs in, link their anonymous ID to their authenticated guest ID:
// createGuestAlias('guest-123', 'anonymous-456');

// 6. SCREEN - Track screen views (for mobile/native applications)
// In a web app, you might use this for modal/overlay tracking
export async function trackScreenView(
  category: string,
  name: string,
  properties?: Record<string, any>,
) {
  await analytics.screen(category, name, properties);
}

// Examples (for modals/overlays in web):
// trackScreenView('modal', 'product-quick-view', { productId: '123' });
// trackScreenView('overlay', 'size-guide', { category: 'shoes' });
// trackScreenView('drawer', 'shopping-cart', { itemCount: 3 });

/**
 * Common e-commerce tracking patterns using the 6 emitters
 */

// Guest journey tracking
export const guestJourneyTracking = {
  // When guest first visits (anonymous)
  async trackAnonymousVisit() {
    await trackPageView("home", "landing");
  },

  // When guest signs up
  async trackSignup(guestId: string, email: string, method: string) {
    // Track the event
    await trackEvent("Signed Up", { method });

    // Identify the guest
    await identifyGuest(guestId, { email, signupMethod: method });

    // Link to their previous anonymous ID if available
    const anonymousId = localStorage.getItem("anonymousId");
    if (anonymousId) {
      await createGuestAlias(guestId, anonymousId);
    }
  },

  // When guest joins an organization
  async trackOrganizationJoin(guestId: string, orgId: string, orgName: string) {
    await associateGuestWithGroup(orgId, { name: orgName });
  },
};

// Product interaction tracking
export const productTracking = {
  // Product list view
  async trackProductListView(category: string, products: any[]) {
    await trackPageView("category", category, {
      productCount: products.length,
      productIds: products.map((p) => p.id),
    });
  },

  // Product detail view
  async trackProductView(product: any) {
    await trackPageView("product", product.handle, {
      category: product.category,
      price: product.price,
      productId: product.id,
      productName: product.title,
    });
  },

  // Quick view modal
  async trackQuickView(product: any) {
    await trackScreenView("modal", "product-quick-view", {
      productId: product.id,
      productName: product.title,
    });
  },
};

// Checkout flow tracking
export const checkoutTracking = {
  // Each checkout step as a page view
  async trackCheckoutStep(step: number, stepName: string) {
    await trackPageView("checkout", stepName, { step });
  },

  // Checkout completion
  async trackPurchase(orderId: string, total: number, products: any[]) {
    await trackEvent("Order Completed", {
      currency: "USD",
      orderId,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
      total,
    });
  },
};
