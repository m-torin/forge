# Next.js 15 Analytics Integration

This package provides full support for Next.js 15 with deferred loading, script optimization, consent management, and comprehensive PostHog feature flags.

## Features

- ✅ **Deferred Script Loading** with Next.js Script component strategies
- ✅ **Event Buffering** before initialization  
- ✅ **Consent Management** integration
- ✅ **Performance Optimized** loading strategies
- ✅ **SSR/SSG Compatible** with proper hydration
- ✅ **TypeScript Support** with full type safety
- ✅ **Feature Flags & A/B Testing** with PostHog integration
- ✅ **Server-Side Flag Fetching** with bootstrap data
- ✅ **Consistent Client/Server Experience** via flag bootstrapping

## Basic Usage

### 1. Setup Analytics Provider

```tsx
// lib/analytics.ts
import { createNextJSAnalytics } from '@repo/analytics';

export const analytics = createNextJSAnalytics({
  providers: {
    segment: {
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!
    },
    vercel: {},
    console: { prefix: '[Analytics]' }
  },
  nextjs: {
    strategy: 'afterInteractive',
    bufferEvents: true,
    maxBufferSize: 100,
    debug: process.env.NODE_ENV === 'development'
  }
});
```

### 2. App Router Integration

```tsx
// app/layout.tsx
import { analytics } from '@/lib/analytics';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize analytics on client
    analytics.initialize();
  }, []);

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
```

### 3. Track Events Anywhere

