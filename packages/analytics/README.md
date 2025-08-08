# @repo/analytics

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`
  - **Utilities**: `./shared`, `./types`, `./keys`

- _AI Hints:_

  ```typescript
  // Primary: PostHog/GA tracking with edge support - feature flags included
  import { track, flag } from "@repo/analytics/server/next";
  // Edge: import { track } from "@repo/analytics/server/edge"
  // Client: import { useTrack } from "@repo/analytics/client/next"
  // ❌ NEVER: Track sensitive data or PII
  ```

- _Key Features:_
  - **Multi-Provider**: PostHog, Vercel Analytics, Segment, Console logging
  - **Emitter-Based Architecture**: Type-safe event tracking following
    Segment.io specification
  - **Universal Analytics**: Consistent tracking across client/server/edge
    environments
  - **E-commerce Tracking**: 50+ standardized e-commerce events
  - **Event Batching**: Sophisticated batching for optimal performance
  - **Next.js 15 Integration**: App Router, Server Components, React hooks

- _Environment Variables:_

  ```bash
  # PostHog (Primary)
  NEXT_PUBLIC_POSTHOG_KEY=phc_...
  NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
  
  # Vercel Analytics
  VERCEL_ANALYTICS_ID=...
  
  # Segment (Optional)
  NEXT_PUBLIC_SEGMENT_WRITE_KEY=...
  
  # Development
  NEXT_PUBLIC_CONSOLE_ANALYTICS=true
  ```

- _Quick Setup:_

  ```typescript
  // Provider setup
  import { AnalyticsProvider } from "@repo/analytics/client/next";
  <AnalyticsProvider>{children}</AnalyticsProvider>

  // Track events
  import { track, identify, ecommerce } from "@repo/analytics/client/next";
  track("Button Clicked", { button_name: "signup" });
  ecommerce.productViewed({ product_id: "prod_123", price: 99.99 });
  ```

- _Documentation:_
  **[Analytics Package](../../apps/docs/packages/analytics.mdx)**
