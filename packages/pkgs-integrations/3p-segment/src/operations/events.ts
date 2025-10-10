/**
 * Segment event operations
 */

import type {
  SegmentAliasPayload,
  SegmentContext,
  SegmentGroupPayload,
  SegmentIdentifyPayload,
  SegmentPagePayload,
  SegmentTrackPayload,
} from '../types';

export function createTrackEvent(
  eventName: string,
  properties?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
    timestamp?: Date | string;
    integrations?: Record<string, boolean | any>;
    messageId?: string;
  },
): SegmentTrackPayload {
  return {
    event: eventName,
    properties: properties || {},
    context: {
      library: {
        name: '@repo/3p-segment',
        version: '0.1.0',
      },
      ...context,
    },
    userId: options?.userId,
    anonymousId: options?.anonymousId,
    timestamp: options?.timestamp || new Date(),
    integrations: options?.integrations || {},
    messageId: options?.messageId,
  };
}

export function createIdentifyEvent(
  userId: string,
  traits?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    anonymousId?: string;
    timestamp?: Date | string;
    integrations?: Record<string, boolean | any>;
    messageId?: string;
  },
): SegmentIdentifyPayload {
  return {
    userId,
    traits: traits || {},
    context: {
      library: {
        name: '@repo/3p-segment',
        version: '0.1.0',
      },
      ...context,
    },
    anonymousId: options?.anonymousId,
    timestamp: options?.timestamp || new Date(),
    integrations: options?.integrations || {},
    messageId: options?.messageId,
  };
}

export function createPageEvent(
  name?: string,
  category?: string,
  properties?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
    timestamp?: Date | string;
    integrations?: Record<string, boolean | any>;
    messageId?: string;
  },
): SegmentPagePayload {
  return {
    name,
    category,
    properties: {
      title: typeof window !== 'undefined' ? document.title : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      search: typeof window !== 'undefined' ? window.location.search : undefined,
      ...properties,
    },
    context: {
      library: {
        name: '@repo/3p-segment',
        version: '0.1.0',
      },
      page:
        typeof window !== 'undefined'
          ? {
              title: document.title,
              url: window.location.href,
              path: window.location.pathname,
              referrer: document.referrer,
              search: window.location.search,
            }
          : undefined,
      ...context,
    },
    userId: options?.userId,
    anonymousId: options?.anonymousId,
    timestamp: options?.timestamp || new Date(),
    integrations: options?.integrations || {},
    messageId: options?.messageId,
  };
}

export function createGroupEvent(
  groupId: string,
  traits?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
    timestamp?: Date | string;
    integrations?: Record<string, boolean | any>;
    messageId?: string;
  },
): SegmentGroupPayload {
  return {
    groupId,
    traits: traits || {},
    context: {
      library: {
        name: '@repo/3p-segment',
        version: '0.1.0',
      },
      ...context,
    },
    userId: options?.userId,
    anonymousId: options?.anonymousId,
    timestamp: options?.timestamp || new Date(),
    integrations: options?.integrations || {},
    messageId: options?.messageId,
  };
}

export function createAliasEvent(
  userId: string,
  previousId: string,
  context?: Partial<SegmentContext>,
  options?: {
    timestamp?: Date | string;
    integrations?: Record<string, boolean | any>;
    messageId?: string;
  },
): SegmentAliasPayload {
  return {
    userId,
    previousId,
    context: {
      library: {
        name: '@repo/3p-segment',
        version: '0.1.0',
      },
      ...context,
    },
    timestamp: options?.timestamp || new Date(),
    integrations: options?.integrations || {},
    messageId: options?.messageId,
  };
}

// E-commerce events
export function trackPurchase(
  orderId: string,
  products: Array<{
    product_id: string;
    name: string;
    category?: string;
    price: number;
    quantity: number;
    sku?: string;
    brand?: string;
    variant?: string;
  }>,
  total: number,
  currency = 'USD',
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
    coupon?: string;
    discount?: number;
    shipping?: number;
    tax?: number;
  },
): SegmentTrackPayload {
  const revenue = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

  return createTrackEvent(
    'Order Completed',
    {
      order_id: orderId,
      total,
      revenue,
      currency,
      products,
      coupon: options?.coupon,
      discount: options?.discount,
      shipping: options?.shipping,
      tax: options?.tax,
    },
    context,
    {
      userId: options?.userId,
      anonymousId: options?.anonymousId,
    },
  );
}

