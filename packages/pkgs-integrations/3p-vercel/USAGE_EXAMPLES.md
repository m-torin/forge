# Vercel Analytics - Standardized Adapter Usage Examples

## New Architecture Benefits

The 3p-vercel package now uses the standardized 3p-core architecture:

- ✅ **Tree-shaking optimized** - only import what you use
- ✅ **Composable features** - add retry, privacy, batching as needed
- ✅ **Multi-provider ready** - works with orchestration
- ✅ **Runtime-specific** - client, server, edge adapters
- ✅ **Backward compatible** - legacy API still available

## Single Provider Usage

### Basic Adapter (Minimal Bundle)

```typescript
import { VercelAdapter } from "@repo/3p-vercel/client";

// Minimal configuration - ~2KB bundle
const analytics = new VercelAdapter({
  provider: "vercel",
  debug: true
});

// Standard analytics interface
await analytics.track({
  name: "Purchase",
  properties: { value: 100, currency: "USD" }
});

await analytics.identify({
  userId: "user123",
  traits: { email: "user@example.com", plan: "pro" }
});
```

### Composable Features (Tree-Shaking Optimized)

```typescript
import { VercelAdapter } from "@repo/3p-vercel/client";
import { withRetry, withPrivacy, withBatching } from "@repo/3p-vercel/client";

// Create base adapter
const baseAdapter = new VercelAdapter({
  provider: "vercel",
  debug: false
});

// Compose only needed features - unused features excluded from bundle
const analytics = withBatching(
  withPrivacy(
    withRetry(baseAdapter, {
      maxRetries: 3,
      retryDelay: 1000,
      circuitBreaker: { failureThreshold: 5 }
    }),
    {
      gdprCompliant: true,
      anonymizeIp: true,
      respectDoNotTrack: true
    }
  ),
  {
    enabled: true,
    maxSize: 100,
    flushInterval: 5000
  }
);

// Same interface - enhanced with retry, privacy, and batching
await analytics.track({
  name: "Purchase",
  properties: { value: 100, sensitive_data: "will_be_anonymized" }
});
```

### Vercel-Specific Features

```typescript
import { VercelAdapter } from "@repo/3p-vercel/client";
import type { VercelWebVitalsMetric } from "@repo/3p-vercel/adapter";

const analytics = new VercelAdapter({
  provider: "vercel",
  mode: "production"
});

// Vercel-specific: Web Vitals tracking
await analytics.trackWebVital({
  name: "CLS",
  value: 0.1,
  rating: "good",
  id: "cls-123",
  navigationType: "navigate"
});

// Vercel-specific: Feature flags (client-side simulation)
await analytics.trackWithFlags(
  "Feature Used",
  {
    feature: "new_checkout"
  },
  ["premium_user", "beta_tester"]
);
```

## Server-Side Usage

### Node.js Server

```typescript
import { VercelServerAdapter } from "@repo/3p-vercel/server";

const analytics = new VercelServerAdapter({
  provider: "vercel",
  debug: false
});

// Server-side tracking
await analytics.track({
  name: "Order Completed",
  properties: {
    orderId: "12345",
    value: 299.99,
    items: 3
  }
});

// Server-specific: Official feature flag support
await (analytics as any).trackWithFlags(
  "Experiment View",
  {
    experiment: "checkout_flow_v2",
    variant: "control"
  },
  ["server_experiment"]
);
```

### Edge Runtime

```typescript
// Edge-compatible usage (future enhancement)
import { VercelAdapter } from "@repo/3p-vercel/server"; // Will work in edge

const analytics = new VercelAdapter({
  provider: "vercel"
});

// Works in Vercel Edge Functions
export default async function handler(request: Request) {
  await analytics.track({
    name: "Edge Function Called",
    properties: {
      path: new URL(request.url).pathname,
      method: request.method
    }
  });

  return new Response("OK");
}
```

## Multi-Provider Orchestration

### Lazy-Loading Multi-Provider

```typescript
import { LazyMultiProvider } from "@repo/3p-core/orchestration/lazy-multi-provider";

// Zero upfront bundle cost - providers loaded on-demand
const multiProvider = new LazyMultiProvider({
  providers: {
    vercel: {
      enabled: true,
      priority: 1,
      loader: async () => {
        const { VercelAdapter } = await import("@repo/3p-vercel/client");
        const { withRetry } = await import(
          "@repo/3p-core/composable/with-retry"
        );

        const base = new VercelAdapter({ provider: "vercel" });
        return withRetry(base, { maxRetries: 2 });
      }
    },
    posthog: {
      enabled: true,
      priority: 2,
      loader: async () => {
        const { PostHogAdapter } = await import("@repo/3p-posthog/client");
        return new PostHogAdapter({ provider: "posthog", apiKey: "ph_key" });
      },
      routingRules: [
        {
          // Route feature flag events only to PostHog
          condition: (event) => event.name.includes("feature_flag"),
          action: "route_only"
        }
      ]
    }
  },
  execution: {
    mode: "parallel", // Send to both simultaneously
    continueOnError: true,
    timeout: 5000
  }
});

// One call → multiple providers (loaded dynamically)
const result = await multiProvider.track({
  name: "Purchase",
  properties: { value: 100 }
});

console.log("Execution results:", result.results);
// {
//   vercel: { success: true, duration: 45, loaded: true },
//   posthog: { success: true, duration: 67, loaded: true }
// }
```

