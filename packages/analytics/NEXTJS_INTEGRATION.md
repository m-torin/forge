# Next.js 15 Analytics Integration

This package provides comprehensive analytics support for Next.js 15 applications with full App Router, React Server Components, and middleware support.

## Features

- ✅ Full Next.js 15 & App Router support
- ✅ React Server Components (RSC) integration
- ✅ Middleware tracking at the edge
- ✅ Automatic page view tracking
- ✅ Server Actions support
- ✅ Feature flags with PostHog
- ✅ TypeScript support with proper types
- ✅ Client/Server boundary handling
- ✅ Bootstrap data for SSR
- ✅ Consent management
- ✅ Event buffering

## Installation

```bash
npm install @repo/analytics
```

## Quick Start

### 1. Client Components

```tsx
// app/layout.tsx
'use client';

import { AnalyticsProvider } from '@repo/analytics/client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider 
          config={{
            providers: {
              posthog: { apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY },
              segment: { writeKey: process.env.NEXT_PUBLIC_SEGMENT_KEY }
            }
          }}
          autoPageTracking
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 2. Server Components (RSC)

```tsx
// app/page.tsx
import { trackServerPageView, isServerFeatureEnabled } from '@repo/analytics/server';

export default async function HomePage() {
  // Track page view from server
  await trackServerPageView('/home', {
    experiment: 'homepage_v2'
  });

  // Check feature flag
  const showNewFeature = await isServerFeatureEnabled(
    'new-homepage-feature',
    process.env.POSTHOG_API_KEY!
  );

  return (
    <div>
      <h1>Welcome</h1>
      {showNewFeature && <NewFeature />}
    </div>
  );
}
```

### 3. Middleware

```ts
// middleware.ts
import { createAnalyticsMiddleware } from '@repo/analytics/server';

