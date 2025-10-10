**Note**: This is a collection folder, not a package itself. Import from
individual packages like `@repo/3p-core`, `@repo/3p-posthog`,
`@repo/3p-segment`, `@repo/3p-vercel`, etc.

---

# Integrations Packages Collection

This folder contains multiple third-party integration packages that provide
analytics, tracking, and external service connectivity. Each package is
independently installable and provides specific integration functionality.

## 📦 Available Packages

| Package                            | Description                                         | Status      |
| ---------------------------------- | --------------------------------------------------- | ----------- |
| [`@repo/3p-core`](./3p-core)       | Core utilities and types for 3rd party integrations | ✅ Complete |
| [`@repo/3p-posthog`](./3p-posthog) | PostHog analytics integration                       | ✅ Complete |
| [`@repo/3p-segment`](./3p-segment) | Segment analytics integration                       | ✅ Complete |
| [`@repo/3p-vercel`](./3p-vercel)   | Vercel Analytics integration                        | ✅ Complete |

## 🚀 Key Features

- **Tree-Shaking Optimized**: Minimal bundle impact with composable utilities
- **Multi-Provider Support**: Lazy loading and orchestration across multiple
  services
- **Type Safety**: Full TypeScript support with strict type checking
- **Edge Runtime Compatible**: Optimized for serverless and edge environments
- **Privacy Compliant**: Built-in GDPR/CCPA compliance and data anonymization
- **Retry & Circuit Breaker**: Robust error handling and resilience patterns

## 🛠 Development

```bash
# Install all dependencies
pnpm install

# Run type checking for all integration packages
pnpm --filter "@repo/3p-*" typecheck

# Run tests for all integration packages
pnpm --filter "@repo/3p-*" test

# Run tests for a specific package
pnpm --filter "@repo/3p-posthog" test
```

## 📚 Documentation

Each package has its own README with detailed documentation:

- [3p-core Package](./3p-core/USAGE_EXAMPLES.md) - Core utilities and
  orchestration
- [3p-posthog Package](./3p-posthog/README.md) - PostHog integration
- [3p-segment Package](./3p-segment/README.md) - Segment integration
- [3p-vercel Package](./3p-vercel/USAGE_EXAMPLES.md) - Vercel Analytics
  integration

## 🔧 Usage Examples

### Minimal Bundle (Tree-Shaking Optimized)

```typescript
// Import only what you need
import { VercelAdapter } from "@repo/3p-vercel/adapter";
import { withRetry } from "@repo/3p-core/composable/with-retry";

const adapter = new VercelAdapter({ provider: "vercel", enabled: true });
const analytics = withRetry(adapter, { maxRetries: 3 });

await analytics.track({ name: "Button Clicked", properties: { id: "cta" } });
```

### Multi-Provider Orchestration

```typescript
import { LazyMultiProvider } from "@repo/3p-core/orchestration/lazy-multi-provider";

const multiProvider = new LazyMultiProvider({
  providers: {
    vercel: {
      enabled: true,
      priority: 1,
      loader: async () => {
        const { VercelAdapter } = await import("@repo/3p-vercel/adapter");
        return new VercelAdapter({ provider: "vercel", enabled: true });
      }
    },
    posthog: {
      enabled: true,
      priority: 2,
      loader: async () => {
        const { PostHogAdapter } = await import("@repo/3p-posthog/adapter");
        return new PostHogAdapter({ provider: "posthog", enabled: true });
      }
    }
  }
});

// Single call reaches all enabled providers
await multiProvider.track({ name: "Purchase", properties: { value: 100 } });
```

## 🎯 Architecture

- **Core Package**: Shared utilities, types, and orchestration
- **Provider Packages**: Specific integrations for analytics services
- **Composable Utilities**: Retry, privacy, batching, and validation
- **Lazy Loading**: Providers loaded on-demand to minimize bundle size
- **Tree-Shaking**: Only import what you use for optimal performance
