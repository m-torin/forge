# @repo/security

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Utilities**: `./shared`, `./middleware`, `./validation`

- _AI Hints:_

  ```typescript
  // Primary: Arcjet bot protection + Nosecone headers + Upstash rate limiting
  import { secure, createRateLimiter } from "@repo/security/server/next";
  // Middleware: import { noseconeMiddleware } from "@repo/security/middleware"
  // ❌ NEVER: Bypass validation or store secrets in client-accessible code
  ```

- _Key Features:_
  - **Arcjet Bot Protection**: AI-powered bot detection with Shield protection
    and customizable allow/deny lists
  - **Nosecone Security Headers**: Production-ready security headers with secure
    defaults and CSP configuration
  - **Upstash Rate Limiting**: Distributed rate limiting with sliding windows
    and Redis backend
  - **Environment Aware**: Graceful degradation in development with production
    validation
  - **Multiple Strategies**: Fixed window, sliding window, token bucket, and
    sliding logs rate limiting
  - **TypeScript Safety**: Zod validation with intelligent defaults

- _Environment Variables:_

  ```bash
  # Development (optional - graceful degradation without these)
  ARCJET_KEY=ajkey_test_xxxxxxxxxxxxx
  UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
  UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxx
  
  # Production (required for full functionality)
  ARCJET_KEY=ajkey_xxxxxxxxxxxxx
  UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
  UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxx
  ```

- _Quick Setup:_

  ```typescript
  // 1. Basic middleware with all features
  import {
    noseconeMiddleware,
    noseconeOptions
  } from "@repo/security/middleware";
  export const middleware = noseconeMiddleware(noseconeOptions);

  // 2. API route protection
  import { secure, createRateLimiter } from "@repo/security/server/next";
  import { Ratelimit } from "@upstash/ratelimit";

  const limiter = createRateLimiter({
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "api"
  });

  export async function POST(request: Request) {
    await secure(["GOOGLEBOT", "BINGBOT"], request);
    const result = await limiter.limit(`api:${ip}`);
    if (!result.success) {
      return new Response("Too many requests", { status: 429 });
    }
    return processRequest(request);
  }
  ```

- _Bot Categories:_
  - **Individual**: `GOOGLEBOT`, `BINGBOT`, `FACEBOOKBOT`, `TWITTERBOT`,
    `LINKEDINBOT`
  - **Categories**: `CRAWLER`, `PREVIEW`, `MONITOR`, `AI`, `SEO`, `ARCHIVE`

- _Documentation:_ **[Security Package](../../apps/docs/packages/security.mdx)**
