# @repo/analytics

A multi-provider analytics package with full TypeScript support, designed for modern web
applications with separate client and server implementations.

## Features

- 🚀 **Emitter-First Design** - Type-safe event emitters following Segment.io specification
- 🎯 **Multi-Provider Support** - Segment, PostHog, Vercel Analytics, and Console logging
- 🔄 **Environment-Specific** - Separate client and server implementations
- ⚡ **Next.js Optimized** - Special support for Next.js 15 with SSR/SSG
- 🎭 **Feature Flags** - Built-in PostHog feature flags and A/B testing
- 🛒 **Ecommerce Events** - Comprehensive ecommerce tracking following Segment's specification
- 📦 **Tree-Shakeable** - Import only what you need
- 🔒 **Type-Safe** - Full TypeScript support with strict typing
- 🚀 **Zero Dependencies** - Core package has no required dependencies

## Installation

```bash
npm install @repo/analytics

# Optional provider dependencies (install only what you need)
npm install @segment/analytics-next      # For Segment
npm install posthog-js posthog-node     # For PostHog
npm install @vercel/analytics           # For Vercel Analytics
```

## Architecture

The package uses **import-based environment separation** - no runtime detection:

```
@repo/analytics/client    → Browser-only code
@repo/analytics/server    → Node.js-only code
@repo/analytics/next/*    → Next.js-specific implementations
@repo/analytics/shared    → Shared types and utilities
```

## Quick Start

### Emitter-First Approach (Recommended)

The analytics package uses **emitters** as the primary pattern for tracking events. Emitters provide
type-safe, consistent event tracking following the Segment.io specification.

```typescript
import { createClientAnalytics, track, identify, page } from '@repo/analytics/client';

// Create analytics instance
const analytics = await createClientAnalytics({
  providers: {
    segment: { writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY },
    posthog: { apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY },
    vercel: {}, // Auto-configured
    console: { prefix: '[Analytics]' }, // Development logging
  },
});

// Method 1: Direct emitter usage (RECOMMENDED)
await analytics.emit(
  track('Button Clicked', {
    button_id: 'cta-hero',
    color: 'blue',
    position: 'above-fold',
  })
);

// Method 2: Overloaded methods accept emitter payloads
await analytics.identify(
  identify('user_123', {
    email: 'user@example.com',
    plan: 'premium',
  })
);

// Method 3: Batch multiple events
await analytics.emitBatch([
  page('Homepage', { path: '/', title: 'Welcome' }),
  track('Page Viewed', { page: 'homepage' }),
]);
```

### Traditional API (Still Supported)

```typescript
// You can still use the traditional API if needed
await analytics.track('Button Clicked', {
  button_id: 'cta-hero',
  color: 'blue',
});

await analytics.identify('user_123', {
  email: 'user@example.com',
});
```

### Server-Side (Node.js)

```typescript
import { createServerAnalytics, track, createUserSession } from '@repo/analytics/server';

const analytics = await createServerAnalytics({
  providers: {
    segment: { writeKey: process.env.SEGMENT_WRITE_KEY },
    posthog: { apiKey: process.env.POSTHOG_API_KEY },
  },
});

// Use emitters for consistent tracking
await analytics.emit(
  track('API Request', {
    endpoint: '/api/users',
    method: 'GET',
    duration_ms: 45,
  })
);

// Create a user session for consistent context
const session = createUserSession('user_123', 'session_abc');
await analytics.emit(session.track('Action Performed', { action: 'update' }));
```

## Emitters: The Recommended Approach

Emitters are the primary, recommended way to track events in this analytics package. They provide:

- **Type Safety**: Full TypeScript support with autocomplete for event properties
- **Consistency**: Following the Segment.io specification ensures compatibility
- **Composability**: Build complex tracking flows with helper utilities
- **Flexibility**: Works with all tracking methods (track, identify, page, etc.)

### Emitter Utilities

