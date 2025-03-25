# Dependency Management

## [DEP-1] Dependency Declaration

- **Required**: Yes
- **Summary**: Use specific syntax for different types of dependencies.
- **Details**:
  - Internal dependencies: Use `workspace:*` syntax
  - Catalog dependencies: Use `catalog:` syntax (without asterisk)
  - External dependencies: Specify exact versions
  - Define workspace packages and catalog entries in pnpm-workspace.yaml

## [DEP-2] Import Conventions

- **Required**: Yes
- **Summary**: Use consistent import patterns for workspace packages.
- **Details**:
  - Always use package name imports for workspace packages:
    `import { component } from '@repo/ui'`
  - Never use relative paths (../../) to reference workspace packages
  - Always include file extensions in imports
  - See `code/module-format.md` for more details

## [DEP-3] Version Management

- **Required**: Yes
- **Summary**: Manage versions through the catalog in pnpm-workspace.yaml.
- **Details**:
  - Define common dependency versions in the catalog section
  - Organize catalog entries by separating runtime from development dependencies
  - Reference catalog entries with `catalog:` in package.json
  - Update catalog versions when upgrading dependencies
  - Use `pnpm bump-deps` to update dependencies across the monorepo

## [DEP-4] Peer Dependencies

- **Required**: Yes
- **Summary**: Declare framework libraries as peer dependencies in shared
  packages.
- **Details**:
  - Use `catalog:` for peer dependencies in the catalog
  - For peer dependencies not in catalog, specify compatible version ranges
  - Include peer dependencies as dev dependencies for testing
  - Use `"peerDependencies": { "react": "catalog:" }` format

## [DEP-5] Development Dependencies

- **Required**: Yes
- **Summary**: Keep development dependencies at the root level when possible.
- **Details**:
  - Add root dev dependencies with `pnpm -w add -D <package>`
  - Only add package-specific dev dependencies when necessary
  - Use `catalog:` for dev dependencies in the catalog

## [DEP-6] Dependency Hoisting

- **Required**: Yes
- **Summary**: Configure dependency hoisting behavior with .npmrc.
- **Details**:
  - Set `hoist=false` to prevent dependency hoisting issues
  - Use `public-hoist-pattern[]` for specific packages that need hoisting
  - Configure consistent hoisting across the monorepo

## [DEP-7] Dependency Pruning

- **Required**: No
- **Summary**: Regularly audit and prune dependencies.
- **Details**:
  - Audit dependencies with `pnpm audit`
  - Remove unused dependencies to keep the project lean
  - Use `depcheck` to identify unused dependencies

## [DEP-8] Lockfile Management

- **Required**: Yes
- **Summary**: Properly manage the pnpm lockfile.
- **Details**:
  - Always commit `pnpm-lock.yaml` to version control
  - Never manually edit the lockfile
  - Run `pnpm install --frozen-lockfile` in CI environments
