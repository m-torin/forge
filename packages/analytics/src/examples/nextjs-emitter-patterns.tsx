/**
 * Next.js Emitter Patterns - Examples for App Router
 *
 * This file demonstrates emitter usage patterns specifically
 * for Next.js 15 applications using the App Router.
 */

import { cookies } from 'next/headers';
import React from 'react';

import { TrackedButton, TrackedLink, useAnalytics, useTrackEvent } from '../next/app-router';
import { identifyServerUser, trackEventAction, trackServerEvent } from '../next/rsc';
import { createUserSession, EventBatch, page, track, withMetadata } from '../shared/emitters';

// ====================================
// CLIENT COMPONENTS WITH HOOKS
// ====================================

export function ProductCard({ product }: { product: any }) {
  const analytics = useAnalytics();
  const trackEvent = useTrackEvent();

  // Method 1: Using the track method with product viewed event
  const handleView = async () => {
    if (!analytics) return;

    await analytics.track('Product Viewed', {
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
    });
  };

  // Method 2: Using the trackEvent hook
  const handleAddToCart = async () => {
    await trackEvent('Product Added to Cart', {
      product_id: product.id,
      name: product.name,
      cart_total: product.price,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onMouseEnter={handleView} aria-label={`Product: ${product.name}`}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}

// ====================================
// TRACKED COMPONENTS WITH EMITTERS
// ====================================

export function HeroSection() {
  // Create emitter payloads for tracked components
  const ctaClickEvent = track('CTA Clicked', {
    location: 'hero',
    text: 'Start Free Trial',
    variant: 'primary',
  });

  const learnMoreEvent = track('Link Clicked', {
    destination: '/features',
    location: 'hero',
    text: 'Learn More',
  });

  return (
    <section>
      <h1>Welcome to Our Platform</h1>

      <TrackedButton
        properties={ctaClickEvent.properties}
        className="btn-primary"
        eventName={ctaClickEvent.event}
      >
        Start Free Trial
      </TrackedButton>

      <TrackedLink
        href="/features"
        properties={learnMoreEvent.properties}
        eventName={learnMoreEvent.event}
      >
        Learn More →
      </TrackedLink>
    </section>
  );
}

// ====================================
// FORM TRACKING WITH EMITTERS
// ====================================

export function SignupForm() {
  const analytics = useAnalytics();
  const [formData, _setFormData] = React.useState({
    company: '',
    email: '',
    role: '',
  });

  // Track form progression with event batch
  const trackFormProgress = React.useCallback(async () => {
    const batch = new EventBatch();
    const filledFields = Object.entries(formData)
      .filter(([_, value]) => value)
      .map(([field]) => field);

    if (filledFields.length === 1) {
      batch.addTrack('Form Started', {
        form_id: 'signup',
        first_field: filledFields[0],
      });
    }

    filledFields.forEach(field => {
      batch.addTrack('Form Field Completed', {
        form_id: 'signup',
        field_name: field,
      });
    });

    if (!analytics) return;

    // Track each event individually since emitBatch might not be available
    const events = batch.getEvents();
    for (const event of events) {
      if (event.type === 'track') {
        await analytics.track(event.event, event.properties);
      }
    }
  }, [formData, analytics]);

  React.useEffect(() => {
    trackFormProgress();
  }, [trackFormProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Track form submission with metadata
    const submitEvent = track('Form Submitted', {
      form_id: 'signup',
      fields: Object.keys(formData),
      method: 'manual',
    });

    if (!analytics) return;

    await analytics.track(submitEvent.event, {
      ...submitEvent.properties,
      experiment: 'simplified-signup',
      form_version: 'v2',
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}

// ====================================
// SERVER COMPONENTS WITH EMITTERS
// ====================================

export async function ProductListingPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  // Track page view in RSC
  await trackServerEvent('Page Viewed', {
    page_name: 'Product Listing',
    category: searchParams.category || 'all',
    path: '/products',
    server_rendered: true,
    sort_order: searchParams.sort || 'popular',
  });

  // Track search/filter usage
  if (searchParams.category) {
    await trackServerEvent('Filter Applied', {
      filter_type: 'category',
      filter_value: searchParams.category,
      page: 'products',
    });
  }

  return <div>{/* Product listing UI */}</div>;
}

// ====================================
// SERVER ACTIONS WITH EMITTERS
// ====================================

export async function updateUserProfile(formData: FormData) {
  'use server';

  const userId = 'user_123'; // Get from session
  const updates = {
    name: formData.get('name') as string,
    company: formData.get('company') as string,
    email: formData.get('email') as string,
  };

  // Create user session for consistent tracking
  const session = createUserSession(userId, 'session_xyz');

  // Track profile update
  const updateEvent = session.track('Profile Updated', {
    fields_changed: Object.keys(updates),
    update_source: 'settings_page',
  });

  await trackEventAction(updateEvent.event, updateEvent.properties);

  // Update user traits
  const identifyEvent = session.identify(updates);
  await identifyServerUser(identifyEvent.userId, identifyEvent.traits);

  // Return result
  return { success: true };
}

// ====================================
// MIDDLEWARE TRACKING WITH EMITTERS
// ====================================

export async function trackMiddlewareEvents(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  // Build context for middleware events
  const context = {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    page: {
      url: url.toString(),
      path: url.pathname,
      search: url.search,
    },
    userAgent: request.headers.get('user-agent') || 'unknown',
  };

  // Track page request
  const pageEvent = page(undefined, url.pathname, {
    ...context.page,
    middleware: true,
  });

  // Add user context if available
  if (userId) {
    return withMetadata(pageEvent, { userId });
  }

  return pageEvent;
}

// ====================================
// REAL-TIME FEATURES WITH EMITTERS
// ====================================

export function LiveDashboard() {
  const analytics = useAnalytics();
  const [_metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    // Track dashboard view
    if (analytics) {
      analytics.track('Dashboard Viewed', {
        widgets_visible: 5,
        view_mode: 'real-time',
      });
    }

    // Set up WebSocket for real-time updates
    const ws = new WebSocket('wss://api.example.com/metrics');

    ws.onmessage = async event => {
      const data = JSON.parse(event.data);
      setMetrics(data);

      // Track significant metric changes
      if (data.alert && analytics) {
        await analytics.track('Metric Alert', {
          metric_name: data.alert.metric,
          current_value: data.alert.value,
          severity: data.alert.severity,
          threshold: data.alert.threshold,
        });
      }
    };

    return () => ws.close();
  }, [analytics]);

  return <div>{/* Dashboard UI */}</div>;
}

// ====================================
// ERROR BOUNDARY WITH EMITTERS
// ====================================

export class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode; analytics: any },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; analytics: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error with emitter
    const errorEvent = track('React Error', {
      component_stack: errorInfo.componentStack,
      error_boundary: true,
      error_message: error.message,
      error_stack: error.stack,
      severity: 'high',
    });

    // Send to analytics
    this.props.analytics.track(errorEvent.event, errorEvent.properties);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// ====================================
// PROGRESSIVE ENHANCEMENT PATTERN
// ====================================

export function EnhancedSearchBar() {
  const analytics = useAnalytics();
  const [query, setQuery] = React.useState('');
  const [suggestions, _setSuggestions] = React.useState<string[]>([]);

  // Debounced search tracking
  const trackSearch = React.useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (searchQuery: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (analytics) {
          analytics.track('Search Performed', {
            has_suggestions: suggestions.length > 0,
            query: searchQuery,
            query_length: searchQuery.length,
            suggestion_count: suggestions.length,
          });
        }
      }, 500);
    };
  }, [analytics, suggestions.length]);

  const handleSearch = (value: string) => {
    setQuery(value);
    trackSearch(value);
    // Fetch suggestions...
  };

  return (
    <div>
      <input
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search..."
        type="search"
        value={query}
      />
    </div>
  );
}
