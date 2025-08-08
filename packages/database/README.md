# @repo/database

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./server`, `./client`, `./migrations`
  - **Utilities**: `./types`, `./seed`, `./utils`

- _AI Hints:_

  ```typescript
  // Primary: Prisma ORM + generated types - always regenerate after schema changes
  import { db } from "@repo/database";
  // After schema changes: pnpm migrate && pnpm --filter @repo/database generate
  // ❌ NEVER: Use database in client components or edge runtime
  ```

- _Key Features:_
  - **Multi-Provider**: Prisma ORM (PostgreSQL), Redis, Firestore, Vector
    database
  - **Four-File Export Pattern**: client, server, client/next, server/next
  - **Better Auth Integration**: Complete user management, organizations, API
    keys
  - **Type Safety**: Full TypeScript + Zod schema validation from Prisma models
  - **Workflow Orchestration**: Workflow config, execution tracking, scheduling

- _Environment Variables:_

  ```bash
  DATABASE_URL=postgresql://username:password@host:port/database
  UPSTASH_REDIS_REST_URL=https://...
  UPSTASH_REDIS_REST_TOKEN=...
  UPSTASH_VECTOR_REST_URL=https://...
  UPSTASH_VECTOR_REST_TOKEN=...
  ```

- _Essential Commands:_

  ```bash
  pnpm migrate                          # Run migrations
  pnpm --filter @repo/database generate # Generate Prisma client
  pnpm studio                           # Open Prisma Studio (port 3600)
  pnpm --filter @repo/database seed     # Seed with sample data
  ```

- _Documentation:_
  **[Database Package](../../apps/docs/packages/database/overview.mdx)**