### Provider Health Monitoring

```typescript
// Check provider status before sending events
const status = multiProvider.getProviderStatus();
console.log("Provider status:", status);
// {
//   vercel: { enabled: true, loaded: true, loading: false },
//   posthog: { enabled: true, loaded: false, loading: true }
// }

// Selective routing based on health
if (status.vercel.loaded) {
  await multiProvider.track({ name: "Critical Event" });
}
```

## Migration from Legacy API

### Before (Direct API)

```typescript
// Old direct API approach
import { track } from "@repo/3p-vercel/client";

await track("Purchase", { value: 100 });
```

### After (Standardized + Backward Compatible)

```typescript
// Option 1: Still works - backward compatible
import { track } from "@repo/3p-vercel/client";
await track("Purchase", { value: 100 });

// Option 2: New standardized approach
import { VercelAdapter } from "@repo/3p-vercel/client";
const analytics = new VercelAdapter({ provider: "vercel" });
await analytics.track({
  name: "Purchase",
  properties: { value: 100 }
});

// Option 3: Multi-provider ready
import { LazyMultiProvider } from "@repo/3p-core/orchestration/lazy-multi-provider";
const multi = new LazyMultiProvider({
  providers: {
    vercel: {
      enabled: true,
      priority: 1,
      loader: async () => {
        const { VercelAdapter } = await import("@repo/3p-vercel/client");
        return new VercelAdapter({ provider: "vercel" });
      }
    }
  },
  execution: { mode: "parallel", continueOnError: true }
});
await multi.track({ name: "Purchase", properties: { value: 100 } });
```

## Bundle Size Comparison

### ❌ Before: Old Approach

```typescript
// Old BaseProviderAdapter forced all utilities
import { VercelAnalyticsAdapter } from "@repo/3p-vercel/client";

// Bundle includes:
// ✗ EventBatcher (even if batching disabled)
// ✗ PrivacyManager (even if privacy not needed)
// ✗ RetryManager + CircuitBreaker (even if retry disabled)
// ✗ Validation utilities (always included)

// Estimated bundle: ~15KB
```

### ✅ After: Tree-Shaking Optimized

```typescript
// New minimal adapter + optional composition
import { VercelAdapter, withRetry } from "@repo/3p-vercel/client";

const analytics = withRetry(new VercelAdapter({ provider: "vercel" }), {
  maxRetries: 3
});

// Bundle includes:
// ✓ Minimal adapter (~2KB)
// ✓ Retry utilities (~3KB)
// ✗ Privacy, batching, validation (excluded)

// Estimated bundle: ~5KB (67% reduction!)
```

## Best Practices

### 1. Start Minimal, Add Features

```typescript
// Start with minimal adapter
import { VercelAdapter } from "@repo/3p-vercel/client";
let analytics = new VercelAdapter({ provider: "vercel" });

// Add features only when needed
if (needsRetry) {
  const { withRetry } = await import("@repo/3p-core/composable/with-retry");
  analytics = withRetry(analytics, { maxRetries: 3 });
}

if (needsPrivacy) {
  const { withPrivacy } = await import("@repo/3p-core/composable/with-privacy");
  analytics = withPrivacy(analytics, { gdprCompliant: true });
}
```

### 2. Use Lazy Loading for Multi-Provider

```typescript
// Don't import all providers upfront
const multiProvider = new LazyMultiProvider({
  providers: {
    vercel: {
      enabled: true,
      loader: () =>
        import("@repo/3p-vercel/client").then(
          (m) => new m.VercelAdapter(config)
        )
    },
    // Other providers loaded only when first used
    posthog: {
      enabled: false, // Disabled = never loaded
      loader: () =>
        import("@repo/3p-posthog/client").then(
          (m) => new m.PostHogAdapter(config)
        )
    }
  }
});
```

### 3. Environment-Specific Adapters

```typescript
// Client-side
import { VercelAdapter } from "@repo/3p-vercel/client";

// Server-side
import { VercelServerAdapter } from "@repo/3p-vercel/server";

// Edge runtime (future)
import { VercelEdgeAdapter } from "@repo/3p-vercel/server/edge";
```

## Key Benefits Summary

1. **📦 67% smaller bundles** through tree-shaking
2. **⚡ Lazy loading** - providers loaded on-demand
3. **🎛️ Multi-provider** - one interface, multiple services
4. **🔧 Composable** - mix and match features
5. **🛡️ Type-safe** - full TypeScript support
6. **🔄 Compatible** - legacy API still works
7. **📊 Observable** - built-in health monitoring