export function trackProductViewed(
  productId: string,
  productName: string,
  category?: string,
  price?: number,
  properties?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  return createTrackEvent(
    'Product Viewed',
    {
      product_id: productId,
      name: productName,
      category,
      price,
      currency: 'USD',
      ...properties,
    },
    context,
    options,
  );
}

export function trackCartEvent(
  action: 'added' | 'removed' | 'viewed',
  product?: {
    product_id: string;
    name: string;
    category?: string;
    price?: number;
    quantity?: number;
    sku?: string;
  },
  cart?: {
    cart_id?: string;
    products?: any[];
    total?: number;
    currency?: string;
  },
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  const eventMap = {
    added: 'Product Added',
    removed: 'Product Removed',
    viewed: 'Cart Viewed',
  };

  return createTrackEvent(
    eventMap[action],
    {
      ...product,
      ...cart,
    },
    context,
    options,
  );
}

// Marketing events
export function trackCampaignEvent(
  action: 'clicked' | 'opened' | 'unsubscribed' | 'bounced',
  campaign: {
    campaign_id?: string;
    campaign_name?: string;
    email_address?: string;
    email_id?: string;
    subject?: string;
    link_id?: string;
    link_url?: string;
  },
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  const eventMap = {
    clicked: 'Email Link Clicked',
    opened: 'Email Opened',
    unsubscribed: 'Email Unsubscribed',
    bounced: 'Email Bounced',
  };

  return createTrackEvent(eventMap[action], campaign, context, options);
}

// User lifecycle events
export function trackSignup(
  method?: string,
  plan?: string,
  properties?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  return createTrackEvent(
    'Signed Up',
    {
      method,
      plan,
      ...properties,
    },
    context,
    options,
  );
}

export function trackLogin(
  method?: string,
  properties?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  return createTrackEvent(
    'Signed In',
    {
      method,
      ...properties,
    },
    context,
    options,
  );
}

export function trackLogout(
  properties?: Record<string, any>,
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  return createTrackEvent('Signed Out', properties, context, options);
}

// B2B events
export function trackLeadEvent(
  action: 'generated' | 'qualified' | 'converted',
  lead: {
    lead_id?: string;
    company?: string;
    title?: string;
    industry?: string;
    employees?: number;
    revenue?: number;
    source?: string;
    campaign?: string;
  },
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  const eventMap = {
    generated: 'Lead Generated',
    qualified: 'Lead Qualified',
    converted: 'Lead Converted',
  };

  return createTrackEvent(eventMap[action], lead, context, options);
}

// Content events
export function trackContentEvent(
  action: 'viewed' | 'shared' | 'liked' | 'commented',
  content: {
    content_id?: string;
    content_name?: string;
    content_type?: string;
    category?: string;
    author?: string;
    publish_date?: string;
    word_count?: number;
    read_time?: number;
  },
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  const eventMap = {
    viewed: 'Content Viewed',
    shared: 'Content Shared',
    liked: 'Content Liked',
    commented: 'Content Commented',
  };

  return createTrackEvent(eventMap[action], content, context, options);
}

// App events
export function trackAppEvent(
  action: 'opened' | 'closed' | 'backgrounded' | 'foregrounded' | 'crashed',
  app?: {
    version?: string;
    build?: string;
    name?: string;
    namespace?: string;
  },
  context?: Partial<SegmentContext>,
  options?: {
    userId?: string;
    anonymousId?: string;
  },
): SegmentTrackPayload {
  const eventMap = {
    opened: 'Application Opened',
    closed: 'Application Closed',
    backgrounded: 'Application Backgrounded',
    foregrounded: 'Application Foregrounded',
    crashed: 'Application Crashed',
  };

  return createTrackEvent(eventMap[action], app, context, options);
}