```typescript
import {
  ContextBuilder,
  PayloadBuilder,
  EventBatch,
  createAnonymousSession,
  withMetadata,
  withUTM,
} from '@repo/analytics/client';

// Build consistent context across events
const context = new ContextBuilder()
  .setUser('user_123', { email: 'user@example.com' })
  .setOrganization('org_456')
  .setPage({ path: '/dashboard', title: 'Dashboard' })
  .setCampaign({ source: 'google', medium: 'cpc' })
  .build();

// Create events with shared context
const builder = new PayloadBuilder(context);
await analytics.emit(builder.track('Feature Used', { feature: 'export' }));

// Batch related events
const batch = new EventBatch(context);
batch
  .addTrack('Form Started', { form_id: 'signup' })
  .addTrack('Form Field Completed', { field: 'email' })
  .addTrack('Form Submitted', { form_id: 'signup' });

await analytics.emitBatch(batch.getEvents());

// Anonymous user tracking
const anonSession = createAnonymousSession('anon_789');
await analytics.emit(anonSession.track('Product Viewed', { sku: 'PROD-123' }));

// Later, when user signs up
await analytics.emit(anonSession.alias('user_123'));
await analytics.emit(anonSession.identify('user_123', { email: 'new@user.com' }));

// Add metadata to any event
const event = track('Purchase Completed', { amount: 99.99 });
await analytics.emit(withMetadata(event, { version: '2.0', source: 'checkout' }));

// Add UTM parameters
await analytics.emit(
  withUTM(event, {
    source: 'newsletter',
    campaign: 'black-friday',
  })
);
```

### Next.js 15 Integration

### React Server Components

```typescript
// app/page.tsx
import { trackServerEvent, getServerFeatureFlag } from '@repo/analytics/server/next';
import { cookies } from 'next/headers';

export default async function Page() {
  // Track events from RSCs
  await trackServerEvent('Page Viewed', {
    path: '/home',
    title: 'Home Page'
  });

  // Check feature flags
  const showNewFeature = await getServerFeatureFlag(
    'new-feature',
    cookies(),
    process.env.POSTHOG_API_KEY!
  );

  return <div>{showNewFeature && <NewFeature />}</div>;
}
```

### Client Components with Hooks

```typescript
// app/components/button.tsx
'use client';
import { useTrackEvent, useFeatureFlag } from '@repo/analytics/client/next';

export function Button() {
  const trackEvent = useTrackEvent();
  const showNewDesign = useFeatureFlag('new-design');

  const handleClick = () => {
    trackEvent('Button Clicked', {
      variant: showNewDesign ? 'new' : 'old'
    });
  };

  return (
    <button onClick={handleClick} className={showNewDesign ? 'new-design' : ''}>
      Click me
    </button>
  );
}
```

### Automatic Page Tracking

```typescript
// app/layout.tsx
'use client';
import { AnalyticsProvider, usePageTracking } from '@repo/analytics/client/next';

function RootLayoutContent({ children }) {
  // Automatically tracks page views on route changes
  usePageTracking();
  return <>{children}</>;
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider config={{
          providers: {
            segment: { writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY },
            posthog: { apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY }
          }
        }}>
          <RootLayoutContent>{children}</RootLayoutContent>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Middleware Integration

```typescript
// middleware.ts
import { createAnalyticsMiddleware } from '@repo/analytics/server/next';

export const middleware = createAnalyticsMiddleware({
  providers: {
    segment: { writeKey: process.env.SEGMENT_WRITE_KEY },
  },
  // Optional configuration
  matchers: ['/api/*', '/app/*'],
  exclude: ['/api/health', '/_next/*'],
  extractUserId: (request) => request.headers.get('x-user-id'),
  extractContext: (request) => ({
    ip: request.ip,
    country: request.geo?.country,
  }),
});

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
```

### Server Actions

```typescript
// app/actions.ts
'use server';
import { trackServerAction } from '@repo/analytics/server/next';

export async function submitForm(formData: FormData) {
  // Track the action
  await trackServerAction('Form Submitted', {
    form_id: 'contact',
    email: formData.get('email'),
  });

  // Process form...
}
```

### Tracked Components

```typescript
// app/components/tracked.tsx
'use client';
import { TrackedButton, TrackedLink } from '@repo/analytics/client/next';

