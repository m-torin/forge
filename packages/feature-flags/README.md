# @repo/feature-flags

Feature flags implementation using Vercel Flags SDK with support for static precomputation, edge
middleware evaluation, and client-side hooks.

## Installation

```bash
pnpm add @repo/feature-flags
```

## Environment Setup

Set `FLAGS_SECRET` for precomputation (required for static page optimization):

```bash
# Generate secret
node -e "console.log(crypto.randomBytes(32).toString('base64url'))"

# Add to .env.local
FLAGS_SECRET=your-generated-secret
```

## Basic Usage

### Define a Feature Flag

```typescript
import { flag } from '@vercel/flags/next';

export const exampleFlag = flag({
  key: 'example-flag',
  decide: () => true,
});
```

### Use in Server Components

```typescript
import { exampleFlag } from './flags';

export default async function Page() {
  const example = await exampleFlag();
  return <div>{example ? 'Flag is on' : 'Flag is off'}</div>;
}
```

### Use in Client Components

```typescript
'use client';

import { useFlag } from '@repo/feature-flags/client';
import { exampleFlag } from './flags';

export function ClientComponent() {
  const example = useFlag(exampleFlag, false);

  if (example === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{example ? 'Flag is on' : 'Flag is off'}</div>;
}
```

## Precomputing for Static Pages

### 1. Create flags to be precomputed

```typescript
import { flag } from '@vercel/flags/next';

export const showSummerSale = flag({
  key: 'summer-sale',
  decide: () => false,
});

export const showBanner = flag({
  key: 'banner',
  decide: () => false,
});

// a group of feature flags to be precomputed
export const marketingFlags = [showSummerSale, showBanner] as const;
```

### 2. Precompute flags in middleware

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { precompute } from '@vercel/flags/next';
import { marketingFlags } from './flags';

export const config = { matcher: ['/'] };

export async function middleware(request: NextRequest) {
  // precompute returns a string encoding each flag's returned value
  const code = await precompute(marketingFlags);

  // rewrites the request to include the precomputed code for this flag combination
  const nextUrl = new URL(
    `/${code}${request.nextUrl.pathname}${request.nextUrl.search}`,
    request.url
  );

  return NextResponse.rewrite(nextUrl, { request });
}
```

### 3. Access the precomputation result from a page

```typescript
import { marketingFlags, showSummerSale, showBanner } from '../../flags';

type Params = Promise<{ code: string }>;

export default async function Page({ params }: { params: Params }) {
  const { code } = await params;
  // access the precomputed result by passing params.code and the group of
  // flags used during precomputation of this route segment
  const summerSale = await showSummerSale(code, marketingFlags);
  const banner = await showBanner(code, marketingFlags);

  return (
    <div>
      {banner ? <p>welcome</p> : null}

      {summerSale ? (
        <p>summer sale live now</p>
      ) : (
        <p>summer sale starting soon</p>
      )}
    </div>
  );
}
```

### Enabling ISR (optional)

```typescript
import type { ReactNode } from 'react';

export async function generateStaticParams() {
  // returning an empty array is enough to enable ISR
  return [];
}

export default async function Layout({ children }: { children: ReactNode }) {
  return children;
}
```

### Opting into build-time rendering (optional)

```typescript
import { generatePermutations } from '@vercel/flags/next';

export async function generateStaticParams() {
  const codes = await generatePermutations(marketingFlags);
  return codes.map((code) => ({ code }));
}
```

## Evaluation Context

### Basic example

```typescript
import { flag } from '@vercel/flags/next';

export const exampleFlag = flag<boolean>({
  key: 'identify-example-flag',
  identify() {
    return { user: { id: 'user1' } };
  },
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
});
```

### Type safety

```typescript
import { flag } from '@vercel/flags/next';

interface Entities {
  user?: { id: string };
}

