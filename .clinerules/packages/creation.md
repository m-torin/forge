# Package Creation

## [PKG-1] Generator Command

- **Required**: Yes
- **Summary**: Use the standardized generator command to create packages.
- **Details**:
  - Run `pnpm turbo gen init` to generate a new package
  - The generator creates minimal files that require modification

## [PKG-2] Directory Structure

- **Required**: Yes
- **Summary**: Follow the standardized directory structure for packages.
- **Details**:
  - `src/`: Source code files (REQUIRED)
  - `src/index.ts`: Main entry point (REQUIRED)
  - `__tests__/`: Test files (REQUIRED)
  - `__tests__/index.test.ts`: At least one test file (REQUIRED)
  - `package.json`: Package metadata (MODIFY from generated)
  - `tsconfig.json`: TypeScript configuration (MODIFY from generated)
  - `eslint.config.ts`: ESLint configuration (CREATE)

## [PKG-3] Package.json Requirements

- **Required**: Yes
- **Summary**: Configure package.json according to monorepo standards.
- **Details**:
  - Name: `@repo/my-package`
  - Private: `true` (for internal packages)
  - Version: `0.0.0` (or semantic version)
  - Type: `module` (REQUIRED for ESM)
  - Exports: Direct TS exports (e.g., `"./src/index.ts"`)
  - Scripts: Include `clean` and `typecheck` (no build step)
  - Dependencies: Use `workspace:*` syntax for internal deps
  - PeerDependencies: Use `catalog:` syntax for catalog deps

## [PKG-4] TypeScript Configuration

- **Required**: Yes
- **Summary**: Configure TypeScript according to monorepo standards.
- **Details**:
  - Extend the appropriate config based on package type:
    - Standard libraries: `@repo/typescript-config/library.json`
    - React libraries: `@repo/typescript-config/react-library.json`
    - Next.js applications: `@repo/typescript-config/nextjs.json`
  - Never extend `base.json` directly (internal use only)
  - Set `"baseUrl": "."`
  - Set `"noEmit": true` (REQUIRED, no build)
  - Set `"strict": true`
  - Configure path aliases if needed

## [PKG-5] ESLint Configuration

- **Required**: Yes
- **Summary**: Create a standardized ESLint configuration.
- **Details**:
  - Create `eslint.config.ts`
  - Import appropriate config from `@repo/eslint-config` based on package type:
    - React libraries:
      `import reactConfig from '@repo/eslint-config/react-package'`
    - Next.js applications: `import nextConfig from '@repo/eslint-config/next'`
    - Server-side code: `import serverConfig from '@repo/eslint-config/server'`
  - Never import the base config directly (it's for internal use only)

## [PKG-6] Verification Checklist

- **Required**: Yes
- **Summary**: Verify package compliance before committing.
- **Details**:
  - Package name uses kebab-case
  - Directory structure follows monorepo standards
  - No build artifacts or dist directories
  - No local Prettier configuration
  - All files use TypeScript (.ts/.tsx)
  - All imports use explicit file extensions
  - No CommonJS syntax
  - Run verification commands

## [PKG-7] Verification Commands

- **Required**: Yes
- **Summary**: Run standardized commands to verify package compliance.
- **Details**:
  - TypeScript: `pnpm --filter @repo/my-package typecheck`
  - ESLint: `pnpm --filter @repo/my-package eslint`
  - Tests: `pnpm --filter @repo/my-package test`
  - All: `pnpm turbo --filter @repo/my-package typecheck lint test`
