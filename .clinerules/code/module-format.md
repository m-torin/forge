# Module Format Standards

## [MOD-1] TypeScript ESM Format

- **Required**: Yes
- **Summary**: All packages must use ESM format with TypeScript.
- **Details**:
  - All packages must be written in TypeScript, not JavaScript
  - All packages must use ESM format with direct TypeScript consumption
  - Add `"type": "module"` to all package.json files
  - No CommonJS modules (`require`/`module.exports`) should be used
  - Node 22+ is required for direct TypeScript ESM consumption

## [MOD-2] File Extensions

- **Required**: Yes
- **Summary**: Use correct file extensions and always include them in imports.
- **Details**:
  - Use `.ts` extension for all TypeScript files
  - Use `.tsx` extension for TypeScript files containing JSX
  - Convert any existing `.js` files to `.ts` files
  - Convert any existing `.jsx` files to `.tsx` files
  - Always use explicit file extensions in import paths

## [MOD-3] Package.json Configuration

- **Required**: Yes
- **Summary**: Configure package.json for ESM TypeScript.
- **Details**:
  - Set `"type": "module"` in package.json
  - Configure exports to point directly to TypeScript source files
  - Remove build-related scripts (no transpilation needed)
  - Keep only essential scripts like clean and typecheck

## [MOD-4] TypeScript Configuration

- **Required**: Yes
- **Summary**: Use standardized TypeScript configuration.
- **Details**:
  - Set `"noEmit": true` in tsconfig.json
  - Use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
  - Enable strict type checking (`"strict": true`)
  - Extend from `@repo/typescript-config/base.json`
  - Remove any settings related to transpilation

## [MOD-5] Import Format

- **Required**: Yes
- **Summary**: Use explicit file extensions and correct import patterns.
- **Details**:
  - Always use explicit file extensions in import paths
  - For TypeScript files: `import { something } from './file.ts'`
  - For package imports, use the package name directly
  - For workspace packages, use `@repo/` prefix

## [MOD-6] Type Safety

- **Required**: Yes
- **Summary**: Maintain type safety throughout the codebase.
- **Details**:
  - Avoid using `any` type
  - Prefer explicit type annotations
  - Use type guards and narrowing
  - Follow type conventions in `code/typescript.md`

## [MOD-7] JSX in TypeScript

- **Required**: No
- **Summary**: Handle JSX in TypeScript correctly.
- **Details**:
  - When using JSX in TypeScript, avoid direct JSX syntax if type issues occur
  - Use React.createElement for compatibility if needed
  - See `ui/mantine.md` for framework-specific JSX handling
