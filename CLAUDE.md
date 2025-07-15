# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Primary Goal

**Enable fully autonomous operation with minimal user intervention.** Claude
Code should:

- Make correct technical decisions based on explicit rules (e.g., always use
  `/next` imports in Next.js)
- Avoid common mistakes through clear patterns and anti-patterns
- Use only permission-free commands and proper formatting
- Follow strict preferences (Mantine UI, server actions, Zod validation)
- Self-correct using provided troubleshooting guides

## Table of Contents

### Quick Start

- [Essential Commands](#essential-commands)
- [Port Assignments](#port-assignments)
- [Important Restrictions](#important-restrictions)

### Project Overview

- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Module System](#module-system)

### Development

- [Development Workflow](#development-workflow)
- [Sequential Task Ordering](#sequential-task-ordering)
- [Testing](#testing)
- [Git Workflow](#git-workflow)

### Package Architecture

- [Package Layers](#package-layers)
- [Environment-Specific Export Pattern](#environment-specific-export-pattern)

### Guidelines

- [Code Style](#code-style)
- [Configuration Standards](#configuration-standards)
- [UI Framework Guidelines](#ui-framework-guidelines)
- [State Management](#state-management)
- [Internationalization](#internationalization)
- [Vercel Toolbar & Feature Flags](#vercel-toolbar--feature-flags)

### Reference

- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## Essential Commands

```bash
# Setup
pnpm install          # Install dependencies
pnpm setup            # Full project setup (install + build)
pnpm doppler:pull:all # Download secrets to .env.local files

# Development (NEVER run these directly - user only)
pnpm dev              # Run all apps
pnpm dev --filter=app # Run specific app

# Building
pnpm build              # Local build with .env.local
pnpm build:doppler      # Production build with Doppler
pnpm build --filter=app # Build specific app

# Testing
pnpm test              # Run all tests
pnpm test --filter=app # Test specific app
pnpm test -- --watch   # Watch mode

# Code Quality
pnpm typecheck        # TypeScript checking
pnpm lint             # ESLint and Prettier
pnpm madge --circular # Check circular dependencies

# Database
pnpm migrate                          # Run Prisma migrations
pnpm studio                           # Open Prisma Studio (port 3600)
pnpm --filter @repo/database generate # Regenerate Prisma client

# Maintenance
pnpm clean     # Clean build artifacts
pnpm bump-deps # Update dependencies
```

## Port Assignments

| Application       | Port | Description    |
| ----------------- | ---- | -------------- |
| `/apps/email`     | 3500 | Email preview  |
| `/apps/studio`    | 3600 | Prisma Studio  |
| `/apps/storybook` | 3700 | Component docs |
| `/apps/docs`      | 3800 | Mintlify docs  |

## Important Restrictions

- **NEVER run `pnpm dev` or `npm dev` commands** - These should only be run by
  the user
- **PREFER Grep tool over grep command** - When searching for patterns in files,
  use the Grep tool instead of bash `grep`. The Grep tool doesn't require
  permission for each search
- **Use the Grep tool for searching** - Don't use `rg` command directly (use
  Claude Code's Grep tool which uses rg internally)
- **NEVER use localStorage/sessionStorage in artifacts** - Use React state or
  JavaScript variables
- **NO file extensions in imports** - ESLint handles resolution automatically
- **NO BULK FILE FIX SCRIPTS** - NEVER create or use bash scripts, shell
  scripts, or scripts in any language to bulk fix multiple files. Always fix
  files one by one using the Edit or MultiEdit tools
- **VARIABLE NAMING** - Variables and parameters should NOT have leading
  underscores. Use standard camelCase naming (e.g., `count` not `_count`).
  Exception: Prisma's aggregation fields like `_count` which are part of the
  schema
- **COMMAND PERMISSIONS** - Only use commands that don't require special
  permissions. Avoid commands like `find` that may need elevated access on
  macOS. The environment is macOS with zsh - use standard, permission-free
  commands
- **COMMAND FORMATTING** - Run commands directly, not through shell processes.
  Use `pnpm install` directly, NOT `bash -c "pnpm install"` or similar
  subprocess wrappers

## Technology Stack

- **Framework**: Next.js 15.4.0 (canary) with React 19.1.0
- **Package Manager**: pnpm v10.6.3+ with workspaces
- **Language**: TypeScript with strict checking
- **Build System**: Turborepo for parallel builds
- **Node Version**: 22+ (ESM modules only, native TypeScript support via
  --experimental-strip-types)
- **UI Framework**: Mantine UI v8 (primary), Tailwind CSS v4 (secondary)
- **Forms**: Mantine form hooks with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with organizations
- **API Design**: Server actions over API endpoints
- **Routing**: Next.js App Router with typed routes
- **File Storage**: Local disk or S3-compatible
- **Email**: React Email + Resend
- **Analytics**: PostHog, Segment, Google Analytics
- **Error Tracking**: Sentry
- **Rate Limiting**: Upstash Redis
- **Job Queue**: QStash

## Architecture Overview

This monorepo follows a layered architecture with clear separation of concerns:

1. **Apps Layer** (`/apps/*`) - User-facing applications
   - Documentation, email preview, and development tools
2. **Packages Layer** (`/packages/*`) - Shared functionality in 7 layers
3. **Infrastructure** (`/infra/*`) - Infrastructure as code
4. **Scripts** (`/scripts/*`) - Build and utility scripts

> See `/apps/docs/` for detailed architecture documentation.

## Module System

- **ESM modules only** - No CommonJS support, any CommonJS usage needs upgrading
- **Packages** (`/packages/*`) MUST have `"type": "module"`
- **Apps** (`/apps/*`) should NOT have `"type": "module"` (Next.js handles ESM)
- Packages are consumed directly from source (no build step)
- **Exception**: `@repo/qa` is a built package consumed from `dist/` exports
- All imports use `@repo/*` namespace
- **Node.js 22+ TypeScript Support**: Use `--experimental-strip-types` flag for
  native TS execution
- **No .cjs/.mjs files** - Use standard .ts/.tsx with ESM syntax

---

## Environment Setup

### Doppler Integration

- **Local Development**: Uses `.env.local` files
- **CI/CD & Production**: Uses Doppler for secrets
- **Setup**: Run `pnpm doppler:pull:all` to sync secrets locally

### Environment Files

- **Location**: `env.ts` MUST be in package/app root, NEVER in `src/`
- **Validation**: Use `@t3-oss/env-nextjs` without explicit ReturnType
- **Structure**: Each app has its own validated environment config

### Standardized Environment Pattern (REQUIRED)

**All packages and apps MUST use the standardized `env.ts` pattern.** Legacy
`keys.ts` files have been deprecated.

> **See Also**:
> [Architecture Documentation](/apps/docs/architecture/environment-configuration.mdx)
> and [AI Hints](/apps/docs/ai-hints/environment-configuration.mdx) for
> comprehensive guidance.

#### Core Principles:

- **Single Pattern**: Use only `env.ts` with SafeEnv pattern
- **Always `@t3-oss/env-nextjs`**: Use NextJS variant for consistency, even in
  packages
- **Deprecate `keys.ts`**: Legacy `keys()` function exports are deprecated
- **White Screen Prevention**: Graceful fallbacks prevent app crashes
- **Security Separation**: `safeEnv()` for server-only, `safeClientEnv()` for
  client-only

#### Usage in Code (Context-Specific):

**In Next.js Apps - Direct Access (for webpack inline replacement):**

```typescript
// ✅ CORRECT - Direct access in Next.js for webpack inlining
import { env } from "#/root/env";
const apiUrl = env.NEXT_PUBLIC_API_URL; // Webpack inlines this at build time

// ✅ CORRECT - Server components can access server vars
import { env } from "#/root/env";
const dbUrl = env.DATABASE_URL;
```

**In Packages - Dual Export Pattern:**

```typescript
// Packages export both patterns for flexibility
import { env, safeEnv } from "@repo/package/env";

// In Next.js contexts - use direct access
const value = env.API_KEY; // ✅ Gets inlined by webpack

// In Node.js/workers/tests - use safeEnv()
const envVars = safeEnv();
const value = envVars.API_KEY; // ✅ Works without webpack
```

**Common Mistakes:**

```typescript
// ❌ WRONG - Direct process.env in client components
"use client";
const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

// ❌ WRONG - Using safeEnv() in Next.js client components
("use client");
import { safeEnv } from "#/root/env";
const env = safeEnv(); // This pattern breaks webpack inlining!

// ❌ WRONG - Accessing server vars in client components
("use client");
import { env } from "#/root/env";
const secret = env.API_SECRET; // Runtime error!
```

#### Required `env.ts` Structures:

**For Next.js Apps (Direct Export Only):**

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

// Direct export for webpack inline replacement
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    API_SECRET: z.string().min(1)
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_APP_NAME: z.string().optional()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_SECRET: process.env.API_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
  },
  onValidationError: (error) => {
    console.error("❌ Invalid environment variables:", error);
    // Prevent white screens in production
    if (process.env.NODE_ENV === "production") {
      console.error("Using fallback values");
    } else {
      throw new Error("Invalid environment variables");
    }
  }
});

// Type export for better DX
export type Env = typeof env;
```

**For Packages (Dual Export Pattern):**

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

// Create validated env object
export const env = createEnv({
  server: {
    API_KEY: z.string().min(1),
    SERVICE_URL: z.string().url().optional()
  },
  client: {}, // Most packages don't have client vars
  runtimeEnv: {
    API_KEY: process.env.API_KEY,
    SERVICE_URL: process.env.SERVICE_URL
  },
  onValidationError: (error) => {
    console.warn("Package environment validation failed:", error);
    // Don't throw in packages - use fallbacks
  }
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    API_KEY: process.env.API_KEY || "",
    SERVICE_URL: process.env.SERVICE_URL || "http://localhost:3000"
  };
}

// Export type
export type Env = typeof env;
```

**For Non-Next.js Apps (using @t3-oss/env-core):**

```typescript
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.string().default("3000"),
    API_KEY: z.string().min(1)
  },
  runtimeEnv: process.env
});

// Simple helper for consistency
export const safeEnv = () => env;
```

**Pattern Benefits:**

- **Webpack Harmony**: Direct `env.VARIABLE` access gets properly inlined by
  Next.js
- **Universal Packages**: Dual export works in both Next.js and Node.js contexts
- **Type Safety**: Full TypeScript support with autocomplete
- **No White Screens**: Graceful fallbacks prevent crashes
- **Security**: @t3-oss/env-nextjs enforces client/server separation
- **DRY/KISS**: Single env.ts file with context-appropriate exports

## Development Workflow

### Task Management

Use TodoWrite and TodoRead tools for multi-step tasks:

1. Create todo list at start
2. Update status as you progress (pending → in_progress → completed)
3. Ensures all steps are completed

### CLI Usage

- **ESLint**: `eslint . --fix` (the `.` is required)
- **TypeScript**: `tsc --noEmit --emitDeclarationOnly false`
- **Prettier**: Run at repo root with `pnpm prettier`

## Sequential Task Ordering

### Creating a New Feature

1. **Check existing** - Search for similar functionality/components
2. **Data layer** - Update schema → `pnpm migrate` →
   `pnpm --filter @repo/database generate`
3. **Server action** - Create `/app/actions/feature.ts` with Zod validation
4. **UI component** - Use Mantine components, connect to server action
5. **Tests** - Unit tests, component tests with data-testid
6. **Verify** - `pnpm typecheck` → `pnpm lint` → `pnpm test` → commit

### Debugging Build Issues

- Check circular dependencies: `pnpm madge --circular`
- Verify TypeScript: `pnpm typecheck`
- Check package.json exports and import paths
- Ensure packages aren't being built
- Verify all imports use `@repo/`

## Testing

### Test Structure

- **Framework**: Vitest for unit/integration tests, Playwright for E2E tests
- **Test Location**:
  - **Preferred**: `__tests__/` directory at package/app root (NOT inside
    `src/`)
  - **Allowed**: Colocated tests next to components (e.g., `HelloWorld.test.tsx`
    next to `HelloWorld.tsx`)
  - **E2E Tests**: `__tests__/e2e/` directory for Playwright tests
- **File Naming**:
  - Unit/Integration: `*.test.{ts,tsx}` (Vitest)
  - E2E: `*.spec.ts` (Playwright)
- **Absolute Imports**: Tests support `@/` alias for absolute imports
- **Concurrency**: Tests run in parallel with concurrency=10
- **Data-TestID**: All components include standardized `data-testid` props
- **Centralized Mocks**: Use `@repo/qa` package for all mocking needs
- **Assertion Standards**: Use `.toStrictEqual()` for objects/arrays, `.toBe()`
  for primitives

```typescript
// Component implementation
interface ComponentProps {
  'data-testid'?: string;
}

const Component = ({ 'data-testid': testId = 'component-name' }) => {
  return <element data-testid={testId} />
}

// Test usage (preferred)
const button = screen.getByTestId('add-to-cart-button');

// Assertion examples
expect(user.name).toBe('John');                    // ✅ Primitive values
expect(users).toStrictEqual([user1, user2]);       // ✅ Objects/arrays
expect(result).toHaveProperty('id');                // ✅ Property checks
```

### Test Directory Structure

```
package-or-app/
├── __tests__/              # Tests at root, NOT in src/
│   ├── setup.ts           # Test setup
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/              # E2E tests (*.spec.ts)
├── src/
│   └── components/
│       ├── HelloWorld.tsx
│       └── HelloWorld.test.tsx  # Colocated test (optional)
├── vitest.config.ts       # Vitest config
└── playwright.config.ts   # Playwright config (if E2E tests exist)
```

### Testing with @repo/qa

**Important**: `@repo/qa` is a built package that must be compiled before use.
It provides centralized test utilities, mocks, and Vitest configurations.

All apps should use centralized mocks from `@repo/qa`:

```typescript
// vitest.config.ts
import { createNextAppConfig } from "@repo/qa/vitest/configs";

export default createNextAppConfig({
  setupFiles: ["./setup.ts"]
});

// setup.ts - Import centralized mocks
import "@repo/qa/vitest/setup/next-app";

// test-utils.ts - Re-export centralized utilities
export * from "@repo/qa/vitest/utils/render";
```

## Git Workflow

- Create feature branches from `master`
- Use conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
  `chore`
- Run `pnpm lint` and `pnpm typecheck` before committing
- Never commit sensitive data

## Package Layers

Packages follow strict layering to prevent circular dependencies. Each layer can
only depend on lower layers:

### Layer 1: Foundation

- `@repo/typescript-config`, `@repo/eslint-config`, `@repo/next-config`

### Layer 2: Core Services

- `@repo/qa` - Test utilities, mocks, and Vitest configurations
- `@repo/security` - Headers, rate limiting (Upstash)
- `@repo/observability` - Sentry tracking

### Layer 3: Data

- `@repo/database` - Prisma ORM

### Layer 4: Business Services

- `@repo/analytics` - PostHog, Segment, GA + feature flags
- `@repo/email` - React Email templates
- `@repo/notifications` - Knock + Mantine

### Layer 5: Business Logic

- `@repo/auth` - Better Auth with organizations
- `@repo/payments` - Stripe
- `@repo/orchestration` - Workflow engine
- `@repo/seo`, `@repo/internationalization`

### Layer 5.5: Specialized

- `@repo/ai`, `@repo/scraping`, `@repo/storage`

### Layer 6: UI

- `@repo/design-system` - Composite components

### Layer 7: Applications

- End-user applications

## Environment-Specific Export Pattern

Packages provide runtime-specific exports. **In Next.js, ALWAYS use `/next`
variants. For edge runtime, use `/edge` variants when available:**

```json
{
  "exports": {
    "./client": "./src/client.ts", // Browser (non-Next.js)
    "./server": "./src/server.ts", // Node.js (non-Next.js)
    "./client/next": "./src/client-next.ts", // Next.js client
    "./server/next": "./src/server-next.ts", // Next.js server
    "./server/edge": "./src/server-edge.ts" // Next.js edge runtime (optional)
  }
}
```

### Import Rules by Environment

1. **Next.js App Router (Server Components, API Routes)**

   ```typescript
   import { useAuth } from "@repo/auth/client/next";
   import { createAuth } from "@repo/auth/server/next";
   ```

2. **Next.js Edge Runtime (Middleware, Edge Functions)**

   ```typescript
   import { createAuth } from "@repo/auth/server/edge";
   ```

   **Note**: Edge exports are optional. Not all packages support edge runtime.
   **Limitations**: No Node.js APIs (fs, crypto, etc.), no native modules,
   HTTP-based implementations only

3. **Node.js Workers**

   ```typescript
   import { createAuth } from "@repo/auth/server";
   ```

4. **Environment-Agnostic Packages** For packages that run in both environments
   (database, storage, analytics), use `shared-env`:
   ```typescript
   import { createServerObservability } from "@repo/observability/shared-env";
   import { createAnalytics } from "@repo/analytics/shared-env";
   ```
   **Important**: The `shared-env` export uses runtime detection to load ONLY
   the appropriate implementation.

### Common Import Mistakes

```typescript
// ❌ WRONG - Using non-Next.js import in Next.js
import { createAuth } from "@repo/auth/client";

// ❌ WRONG - Using server/next in edge runtime
import { createObservability } from "@repo/observability/server/next"; // In middleware.ts

// ✅ CORRECT - Next.js server components
import { auth } from "@repo/auth/server/next";

// ✅ CORRECT - Edge runtime (middleware)
import { auth } from "@repo/auth/server/edge";
```

**Packages currently supporting edge runtime**: `@repo/analytics`, `@repo/auth`,
`@repo/notifications`, `@repo/observability`

### Standard Import Patterns

**IMPORTANT: Different import rules for packages vs apps:**

**In Package Source Code** (`/packages/*/src/**`):

```typescript
// ✅ CORRECT - Use relative imports in package source
import { utils } from '../utils';
import { Component } from './Component';

// ✅ CORRECT - Workspace packages
import { ... } from '@repo/other-package';

// ✅ CORRECT - External packages
import { ... } from 'external-package';

// ❌ WRONG - No absolute imports in package source
import { utils } from '@/utils'; // Don't use in src/
```

**In Package Tests** (`/packages/*/__tests__/**`):

```typescript
// ✅ CORRECT - Use absolute imports in tests
import { utils } from '@/utils';
import { Component } from '@/components/Component';

// ✅ CORRECT - Workspace packages
import { ... } from '@repo/other-package';
```

**In App Code** (`/apps/**`):

```typescript
// ✅ CORRECT - Use absolute imports freely
import { ... } from '@/components/...';
import { ... } from '@/lib/...';

// ✅ CORRECT - Workspace packages
import { ... } from '@repo/package-name';

// ✅ CORRECT - External packages
import { ... } from 'external-package';
```

**Reason**: Packages are consumed from source, so absolute imports in package
source would break when imported by apps. Tests need absolute imports for
cleaner test organization.

### Catalog Versions

Always use `"catalog:"` versions in package.json when available:

```json
{
  "dependencies": {
    "react": "catalog:",
    "custom-package": "^1.2.3" // Use specific version if not in catalog
  }
}
```

## Code Style

### TypeScript

- Always use TypeScript (.ts/.tsx)
- Define proper types (avoid `any`)
- Use `_` prefix for unused variables (e.g., `_error` in catch blocks when not
  using the error)
- Remove `_` prefix when actually using the variable (e.g., `error` not `_error`
  when throwing)
- Ensure type accuracy with dependency types
- Run `pnpm typecheck` before committing

### React/Next.js

- React 19.1.0 and Next.js 15.4.0 features
- Server components by default
- Use typed routes with `typedRoutes: true`
- Optimize images with Next.js `Image`
- Server actions for forms and mutations
- Use typed forms with Mantine + Zod
- Prefer server actions over API routes

### Component Structure

- One component per file
- Co-locate related files (styles, tests, types)
- **Use Mantine UI components and hooks** (see UI Framework Guidelines)
- Design-system for custom/composite components only

## Configuration Standards

**Package Dependencies**: Use `"catalog:"` versions when available

**TypeScript**: Extend
`@repo/typescript-config/[base|nextjs|react-library].json`

**ESLint**: Extend
`@repo/eslint-config/[base|next|react-internal|react-library]`

**Next.js**: Import and use `@repo/next-config`

**Vitest**: Use config builders from `@repo/qa/vitest/configs`:

- Next.js apps: `createNextAppConfig()`
- React packages: `createReactPackageConfig()`
- Node packages: `createNodePackageConfig()`
- Database packages: `createDatabasePackageConfig()`

Example vitest.config.ts:

```typescript
import { createNextAppConfig } from "@repo/qa/vitest/configs";

export default createNextAppConfig({
  setupFiles: ["./setup.ts"]
});
```

## UI Framework Guidelines

### Mantine UI v8 (Primary)

Always use Mantine as primary UI solution:

- Import directly: `import { Button } from '@mantine/core'`
- Use Mantine hooks exclusively (`useForm`, `useDisclosure`, etc.)
- Prefer Mantine style props over Tailwind classes
- Dark mode via `useMantineColorScheme` or `dark` prop
- Responsive props: `{ base: value, sm: value, md: value }`
- Notifications: `@repo/notifications/mantine-notifications`

### Tailwind CSS v4 (Secondary)

- Valid for specific use cases or existing code
- Can complement Mantine when needed
- v4 only (not v3)

## State Management

### Forms & Validation

Always use Mantine forms with Zod:

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

### Server Actions (Preferred over API Routes)

```typescript
// app/actions/update-user.ts
"use server";
export async function updateUser(data: FormData) {
  const validated = schema.parse(Object.fromEntries(data));
  // Update logic
}
```

### State Hierarchy

1. **Mantine hooks**: `useForm`, `useDisclosure`, `useToggle`
2. **Server state**: Server actions + React cache
3. **Component state**: `useState`, `useReducer`
4. **Global state** (rare): Zustand or Context

## Internationalization

Use `@repo/internationalization` package with concise property names (e.g., `l`
for languages). Standard locale codes: `en`, `fr`, `es`, `pt`, `de`. See package
docs for implementation details.

---

## Vercel Toolbar & Feature Flags

Available in development mode for apps with PostHog integration. Toggle feature
flags in real-time via toolbar.

## Troubleshooting

### Common AI Agent Mistakes (Expanded Anti-Pattern Catalog)

**Environment Variable Errors**

- ❌ `process.env.NEXT_PUBLIC_NODE_ENV` in Next.js → ✅
  `import { env } from "#/root/env"; env.NEXT_PUBLIC_NODE_ENV`
- ❌ Using `safeEnv()` in Next.js client components → ✅ Use direct
  `env.VARIABLE` for webpack inlining
- ❌ Using `safeClientEnv()` in Next.js → ✅ Use direct `env.NEXT_PUBLIC_*`
  (library handles separation)
- ❌ Not exporting `env` directly from packages → ✅ Export both `env` and
  `safeEnv()` for flexibility
- ❌ Using `@t3-oss/env-nextjs` in non-Next.js apps → ✅ Use `@t3-oss/env-core`
  instead
- ❌ Importing from `@repo/package/keys` → ✅ Import from `@repo/package/env`
- ❌ Creating new `keys.ts` files → ✅ Use only `env.ts` with dual export
  pattern
- ❌ No fallback for missing env vars → ✅ Graceful fallbacks in `safeEnv()`
  function
- ❌ Environment crashes causing white screens → ✅ Error handling in
  `onValidationError`
- ❌ Mixing server and client env vars → ✅ @t3-oss/env-nextjs enforces
  separation automatically

**Import & Export Errors**

- ❌ `import from '@repo/package/src/file'` → ✅ `import from '@repo/package'`
- ❌ `import from './file.js'` → ✅ `import from './file'`
- ❌ Using `/client` in Next.js → ✅ Always use `/client/next` in Next.js apps
- ❌ Using `/server/next` in edge runtime → ✅ Always use `/server/edge` in
  middleware/edge functions
- ❌ `import { Button } from '@repo/design-system'` → ✅
  `import { Button } from '@mantine/core'`
- ❌ Deep imports like `@repo/auth/src/lib/utils` → ✅ Export from package root
- ❌ **CRITICAL**: `@/` absolute imports in package source code → ✅ Use
  relative imports in `/packages/*/src/**`
- ❌ **CRITICAL**: This breaks consumption by other apps/packages → ✅ Only use
  `@/` in package tests (`__tests__/`)

**Edge Runtime Errors**

- ❌ `@opentelemetry/api` in middleware → ✅ Use `/server/edge` exports
  (HTTP-based observability)
- ❌ Node.js APIs in edge runtime → ✅ Use Web APIs (fetch, crypto.randomUUID,
  etc.)
- ❌ Native modules in edge runtime → ✅ Use edge-compatible implementations
- ❌ `fs`, `path`, `crypto` in middleware → ✅ Use edge-compatible alternatives
- ❌ Heavy libraries in edge → ✅ Lightweight, fetch-based implementations

**Configuration Mistakes**

- ❌ `src/env.ts` → ✅ `env.ts` in package root
- ❌ Building packages → ✅ Packages are ESM source, never built
- ❌ Guessing versions → ✅ Use `"catalog:"` when available
- ❌ Missing `"type": "module"` in packages → ✅ Always add for packages
- ❌ Adding `"type": "module"` to apps → ✅ Next.js apps don't need it

**Development Patterns**

- ❌ `react-hook-form` → ✅ `@mantine/form` with Zod
- ❌ `/app/api/*/route.ts` → ✅ `/app/actions/*.ts` server actions
- ❌ `useEffect` + `fetch` → ✅ Server components or actions
- ❌ `localStorage` in artifacts → ✅ React state or variables
- ❌ Manual form validation → ✅ Zod schemas with Mantine forms
- ❌ `useState` for forms → ✅ `useForm` from Mantine

**File Organization**

- ❌ Creating `/lib` or `/utils` → ✅ Use existing packages or create new
  package
- ❌ Business logic in components → ✅ Server actions for data operations
- ❌ Shared code in app folders → ✅ Extract to packages
- ❌ `/pages` directory → ✅ `/app` directory (App Router)
- ❌ `getServerSideProps` → ✅ Server components or server actions

**Database & Schema**

- ❌ Raw SQL queries → ✅ Prisma ORM methods
- ❌ Manual type definitions → ✅ Generated Prisma types
- ❌ Forgetting to regenerate → ✅ Always run generate after schema changes
- ❌ Direct database calls in components → ✅ Server actions only
- ❌ Client-side database imports → ✅ Database only in server code

**Testing Patterns**

- ❌ `data-cy` or custom attributes → ✅ Always use `data-testid`
- ❌ Testing implementation details → ✅ Test user interactions
- ❌ Separate test files → ✅ Co-locate in `__tests__` directories
- ❌ `jest` imports → ✅ Use `vitest` imports
- ❌ Manual mocking → ✅ Use Vitest's auto-mocking features
- ❌ Using `.toEqual()` for object/array comparisons → ✅ Use `.toStrictEqual()`
  for strict equality
- ❌ Using `.toStrictEqual()` for primitives → ✅ Use `.toBe()` for primitive
  values and reference equality
- ❌ Custom mock implementations in apps → ✅ Use centralized mocks from
  `@repo/qa`

**State Management**

- ❌ Redux for everything → ✅ Server state + Mantine hooks first
- ❌ Global state by default → ✅ Component state, then server state
- ❌ Complex state machines → ✅ Server actions + optimistic updates
- ❌ Client-side caching → ✅ Next.js caching + server components
- ❌ Manual loading states → ✅ Suspense boundaries

**Authentication Patterns**

- ❌ Custom auth implementation → ✅ Use `@repo/auth` (Better Auth)
- ❌ JWT in localStorage → ✅ Secure httpOnly cookies via Better Auth
- ❌ Client-side auth checks → ✅ Server-side via `auth()` function
- ❌ Manual session handling → ✅ Better Auth handles it
- ❌ Forgetting auth checks → ✅ Always check in server actions

**UI/UX Patterns**

- ❌ Custom CSS files → ✅ Mantine style props first
- ❌ Tailwind for everything → ✅ Mantine components + minimal Tailwind
- ❌ Custom form components → ✅ Mantine form components
- ❌ Manual dark mode → ✅ `useMantineColorScheme`
- ❌ Custom notification system → ✅ `@repo/notifications`

**Performance Anti-Patterns**

- ❌ Client components by default → ✅ Server components by default
- ❌ Fetching in useEffect → ✅ Fetch in server components
- ❌ Large client bundles → ✅ Dynamic imports + server components
- ❌ Unoptimized images → ✅ Next.js Image component
- ❌ Runtime config → ✅ Build-time environment validation

### Common Issues & Solutions

1. **Module not found**: Ensure `"type": "module"` in packages
2. **Type errors**: Run `pnpm typecheck`, regenerate Prisma client
3. **Auth issues**: Verify environment variables
4. **Build failures**: Check circular dependencies with `pnpm madge --circular`
5. **Forms**: Always use Mantine's `useForm` hook with Zod

## AI-Optimized Guidance

For detailed guidance on common development tasks, see the AI-specific
documentation in `/apps/docs/ai-hints/`:

- **[Task Templates](/apps/docs/ai-hints/task-templates.mdx)** - Ready-to-use
  code templates
- **[Decision Trees](/apps/docs/ai-hints/decision-trees.mdx)** - Flowcharts for
  technical decisions
- **[Command Sequences](/apps/docs/ai-hints/command-sequences.mdx)** -
  Step-by-step workflows
- **[Success Markers](/apps/docs/ai-hints/success-markers.mdx)** - Task
  completion checklists
- **[Package Hints](/apps/docs/ai-hints/packages/)** - Package-specific guidance

### Quick Package Reference

| Package               | Purpose               | Edge Support | Key Import                 |
| --------------------- | --------------------- | ------------ | -------------------------- |
| `@repo/auth`          | Better Auth           | ✅           | `auth` from `/server/next` |
| `@repo/database`      | Prisma ORM            | ❌           | `import { db }`            |
| `@repo/analytics`     | PostHog/GA            | ✅           | Feature flags included     |
| `@repo/observability` | Sentry                | ✅           | Different for edge/server  |
| `@repo/notifications` | Mantine notifications | ✅           | `/mantine-notifications`   |

> **Rule**: Always use `/next` variants in Next.js apps, `/edge` in middleware

## Documentation

**IMPORTANT**: The source of truth for all documentation is located in
`/apps/docs/` (Mintlify). This is the authoritative documentation source for the
entire project. Always refer to and update documentation in this location.

# important-instruction-reminders

Do what has been asked; nothing more, nothing less. NEVER create files unless
they're absolutely necessary for achieving your goal. ALWAYS prefer editing an
existing file to creating a new one. NEVER proactively create documentation
files (\*.md) or README files. Only create documentation files if explicitly
requested by the User.
