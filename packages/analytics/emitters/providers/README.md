# Analytics Providers

This directory contains analytics provider implementations.

## Architecture Update

We've refactored the analytics providers to avoid circular dependencies with the feature-flags
package:

### New Flag-Aware Providers

1. **`flag-aware-provider.tsx`** - Client-side provider that accepts resolved feature flags as props
2. **`flag-aware-server.ts`** - Server-side functions that accept resolved feature flags as
   parameters

These providers:

- Do NOT import from `@repo/feature-flags` (avoiding circular dependencies)
- Accept feature flags as parameters from the application level
- Maintain the same functionality but with better architecture

### Legacy Providers (Deprecated)

The following files still import from feature-flags and will be removed in a future update:

- `feature-flag-provider.tsx` (use `flag-aware-provider.tsx` instead)
- `feature-flag-server.ts` (use `flag-aware-server.ts` instead)

### Usage Pattern

```typescript
// ✅ Good - In your app, resolve flags first
import { getAnalyticsFlags } from '@repo/feature-flags';
import { FlagAwareAnalyticsProvider } from '@repo/analytics/emitters';

export default async function Layout({ children }) {
  const analyticsFlags = await getAnalyticsFlags();

  return (
    <FlagAwareAnalyticsProvider
      flags={analyticsFlags}
      segment={{ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! }}
    >
      {children}
    </FlagAwareAnalyticsProvider>
  );
}

// ❌ Bad - Don't import feature-flags in analytics package
import { analyticsEnabled } from '@repo/feature-flags';
```

### Benefits

1. **No Circular Dependencies** - Clean package hierarchy maintained
2. **Type Safety** - Full TypeScript support with flag types
3. **Flexibility** - Apps control flag resolution and timing
4. **Testability** - Easy to test with mock flag values
