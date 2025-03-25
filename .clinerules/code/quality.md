# Code Quality Standards

## [QUAL-1] Core Tools

- **Required**: Yes
- **Summary**: Use standardized linting and formatting tools.
- **Details**:
  - ESLint: code linting (v9+, flat config)
  - Prettier: code formatting
  - TypeScript: static type checking

## [QUAL-2] ESLint Configuration

- **Required**: Yes
- **Summary**: Follow ESLint configuration standards.
- **Details**:
  - Each app/package needs `eslint.config.ts`
  - No root-level ESLint config
  - Use the appropriate config from `@repo/eslint-config` based on project type
  - Base: `@repo/eslint-config` - General TypeScript packages
  - Next.js: `@repo/eslint-config/next` - Next.js applications
  - React: `@repo/eslint-config/react` - React component libraries
  - Server: `@repo/eslint-config/server` - Server-side code

## [QUAL-3] Prettier Configuration

- **Required**: Yes
- **Summary**: Use centralized Prettier configuration.
- **Details**:
  - Config ONLY at repository root via `@repo/config-prettier`
  - No package-level `.prettierrc` files
  - Implement at root level:
    `import config from './packages/config-prettier/index.ts'; export default config;`

## [QUAL-4] Running Tools

- **Required**: Yes
- **Summary**: Use standardized commands to run linting and formatting.
- **Details**:
  - ESLint (all projects): `pnpm eslint`
  - ESLint (specific project): `pnpm --filter <package-name> lint`
  - Prettier (all files): `pnpm prettier`
  - Prettier (specific path): `prettier --write "apps/web/**/*.{ts,tsx}"`
  - Combined: `pnpm lint`

## [QUAL-5] VS Code Integration

- **Required**: No
- **Summary**: Configure VS Code for optimal development experience.
- **Details**:
  - Set `"editor.formatOnSave": true`
  - Set `"editor.defaultFormatter": "esbenp.prettier-vscode"`
  - Set `"editor.codeActionsOnSave": { "source.fixAll.eslint": true }`

## [QUAL-6] TypeScript Checks

- **Required**: Yes
- **Summary**: Run TypeScript checks to ensure type safety.
- **Details**:
  - Run `pnpm typecheck` to check types
  - Each package should have a typecheck script in package.json
  - Ensure strict mode is enabled in tsconfig.json
  - See `code/typescript.md` for type requirements

## [QUAL-7] Troubleshooting

- **Required**: No
- **Summary**: Common troubleshooting steps for code quality tools.
- **Details**:
  - ESLint: Use workspace version in IDE; use `.eslintignore` for performance
  - Prettier: Lock versions; define explicit formatting rules
  - Integration: Keep `eslint-config-prettier` updated
