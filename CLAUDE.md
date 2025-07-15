# CLAUDE.md

Guidance for Claude Code (claude.ai/code) - optimized for autonomous operation.

## 🎯 Primary Goal

Enable fully autonomous operation with explicit rules, self-correction, and
minimal user intervention.

## 🚨 Critical Rules - Always Apply

### NEVER Do:

- Run `pnpm dev` or `npm dev` (user only)
- Use localStorage/sessionStorage in artifacts
- Create bulk fix scripts
- Use file extensions in imports
- Use `@/` imports in package source code (`/packages/*/src/**`)
- Build packages (consumed from source)
- Create files unless absolutely necessary
- Use leading underscores in variables (except Prisma `_count`)
- Throw errors in package env validation
- Use non-Next.js imports in Next.js apps
- Change existing `parameters` in AI SDK v5 tools - DO NOT CHANGE existing code
- Use "enhanced" in function names or filenames

### ALWAYS Do:

- Use Grep tool instead of `grep` command
- Use Context7 MCP for latest library documentation
- For web search: Context7 MCP > Perplexity MCP > Official WebSearch (in
  priority order)
- Use `/next` imports in Next.js, `/edge` in edge runtime
- Use Mantine UI as primary UI solution
- Prefer server actions over API routes
- Use `"catalog:"` versions when available
- Add `"type": "module"` to packages (NOT apps)
- Run `pnpm typecheck` and `pnpm lint` before commits
- Use TodoWrite for multi-step tasks
- Test with `@repo/qa` centralized mocks

## ⚡ Quick Reference Tables

### Port Assignments

| App                | Port | Purpose           |
| ------------------ | ---- | ----------------- |
| `/apps/webapp`     | 3200 | Main webapp       |
| `/apps/ai-chatbot` | 3300 | AI Chat interface |
| `/apps/backstage`  | 3400 | Admin backstage   |
| `/apps/email`      | 3500 | Email preview     |
| `/apps/studio`     | 3600 | Prisma Studio     |
| `/apps/storybook`  | 3700 | Component docs    |
| `/apps/docs`       | 3800 | Mintlify docs     |

### Import Decision Matrix

| Context                   | Import Pattern        | Example                  |
| ------------------------- | --------------------- | ------------------------ |
| Next.js Client Component  | `/client/next`        | `@repo/auth/client/next` |
| Next.js Server Component  | `/server/next`        | `@repo/auth/server/next` |
| Edge Runtime (middleware) | `/server/edge`        | `@repo/auth/server/edge` |
| Node.js Workers           | `/server`             | `@repo/auth/server`      |
| Package Source Code       | Relative imports only | `../utils` not `@/utils` |
| Package Tests             | `@/` imports allowed  | `@/utils` ✓              |

### Environment Variable Patterns

| Context            | Pattern                            | Notes                        |
| ------------------ | ---------------------------------- | ---------------------------- |
| Next.js Apps       | `import { env } from "#/root/env"` | Direct access for webpack    |
| Packages           | Export both `env` and `safeEnv()`  | Dual pattern for flexibility |
| Client Components  | Use `env.NEXT_PUBLIC_*`            | Never `safeEnv()` in client  |
| Package Validation | Never throw, return fallbacks      | `return undefined as never`  |
| App Validation     | Always throw on error              | Type safety enforcement      |

---

## 📋 Essential Commands

```bash
# Setup (one-time)
pnpm install && pnpm doppler:pull:all

# Build & Test
pnpm build                            # Local build
pnpm test                             # Run tests
pnpm typecheck && pnpm lint           # Code quality
pnpm --filter @repo/database generate # After schema changes

# Database
pnpm migrate # Run migrations
pnpm studio  # Prisma Studio (port 3600)

# Debug
pnpm madge --circular # Check circular deps
```

**⚠️ NEVER run `pnpm dev` - user only**

## 🛠 Technology Stack

| Category            | Technology                           | Notes                                  |
| ------------------- | ------------------------------------ | -------------------------------------- |
| **Core**            | Next.js 15.4, React 19.1, TypeScript | App Router, typed routes               |
| **Package Manager** | pnpm v10.6.3+                        | Workspaces, catalog versions           |
| **Build**           | Turborepo, Node 22+                  | ESM only, `--experimental-strip-types` |
| **UI**              | Mantine v8 (primary), Tailwind v4    | Mantine hooks + Zod forms              |
| **Data**            | PostgreSQL, Prisma ORM               | Server actions > API routes            |
| **Auth**            | Better Auth                          | Organizations support                  |
| **Infrastructure**  | Vercel, Upstash, Sentry              | Redis, QStash, monitoring              |

## 📦 Module System

- **ESM only** - No CommonJS
- **Packages**: `"type": "module"` required
- **Apps**: NO `"type": "module"` (Next.js handles it)
- **Imports**: Always `@repo/*` namespace
- **Source consumption**: Packages aren't built (except `@repo/qa`)
- **No .cjs/.mjs**: Use .ts/.tsx only

