/**
 * Next.js App Router specific analytics helpers
 * Provides hooks and components optimized for the App Router
 */

'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { createNextJSClientAnalytics, type NextJSClientAnalyticsManager } from './client';

import type { BootstrapData } from '../shared/types/posthog-types';
import type { AnalyticsConfig, TrackingOptions } from '../shared/types/types';

// Global analytics instance
let globalAnalytics: NextJSClientAnalyticsManager | null = null;

/**
 * Hook to get or create analytics instance
 */
export function useAnalytics(config?: AnalyticsConfig): NextJSClientAnalyticsManager | null {
  const [analytics, setAnalytics] = useState<NextJSClientAnalyticsManager | null>(null);

  useEffect(() => {
    if (!globalAnalytics && config) {
      globalAnalytics = createNextJSClientAnalytics(config);
      globalAnalytics.initialize();
    }
    setAnalytics(globalAnalytics);
  }, [config]);

  return analytics;
}

/**
 * Hook for automatic page view tracking in App Router
 */
export function usePageTracking(options?: {
  trackSearch?: boolean;
  trackParams?: boolean;
  properties?: Record<string, any>;
  skip?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const tracked = useRef<string>('');

  useEffect(() => {
    if (options?.skip || !globalAnalytics) return;

    // Create unique key for this page view
    const searchString = options?.trackSearch ? searchParams.toString() : '';
    const pageKey = `${pathname}${searchString}`;

    // Avoid duplicate tracking
    if (tracked.current === pageKey) return;
    tracked.current = pageKey;

    // Build properties
    const properties: Record<string, any> = {
      ...options?.properties,
      url: window.location.href,
      path: pathname,
      referrer: document.referrer,
      title: document.title,
    };

    if (options?.trackSearch) {
      properties.search = searchString;
      properties.search_params = Object.fromEntries(searchParams.entries());
    }

    if (options?.trackParams && params) {
      properties.route_params = params;
    }

    // Track page view
    globalAnalytics.page(pathname, properties);
  }, [
    pathname,
    searchParams,
    params,
    options?.skip,
    options?.trackSearch,
    options?.trackParams,
    options?.properties,
  ]);
}

/**
 * Hook for tracking events
 */
export function useTrackEvent() {
  return useCallback((event: string, properties?: any, options?: TrackingOptions) => {
    if (!globalAnalytics) return;
    globalAnalytics.track(event, properties, options);
  }, []);
}

/**
 * Hook for user identification
 */
export function useIdentifyUser() {
  return useCallback((userId: string, traits?: any, options?: TrackingOptions) => {
    if (!globalAnalytics) return;
    globalAnalytics.identify(userId, traits, options);
  }, []);
}

/**
 * Hook for analytics consent management
 */
export function useAnalyticsConsent() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const grantConsent = useCallback(async () => {
    if (!globalAnalytics) return;

    setIsLoading(true);
    try {
      await globalAnalytics.grantConsent();
      setConsentGiven(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(() => {
    if (!globalAnalytics) return;

    globalAnalytics.revokeConsent();
    setConsentGiven(false);
  }, []);

  useEffect(() => {
    if (!globalAnalytics) return;

    const status = globalAnalytics.getStatus();
    setConsentGiven(status.consentGiven);
  }, []);

  return {
    consentGiven,
    grantConsent,
    isLoading,
    revokeConsent,
  };
}

/**
 * Analytics provider component for App Router
 */
export function AnalyticsProvider({
  autoPageTracking = true,
  bootstrapData,
  children,
  config,
  pageTrackingOptions,
}: {
  children: React.ReactNode;
  config: AnalyticsConfig;
  bootstrapData?: BootstrapData;
  autoPageTracking?: boolean;
  pageTrackingOptions?: Parameters<typeof usePageTracking>[0];
}) {
  // Initialize analytics
  useEffect(() => {
    if (!globalAnalytics) {
      const analyticsConfig = { ...config };

      // Add bootstrap data if provided
      if (bootstrapData && config.providers.posthog) {
        analyticsConfig.nextjs = {
          ...analyticsConfig.nextjs,
          posthog: {
            ...analyticsConfig.nextjs?.posthog,
            bootstrap: bootstrapData,
          },
        };
      }

      globalAnalytics = createNextJSClientAnalytics(analyticsConfig);
      globalAnalytics.initialize();
    }
  }, [config, bootstrapData]);

  // Auto page tracking
  usePageTracking(autoPageTracking ? pageTrackingOptions : { skip: true });

  return children as React.ReactElement;
}

/**
 * Higher-order component for tracking component views
 */
export function withViewTracking<P extends object>(
  Component: React.ComponentType<P>,
  eventName: string,
  getProperties?: (props: P) => Record<string, any>,
) {
  return function TrackedComponent(props: P) {
    const track = useTrackEvent();
    const tracked = useRef(false);

    useEffect(() => {
      if (!tracked.current) {
        tracked.current = true;
        const properties = getProperties ? getProperties(props) : {};
        track(eventName, properties);
      }
    }, [track, props]);

    return <Component {...props} />;
  };
}

/**
 * Component for tracking clicks
 */
export function TrackedButton({
  children,
  eventName,
  onClick,
  properties,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  eventName: string;
  properties?: Record<string, any>;
}) {
  const track = useTrackEvent();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      track(eventName, properties);
      onClick?.(e);
    },
    [track, eventName, properties, onClick],
  );

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

/**
 * Component for tracking link clicks
 */
export function TrackedLink({
  children,
  eventName,
  href,
  onClick,
  properties,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  properties?: Record<string, any>;
}) {
  const track = useTrackEvent();
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Track the event
      const enhancedProperties = {
        ...properties,
        href,
        link_text: typeof children === 'string' ? children : undefined,
      };
      track(eventName, enhancedProperties);

      // Handle navigation
      if (onClick) {
        onClick(e);
      } else if (href && !props.target && href.startsWith('/')) {
        // Internal navigation
        e.preventDefault();
        router.push(href);
      }
    },
    [track, eventName, properties, href, onClick, router, children, props.target],
  );

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

/**
 * Hook for tracking form submissions
 */
export function useFormTracking(formName: string) {
  const track = useTrackEvent();

  const trackFormStart = useCallback(() => {
    track('Form Started', { form_name: formName });
  }, [track, formName]);

  const trackFormSubmit = useCallback(
    (data?: any) => {
      track('Form Submitted', {
        form_name: formName,
        field_count: data ? Object.keys(data).length : undefined,
      });
    },
    [track, formName],
  );

  const trackFormError = useCallback(
    (error: any) => {
      track('Form Error', {
        form_name: formName,
        error_message: error?.message || String(error),
      });
    },
    [track, formName],
  );

  const trackFieldInteraction = useCallback(
    (fieldName: string) => {
      track('Form Field Interacted', {
        field_name: fieldName,
        form_name: formName,
      });
    },
    [track, formName],
  );

  return {
    trackFieldInteraction,
    trackFormError,
    trackFormStart,
    trackFormSubmit,
  };
}

/**
 * Hook for e-commerce tracking helpers
 */
export function useEcommerceTracking() {
  const track = useTrackEvent();

  const trackProductView = useCallback(
    (product: {
      id: string;
      name: string;
      price?: number;
      category?: string;
      [key: string]: any;
    }) => {
      track('Product Viewed', {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: product.price,
        ...product,
      });
    },
    [track],
  );

  const trackAddToCart = useCallback(
    (product: {
      id: string;
      name: string;
      price?: number;
      quantity?: number;
      [key: string]: any;
    }) => {
      track('Product Added to Cart', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
        ...product,
      });
    },
    [track],
  );

  const trackCheckout = useCallback(
    (cart: { total: number; items: any[]; [key: string]: any }) => {
      const { items, total, ...otherProps } = cart;
      track('Checkout Started', {
        item_count: items.length,
        total,
        ...otherProps,
      });
    },
    [track],
  );

  const trackPurchase = useCallback(
    (order: { orderId: string; total: number; items: any[]; [key: string]: any }) => {
      const { items, orderId, total, ...otherProps } = order;
      track('Order Completed', {
        order_id: orderId,
        item_count: items.length,
        total,
        ...otherProps,
      });
    },
    [track],
  );

  return {
    trackAddToCart,
    trackCheckout,
    trackProductView,
    trackPurchase,
  };
}

/**
 * Utility to reset analytics (useful for testing)
 */
export function resetAnalytics() {
  globalAnalytics = null;
}
