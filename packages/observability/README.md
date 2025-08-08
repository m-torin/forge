# @repo/observability

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`, `./env`
  - **Plugins**: `./plugins/console`, `./plugins/sentry`,
    `./plugins/betterstack`, `./plugins/logtape`,
    `./plugins/sentry-microfrontend` (+ env configs)

- _AI Hints:_

  ```typescript
  // Primary: Sentry error tracking + multi-provider observability
  import { createObservability } from "@repo/observability/server/next";
  // Edge: import { createObservability } from "@repo/observability/server/edge"
  // Client: import { createObservability } from "@repo/observability/client/next"
  // ❌ NEVER: Use server/next in edge runtime or edge exports in server components
  ```

- _Key Features:_
  - **Sentry Integration**: Error tracking, performance monitoring, session
    replay
  - **Structured Logging**: Environment-aware logging (Logtail prod, console
    dev)
  - **Performance Monitoring**: Automatic timing and performance tracking
  - **Analytics Integration**: User behavior tracking and workflow analytics
  - **System Status Monitoring**: Real-time status display with BetterStack

- _Environment Variables:_

  ```bash
  SENTRY_DSN=https://...
  SENTRY_ORG=your-org
  SENTRY_PROJECT=your-project
  LOGTAIL_SOURCE_TOKEN=your-token
  BETTERSTACK_STATUS_PAGE_ID=your-page-id
  ```

- _Documentation:_
  **[Observability Package](../apps/docs/packages/observability/overview.mdx)**