## 🔐 Environment Configuration

### Quick Setup

- **Local**: `.env.local` files via `pnpm doppler:pull:all`
- **Production**: Doppler for secrets
- **Location**: `env.ts` at package/app root (never in `src/`)

### Environment Patterns

#### Next.js Apps

```typescript
// Direct access for webpack inlining
import { env } from "#/root/env";
const url = env.NEXT_PUBLIC_API_URL;

// Extend packages for DRY
export const env = createEnv({
  extends: [databaseEnv],
  server: {
    /* app-specific only */
  },
  client: {
    /* NEXT_PUBLIC_* */
  },
  onValidationError: (error) => {
    console.error("❌ Invalid env vars:", error);
    throw new Error("Invalid environment");
  }
});
```

#### Packages (Dual Export)

```typescript
// Export both patterns
export const env = createEnv({
  server: { API_KEY: z.string().optional() },
  onValidationError: (error) => {
    console.warn("Package env failed:", error);
    return undefined as never; // Never throw!
  }
});

export function safeEnv() {
  return (
    env || {
      API_KEY: process.env.API_KEY || ""
    }
  );
}
```

### Common Env Mistakes

| ❌ Wrong              | ✅ Right                           |
| --------------------- | ---------------------------------- |
| `process.env.VAR`     | `import { env } from "#/root/env"` |
| `safeEnv()` in client | `env.NEXT_PUBLIC_*`                |
| Throwing in packages  | Return fallbacks                   |
| Duplicating vars      | Use `extends: [pkgEnv]`            |

> 📚 See `/apps/docs/ai-hints/environment-configuration.mdx` for details

## 🚀 Development Workflows

### Documentation First

Always check Context7 MCP for latest library docs:

```bash
1. mcp__context7__resolve-library-id("library-name")
2. mcp__context7__get-library-docs("/org/lib", topic="feature")
3. Implement with latest APIs
```

### New Feature Workflow

1. **Search** existing code with Grep tool
2. **Docs** via Context7 MCP
3. **Schema** → `pnpm migrate` → `pnpm --filter @repo/database generate`
4. **Server Action** in `/app/actions/*.ts` with Zod
5. **UI** with Mantine components
6. **Test** with `@repo/qa` mocks
7. **Verify** → `pnpm typecheck && pnpm lint`

### Debug Checklist

- `pnpm madge --circular` - Check deps
- `pnpm typecheck` - Type errors
- Check imports use `@repo/*`
- Verify env vars configured
- Packages shouldn't be built

## 🧪 Testing

### Quick Setup

```typescript
// vitest.config.ts - Use @repo/qa configs
import { createNextAppConfig } from "@repo/qa/vitest/configs";
export default createNextAppConfig({ setupFiles: ["./setup.ts"] });

// setup.ts - Import centralized mocks
import "@repo/qa/vitest/setup/next-app";
```

### Test Structure

- **Location**: `__tests__/` at root (NOT in `src/`)
- **Naming**: `*.test.{ts,tsx}` (Vitest), `*.spec.ts` (E2E)
- **Imports**: `@/` allowed in tests only
- **Assertions**: `.toBe()` for primitives, `.toStrictEqual()` for objects
- **IDs**: Always use `data-testid`

### Coverage

- **Default**: 50% threshold
- **Complex packages**: 30-40% allowed
- **Check**: `pnpm test --coverage`
- **Report**: `node packages/qa/scripts/coverage.mjs`

### Centralized Mocks (@repo/qa)

| Service                             | Mock Available |
| ----------------------------------- | -------------- |
| Upstash (Redis, QStash, Rate Limit) | ✅             |
| Stripe, Better Auth                 | ✅             |
| AI SDK, Vercel Analytics            | ✅             |
| React, Next.js, Prisma              | ✅             |

```typescript
// Auto-imported, no vi.mock() needed
import { createRatelimitScenarios } from "@repo/qa";
const rateLimit = createRatelimitScenarios();
rateLimit.exceeded.mockLimit();
```

## 📝 Git & Package Architecture

### Git Workflow

- Branch from `master`
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
  `chore`
- Pre-commit: `pnpm typecheck && pnpm lint`
- Never commit secrets
- No attribution in commit messages

### Package Layers (Dependency Order)

1. **Foundation**: configs (typescript, eslint, next)
2. **Core**: qa, security, observability
3. **Data**: database
4. **Services**: analytics, email, notifications
5. **Logic**: auth, payments, orchestration, seo, i18n
6. **Specialized**: ai, scraping, storage
7. **UI**: design-system
8. **Apps**: End-user applications

### Export Patterns