export function CTASection() {
  return (
    <div>
      <TrackedButton
        event="CTA Clicked"
        properties={{ location: 'hero' }}
        className="btn-primary"
      >
        Get Started
      </TrackedButton>

      <TrackedLink
        href="/pricing"
        event="Link Clicked"
        properties={{ link: 'pricing' }}
      >
        View Pricing
      </TrackedLink>
    </div>
  );
}
```

## Providers

### Segment

Universal customer data platform for all your analytics needs.

```typescript
{
  segment: {
    writeKey: 'your-write-key',
    options: {
      // Optional Segment configuration
    }
  }
}
```

### PostHog

Product analytics with feature flags, A/B testing, and session recording.

```typescript
{
  posthog: {
    apiKey: 'your-api-key',
    options: {
      api_host: 'https://app.posthog.com',
      autocapture: false,
      capture_pageview: false,  // We handle this manually
      // Bootstrap data for SSR (Next.js)
      bootstrap: {
        distinctID: 'user_123',
        featureFlags: {
          'new-feature': true,
          'button-color': 'blue'
        }
      }
    }
  }
}
```

### Vercel Analytics

Web Vitals and performance monitoring (auto-configured on Vercel).

```typescript
{
  vercel: {
    // No configuration needed - auto-detects Vercel environment
  }
}
```

### Console

Development provider that logs all events to console.

```typescript
{
  console: {
    prefix: '[Analytics]',
    enabled: process.env.NODE_ENV === 'development'
  }
}
```

## Feature Flags (PostHog)

### Client-Side Feature Flags

```typescript
import { createClientAnalytics } from '@repo/analytics/client';

const analytics = await createClientAnalytics({
  providers: {
    posthog: { apiKey: 'xxx' },
  },
});

// Check if feature is enabled
const showNewFeature = await analytics.isFeatureEnabled('new-feature');

// Get feature flag value (for A/B tests)
const buttonColor = await analytics.getFeatureFlag('button-color-test');

// Get all flags
const allFlags = await analytics.getAllFeatureFlags();
```

### Server-Side Feature Flags (Next.js)

```typescript
import {
  isFeatureEnabledOnServer,
  getFeatureFlagOnServer
} from '@repo/analytics/next/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  const apiKey = process.env.POSTHOG_API_KEY!;

  // Check feature flag
  const showBeta = await isFeatureEnabledOnServer(
    'beta-feature',
    cookieStore,
    apiKey
  );

  // Get A/B test variant
  const heroVariant = await getFeatureFlagOnServer(
    'hero-test',
    cookieStore,
    apiKey,
    { defaultValue: 'control' }
  );

  return (
    <div>
      {showBeta && <BetaFeature />}
      <Hero variant={heroVariant} />
    </div>
  );
}
```

## Ecommerce Events

The package includes comprehensive ecommerce event tracking using type-safe emitters:

```typescript
import { ecommerce } from '@repo/analytics/client';

// Product viewed - Recommended approach
const productViewed = ecommerce.productViewed({
  product_id: '12345',
  name: 'Wireless Headphones',
  price: 129.99,
  category: 'Electronics',
  brand: 'AudioTech',
});
await analytics.emit(productViewed);

// Add to cart with full type safety
const cartUpdated = ecommerce.cartUpdated({
  action: 'added',
  product: {
    product_id: '12345',
    name: 'Wireless Headphones',
    price: 129.99,
    quantity: 1,
  },
  cart_total: 129.99,
});
await analytics.emit(cartUpdated);

// Complete purchase flow
const orderCompleted = ecommerce.orderCompleted({
  order_id: 'ORD-12345',
  total: 142.48,
  revenue: 129.99,
  tax: 12.49,
  shipping: 0,
  currency: 'USD',
  products: [
    {
      product_id: '12345',
      name: 'Wireless Headphones',
      price: 129.99,
      quantity: 1,
      category: 'Electronics',
    },
  ],
});
await analytics.emit(orderCompleted);

