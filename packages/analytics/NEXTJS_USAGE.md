# Next.js 15 Analytics Integration

This package provides full support for Next.js 15 with deferred loading, script optimization, and consent management.

## Features

- ✅ **Deferred Script Loading** with Next.js Script component strategies
- ✅ **Event Buffering** before initialization  
- ✅ **Consent Management** integration
- ✅ **Performance Optimized** loading strategies
- ✅ **SSR/SSG Compatible** with proper hydration
- ✅ **TypeScript Support** with full type safety

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
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_key
NEXT_PUBLIC_POSTHOG_API_KEY=your_posthog_key
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