export const exampleFlag = flag<boolean, Entities>({
  key: 'identify-example-flag',
  identify() {
    return { user: { id: 'user1' } };
  },
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
});
```

### Headers and Cookies

```typescript
export const exampleFlag = flag<boolean, Entities>({
  // ...
  identify({ headers, cookies }) {
    // access to normalized headers and cookies here
    headers.get('auth');
    cookies.get('auth')?.value;
    // ...
  },
  // ...
});
```

### Custom evaluation context

```typescript
// pass a custom evaluation context from the call side
await exampleFlag.run({ identify: { user: { id: 'user1' } } });

// pass a custom evaluation context function from the call side
await exampleFlag.run({ identify: () => ({ user: { id: 'user1' } }) });
```

## Dedupe

Prevent duplicate work by deduplicating function calls:

```typescript
import { dedupe } from '@vercel/flags/next';

const dedupeExample = dedupe(() => {
  return Math.random();
});

export default async function Page() {
  const random1 = await dedupeExample();
  const random2 = await dedupeExample();
  const random3 = await dedupeExample();

  // these will all be the same random number
  return (
    <div>
      {random1} {random2} {random3}
    </div>
  );
}
```

## Dashboard Pages

```typescript
import type { ReadonlyRequestCookies } from '@vercel/flags';
import { flag, dedupe } from '@vercel/flags/next';

interface Entities {
  user?: { id: string };
}

const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('dashboard-user-id')?.value;
  return { user: userId ? { id: userId } : undefined };
});

export const dashboardFlag = flag<boolean, Entities>({
  key: 'dashboard-flag',
  identify,
  decide({ entities }) {
    if (!entities?.user) return false;
    // Allowed users could be loaded from Edge Config or elsewhere
    const allowedUsers = ['user1'];

    return allowedUsers.includes(entities.user.id);
  },
});
```

## Marketing Pages

See the `examples/marketing-pages` directory for a complete example including:

- Visitor ID generation
- Cookie handling in middleware
- A/B testing based on visitor IDs

## Edge Middleware

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { basicEdgeMiddlewareFlag } from './flags';

export const config = {
  matcher: ['/examples/feature-flags-in-edge-middleware'],
};

export async function middleware(request: NextRequest) {
  const active = await basicEdgeMiddlewareFlag();
  const variant = active ? 'variant-on' : 'variant-off';

  return NextResponse.rewrite(
    new URL(`/examples/feature-flags-in-edge-middleware/${variant}`, request.url)
  );
}
```

## Suspense Fallbacks

```typescript
export default async function Page() {
  const hasAuth = await hasAuthCookieFlag();

  return (
    <Suspense fallback={hasAuth ? <AuthedSkeleton /> : <UnauthedSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
```

## Declaring Available Options

```typescript
// Simple array
export const greetingFlag = flag<string>({
  key: 'greeting',
  options: ['Hello world', 'Hi', 'Hola'],
  decide: () => 'Hello world',
});

// With labels
export const greetingFlag = flag<string>({
  key: 'greeting',
  options: [
    { label: 'Hello world', value: 'Hello world' },
    { label: 'Hi', value: 'Hi' },
    { label: 'Hola', value: 'Hola' },
  ],
  decide: () => 'Hello world',
});

// Object values
export const greetingFlag = flag<string>({
  key: 'greeting',
  options: [
    {
      label: 'Hello world',
      value: {
        /* your object here */
      },
    },
  ],
});
```

## Pages Router Support

```typescript
export const getStaticPaths = (async () => {
  const codes = await generatePermutations(marketingFlags);

  return {
    paths: codes.map((code) => ({ params: { code } })),
    fallback: 'blocking',
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async (context) => {
  if (typeof context.params?.code !== 'string') return { notFound: true };

  const example = await exampleFlag(context.params.code, marketingFlags);
  return { props: { example } };
}) satisfies GetStaticProps;
```

## Advanced Features

### Filtering Permutations