```tsx
// components/signup-form.tsx
import { analytics } from '@/lib/analytics';

export function SignupForm() {
  const handleSubmit = async (formData: FormData) => {
    // Track immediately - will buffer if not initialized
    analytics.track('Form Submitted', {
      form: 'signup',
      method: 'email'
    });
    
    // Process signup...
  };

  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Feature Flags & A/B Testing

### Server-Side Feature Flags (Recommended)

Server-side flag fetching eliminates client-side flicker and ensures consistent user experience:

```tsx
// app/layout.tsx - Bootstrap flags on server
import { cookies } from 'next/headers';
import { getPostHogBootstrapDataOnServer } from '@repo/analytics';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch bootstrap data on server
  const cookieStore = cookies();
  const bootstrapData = await getPostHogBootstrapDataOnServer(
    cookieStore,
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY!
  );

  return (
    <html lang="en">
      <body>
        <AnalyticsProvider bootstrapData={bootstrapData}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Server Component Feature Flags

Use feature flags directly in server components:

```tsx
// app/page.tsx - Server component with flags
import { cookies } from 'next/headers';
import { 
  isFeatureEnabledOnServer, 
  getFeatureFlagOnServer,
  getAllFeatureFlagsOnServer 
} from '@repo/analytics';

export default async function HomePage() {
  const cookieStore = cookies();
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;

  // Check individual flags
  const showNewDesign = await isFeatureEnabledOnServer('new-design', cookieStore, apiKey);
  const ctaText = await getFeatureFlagOnServer('cta-text', cookieStore, apiKey, {
    defaultValue: 'Click here'
  });

  // Get all flags at once (more efficient)
  const allFlags = await getAllFeatureFlagsOnServer(cookieStore, apiKey);

  return (
    <main>
      <h1>Welcome to our app</h1>
      
      {showNewDesign ? (
        <div className="new-design">
          <h2>New Design!</h2>
        </div>
      ) : (
        <div className="old-design">
          <h2>Classic Design</h2>
        </div>
      )}
      
      <button>{ctaText}</button>
      
      {allFlags['premium-features'] && (
        <div>Premium features available!</div>
      )}
    </main>
  );
}
```

### Client-Side Feature Flags

Use flags in client components with automatic fallback to bootstrap data:

```tsx
// components/feature-component.tsx
'use client';
import { useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function FeatureComponent() {
  const [flagValue, setFlagValue] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFlag = async () => {
      // This will use live PostHog data if available, 
      // or fall back to bootstrap data
      const enabled = await analytics.isFeatureEnabled('new-feature');
      setFlagValue(enabled);
      setIsLoading(false);
    };

    checkFlag();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {flagValue ? (
        <NewFeature />
      ) : (
        <OldFeature />
      )}
    </div>
  );
}
```

### A/B Testing Implementation

```tsx
// app/experiment-page/page.tsx
import { cookies } from 'next/headers';
import { getFeatureFlagOnServer } from '@repo/analytics';

export default async function ExperimentPage() {
  const cookieStore = cookies();
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;

  // A/B test with variants
  const buttonVariant = await getFeatureFlagOnServer(
    'button-color-test', 
    cookieStore, 
    apiKey,
    { defaultValue: 'blue' }
  );

  const buttonStyles = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    red: 'bg-red-500 hover:bg-red-600', 
    green: 'bg-green-500 hover:bg-green-600'
  };

  return (
    <div>
      <h1>A/B Test Page</h1>
      <button 
        className={`px-4 py-2 text-white rounded ${buttonStyles[buttonVariant] || buttonStyles.blue}`}
        onClick={() => {
          // Track the conversion event
          analytics.track('Button Clicked', {
            variant: buttonVariant,
            experiment: 'button-color-test'
          });
        }}
      >
        Click me! ({buttonVariant} variant)
      </button>
    </div>
  );
}
```

### Complete Bootstrap Integration

```tsx
// lib/analytics-bootstrap.ts
import { cookies } from 'next/headers';
import { createNextJSAnalyticsWithBootstrap } from '@repo/analytics';

export async function getAnalyticsWithBootstrap() {
  const cookieStore = cookies();
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;

  return await createNextJSAnalyticsWithBootstrap(cookieStore, apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    providers: {
      // Add other providers
      segment: {
        writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY
      },
      vercel: {}
    },
    nextjs: {
      strategy: 'afterInteractive',
      bufferEvents: true,
      debug: process.env.NODE_ENV === 'development'
    }
  });
}

// app/layout.tsx
import { getAnalyticsWithBootstrap } from '@/lib/analytics-bootstrap';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const analytics = await getAnalyticsWithBootstrap();

  return (
    <html lang="en">
      <body>
        <AnalyticsProvider analytics={analytics}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Flag-Based Component Rendering

```tsx
// components/conditional-feature.tsx
import { cookies } from 'next/headers';
import { isFeatureEnabledOnServer } from '@repo/analytics';

interface ConditionalFeatureProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function ConditionalFeature({ 
  flag, 
  children, 
  fallback = null 
}: ConditionalFeatureProps) {
  const cookieStore = cookies();
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;
  
  const enabled = await isFeatureEnabledOnServer(flag, cookieStore, apiKey);
  
  return enabled ? <>{children}</> : <>{fallback}</>;
}

// Usage in any server component
export default function SomePage() {
  return (
    <div>
      <h1>My Page</h1>
      
      <ConditionalFeature flag="premium-section">
        <PremiumContent />
      </ConditionalFeature>
      
      <ConditionalFeature 
        flag="beta-feature" 
        fallback={<div>Coming soon!</div>}
      >
        <BetaFeature />
      </ConditionalFeature>
    </div>
  );
}
```

## Advanced Usage

### Consent Management

```tsx
// lib/analytics-with-consent.ts
import { createNextJSAnalytics } from '@repo/analytics';

export const analytics = createNextJSAnalytics({
  providers: {
    segment: { writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! }
  },
  nextjs: {
    deferUntilConsent: true,
    checkConsent: async () => {
      // Check your consent management system
      return await checkUserConsent();
    },
    bufferEvents: true
  }
});

// Grant consent when user accepts
export function grantAnalyticsConsent() {
  analytics.grantConsent();
}

// Revoke consent and clear data
export function revokeAnalyticsConsent() {
  analytics.revokeConsent();
}
```

### Custom Script Loading Strategy

```tsx
// app/layout.tsx with custom script loading
import Script from 'next/script';
import { getAnalyticsScriptProps } from '@repo/analytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Load analytics scripts with optimal strategy */}
        <Script
          {...getAnalyticsScriptProps('lazyOnload')}
          onLoad={() => {
            // Scripts loaded, initialize analytics
            analytics.initialize();
          }}
        />
      </body>
    </html>
  );
}
```

### Feature Flag Integration

```tsx
// lib/analytics-with-flags.ts
import { createNextJSAnalytics } from '@repo/analytics';
import { getFeatureFlag } from '@/lib/feature-flags';

