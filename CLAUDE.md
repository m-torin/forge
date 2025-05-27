# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Context

This is a Next.js monorepo using Turborepo, based on the forge template. Key technologies:

- **Framework**: Next.js 15.4.0 (canary) with React 19.1.0
- **Package Manager**: pnpm (v10.6.3+) with workspaces
- **Language**: TypeScript with strict type checking
- **Build System**: Turborepo for parallel builds
- **Node Version**: 22+ (ESM modules only)
- **UI Framework**: Mantine UI v8 (preferred) + Tailwind CSS v4 (legacy/allowed)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with organizations and API keys

## High-Level Architecture

This monorepo follows a modular architecture with clear separation of concerns:

1. **Apps Layer** (`/apps/`) - User-facing applications

   - Each app is independently deployable
   - Apps consume shared packages via `@repo/*` imports
   - No direct dependencies between apps

2. **Packages Layer** (`/packages/`) - Shared functionality

   - **Core Services**: auth, database, payments, email
   - **UI/UX**: design-system, internationalization
   - **Infrastructure**: analytics, observability, security, rate-limit
   - **Utilities**: testing, typescript-config, next-config
   - **Notifications**: Backend (Knock) and frontend (Mantine) notifications

3. **Authentication Flow**

   - Better Auth handles user sessions and API keys
   - Organization-based multi-tenancy with teams
   - Role-based permissions (owner, admin, member)
   - Admin panel with user management, impersonation, and API key oversight
   - API keys support with rate limiting and custom validation

4. **Data Flow**

   - PostgreSQL database with Prisma ORM
   - Type-safe database queries
   - API routes handle business logic
   - Real-time updates via Liveblocks collaboration

5. **Module System (Important)**
   - ESM modules only (no CommonJS)
   - **Packages** (`/packages/*`) MUST have `"type": "module"` in package.json
   - **Apps** (`/apps/*`) should NOT have `"type": "module"` - Next.js handles ESM automatically
   - Packages are consumed directly from source (no build step required)
   - All internal imports use `@repo/*` namespace
   - DO NOT build packages - they are used as ESM modules directly

## Directory Structure

- `/apps/` - Contains all applications
- `/packages/` - Shared packages across apps
- `/turbo/` - Turbo generator configuration
- `/scripts/` - Build and utility scripts
- `/infra/` - Infrastructure as code

## Development Commands

Always run these commands from the repository root:

**IMPORTANT**: Do not use the `rg` (ripgrep) command directly. Use the Grep tool instead for
searching file contents.

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                # Run all apps in development mode
pnpm dev --filter=app   # Run specific app

# Testing
pnpm test              # Run all tests with Vitest (parallel, concurrency=10)
pnpm test --filter=app # Run tests for specific app
pnpm test:watch        # Run tests in watch mode (add to specific package.json)

# Linting & Formatting
pnpm lint              # Run ESLint and Prettier
pnpm prettier          # Format all code files

# Type checking
pnpm typecheck         # Run TypeScript type checking

# CLI Usage Notes:
# - ESLint: Use `eslint . --fix` in apps/packages (the . is required, --fix auto-fixes issues)
# - TypeScript: Use `tsc --noEmit --emitDeclarationOnly false` for type checking
# - Prettier: Run at repo root only with `pnpm prettier`

# Building
pnpm build             # Build all apps in parallel
pnpm build --filter=app # Build specific app

# Database operations
pnpm migrate           # Run Prisma migrations
pnpm --filter @repo/database generate # Regenerate Prisma client
pnpm studio            # Open Prisma Studio (port 3600)

# Dependency management
pnpm bump-deps         # Update all dependencies
pnpm madge --circular  # Check for circular dependencies