```json
{
  "exports": {
    "./client": "./src/client.ts", // Browser
    "./server": "./src/server.ts", // Node.js
    "./client/next": "./src/client-next.ts", // Next.js client
    "./server/next": "./src/server-next.ts", // Next.js server
    "./server/edge": "./src/server-edge.ts" // Edge runtime
  }
}
```

**Edge-enabled packages**: analytics, auth, notifications, observability

## 💻 Code Patterns

### Forms (Always Mantine + Zod)

```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

const form = useForm({
  validate: zodResolver(schema),
  initialValues: { email: "", name: "" }
});
```

### AI SDK v5 Tools (Always use `inputSchema`)

```typescript
import { tool } from "ai";
import { z } from "zod";

export const myTool = tool({
  description: "Tool description",
  inputSchema: z.object({
    query: z.string().describe("Query parameter"),
    limit: z.number().optional().default(10)
  }),
  execute: async ({ query, limit }) => {
    // Implementation
  }
});
```

**Critical**: AI SDK v5 uses `inputSchema` (NOT `parameters`). Never use
`parameters` - it will break type inference and runtime execution.

### Server Actions (Not API Routes)

```typescript
// app/actions/feature.ts
"use server";
export async function action(data: FormData) {
  const validated = schema.parse(Object.fromEntries(data));
  // logic
}
```

### UI Priority

1. **Mantine UI v8** - Primary (`import { Button } from '@mantine/core'`)
2. **Tailwind v4** - Secondary (complement Mantine)
3. **Design System** - Custom composites only

### State Hierarchy

1. **Mantine hooks** (useForm, useDisclosure)
2. **Server state** (actions + cache)
3. **Component state** (useState)
4. **Global** (Zustand - rare)

### Config Standards

- **Dependencies**: `"catalog:"` versions
- **TypeScript**: Extend `@repo/typescript-config/*`
- **ESLint**: Extend `@repo/eslint-config/*`
- **Vitest**: Use `@repo/qa/vitest/configs`

## 🔧 Troubleshooting

### Quick Anti-Pattern Reference

| Category         | ❌ Wrong               | ✅ Right                           |
| ---------------- | ---------------------- | ---------------------------------- |
| **Environment**  |
|                  | `process.env.VAR`      | `import { env } from "#/root/env"` |
|                  | `safeEnv()` in client  | `env.NEXT_PUBLIC_*` direct         |
|                  | Throw in packages      | Return fallbacks                   |
|                  | Duplicate vars         | `extends: [packageEnv]`            |
| **Imports**      |
|                  | `@repo/pkg/src/file`   | `@repo/pkg`                        |
|                  | `/client` in Next.js   | `/client/next`                     |
|                  | `/server/next` in edge | `/server/edge`                     |
|                  | `@/` in package source | Relative imports                   |
| **Patterns**     |
|                  | `react-hook-form`      | `@mantine/form`                    |
|                  | `/api/route.ts`        | `/actions/*.ts`                    |
|                  | `useEffect` + fetch    | Server components                  |
|                  | Redux everything       | Server state first                 |
| **Testing**      |
|                  | `.toEqual()` objects   | `.toStrictEqual()`                 |
|                  | Custom mocks           | `@repo/qa` mocks                   |
|                  | `data-cy`              | `data-testid`                      |
| **Edge Runtime** |
|                  | Node.js APIs           | Web APIs only                      |
|                  | `fs`, `crypto`         | Edge alternatives                  |

### Common Fixes

1. **Module not found** → Add `"type": "module"`
2. **Type errors** → `pnpm typecheck` + regenerate Prisma
3. **Auth issues** → Check env vars
4. **Build fails** → `pnpm madge --circular`
5. **Form issues** → Use Mantine `useForm`

## 📚 Documentation & Resources

### Key Package Reference

| Package               | Purpose        | Edge? | Import                             |
| --------------------- | -------------- | ----- | ---------------------------------- |
| `@repo/auth`          | Better Auth    | ✅    | `/server/next`                     |
| `@repo/database`      | Prisma ORM     | ❌    | `import { db }`                    |
| `@repo/analytics`     | PostHog/GA     | ✅    | Feature flags included             |
| `@repo/observability` | Multi-provider | ✅    | Sentry/BetterStack/LogTape/Console |
| `@repo/notifications` | Mantine        | ✅    | `/mantine-notifications`           |

### Documentation Locations

- **Source of Truth**: `/apps/docs/` (Mintlify)
- **AI Hints**: `/apps/docs/ai-hints/`
- **Architecture**: `/apps/docs/architecture/`
- **Package Docs**: `/apps/docs/packages/`

---

## 🎯 Final Reminders

- Do only what's asked, nothing more
- Prefer editing over creating files
- Never create docs unless explicitly requested
- Always use `/next` imports in Next.js, `/edge` in middleware
- Check Context7 MCP for latest library documentation
- Use TodoWrite for multi-step tasks