export const middleware = createAnalyticsMiddleware({
  analytics: {
    providers: {
      posthog: { apiKey: process.env.POSTHOG_API_KEY }
    }
  },
  excludeRoutes: ['/_next', '/api/health'],
  trackPageViews: true,
  trackApiRoutes: true
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

## App Router Hooks

### usePageTracking

Automatically track page views with the App Router:

```tsx
'use client';

import { usePageTracking } from '@repo/analytics/client';

export default function Layout({ children }) {
  usePageTracking({
    trackSearch: true, // Track search params
    trackParams: true, // Track route params
    properties: {
      version: 'v2'
    }
  });

  return <>{children}</>;
}
```

### useTrackEvent

Track custom events:

```tsx
'use client';

import { useTrackEvent } from '@repo/analytics/client';

export function ProductCard({ product }) {
  const track = useTrackEvent();

  const handleAddToCart = () => {
    track('Product Added to Cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

### useFeatureFlag

Check feature flags on the client:

```tsx
'use client';

import { useFeatureFlag } from '@repo/analytics/client';

export function Feature() {
  const isEnabled = useFeatureFlag('new-checkout-flow', false);

  if (!isEnabled) return null;

  return <NewCheckoutFlow />;
}
```

### useEcommerceTracking

E-commerce specific tracking helpers:

```tsx
'use client';

import { useEcommerceTracking } from '@repo/analytics/client';

export function ProductPage({ product }) {
  const { trackProductView, trackAddToCart } = useEcommerceTracking();

  useEffect(() => {
    trackProductView(product);
  }, [product]);

  const handleAddToCart = () => {
    trackAddToCart({
      ...product,
      quantity: 1
    });
  };

  return <ProductDetails product={product} onAddToCart={handleAddToCart} />;
}
```

## Server Components (RSC)

### Track Events

```tsx
import { trackServerEvent } from '@repo/analytics/server';

export default async function ServerAction() {
  'use server';
  
  await trackServerEvent('Form Submitted', {
    form_id: 'contact',
    source: 'server_action'
  });
}
```

### Feature Flags

```tsx
import { 
  getServerFeatureFlag,
  getAllServerFeatureFlags 
} from '@repo/analytics/server';

export default async function FeaturePage() {
  // Single flag
  const showFeature = await getServerFeatureFlag(
    'feature-key',
    process.env.POSTHOG_API_KEY!
  );

  // All flags
  const flags = await getAllServerFeatureFlags(
    process.env.POSTHOG_API_KEY!
  );

  return <Features flags={flags} />;
}
```

### Server Actions

```tsx
import { trackEventAction, identifyUserAction } from '@repo/analytics/server';

// In your client component
async function handleSubmit(formData: FormData) {
  // Track from server action
  await trackEventAction('Form Submitted', {
    form_id: formData.get('id')
  });
  
  // Identify user
  await identifyUserAction(userId, {
    email: formData.get('email'),
    plan: 'pro'
  });
}
```

## Middleware Integration

### Basic Setup

```ts
// middleware.ts
import { createAnalyticsMiddleware } from '@repo/analytics/server';

export const middleware = createAnalyticsMiddleware({
  analytics: {
    providers: {
      posthog: { apiKey: process.env.POSTHOG_API_KEY }
    }
  },
  posthogApiKey: process.env.POSTHOG_API_KEY,
  trackPageViews: true
});
```

### Advanced Configuration

```ts
// middleware.ts
import { 
  createAnalyticsMiddleware,
  composeMiddleware 
} from '@repo/analytics/server';
import { authMiddleware } from './auth-middleware';

const analyticsMiddleware = createAnalyticsMiddleware({
  analytics: { /* config */ },
  
  // Custom route matching
  shouldTrack: (pathname) => {
    return !pathname.startsWith('/admin');
  },
  
  // Custom event naming
  getEventName: (pathname, method) => {
    if (pathname.startsWith('/api/')) {
      return `API ${method} ${pathname}`;
    }
    return 'Page View';
  },
  
  // Custom properties
  getProperties: (request) => ({
    custom_header: request.headers.get('x-custom-header'),
    ab_test: request.cookies.get('ab_test')?.value
  })
});

// Compose multiple middlewares
export const middleware = composeMiddleware(
  authMiddleware,
  analyticsMiddleware
);
```

## SSR with Bootstrap Data

For optimal performance with PostHog feature flags:

```tsx
// app/layout.tsx
import { getServerBootstrapData } from '@repo/analytics/server';
import { AnalyticsProvider } from '@repo/analytics/client';

export default async function RootLayout({ children }) {
  // Get bootstrap data on server
  const bootstrapData = await getServerBootstrapData(
    process.env.POSTHOG_API_KEY!
  );

  return (
    <html>
      <body>
        <AnalyticsProvider 
          config={{
            providers: {
              posthog: { apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY }
            }
          }}
          bootstrapData={bootstrapData}
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

## Consent Management

Handle user consent for analytics:

```tsx
'use client';

import { useAnalyticsConsent } from '@repo/analytics/client';

export function CookieBanner() {
  const { consentGiven, grantConsent, revokeConsent } = useAnalyticsConsent();

  if (consentGiven) return null;

  return (
    <div className="cookie-banner">
      <p>We use cookies for analytics</p>
      <button onClick={grantConsent}>Accept</button>
      <button onClick={revokeConsent}>Decline</button>
    </div>
  );
}
```

## TypeScript Support

The package includes comprehensive TypeScript support:

```tsx
import type { 
  AnalyticsConfig,
  BootstrapData,
  FeatureFlags,
  PageViewEvent,
  ProductViewEvent 
} from '@repo/analytics/types';

// Type-safe feature flags
const flags = createServerFeatureFlags<{
  'new-checkout': boolean;
  'dark-mode': boolean;
}>(apiKey, {
  'new-checkout': false,
  'dark-mode': true
});

const isCheckoutEnabled = await flags.isEnabled('new-checkout');
```

## Best Practices

1. **Initialize Early**: Set up analytics in your root layout
2. **Use Bootstrap Data**: Improve performance with server-side bootstrap
3. **Track Meaningful Events**: Focus on business-critical interactions
4. **Handle Errors**: Analytics should never break your app
5. **Respect Privacy**: Implement proper consent management
6. **Type Everything**: Use TypeScript for better reliability

## Environment Variables

```env
# Client-side (public)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SEGMENT_WRITE_KEY=xxx

# Server-side
POSTHOG_API_KEY=phc_xxx
SEGMENT_WRITE_KEY=xxx
```

## Debugging

Enable debug mode to see analytics events in the console:

```tsx
<AnalyticsProvider 
  config={{
    providers: {
      console: { 
        options: { 
          prefix: '[Analytics]',
          pretty: true 
        }
      }
    },
    debug: true
  }}
/>
```