```typescript
export async function generateStaticParams() {
  const codes = await generatePermutations(flags, (combination) => {
    // Only pre-render specific combinations
    return combination['feature-a'] === true;
  });

  return codes.map((code) => ({ code }));
}
```

### Multiple Groups

Define multiple groups of flags to avoid unnecessary permutations:

```typescript
// all available flags
export const navigationFlag = flag(/* ... */);
export const bannerFlag = flag(/* ... */);
export const discountFlag = flag(/* ... */);

// two groups of flags
export const rootFlags = [navigationFlag, bannerFlag];
export const pricingFlags = [discountFlag];
```

## API Reference

### Imports

This package re-exports everything from `@vercel/flags/next`:

```typescript
// Next.js Server-side
import { flag, dedupe, precompute, generatePermutations } from '@repo/feature-flags/server/next';

// Next.js Client-side
import { useFlag } from '@repo/feature-flags/client/next';

// Generic server (any Node.js environment)
import { createPostHogServerAdapter, createEdgeConfigAdapter } from '@repo/feature-flags/server';

// Generic client (any browser environment)
import { postHogClientAdapter } from '@repo/feature-flags/client';
```

### Server Functions

- `flag()` - Define a feature flag with decide function and options
- `dedupe()` - Deduplicate function calls within a request
- `precompute()` - Precompute flags for static generation
- `generatePermutations()` - Generate flag combinations with optional filter
- `getFlagContext()` - Get current flag context (headers, cookies, overrides)
- `evaluateFlags()` - Evaluate multiple flags in parallel

### Flag Methods

- `flag()` - Evaluate the flag
- `flag(code, flagsArray)` - Evaluate with precomputed code
- `flag.run(options)` - Evaluate with custom context

### Client Hooks

- `useFlag()` - React hook for client-side flag evaluation

### Utility Functions

- `getOrGenerateVisitorId()` - Generate visitor IDs for A/B testing
- `parseOverrides()` - Parse Vercel Toolbar overrides
- `generateVisitorId()` - Generate a new visitor ID

## Integration with Vercel Toolbar

The Flags Explorer in Vercel Toolbar allows overriding flags for development. Overrides are
automatically respected by the SDK.

## PostHog Adapter

Use PostHog as your feature flag provider instead of the default decide function.

### Basic Setup

```typescript
import { flag } from '@vercel/flags/next';
import { postHogServerAdapter } from '@repo/feature-flags/server/next';

// Boolean flag
export const myFlag = flag({
  key: 'posthog-is-feature-enabled',
  adapter: postHogServerAdapter.isFeatureEnabled(),
  identify,
});

// Multivariate flag (returns string or boolean)
export const myFlagVariant = flag({
  key: 'posthog-feature-flag-value',
  adapter: postHogServerAdapter.featureFlagValue(),
  identify,
});

// Flag with payload (JSON data)
export const myFlagPayload = flag({
  key: 'posthog-feature-flag-payload',
  adapter: postHogServerAdapter.featureFlagPayload((v) => v),
  defaultValue: {},
  identify,
});
```

### Custom PostHog Configuration

```typescript
import { createPostHogServerAdapter } from '@repo/feature-flags/server/next';

const customAdapter = createPostHogServerAdapter({
  postHogKey: 'your-api-key',
  postHogOptions: {
    host: 'https://app.posthog.com',
    // additional PostHog options
  },
});

export const myFlag = flag({
  key: 'custom-flag',
  adapter: customAdapter.isFeatureEnabled(),
  identify,
});
```

### Discovery Endpoint for Vercel Toolbar

Create a discovery endpoint at `app/.well-known/vercel/flags/route.ts`:

```typescript
import {
  createFlagsDiscoveryEndpoint,
  getPostHogProviderData,
} from '@repo/feature-flags/server/next';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getPostHogProviderData({
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
  });
});
```

### Environment Variables

