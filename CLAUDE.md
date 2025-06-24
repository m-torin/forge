# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Primary Goal

**Enable fully autonomous operation with minimal user intervention.** Claude Code should:

- Make correct technical decisions based on explicit rules (e.g., always use `/next` imports in
  Next.js)
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
pnpm install                        # Install dependencies
pnpm doppler:pull:all              # Download secrets to .env.local files

# Development (NEVER run these directly - user only)
pnpm dev                           # Run all apps
pnpm dev --filter=app              # Run specific app

# Building
pnpm build                         # Production build with Doppler
pnpm build:local                   # Local build with .env.local
pnpm build --filter=app            # Build specific app

# Testing
pnpm test                          # Run all tests
pnpm test --filter=app             # Test specific app
pnpm test -- --watch               # Watch mode

# Code Quality
pnpm typecheck                     # TypeScript checking
pnpm lint                          # ESLint and Prettier
pnpm madge --circular              # Check circular dependencies

# Database
pnpm migrate                       # Run Prisma migrations
pnpm studio                        # Open Prisma Studio (port 3600)
pnpm --filter @repo/database generate  # Regenerate Prisma client

# Maintenance
pnpm clean                         # Clean build artifacts
pnpm bump-deps                     # Update dependencies
```

## Port Assignments

| Application                 | Port | Description                   |
| --------------------------- | ---- | ----------------------------- |
| `/apps/web`                 | 3200 | Marketing website             |
| `/apps/backstage`           | 3300 | Admin panel (main)            |
| `/apps/backstage-cms`       | 3301 | CMS microfrontend             |
| `/apps/backstage-authmgmt`  | 3302 | Auth management microfrontend |
| `/apps/backstage-workflows` | 3303 | Workflows microfrontend       |
| `/apps/workers`             | 3400 | Background jobs               |
| `/apps/email`               | 3500 | Email preview                 |
| `/apps/studio`              | 3600 | Prisma Studio                 |
| `/apps/storybook`           | 3700 | Component docs                |
| `/apps/docs`                | 3800 | Mintlify docs                 |

> **Note**: Backstage uses microfrontend architecture. See
> `/apps/docs/architecture/backstage-microfrontends.mdx` for details.

## Important Restrictions

- **NEVER run `pnpm dev` or `npm dev` commands** - These should only be run by the user
- **PREFER Grep tool over grep command** - When searching for patterns in files, use the Grep tool
  instead of bash `grep`. The Grep tool doesn't require permission for each search
- **Use the Grep tool for searching** - Don't use `rg` command directly (use Claude Code's Grep tool
  which uses rg internally)
- **NEVER use localStorage/sessionStorage in artifacts** - Use React state or JavaScript variables
- **NO file extensions in imports** - ESLint handles resolution automatically
- **NO BULK FILE FIX SCRIPTS** - NEVER create or use bash scripts, shell scripts, or scripts in any
  language to bulk fix multiple files. Always fix files one by one using the Edit or MultiEdit tools
- **VARIABLE NAMING** - Variables and parameters should NOT have leading underscores. Use standard
  camelCase naming (e.g., `count` not `_count`). Exception: Prisma's aggregation fields like
  `_count` which are part of the schema
- **COMMAND PERMISSIONS** - Only use commands that don't require special permissions. Avoid commands
  like `find` that may need elevated access on macOS. The environment is macOS with zsh - use
  standard, permission-free commands
- **COMMAND FORMATTING** - Run commands directly, not through shell processes. Use `pnpm install`
  directly, NOT `bash -c "pnpm install"` or similar subprocess wrappers

## Technology Stack

- **Framework**: Next.js 15.4.0 (canary) with React 19.1.0
- **Package Manager**: pnpm v10.6.3+ with workspaces
- **Language**: TypeScript with strict checking
- **Build System**: Turborepo for parallel builds
- **Node Version**: 22+ (ESM modules only)
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
   - Marketing site (`/apps/web`)
   - Backstage admin with microfrontend architecture
   - Background workers and utilities
2. **Packages Layer** (`/packages/*`) - Shared functionality in 7 layers
3. **Infrastructure** (`/infra/*`) - Infrastructure as code
4. **Scripts** (`/scripts/*`) - Build and utility scripts

> See `/apps/docs/` for detailed architecture documentation.

## Module System

- **ESM modules only** - No CommonJS support
- **Packages** (`/packages/*`) MUST have `"type": "module"`
- **Apps** (`/apps/*`) should NOT have `"type": "module"` (Next.js handles ESM)
- Packages are consumed directly from source (no build step)
- All imports use `@repo/*` namespace

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
2. **Data layer** - Update schema → `pnpm migrate` → `pnpm --filter @repo/database generate`
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

- **Framework**: Vitest with React Testing Library
- **Location**: `__tests__` directories
- **Naming**: `*.test.ts(x)` for unit tests, `*.component.test.ts(x)` for components
- **Concurrency**: Tests run in parallel with concurrency=10
- **Data-TestID**: All components include standardized `data-testid` props

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
```

## Git Workflow

- Create feature branches from `master`
- Use conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Run `pnpm lint` and `pnpm typecheck` before committing
- Never commit sensitive data

## Package Layers

Packages follow strict layering to prevent circular dependencies. Each layer can only depend on
lower layers:

### Layer 1: Foundation

- `@repo/typescript-config`, `@repo/eslint-config`, `@repo/next-config`

### Layer 2: Core Services

- `@repo/testing` - Test utilities
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

Packages provide runtime-specific exports. **In Next.js, ALWAYS use `/next` variants. For edge
runtime, use `/edge` variants when available:**

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
   import { useAuth } from '@repo/auth/client/next';
   import { createAuth } from '@repo/auth/server/next';
   ```

2. **Next.js Edge Runtime (Middleware, Edge Functions)**

   ```typescript
   import { createAuth } from '@repo/auth/server/edge';
   ```

   **Note**: Edge exports are optional. Not all packages support edge runtime. **Limitations**: No
   Node.js APIs (fs, crypto, etc.), no native modules, HTTP-based implementations only

3. **Node.js Workers**

   ```typescript
   import { createAuth } from '@repo/auth/server';
   ```

4. **Environment-Agnostic Packages** For packages that run in both environments (database, storage,
   analytics), use `shared-env`:
   ```typescript
   import { createServerObservability } from '@repo/observability/shared-env';
   import { createAnalytics } from '@repo/analytics/shared-env';
   ```
   **Important**: The `shared-env` export uses runtime detection to load ONLY the appropriate
   implementation.

### Common Import Mistakes

```typescript
// ❌ WRONG - Using non-Next.js import in Next.js
import { createAuth } from '@repo/auth/client';

// ❌ WRONG - Using server/next in edge runtime
import { createObservability } from '@repo/observability/server/next'; // In middleware.ts

// ✅ CORRECT - Next.js server components
import { auth } from '@repo/auth/server/next';

// ✅ CORRECT - Edge runtime (middleware)
import { auth } from '@repo/auth/server/edge';
```

**Packages currently supporting edge runtime**: `@repo/analytics`, `@repo/auth`,
`@repo/notifications`, `@repo/observability`

### Standard Import Patterns

```typescript
// Workspace packages
import { ... } from '@repo/package-name';

// App-specific (absolute imports)
import { ... } from '@/components/...';

// External packages
import { ... } from 'external-package';
```

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
- Use `_` prefix for unused variables (e.g., `_error` in catch blocks when not using the error)
- Remove `_` prefix when actually using the variable (e.g., `error` not `_error` when throwing)
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

**TypeScript**: Extend `@repo/typescript-config/[base|nextjs|react-library].json`

**ESLint**: Extend `@repo/eslint-config/[base|next|react-internal|react-library]`

**Next.js**: Import and use `@repo/next-config`

**Vitest**: Extend `@repo/testing/config/[node|react|next]`

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
  name: z.string().min(2),
});

const form = useForm({
  validate: zodResolver(schema),
  initialValues: { email: '', name: '' },
});
```

### Server Actions (Preferred over API Routes)

```typescript
// app/actions/update-user.ts
'use server';
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

Use `@repo/internationalization` package with concise property names (e.g., `l` for languages).
Standard locale codes: `en`, `fr`, `es`, `pt`, `de`. See package docs for implementation details.

---

## Vercel Toolbar & Feature Flags

Available in development mode for apps with PostHog integration. Toggle feature flags in real-time
via toolbar. See `/apps/backstage/app/lib/feature-flags.ts` for implementation examples.

## Troubleshooting

### Common AI Agent Mistakes (Expanded Anti-Pattern Catalog)

**Import & Export Errors**

- ❌ `import from '@repo/package/src/file'` → ✅ `import from '@repo/package'`
- ❌ `import from './file.js'` → ✅ `import from './file'`
- ❌ Using `/client` in Next.js → ✅ Always use `/client/next` in Next.js apps
- ❌ Using `/server/next` in edge runtime → ✅ Always use `/server/edge` in middleware/edge
  functions
- ❌ `import { Button } from '@repo/design-system'` → ✅ `import { Button } from '@mantine/core'`
- ❌ Deep imports like `@repo/auth/src/lib/utils` → ✅ Export from package root

**Edge Runtime Errors**

- ❌ `@opentelemetry/api` in middleware → ✅ Use `/server/edge` exports (HTTP-based observability)
- ❌ Node.js APIs in edge runtime → ✅ Use Web APIs (fetch, crypto.randomUUID, etc.)
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

- ❌ Creating `/lib` or `/utils` → ✅ Use existing packages or create new package
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

For detailed guidance on common development tasks, see the AI-specific documentation in
`/apps/docs/ai-hints/`:

- **[Task Templates](/apps/docs/ai-hints/task-templates.mdx)** - Ready-to-use code templates
- **[Decision Trees](/apps/docs/ai-hints/decision-trees.mdx)** - Flowcharts for technical decisions
- **[Command Sequences](/apps/docs/ai-hints/command-sequences.mdx)** - Step-by-step workflows
- **[Success Markers](/apps/docs/ai-hints/success-markers.mdx)** - Task completion checklists
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

**IMPORTANT**: The source of truth for all documentation is located in `/apps/docs/` (Mintlify).
This is the authoritative documentation source for the entire project. Always refer to and update
documentation in this location.

# important-instruction-reminders

Do what has been asked; nothing more, nothing less. NEVER create files unless they're absolutely
necessary for achieving your goal. ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation
files if explicitly requested by the User.
