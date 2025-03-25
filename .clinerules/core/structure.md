# Monorepo Structure

## [STRUCT-1] Directory Organization

- **Required**: Yes
- **Summary**: The monorepo follows a specific top-level directory organization.
- **Details**:
  - `apps/`: Contains all standalone applications
  - `packages/`: Contains all shared libraries and utilities
  - `docs/`: Contains documentation
  - `scripts/`: Contains build and utility scripts
  - `turbo/`: Contains Turborepo configuration

## [STRUCT-2] Application Structure

- **Required**: Yes
- **Summary**: Each application in the `apps/` directory follows Next.js
  conventions.
- **Details**:
  - `app/`: App Router components and routes
  - `components/`: Reusable UI components
  - `lib/`: Utility functions and helpers
  - `public/`: Static assets
  - `styles/`: CSS and styling files
  - `__tests__/`: Test files

## [STRUCT-3] Package Structure

- **Required**: Yes
- **Summary**: Each package in the `packages/` directory follows a consistent
  structure.
- **Details**:
  - `src/`: Source code
  - `dist/`: Build output (gitignored)
  - `__tests__/`: Test files
  - `tsconfig.json`: TypeScript configuration
  - `package.json`: Package metadata and scripts

## [STRUCT-4] Naming Conventions

- **Required**: Yes
- **Summary**: Use consistent naming patterns across the codebase.
- **Details**:
  - Use kebab-case for directory and file names
  - Use PascalCase for component files and classes
  - Use camelCase for utility functions and variables
  - Prefix internal packages with `@repo/` scope

## [STRUCT-5] Import Conventions

- **Required**: Yes
- **Summary**: Follow consistent import patterns.
- **Details**:
  - Use relative imports for files within the same package
  - Use absolute imports for files across packages
  - Always use the `@repo/` scope for importing from other packages
  - See `code/module-format.md` for more details

## [STRUCT-6] Configuration Files

- **Required**: Yes
- **Summary**: Manage configuration files according to specific patterns.
- **Details**:
  - Root-level configuration files apply to all packages and applications
  - Package-specific configuration files override root-level configuration
  - Use `.gitignore` to exclude build artifacts and environment files
  - ESLint: each package has its own `eslint.config.ts`
  - Prettier: configuration ONLY at repository root via `@repo/config-prettier`
