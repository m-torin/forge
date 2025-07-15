# @repo/analytics

Universal analytics system with multi-provider support, emitter-based tracking
patterns, and comprehensive Next.js integration.

Complete documentation is available in
[../../apps/docs/packages/analytics.mdx](../../apps/docs/packages/analytics.mdx).

## Key Features

- **Multi-Provider Analytics**: PostHog, Vercel Analytics, Segment, Console
  logging
- **Emitter-Based Architecture**: Type-safe event tracking following Segment.io
  specification
- **Comprehensive E-commerce Tracking**: 50+ standardized e-commerce events
- **Next.js 15 Integration**: App Router, Server Components, and React hooks
- **Type-Safe Event Tracking**: Full TypeScript support with proper type
  inference

## Quick Start

```typescript
import { track, identify, ecommerce } from "@repo/analytics/client/next";

// Track events
track("Button Clicked", {
  button_name: "signup",
  location: "header"
});

// E-commerce tracking
ecommerce.productViewed({
  product_id: "iphone-15-pro",
  name: "iPhone 15 Pro",
  price: 999.99
});
```

See [documentation](../../apps/docs/packages/analytics.mdx) for complete usage
examples and API reference.