# Other utilities
pnpm clean             # Clean all build artifacts (./clean-everything.sh)
pnpm translate         # Run translations
pnpm analyze           # Analyze bundles
pnpm boundaries        # Check module boundaries
```

## Configuration Standards

All apps and packages must extend their respective shared configurations. Choose the appropriate
config based on the context:

**IMPORTANT**: Always use `"catalog:"` versions in package.json when the dependency exists in the
pnpm-workspace.yaml catalog. If a dependency is NOT in the catalog, use the appropriate version
number (check root package.json or other apps for the version to use).

1. **TypeScript**: Extend from `@repo/typescript-config`

   ```json
   {
     "extends": "@repo/typescript-config/base.json" // or nextjs.json, react-library.json, etc.
   }
   ```

2. **ESLint**: Extend from `@repo/eslint-config` - choose the right config:

   - `base` - for Node.js packages
   - `next` - for Next.js apps
   - `react-internal` - for internal React packages
   - `react-library` - for publishable React libraries

   ```js
   import baseConfig from '@repo/eslint-config/next'; // Choose appropriate config
   export default [...baseConfig];
   ```

3. **Next.js**: Import and use `@repo/next-config`

   ```js
   import config from '@repo/next-config';
   export default config(/* your config */);
   ```

4. **Vitest**: Extend from `@repo/testing` configs:
   - Use `config/next.ts` for Next.js apps
   - Use `config/react.ts` for React packages
   - Use `config/node.ts` for Node.js packages
   ```js
   import { defineConfig } from 'vitest/config';
   import baseConfig from '@repo/testing/config/next'; // Choose appropriate config
   export default defineConfig({
     ...baseConfig,
     // your overrides
   });
   ```

Always select the most specific configuration that matches your package/app type for optimal
settings.

## Code Style Guidelines

1. **TypeScript Usage**

   - Always use TypeScript (.ts/.tsx files)
   - Define proper types/interfaces (no `any` except when absolutely necessary)
   - Use `_` prefix for unused variables (per ESLint config)
   - Environment variables: Use `@t3-oss/env-nextjs` without explicit ReturnType

2. **React/Next.js**

   - Use React 19.1.0 and Next.js 15.4.0 (canary) features
   - Follow Next.js App Router conventions
   - Use server components by default, client components only when needed
   - Always optimize images using Next.js `Image` component
   - Server actions for form handling
   - Parallel routes and intercepting routes where appropriate

3. **Imports**

   - Use workspace imports for internal packages: `@repo/*`
   - Use absolute imports from `@/` for app-specific code
   - Group imports logically: external, internal packages, local

4. **Component Structure**

   - One component per file
   - Co-locate related files (styles, tests, types)
   - Use Mantine UI components directly (not through design-system re-exports)
   - Only use design-system for custom/composite components

5. **Styling**
   - **Mantine UI v8** as preferred UI framework for new components
   - **Tailwind CSS v4** (only v4, not v3) allowed for existing components or when specifically
     directed
   - Use Mantine's theme system for consistent styling
   - Use Mantine's color scheme support for dark mode (no `dark` prop)
   - Use responsive props: `{ base: value, sm: value, md: value, lg: value, xl: value }`
   - Avoid inline styles - use Mantine's style props or Tailwind classes

## Testing Guidelines

- **Test Framework**: Vitest with React Testing Library
- **Test Location**: `__tests__` directories in each package/app
- **File Naming**: `*.test.ts(x)` for unit tests, `*.component.test.ts(x)` for component tests
- **Running Tests**:
  ```bash
  pnpm test                    # Run all tests in parallel
  pnpm test --filter=@repo/auth # Test specific package
  pnpm test -- --watch         # Watch mode
  pnpm test -- --coverage      # With coverage report
  ```
- **Test Structure**:
  - Unit tests for utilities and pure functions
  - Integration tests for API routes
  - Component tests with user interactions and Storybook integration
  - Mock external services (database, auth, email)

## Git Workflow

1. Create feature branches from `master`
2. Use conventional commit messages:

   - `feat:` for features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

3. Never commit sensitive data (API keys, secrets)
4. Always run `pnpm lint` and `pnpm typecheck` before committing

## Mantine UI Guidelines

1. **Theme Configuration**

   - Use MantineProvider with custom theme in root layout
   - Define color schemes for light/dark mode support
   - Use CSS variables for dynamic theming

2. **Component Usage**

   - Import Mantine components directly: `import { Button, Card } from '@mantine/core'`
   - Use Mantine hooks: `useDisclosure`, `useMediaQuery`, etc.
   - Prefer Mantine form hooks over react-hook-form
   - For new work: Use Mantine unless specifically directed to use Tailwind

3. **Dark Mode**

   - Never use `dark` prop (removed in Mantine v8)
   - Use `useMantineColorScheme` hook for color scheme detection
   - Style dark mode with CSS variables or theme functions

4. **Notifications**
   - Use centralized notification configuration from `@repo/notifications/mantine-notifications`
   - Consistent notification styles across all apps

## Package-Specific Rules

### `/apps/app` - Main Application (Port: 3100)

- Primary user-facing application
- Authentication required via `@repo/auth`
- Real-time collaboration via `@repo/collaboration` (Liveblocks)
- Features: API key management, webhooks, search functionality
- Protected routes under `(authenticated)` group

### `/apps/web` - Marketing Website (Port: 3200)

- Public-facing marketing site
- Internationalization with 6 languages
- Static generation for optimal SEO
- Blog with MDX content
- Contact form with server actions
- Prefer Mantine UI for new components

### `/apps/api` - API Backend (Port: 3300)

- RESTful API endpoints
- Protected routes require authentication
- Webhook handlers (Stripe)
- Health check endpoints
- CORS and security headers

### `/apps/backstage` - Admin Panel

- Admin-only application
- User management (list, ban, impersonate)
- Organization management
- Session management
- API key oversight
- Role-based access (super-admin, admin, moderator, support)
- Full Better Auth integration

### `/apps/docs` - Documentation (Port: 3400)

- Mintlify documentation platform
- API reference from OpenAPI spec
- Development guides
- Code examples

### `/apps/email` - Email Service (Port: 3500)

- React Email templates
- Preview server for development
- Email templates: contact, invitations, notifications
- Uses Tailwind CSS (React Email requirement)

### `/apps/studio` - Prisma Studio (Port: 3600)

- Database management UI
- Direct database access
- Development tool only

### `/apps/storybook` - Component Library (Port: 3700)

- All design system components
- Interactive documentation
- Visual testing
- Theme variations
- Supports both Mantine and Tailwind components

## Key Shared Packages

### `@repo/auth` - Authentication & Authorization

- Full Better Auth implementation with all plugins
- Organization/team multi-tenancy
- API key generation and validation with rate limiting
- Admin roles and permissions (super-admin, admin, moderator, support)
- Middleware for route protection (edge-compatible)
- Session management with cookie caching
- Impersonation support

### `@repo/database` - Data Layer

- Prisma ORM with PostgreSQL
- Type-safe database client
- Migration management
- Shared models across apps

### `@repo/design-system` - UI Components

- Custom composite components only
- Use Mantine UI components directly for basic components
- Custom auth components (sign-in, user-button, organization-switcher)
- Admin components (user-list, organization-detail)
- Form handling with @mantine/form
- Theme provider configuration

### `@repo/notifications` - Notification Systems

- Backend: Knock integration for transactional notifications
- Frontend: Centralized Mantine notifications configuration
- Consistent notification patterns across apps

### `@repo/seo` - SEO & Structured Data

- Enhanced metadata generation for Next.js
- Comprehensive structured data support (LD+JSON)
- Multiple schema types: WebSite, Organization, Article, Product, FAQ, etc.
- Type-safe schema generation

### `@repo/analytics` - Tracking

- PostHog integration
- Google Analytics support
- Server and client implementations
- GDPR-compliant tracking

### `@repo/payments` - Stripe Integration

- Subscription management
- Webhook handling
- AI credit system
- Payment method management

### `@repo/email` - Email Service

- React Email templates
- Resend integration
- Template types: contact, invitations
- Development preview server

### `@repo/observability` - Monitoring

- Sentry error tracking
- Performance monitoring
- Custom error boundaries
- Health check components

## Environment Variables

- Never commit `.env` files
- Use `.env.local` for local development
- All environment variables should be properly typed in `env.ts`
- **CRITICAL**: `env.ts` files MUST be in the package/app root directory, NEVER in `src/`
- Use `@t3-oss/env-nextjs` for validation
- Each app has its own `env.ts` with required variables
- Keys functions should NOT use explicit ReturnType annotations

## Security

1. Always validate user input
2. Use CSRF protection
3. Implement proper authentication/authorization
4. Rate limiting via `@repo/rate-limit`
5. Security headers via `@repo/security`

## Performance

1. Optimize bundle size
2. Use dynamic imports for code splitting
3. Implement proper caching strategies
4. Monitor performance with `@repo/observability`
5. Use Mantine's built-in performance optimizations

## Common Patterns

### API Routes with Better Auth

```typescript
// Protected API route example
import { auth } from '@repo/auth/server';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Handle request...
}
```

### Database Queries

```typescript
// Use the shared database client
import { database } from '@repo/database';

const users = await database.user.findMany({
  where: { organizationId: session.session.activeOrganizationId },
});
```

### Protected Pages

```typescript
// Use middleware for route protection
import { authMiddleware } from '@repo/auth/middleware';
export const middleware = authMiddleware;
```

### Mantine Notifications

```typescript
// Use centralized notification system
import { notify } from '@repo/notifications/mantine-notifications';

// Success notification
notify.success('Operation completed successfully');

// Error notification
notify.error('Something went wrong', { title: 'Error' });
```

## Debugging Common Issues

1. **Module not found errors**: Ensure packages have `"type": "module"` and use `@repo/*` imports
2. **Type errors**: Run `pnpm typecheck` and ensure Prisma client is generated
3. **Auth issues**: Verify environment variables and Better Auth configuration
4. **Build failures**: Check for circular dependencies with `pnpm madge --circular`
5. **Test failures**: Ensure test setup files are imported and mocks are configured
6. **Dark mode issues**: Remove `dark` prop, use Mantine's color scheme system