const buildAnalyticsConfig = async () => {
  const providers: any = {};
  
  // Always include core provider
  providers.segment = {
    writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!
  };
  
  // Conditionally include based on feature flags
  if (await getFeatureFlag('enable_posthog')) {
    providers.posthog = {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY!
    };
  }
  
  if (await getFeatureFlag('enable_vercel_analytics')) {
    providers.vercel = {};
  }
  
  return { providers };
};

export const analytics = createNextJSAnalytics({
  ...(await buildAnalyticsConfig()),
  nextjs: {
    strategy: 'afterInteractive',
    bufferEvents: true
  }
});
```

### Server Actions Integration

```tsx
// app/actions.ts
import { analytics } from '@/lib/analytics';

export async function createUser(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  
  // Server-side tracking
  await analytics.track('User Created', {
    email,
    source: 'server_action'
  });
  
  // Create user logic...
}
```

### Middleware Integration

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analytics } from '@/lib/analytics';

export function middleware(request: NextRequest) {
  // Track page views on middleware level
  analytics.page('Page View', {
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    referrer: request.headers.get('referer')
  });

  return NextResponse.next();
}
```

## Loading Strategies

### 1. After Interactive (Recommended)
```tsx
const analytics = createNextJSAnalytics({
  // ... providers
  nextjs: {
    strategy: 'afterInteractive' // Load after page is interactive
  }
});
```

### 2. Lazy On Load (Performance First)
```tsx
const analytics = createNextJSAnalytics({
  // ... providers
  nextjs: {
    strategy: 'lazyOnload' // Load when browser is idle
  }
});
```

### 3. Before Interactive (Critical Analytics)
```tsx
const analytics = createNextJSAnalytics({
  // ... providers
  nextjs: {
    strategy: 'beforeInteractive' // Load before page is interactive
  }
});
```

### 4. Web Worker (Experimental)
```tsx
const analytics = createNextJSAnalytics({
  // ... providers
  nextjs: {
    strategy: 'worker' // Load in web worker (if supported)
  }
});
```

## Debugging

```tsx
const analytics = createNextJSAnalytics({
  // ... providers
  nextjs: {
    debug: true, // Enable debug logging
    bufferEvents: true
  }
});

// Check status
console.log(analytics.getStatus());
// {
//   isInitialized: true,
//   isLoading: false,
//   consentGiven: true,
//   bufferedEvents: 0,
//   activeProviders: ['segment', 'vercel']
// }
```

## Environment Configuration

```env
# .env.local

# PostHog (required for feature flags)
NEXT_PUBLIC_POSTHOG_API_KEY=phc_your_posthog_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Segment (optional)
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key

# Vercel Analytics (auto-configured, no env vars needed)
```

## Dependencies Required

```bash
# Core analytics package
npm install @repo/analytics

# PostHog dependencies (for feature flags and analytics)
npm install posthog-js posthog-node

# Segment (optional)
npm install @segment/analytics-next

# Vercel Analytics (optional)
npm install @vercel/analytics

# Next.js dependencies (usually already installed)
npm install next react react-dom

# Additional utilities for ID generation
npm install uuidv7
```

## Best Practices

1. **Initialize Early**: Call `analytics.initialize()` in your root layout
2. **Buffer Events**: Enable event buffering for better UX
3. **Use Consent**: Implement proper consent management
4. **Optimize Loading**: Choose appropriate script loading strategy
5. **Debug in Development**: Enable debug mode during development
6. **Server Actions**: Use server-side tracking for sensitive events
7. **Feature Flags**: Control provider activation with feature flags

## Performance Impact

- **Bundle Size**: ~5kb gzipped for core analytics
- **Script Loading**: Deferred loading prevents blocking
- **Event Buffering**: No lost events during initialization
- **Dynamic Imports**: Providers loaded only when needed
- **Next.js Optimized**: Works with SSR, SSG, and ISR