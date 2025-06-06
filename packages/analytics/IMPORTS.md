# Simplified Import Structure

The analytics package has been simplified to only 4 import paths, each providing complete
functionality for their environment.

## Import Paths

### 1. `@repo/analytics/client`

**Client-side analytics for browsers and client components**

```typescript
import {
  createClientAnalytics,
  track,
  identify,
  page,
  group,
  alias,
  ecommerce,
  ContextBuilder,
  PayloadBuilder,
  EventBatch,
} from '@repo/analytics/client';
```

**Includes:**

- Core analytics functions
- All emitters (track, identify, page, etc.)
- Ecommerce emitters
- Utility classes
- Type definitions
- Validation utilities
- PostHog utilities

### 2. `@repo/analytics/server`

**Server-side analytics for Node.js and server environments**

```typescript
import {
  createServerAnalytics,
  track,
  identify,
  page,
  group,
  alias,
  ecommerce,
  ContextBuilder,
  PayloadBuilder,
  EventBatch,
  isFeatureEnabled,
  getFeatureFlag,
} from '@repo/analytics/server';
```

**Includes:**

- Core analytics functions (server providers)
- All emitters (same as client)
- Server-side PostHog utilities
- Feature flag functions
- Bootstrap data utilities

### 3. `@repo/analytics/client/next`

**Next.js client-side integration (extends `/client`)**

```typescript
import {
  // Everything from /client, plus:
  createNextJSClientAnalytics,
  usePageTracking,
  useTrackEvent,
  useFeatureFlag,
  AnalyticsProvider,
  TrackedButton,
  TrackedLink,
} from '@repo/analytics/client/next';
```

**Includes:**

- All client functionality
- React hooks for client components
- Next.js optimized analytics manager
- Tracked components
- Client-side providers and contexts

### 4. `@repo/analytics/server/next`

**Next.js server-side integration (extends `/server`)**

```typescript
import {
  // Everything from /server, plus:
  createNextJSServerAnalytics,
  trackServerEvent,
  trackServerAction,
  getServerFeatureFlag,
  isServerFeatureEnabled,
  createAnalyticsMiddleware,
} from '@repo/analytics/server/next';
```

**Includes:**

- All server functionality
- React Server Component functions
- Server Actions support
- Middleware integration
- Server-side feature flags
- Bootstrap data for SSR

## Usage Examples

### Basic Client Usage

```typescript
import { createClientAnalytics, track } from '@repo/analytics/client';

const analytics = await createClientAnalytics({
  providers: { segment: { writeKey: 'xxx' } },
});

await analytics.emit(track('Button Clicked', { color: 'blue' }));
```

### Basic Server Usage

```typescript
import { createServerAnalytics, track } from '@repo/analytics/server';

const analytics = await createServerAnalytics({
  providers: { segment: { writeKey: 'xxx' } },
});

await analytics.emit(track('API Called', { endpoint: '/users' }));
```

### Next.js Client Components

```tsx
'use client';
import { useTrackEvent, AnalyticsProvider } from '@repo/analytics/client/next';

function MyComponent() {
  const trackEvent = useTrackEvent();
  return <button onClick={() => trackEvent('Clicked', {})}>Click</button>;
}
```

### Next.js Server Components

```tsx
import { trackServerEvent, getServerFeatureFlag } from '@repo/analytics/server/next';
import { cookies } from 'next/headers';

export default async function Page() {
  await trackServerEvent('Page Viewed', { path: '/home' });
  const showFeature = await getServerFeatureFlag('new-feature', cookies());
  return <div>{showFeature && <NewFeature />}</div>;
}
```

## Migration from Previous Structure

**Before:**

```typescript
import { track } from '@repo/analytics/emitters';
import { createClientAnalytics } from '@repo/analytics/client';
import { useTrackEvent } from '@repo/analytics/next/app-router';
```

**After:**

```typescript
import { createClientAnalytics, track } from '@repo/analytics/client';
import { useTrackEvent } from '@repo/analytics/client/next';
```

## Benefits

1. **Simpler imports** - Everything you need from 4 clear paths
2. **Complete functionality** - Each path provides full feature set
3. **Clear separation** - Client vs server, basic vs Next.js
4. **No sub-imports** - All related functionality in one import
5. **Better tree-shaking** - Only import what you need per environment
