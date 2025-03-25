# TypeScript Standards

## [TS-1] Type Definitions

- **Required**: Yes
- **Summary**: Use explicit type annotations and consistent type definition
  patterns.
- **Details**:
  - Use explicit type annotations for function parameters and return types
  - Prefer interfaces for object types that will be extended
  - Use type aliases for union types, intersection types, and simple object
    types
  - Export types that are used across multiple files

## [TS-2] Generic Types

- **Required**: Yes
- **Summary**: Use generic types for reusable components and functions.
- **Details**:
  - Provide descriptive names for type parameters
  - Use constraints to limit the types that can be used
  - Document complex generic types with JSDoc

## [TS-3] Type Safety

- **Required**: Yes
- **Summary**: Maintain strict type safety throughout the codebase.
- **Details**:
  - Avoid using `any` type whenever possible
  - Use `unknown` instead of `any` for values of uncertain type
  - Use type guards to narrow types
  - Enable strict TypeScript checks in tsconfig.json

## [TS-4] Utility Types

- **Required**: No
- **Summary**: Use TypeScript's built-in utility types when appropriate.
- **Details**:
  - Common utility types: `Partial<T>`, `Required<T>`, `Pick<T, K>`,
    `Omit<T, K>`, `Record<K, T>`
  - Create custom utility types for project-specific needs
  - Document custom utility types with JSDoc

## [TS-5] Type Exports

- **Required**: Yes
- **Summary**: Export types consistently.
- **Details**:
  - Group related types in a types.ts file
  - Use barrel exports for types from multiple files
  - Export interfaces and types that are used by other packages

## [TS-6] Type Imports

- **Required**: Yes
- **Summary**: Import types explicitly using the `type` keyword.
- **Details**:
  - Use `import type { Something } from './something'`
  - Group type imports separately from value imports
  - Import types directly from their source package

## [TS-7] ESM Module Format

- **Required**: Yes
- **Summary**: All packages must use ESM format with direct TypeScript
  consumption.
- **Details**:
  - Add `"type": "module"` to all package.json files
  - Use explicit file extensions in import paths (.ts/.tsx)
  - Do not use CommonJS modules (`require`/`module.exports`)
  - Node 22+ is required for direct TypeScript ESM consumption
  - See `code/module-format.md` for more details

## [TS-8] Type Documentation

- **Required**: No
- **Summary**: Document complex types with JSDoc comments.
- **Details**:
  - Include examples for non-obvious types
  - Document type parameters for generic types
  - Document constraints and edge cases
