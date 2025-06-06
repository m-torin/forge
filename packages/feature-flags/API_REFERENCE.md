# Feature Flags SDK API Reference

This package provides a complete implementation of the Vercel Flags SDK with additional adapters for
PostHog and Edge Config.

## Core API (from @vercel/flags/next)

All standard Vercel Flags SDK functions are re-exported:

### Flag Declaration

#### `flag<T, E = any>(options)`

Declares a feature flag with automatic Vercel Toolbar integration.

**Parameters:**

- `key` (string, required) - Unique identifier for the flag
- `decide` (function) - Resolves the flag value
- `defaultValue` (T) - Fallback value if decide returns undefined or throws
- `description` (string) - Description shown in Flags Explorer
- `origin` (string) - URL where flag can be managed
- `options` (Array) - Possible values with labels for Flags Explorer
- `adapter` (Adapter) - External provider adapter (overrides decide)
- `identify` (function) - Provides evaluation context to decide

```typescript
const myFlag = flag<boolean>({
  key: 'my-flag',
  decide: async ({ entities }) => true,
  defaultValue: false,
  description: 'My feature flag',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});
```

### Discovery Endpoint

#### `createFlagsDiscoveryEndpoint(getApiData, options?)`

Creates the `.well-known/vercel/flags` route handler.

**Features:**

- Automatic `verifyAccess` for authorization
- Adds `x-flags-sdk-version` header
- Returns 401 for unauthorized requests

```typescript
export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});
```

#### `getProviderData(flags)`

Converts flag definitions to Vercel Toolbar format.

```typescript
const providerData = getProviderData({
  flag1: myFlag,
  flag2: anotherFlag,
});
```

#### `verifyAccess(request, secret?)`

Verifies authorization header (for Pages Router).

### Precomputation

#### `precompute(flags, code?)`

Evaluates and serializes multiple flags to a signed string.

```typescript
const code = await precompute([flag1, flag2]);
```

#### `evaluate(flags)`

Evaluates multiple flags and returns their values.

```typescript
const values = await evaluate([flag1, flag2]);
// Returns: [value1, value2]
```

#### `serialize(flags, values, secret?)`

Converts evaluated flags to compressed format (2 bytes per flag).

```typescript
const code = await serialize(flags, values);
```

#### `getPrecomputed(flag(s), precomputeFlags, code)`

Retrieves flag values from precomputation.

```typescript
const [val1, val2] = await getPrecomputed([flag1, flag2], precomputeFlags, code);
```

#### `deserialize(flags, code)`

Returns all flag values as a record.

```typescript
const allFlags = await deserialize(precomputeFlags, code);
// Returns: { 'flag-key': value, ... }
```

#### `generatePermutations(flags, filter?, secret?)`

Generates all possible flag combinations for static generation.

```typescript
const codes = await generatePermutations(flags, (combo) => combo['show-banner'] === true);
```

### Utilities

#### `dedupe(fn)`

Prevents duplicate function calls within a request.

```typescript
const getUser = dedupe(async () => {
  return fetchUser();
});
```

## Custom Adapters

### PostHog Adapter

```typescript
import { postHogAdapter, createPostHogAdapter } from '@repo/feature-flags/server';

// Pre-configured adapter
const flag1 = flag({
  key: 'my-flag',
  adapter: postHogAdapter.isFeatureEnabled(),
});

// Custom configuration
const customAdapter = createPostHogAdapter({
  postHogKey: 'your-key',
  postHogOptions: { host: 'https://app.posthog.com' },
});
```

**Methods:**

- `isFeatureEnabled()` - Boolean flags
- `featureFlagValue()` - String/boolean multivariate
- `featureFlagPayload(transform?)` - JSON payloads

### Edge Config Adapter

```typescript
import { edgeConfigAdapter, createEdgeConfigAdapter } from '@repo/feature-flags/server';

// Default adapter (uses EDGE_CONFIG env var)
const flag1 = flag({
  key: 'my-flag',
  adapter: edgeConfigAdapter(),
});

// Custom configuration
const customAdapter = createEdgeConfigAdapter({
  connectionString: process.env.OTHER_EDGE_CONFIG,
  options: {
    edgeConfigItemKey: 'feature-flags',
    teamSlug: 'my-team',
  },
});
```

## Type Definitions

### Adapter Interface

```typescript
interface Adapter<T, E> {
  decide: (params: {
    key: string;
    entities?: E;
    headers: ReadonlyHeaders;
    cookies: ReadonlyRequestCookies;
  }) => T | Promise<T>;
  origin?: Origin | string;
  identify?: (params: {
    headers: ReadonlyHeaders;
    cookies: ReadonlyRequestCookies;
  }) => E | Promise<E>;
  config?: { reportValue?: boolean };
}
```

### Flag Options

```typescript
interface FlagOption<T> {
  value: T;
  label?: string;
}
```

## Environment Variables

### PostHog

- `NEXT_PUBLIC_POSTHOG_KEY` or `POSTHOG_KEY` - API key
- `NEXT_PUBLIC_POSTHOG_HOST` or `POSTHOG_HOST` - Host URL
- `POSTHOG_PERSONAL_API_KEY` - For discovery endpoint
- `POSTHOG_PROJECT_ID` - For discovery endpoint

### Edge Config

- `EDGE_CONFIG` - Connection string

### Flags SDK

- `FLAGS_SECRET` - Secret for signing precomputed values

## Complete Example

```typescript
// flags.ts
import { flag } from '@vercel/flags/next';
import { postHogAdapter, edgeConfigAdapter } from '@repo/feature-flags/server';

// Standard flag
export const showBanner = flag<boolean>({
  key: 'show-banner',
  decide: () => true,
  defaultValue: false,
  description: 'Show promotional banner',
});

// PostHog flag
export const betaFeature = flag({
  key: 'beta-feature',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify: ({ cookies }) => ({
    user: { id: cookies.get('user-id')?.value || 'anonymous' },
  }),
});

// Edge Config flag
export const theme = flag<string>({
  key: 'theme',
  adapter: edgeConfigAdapter(),
  defaultValue: 'light',
});

// Discovery endpoint
// app/.well-known/vercel/flags/route.ts
import { createFlagsDiscoveryEndpoint, getProviderData } from '@repo/feature-flags/server';
import * as flags from '@/flags';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});
```
