# @repo/links

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`
  - **Utilities**: `./shared`, `./types`

- _AI Hints:_

  ```typescript
  // Primary: Enterprise URL shortening with Dub.co integration + analytics
  import { createServerLinkManager } from "@repo/links/server/next";
  // Client: import { useCreateLink } from "@repo/links/client/next"
  // ❌ NEVER: Create unvalidated redirects or expose internal URLs
  ```

- _Key Features:_
  - **Dub.co Integration**: Enterprise-grade URL shortening with custom domains
  - **Analytics & Tracking**: Comprehensive click analytics with geographic and
    device data
  - **LinkManager Pattern**: Provider-based architecture with graceful
    degradation
  - **React Hooks**: Specialized hooks for link creation, analytics, and click
    handling
  - **Bulk Operations**: Efficient batch link creation with chunking and error
    handling
  - **Link Expiration**: TTL support with custom expired URL redirects
  - **Password Protection**: Optional password-protected links

- _Environment Variables:_

  ```bash
  # Dub.co configuration (required)
  DUB_API_KEY=your_dub_api_key
  DUB_WORKSPACE=your_workspace_id
  DUB_DEFAULT_DOMAIN=yourdomain.com
  DUB_BASE_URL=https://api.dub.co
  
  # Analytics configuration (optional)
  LINKS_ANALYTICS_ENABLED=true
  LINKS_ANALYTICS_SAMPLING=1.0
  ```

- _Quick Examples:_

  ```typescript
  // Server-side link creation
  import { createServerLinkManager } from "@repo/links/server/next";

  const linkManager = await createServerLinkManager({
    providers: {
      dub: {
        enabled: true,
        apiKey: process.env.DUB_API_KEY,
        workspace: process.env.DUB_WORKSPACE,
        defaultDomain: "yourdomain.com"
      }
    }
  });

  const link = await linkManager.createLink({
    url: "https://example.com/very/long/url",
    title: "My Page",
    tags: ["marketing", "campaign"]
  });

  // Client-side hooks
  import { useCreateLink, useLinkAnalytics } from "@repo/links/client/next";
  const { createLink, isLoading } = useCreateLink();
  const { analytics } = useLinkAnalytics(linkId, "7d");
  ```

- _API Methods:_
  - `createLink()`, `getLink()`, `getLinkByKey()`, `updateLink()`,
    `deleteLink()`
  - `getAnalytics()`, `getClicks()`, `bulkCreate()`
  - Analytics: clicks, uniqueClicks, topCountries, topCities, topReferrers,
    topBrowsers

- _React Hooks:_
  - `useCreateLink()`, `useLink()`, `useLinkAnalytics()`, `useLinkClick()`

- _Documentation:_ **[Links Package](../../apps/docs/packages/links.mdx)**