// Track entire checkout flow
const checkoutFlow = new EventBatch();
checkoutFlow
  .add(ecommerce.checkoutProgressed({ step: 1, step_name: 'shipping' }))
  .add(ecommerce.checkoutProgressed({ step: 2, step_name: 'payment' }))
  .add(orderCompleted);

await analytics.emitBatch(checkoutFlow.getEvents());
```

### Available Ecommerce Events

- **Product Discovery**: `productViewed`, `productClicked`, `productSearched`
- **Cart Management**: `cartUpdated` (with actions: added/removed/updated), `cartViewed`
- **Checkout Process**: `checkoutProgressed` (with steps), `orderCompleted`
- **Post-Purchase**: `orderRefunded`, `orderCancelled`, `returnRequested`
- **Wishlist**: `productAddedToWishlist`, `productRemovedFromWishlist`
- **Marketplace**: `priceComparisonViewed`, `merchantSelected`, `affiliateLinkClicked`

See [Ecommerce Events Documentation](./src/shared/emitters/ecommerce/README.md) for complete
details.

## Advanced Usage

### Error Handling

```typescript
const analytics = await createClientAnalytics({
  providers: {
    /* ... */
  },
  onError: (error, context) => {
    console.error('Analytics error:', error);
    // Send to error tracking service
    Sentry.captureException(error, { extra: context });
  },
});
```

### Accessing Specific Providers

```typescript
// Get a specific provider for advanced usage
const posthogProvider = analytics.getProvider('posthog');
if (posthogProvider && 'getAllFlags' in posthogProvider) {
  const flags = await posthogProvider.getAllFlags('user_123');
}
```

### Why Use Emitters?

Emitters are the recommended approach because they:

1. **Ensure Consistency**: All events follow the Segment.io specification
2. **Provide Type Safety**: Full TypeScript support prevents errors
3. **Enable Reusability**: Create event templates and reuse them
4. **Support Composition**: Build complex tracking logic easily

```typescript
import { track, identify, page } from '@repo/analytics/client';

// ✅ Recommended: Use emit() method
const event = track('User Registered', {
  method: 'email',
  referral_source: 'organic',
});
await analytics.emit(event);

// ✅ Also good: Direct method with emitter
await analytics.track(
  track('Feature Activated', {
    feature_name: 'dark_mode',
    activation_method: 'settings',
  })
);

// ✅ Batch operations
const onboarding = [
  identify('user_123', { role: 'admin' }),
  track('Onboarding Started', { step: 1 }),
  page('Onboarding', { step: 'welcome' }),
];
await analytics.emitBatch(onboarding);

// ❌ Avoid: Manual event construction (error-prone)
await analytics.track('some event', {
  /* untyped properties */
});
```

### Consent Management

```typescript
const analytics = createNextJSClientAnalytics({
  providers: {
    /* ... */
  },
  nextjs: {
    deferUntilConsent: true,
    checkConsent: async () => {
      // Check your consent management platform
      return await checkUserConsent();
    },
  },
});

// Later, when user consents
await analytics.grantConsent();
```

### Event Context

```typescript
// Set global context
analytics.setContext({
  app_version: '1.2.3',
  deployment: 'production',
  region: 'us-east-1',
});

// All subsequent events will include this context
await analytics.track('Event Name', { specific: 'properties' });
```

## Best Practices

1. **Initialize Early** - Initialize analytics as early as possible in your app lifecycle
2. **Use Appropriate Imports** - Import from `/client` for browser, `/server` for Node.js
3. **Handle Failures Gracefully** - Analytics should never break your app
4. **Respect User Privacy** - Implement consent management before tracking
5. **Use TypeScript** - Take advantage of full type safety
6. **Buffer Events** - Enable event buffering to prevent data loss
7. **Test in Development** - Use the console provider to debug events

## Migration Guide

### From Global Instance Pattern

```typescript
// Old (global singleton)
import { track } from '@repo/analytics';
track('Event', {});

// New (explicit instance)
import { createClientAnalytics } from '@repo/analytics/client';
const analytics = await createClientAnalytics({
  /* config */
});
await analytics.track('Event', {});
```

### From Runtime Detection

```typescript
// Old (runtime detection)
const analytics = createAnalytics({
  isServer: typeof window === 'undefined',
});

