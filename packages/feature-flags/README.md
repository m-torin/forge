# @repo/feature-flags

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`
  - **Utilities**: `./types`, `./middleware`

- _AI Hints:_

  ```typescript
  // Primary: Feature flag configuration with edge support
  import { flag, isEnabled } from "@repo/feature-flags/server/next";
  // Edge: import { flag } from "@repo/feature-flags/server/edge"
  // Client: import { useFlag } from "@repo/feature-flags/client/next"
  // ❌ NEVER: Hardcode feature states or bypass flag checks
  ```

- _Key Features:_
  - **Vercel Flags SDK**: Full implementation with static precomputation and
    edge middleware
  - **PostHog Integration**: Complete adapter with user targeting, A/B testing,
    multivariate flags
  - **Edge Config Provider**: Ultra-low latency flags using Vercel Edge Config
  - **Developer Tools**: Vercel Toolbar integration with real-time flag
    overrides

- _Provider Options:_
  - **Static**: Precomputed flags for build-time optimization
  - **PostHog**: User targeting and experimentation platform
  - **Edge Config**: Global distribution with minimal latency
  - **Hybrid**: Combine multiple providers for different flag types

- _Quick Start:_

  ```typescript
  import { flag } from "@vercel/flags/next";
  export const showFeature = flag<boolean>({
    key: "show-feature",
    decide: () => true,
    defaultValue: false
  });
  ```

- _Documentation:_
  **[Feature Flags Package](../../apps/docs/packages/feature-flags.mdx)**
