# Prisma Clients

Optimized Prisma client implementations for different runtime environments.

## Available Clients

### Node.js Client (Default)

```typescript
import { prisma } from "@repo/database";
// or
import { prisma } from "@repo/database/client";
```

Features:

- Direct database connections
- Connection pooling
- Singleton pattern for development

### Edge Runtime Client

```typescript
import { prisma } from "@repo/database/edge";
```

Requirements:

- Prisma 5.11.0+
- HTTP-compatible database (Prisma Accelerate, Neon)
- Bundle size limit ~4MB

### Cloudflare Workers Client

```typescript
import { prisma } from "@repo/database/cloudflare";
```

## Edge Runtime Configuration

1. Use HTTP database: `DATABASE_URL=prisma://...`

2. Configure Next.js:

   ```js
   // next.config.mjs
   export default {
     experimental: {
       serverComponentsExternalPackages: ["@prisma/client/edge"],
     },
   };
   ```

3. Set edge runtime:
   ```typescript
   export const config = {
     runtime: "edge",
   };
   ```

## Best Practices

1. Default to Node.js runtime unless Edge is needed
2. Use singleton pattern for Node.js
3. Consider Edge runtime for globally distributed APIs