// New (import-based)
// In client code:
import { createClientAnalytics } from '@repo/analytics/client';

// In server code:
import { createServerAnalytics } from '@repo/analytics/server';
```

## Troubleshooting

### Events Not Tracking

1. Check that analytics is initialized: `await analytics.initialize()`
2. Enable debug mode: `console: { enabled: true }`
3. Verify provider API keys are correct
4. Check browser console for errors

### Feature Flags Not Working

1. Ensure PostHog provider is configured
2. Check that distinct ID is being set correctly
3. Verify feature flag exists in PostHog dashboard
4. Use bootstrap data for server-side rendering

### TypeScript Errors

1. Ensure you're importing from the correct path
2. Install type definitions: `@types/segment-analytics`
3. Check tsconfig includes the package

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## Best Practices with Emitters

### 1. Use Emitters for All Events

```typescript
// ❌ Avoid: Direct tracking
analytics.track('User Signed Up', { plan: 'premium' });

// ✅ Preferred: Use emitters
import { track } from '@repo/analytics/client';
analytics.emit(track('User Signed Up', { plan: 'premium' }));
```

### 2. Create Event Factories

```typescript
// lib/analytics-events.ts
import { track, identify } from '@repo/analytics/client';

export const events = {
  userSignedUp: (plan: string) => track('User Signed Up', { plan, timestamp: new Date() }),

  userUpgraded: (fromPlan: string, toPlan: string) =>
    track('Plan Upgraded', { from_plan: fromPlan, to_plan: toPlan }),

  userIdentified: (userId: string, email: string, plan: string) =>
    identify(userId, { email, plan }),
};

// Usage
analytics.emit(events.userSignedUp('premium'));
```

### 3. Use Context Builders

```typescript
import { ContextBuilder } from '@repo/analytics/client';

const context = new ContextBuilder()
  .setUser('user_123')
  .setSession('session_456')
  .setCampaign({ source: 'google', medium: 'cpc' })
  .build();

// All events will have this context
const pb = new PayloadBuilder(context);
analytics.emit(pb.track('Event', { data: 'value' }));
```

### 4. Batch Related Events

```typescript
import { EventBatch } from '@repo/analytics/client';

const checkout = new EventBatch()
  .add(track('Checkout Started', { value: 99.99 }))
  .add(track('Payment Method Selected', { method: 'card' }))
  .add(track('Order Completed', { order_id: '12345' }));

await analytics.emitBatch(checkout.getEvents());
```

## Migration Guide

### From Direct Tracking to Emitters

```typescript
// Old approach
analytics.track('Product Viewed', {
  product_id: '123',
  price: 99.99,
});

// New approach - Option 1: Using emit
import { track } from '@repo/analytics/client';
analytics.emit(
  track('Product Viewed', {
    product_id: '123',
    price: 99.99,
  })
);

// New approach - Option 2: Using overloaded track
const event = track('Product Viewed', {
  product_id: '123',
  price: 99.99,
});
analytics.track(event);

// New approach - Option 3: Using ecommerce emitters
import { ecommerce } from '@repo/analytics/client';
analytics.emit(
  ecommerce.productViewed({
    product_id: '123',
    price: 99.99,
    name: 'Product Name',
  })
);
```

### Gradual Migration Strategy

1. **Phase 1**: Start using emitters for new events
2. **Phase 2**: Create event factories for common events
3. **Phase 3**: Migrate existing events to emitters
4. **Phase 4**: Add context builders for consistency
5. **Phase 5**: Remove direct tracking calls

## Why Emitters?

### 1. Type Safety

Emitters provide full TypeScript support with autocomplete for event properties.

### 2. Consistency

All events follow the Segment.io specification automatically.

### 3. Validation

Emitters validate required properties at compile time.

### 4. Context Management

Emitters make it easy to maintain consistent context across events.

### 5. Testing

Emitter payloads are pure data structures that are easy to test.

### 6. Provider Agnostic

Emitters work with any analytics provider without changes.

## License

MIT