```bash
# For flag evaluation
NEXT_PUBLIC_POSTHOG_KEY=your-project-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com # optional

# For discovery endpoint (optional)
POSTHOG_PERSONAL_API_KEY=your-personal-api-key
POSTHOG_PROJECT_ID=your-project-id
```

### Server-Side Evaluation

The PostHog adapter supports both client-side and server-side evaluation:

```typescript
// Server component
export default async function Page() {
  // This works on both client and server
  const enabled = await myFlag();

  return <div>{enabled ? 'Feature enabled' : 'Feature disabled'}</div>;
}
```

## Edge Config Adapter

Use Vercel Edge Config as your feature flag provider for ultra-low latency flag evaluation.

### Basic Setup

```typescript
import { flag } from '@vercel/flags/next';
import { edgeConfigAdapter } from '@repo/feature-flags/server/next';

export const exampleFlag = flag({
  // Will load the `flags` key from Edge Config
  adapter: edgeConfigAdapter(),
  // Will get the `example-flag` key from the `flags` object
  key: 'example-flag',
});
```

Your Edge Config should be structured as follows:

```json
{
  // `flags` is the default key used by the Edge Config adapter
  "flags": {
    // Flags using the adapter should have their `key` defined here
    "example-flag": true,
    "another-example-flag": false,
    "variant-flag": "control",
    "config-flag": {
      "enabled": true,
      "maxUsers": 100
    }
  }
}
```

### Custom Edge Config Configuration

```typescript
import { createEdgeConfigAdapter } from '@repo/feature-flags/server/next';

const myEdgeConfigAdapter = createEdgeConfigAdapter({
  connectionString: process.env.OTHER_EDGE_CONFIG_CONNECTION_STRING,
  options: {
    edgeConfigItemKey: 'other-flags-key', // Default is 'flags'
    teamSlug: 'my-vercel-team-slug', // For dashboard links
  },
});

export const myFlag = flag({
  adapter: myEdgeConfigAdapter(),
  key: 'example-flag',
});
```

### Using Custom Edge Config Client

```typescript
import { createClient } from '@vercel/edge-config';
import { createEdgeConfigAdapter } from '@repo/feature-flags/server/next';

const client = createClient(process.env.EDGE_CONFIG!);

const adapter = createEdgeConfigAdapter({
  connectionString: client,
  options: {
    edgeConfigItemKey: 'app-flags',
  },
});
```

### Discovery Endpoint for Edge Config

Create a discovery endpoint at `app/.well-known/vercel/flags/route.ts`:

```typescript
import {
  createFlagsDiscoveryEndpoint,
  getEdgeConfigProviderData,
} from '@repo/feature-flags/server/next';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getEdgeConfigProviderData({
    // Uses EDGE_CONFIG environment variable by default
    options: {
      edgeConfigItemKey: 'flags', // optional, defaults to 'flags'
      teamSlug: 'my-team', // optional, for dashboard links
    },
  });
});
```

### Environment Variables

```bash
# Edge Config connection string
EDGE_CONFIG=your-edge-config-connection-string
```

### Edge Config Benefits

- **Ultra-low latency**: Edge Config is globally distributed
- **No cold starts**: Data is available at the edge
- **Simple management**: Update flags via Vercel dashboard
- **Version control**: Changes are tracked and can be rolled back

## Complete Examples

See the `examples/` directory for complete working examples:

- `basic/` - Simple flag usage
- `precompute/` - Static page optimization
- `marketing-pages/` - A/B testing with visitor IDs
- `dashboard-pages/` - User-based targeting
- `edge-middleware/` - Middleware rewrites
- `suspense-fallbacks/` - Partial prerendering
- `evaluation-context/` - Custom context examples
- `options/` - Flag options examples
- `pages-router/` - Pages Router support
- `custom-evaluation-context/` - Advanced context usage
- `posthog/` - PostHog adapter integration
- `edge-config/` - Edge Config adapter integration
