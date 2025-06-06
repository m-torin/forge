# Feature Flags Package Structure

This package follows the same structure as `@repo/analytics`, separating generic/platform-agnostic
functionality from Next.js-specific features.

## Import Paths

### Generic (Platform-Agnostic)

#### `@repo/feature-flags/client`

Generic client-side exports for any browser/client environment:

- PostHog client adapter
- Generic types and interfaces

```typescript
import { createPostHogClientAdapter, postHogClientAdapter } from '@repo/feature-flags/client';
```

#### `@repo/feature-flags/server`

Generic server-side exports for any Node.js environment:

- PostHog server adapter
- Edge Config adapter
- Provider data functions
- Generic types

```typescript
import {
  createPostHogServerAdapter,
  createEdgeConfigAdapter,
  getPostHogProviderData,
  getEdgeConfigProviderData,
} from '@repo/feature-flags/server';
```

### Next.js-Specific

#### `@repo/feature-flags/client/next`

Next.js client exports with hooks and utilities:

- All generic client exports
- `useFlag` hook for client components
- Next.js-specific utilities

```typescript
import { useFlag, postHogClientAdapter } from '@repo/feature-flags/client/next';
```

#### `@repo/feature-flags/server/next`

Next.js server exports with full Vercel Flags SDK:

- All generic server exports
- Vercel Flags SDK functions (`flag`, `precompute`, etc.)
- Discovery endpoint functions
- Next.js-specific types

```typescript
import {
  flag,
  getPostHogProviderData,
  createFlagsDiscoveryEndpoint,
  postHogServerAdapter,
  edgeConfigAdapter,
} from '@repo/feature-flags/server/next';
```

## Usage Examples

### Generic Node.js Application

```typescript
// Any Node.js app
import { createPostHogServerAdapter } from '@repo/feature-flags/server';

const adapter = createPostHogServerAdapter({
  postHogKey: 'your-key',
});

// Use with your own flag system
const isEnabled = await adapter.isFeatureEnabled()({
  key: 'my-feature',
  entities: { user: { id: 'user123' } },
});
```

### Next.js Application

```typescript
// flags.ts
import { flag } from '@vercel/flags/next';
import { postHogServerAdapter } from '@repo/feature-flags/server/next';

export const myFlag = flag({
  key: 'my-feature',
  adapter: postHogServerAdapter.isFeatureEnabled(),
  defaultValue: false
});

// Server component
export default async function Page() {
  const enabled = await myFlag();
  return <div>{enabled ? 'Feature on' : 'Feature off'}</div>;
}

// Client component
'use client';
import { useFlag } from '@repo/feature-flags/client/next';

export function ClientComponent() {
  const enabled = useFlag(myFlag, false);
  return <div>{enabled ? 'Feature on' : 'Feature off'}</div>;
}
```

## File Structure

```
src/
├── client.ts              # Generic client exports
├── server.ts              # Generic server exports
├── client-next.ts         # Next.js client exports
├── server-next.ts         # Next.js server exports
├── adapters/
│   ├── posthog.ts         # PostHog adapter (client + server)
│   └── edge-config.ts     # Edge Config adapter (server-only)
├── client/
│   ├── hooks.ts          # useFlag hook (Next.js only)
│   └── index.ts          # Client utilities
├── server/
│   ├── flags.ts          # Next.js server utilities
│   └── index.ts          # (deprecated, moved to root files)
├── shared/
│   ├── flag.ts           # Vercel SDK re-exports
│   ├── types.ts          # Shared types
│   └── utils.ts          # Utilities
├── discovery/
│   └── index.ts          # Discovery endpoint (Next.js only)
└── middleware/
    └── index.ts          # Middleware utilities (Next.js only)
```

## Migration Guide

### From Old Import Paths

**Before:**

```typescript
import { postHogAdapter } from '@repo/feature-flags/server';
import { useFlag } from '@repo/feature-flags/client';
```

**After:**

```typescript
// For Next.js apps
import { postHogServerAdapter } from '@repo/feature-flags/server/next';
import { useFlag } from '@repo/feature-flags/client/next';

// For generic Node.js apps
import { createPostHogServerAdapter } from '@repo/feature-flags/server';
// (useFlag not available in generic environments)
```

### Choosing the Right Import

**Use Generic Imports (`/client`, `/server`) when:**

- Building a non-Next.js application
- Creating reusable libraries
- Need platform-agnostic flag adapters
- Don't need Vercel Flags SDK features

**Use Next.js Imports (`/client/next`, `/server/next`) when:**

- Building a Next.js application
- Need full Vercel Flags SDK integration
- Want Vercel Toolbar support
- Using precomputation, middleware, etc.

## Benefits

1. **Platform Flexibility**: Use adapters in any Node.js environment
2. **Clear Separation**: Obvious which features require Next.js
3. **Smaller Bundles**: Generic imports don't include Next.js dependencies
4. **Consistent Pattern**: Matches `@repo/analytics` structure
5. **Future-Proof**: Easy to add more platform-specific exports
