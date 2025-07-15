/**
 * TypeScript declarations for Next.js 15 analytics integration
 */

/// <reference types="react" />
/// <reference types="next" />

import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

declare module 'next/server' {
  interface NextRequest {
    analytics?: {
      distinctId?: string;
      context?: Record<string, any>;
    };
  }
}

declare module 'next/headers' {
  interface ReadonlyHeaders {
    getAnalyticsContext(): Record<string, any>;
    getDistinctId(): string | null;
  }
}

// Augment global types for edge runtime
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_POSTHOG_HOST?: string;
      NEXT_PUBLIC_POSTHOG_KEY?: string;
      NEXT_PUBLIC_SEGMENT_WRITE_KEY?: string;
      NEXT_PUBLIC_VERCEL_ANALYTICS_ID?: string;
    }
  }

  interface Window {
    // PostHog types
    posthog?: any;

    // Segment types
    analytics?: any;

    // Custom analytics events
    analyticsReady?: boolean;
    onAnalyticsReady?: (callback: () => void) => void;
  }
}

// Server Action types
export type ServerActionResult<T = void> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

// Feature flag types with proper typing
export type TypedFeatureFlags<T extends Record<string, boolean>> = {
  [K in keyof T]: T[K];
};

// Analytics event types
export interface AnalyticsEvent {
  context?: Record<string, any>;
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

// Page view event
export interface PageViewEvent extends AnalyticsEvent {
  name: 'Page View';
  properties: {
    path: string;
    url: string;
    title: string;
    referrer?: string;
    search?: string;
    search_params?: Record<string, string>;
    route_params?: Record<string, string | string[]>;
  };
}

// E-commerce event types
export interface ProductViewEvent extends AnalyticsEvent {
  name: 'Product Viewed';
  properties: {
    product_id: string;
    product_name: string;
    price?: number;
    category?: string;
    [key: string]: any;
  };
}

export interface AddToCartEvent extends AnalyticsEvent {
  name: 'Product Added to Cart';
  properties: {
    product_id: string;
    product_name: string;
    price?: number;
    quantity: number;
    [key: string]: any;
  };
}

export interface CheckoutEvent extends AnalyticsEvent {
  name: 'Checkout Started';
  properties: {
    total: number;
    item_count: number;
    [key: string]: any;
  };
}

export interface PurchaseEvent extends AnalyticsEvent {
  name: 'Order Completed';
  properties: {
    order_id: string;
    total: number;
    item_count: number;
    [key: string]: any;
  };
}

// Form tracking event types
export interface FormStartEvent extends AnalyticsEvent {
  name: 'Form Started';
  properties: {
    form_name: string;
  };
}

export interface FormSubmitEvent extends AnalyticsEvent {
  name: 'Form Submitted';
  properties: {
    form_name: string;
    field_count?: number;
  };
}

export interface FormErrorEvent extends AnalyticsEvent {
  name: 'Form Error';
  properties: {
    form_name: string;
    error_message: string;
  };
}

// Middleware types
export interface AnalyticsMiddlewareContext {
  cookies: ReadonlyRequestCookies;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  headers: Headers;
  method: string;
  pathname: string;
  searchParams: URLSearchParams;
}

// React component props types
export interface TrackedComponentProps {
  'data-analytics-event'?: string;
  'data-analytics-properties'?: string | Record<string, any>;
}

// Hook return types
export interface UseAnalyticsReturn {
  identify: (userId: string, traits?: any) => void;
  page: (name?: string, properties?: any) => void;
  ready: boolean;
  track: (event: string, properties?: any) => void;
}

// Provider props types
export interface AnalyticsProviderProps {
  autoPageTracking?: boolean;
  bootstrapData?: import('../shared/types/posthog-types').BootstrapData;
  children: React.ReactNode;
  config: import('../shared/types/types').AnalyticsConfig;
  consentRequired?: boolean;
  onReady?: () => void;
  pageTrackingOptions?: {
    trackSearch?: boolean;
    trackParams?: boolean;
    properties?: Record<string, any>;
    skip?: boolean;
  };
}

// Utility types for type-safe event tracking
export type EventProperties<T extends AnalyticsEvent> = T extends { properties: infer P }
  ? P
  : never;

export type EventName<T extends AnalyticsEvent> = T extends { name: infer N } ? N : never;

// Helper type for creating typed track functions
export type TypedTrackFunction<T extends AnalyticsEvent> = (
  properties: EventProperties<T>,
) => void | Promise<void>;
