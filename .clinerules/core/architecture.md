# Next-Forge Architecture

## [ARCH-1] Monorepo Structure

- **Required**: Yes
- **Summary**: Next-Forge uses a pnpm/Turborepo monorepo with a specific
  directory organization.
- **Details**:
  - Root directories: `apps/`, `packages/`, `docs/`, `scripts/`, `turbo/`
  - Applications live in `apps/` directory
  - Shared libraries live in `packages/` directory
  - Use pnpm workspaces for package management
  - Use Turborepo for build orchestration

## [ARCH-2] Application Types

- **Required**: Yes
- **Summary**: The monorepo supports specific application types in the apps/
  directory.
- **Details**:
  - `app`: Main authenticated application
  - `web`: Public-facing website
  - `api`: Backend services
  - `docs`: Documentation site
  - `email`: Email templates
  - `studio`: Admin dashboard

## [ARCH-3] Package Types

- **Required**: Yes
- **Summary**: Shared packages must follow specific organization patterns.
- **Details**:
  - `design-system`: UI components, theming
  - `auth`: Authentication, authorization
  - `database`: Prisma schema, client, migrations
  - `analytics`: Tracking integration
  - `next-config`: Shared Next.js config
  - `typescript-config`: Shared TS config
  - Utility packages: feature-flags, internationalization, observability,
    security, etc.

## [ARCH-4] Dependency Flow

- **Required**: Yes
- **Summary**: Packages must follow dependency hierarchy to prevent circular
  dependencies.
- **Details**:
  - Core packages (`typescript-config`, `next-config`, `database`) have minimal
    dependencies
  - Shared packages can depend on core packages
  - Applications depend on shared packages
  - Never allow circular dependencies
  - Package dependencies must be explicitly declared

## [ARCH-5] Build Pipeline

- **Required**: Yes
- **Summary**: Turborepo orchestrates building packages in dependency order.
- **Details**:
  - Define build tasks in `turbo.json`
  - Use `pnpm build` to build all packages
  - Use `pnpm --filter <package-name> build` for specific packages
  - Define clear dependency chains in turbo.json

## [ARCH-6] Environment Configuration

- **Required**: Yes
- **Summary**: Applications use shared validation patterns with zod.
- **Details**:
  - Each application has its own `.env` files
  - Use `@t3-oss/env-nextjs` for environment validation
  - Define environment schema in `env.ts`
  - Reference keys from shared packages
  - See `config/environment.md` for details
