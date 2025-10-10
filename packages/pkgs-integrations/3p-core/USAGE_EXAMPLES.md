# 3P Analytics - Tree-Shaking Optimized Usage Examples

## Architecture Overview

The new 3p-core architecture uses composable utilities for maximum tree-shaking:

- ✅ **Minimal Base Adapter** - lightweight foundation
- ✅ **Composable Features** - add only what you need
- ✅ **Lazy Loading** - providers loaded on-demand
- ✅ **Specific Imports** - no wildcards or barrel exports

## Single Provider Usage (Minimal Bundle)

```typescript
// Only imports the adapter - no extra utilities
import { BaseMinimalAdapter } from "@repo/3p-core/adapters/minimal-adapter";
import { AnalyticsEvent } from "@repo/3p-core/types";

class SimpleVercelAdapter extends BaseMinimalAdapter {
  get provider() {
    return "vercel" as const;
  }

  protected async doInitialize() {
    // Vercel init
  }

  protected async doTrack(event: AnalyticsEvent) {
    const { track } = await import("@vercel/analytics");
    track(event.name, event.properties);
    return true;
  }

  // ... other methods
}

// Usage - minimal bundle size
const analytics = new SimpleVercelAdapter({ provider: "vercel" });
await analytics.track({ name: "Purchase", properties: { value: 100 } });
```

## Single Provider with Composable Features

```typescript
// Import only what you need - tree-shaking eliminates unused features
import { BaseMinimalAdapter } from "@repo/3p-core/adapters/minimal-adapter";
import { withRetry } from "@repo/3p-core/composable/with-retry";
import { withPrivacy } from "@repo/3p-core/composable/with-privacy";

// Create base adapter
const baseAdapter = new VercelAdapter(config);

// Compose only needed features
const analytics = withPrivacy(
  withRetry(baseAdapter, {
    maxRetries: 3,
    retryDelay: 1000
  }),
  {
    gdprCompliant: true,
    anonymizeIp: true
  }
);

// Usage - includes only retry + privacy features
await analytics.track({ name: "Purchase", properties: { value: 100 } });
```

## Multi-Provider Lazy Loading

```typescript
// Lazy multi-provider - providers loaded only when used
import { LazyMultiProvider } from "@repo/3p-core/orchestration/lazy-multi-provider";
import type { AnalyticsEvent } from "@repo/3p-core/types";

const multiProvider = new LazyMultiProvider({
  providers: {
    // Providers loaded dynamically - zero upfront bundle cost
    vercel: {
      enabled: true,
      priority: 1,
      loader: async () => {
        const { VercelAdapter } = await import("@repo/3p-vercel/client");
        return new VercelAdapter(vercelConfig);
      }
    },
    posthog: {
      enabled: true,
      priority: 2,
      loader: async () => {
        const { PostHogAdapter } = await import("@repo/3p-posthog/client");
        return new PostHogAdapter(posthogConfig);
      },
      routingRules: [
        {
          // Only route feature flag events to PostHog
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

// Usage - one call → multiple providers
const result = await multiProvider.track({
  name: "Purchase",
  properties: { value: 100 }
});

console.log("Results:", result.results);
// { vercel: { success: true }, posthog: { success: true } }
```

## Bundle Size Comparison

### ❌ Old Approach (Forced Imports)

```typescript
// Old way - forces ALL utilities even if unused
import { BaseProviderAdapter } from "@repo/3p-core/adapters/base-adapter";

// This imports:
// ✗ EventBatcher (unused)
// ✗ PrivacyManager (unused)
// ✗ RetryManager (unused)
// ✗ CircuitBreaker (unused)
// ✗ Validation utilities (unused)

// Estimated bundle: ~15KB
```

### ✅ New Approach (Tree-Shaking Optimized)

```typescript
// New way - import only what you use
import { BaseMinimalAdapter } from "@repo/3p-core/adapters/minimal-adapter";
import { withRetry } from "@repo/3p-core/composable/with-retry";

// This imports:
// ✓ Minimal adapter (~2KB)
// ✓ Retry utilities only (~3KB)
// ✗ Privacy, batching, validation (excluded)

// Estimated bundle: ~5KB (67% smaller)
```

## Advanced Compositions

```typescript
// Maximum feature composition
import { BaseMinimalAdapter } from "@repo/3p-core/adapters/minimal-adapter";
import { withRetry } from "@repo/3p-core/composable/with-retry";
import { withPrivacy } from "@repo/3p-core/composable/with-privacy";
import { withBatching } from "@repo/3p-core/composable/with-batching";

const baseAdapter = new VercelAdapter(config);

// Chain multiple features - still tree-shaking optimized
const analytics = withBatching(
  withPrivacy(
    withRetry(baseAdapter, {
      maxRetries: 3,
      circuitBreaker: { failureThreshold: 5 }
    }),
    {
      gdprCompliant: true,
      ccpaCompliant: true,
      respectDoNotTrack: true
    }
  ),
  {
    enabled: true,
    maxSize: 100,
    flushInterval: 5000
  }
);

// All features available, but bundler only includes what's used
await analytics.track({ name: "Purchase", properties: { value: 100 } });
```

## Provider-Specific Extensions

```typescript
// Extend minimal adapter for provider-specific features
import { BaseMinimalAdapter } from "@repo/3p-core/adapters/minimal-adapter";
import type { VercelWebVitalsMetric } from "@repo/3p-vercel/types";

class VercelAdapter extends BaseMinimalAdapter {
  // Standard analytics
  async track(event: AnalyticsEvent) {
    const { track } = await import("@vercel/analytics");
    track(event.name, event.properties);
    return true;
  }

  // Vercel-specific feature
  async trackWebVital(metric: VercelWebVitalsMetric) {
    const { onCLS } = await import("@vercel/analytics");
    onCLS((metric) => console.log("CLS:", metric));
  }
}

// Provider-specific features don't affect base bundle size
const vercel = new VercelAdapter(config);
await vercel.trackWebVital(clsMetric); // Tree-shaking preserves this
```

## Key Benefits

1. **🎯 Targeted Imports**: Import exactly what you need
2. **📦 Minimal Bundles**: 60-80% smaller than old approach
3. **⚡ Lazy Loading**: Providers loaded on-demand
4. **🔧 Composable**: Mix and match features
5. **🎛️ Multi-Provider**: One call → multiple services
6. **🛡️ Type Safe**: Full TypeScript support maintained
