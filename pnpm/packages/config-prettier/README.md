# @repo/prettier-config

Shared Prettier configuration for the monorepo. This package provides a
consistent code formatting experience across all projects in the repository.

## Features

- Extends the Vercel Style Guide configuration
- Adds support for PHP, Shell scripts, and package.json formatting
- Customized rules for different file types (TS/JS, CSS, YAML, Markdown,
  GraphQL, etc.)
- Ready-to-use format scripts

## Usage

### Within the Monorepo

This package is automatically used by all projects in the monorepo. You don't
need to install it separately.

To format your code:

```bash
# Format all files in the monorepo
npm run format -w @repo/prettier-config

# Check if files are properly formatted (without modifying them)
npm run format:check -w @repo/prettier-config

# Format only staged files in git
npm run format:staged -w @repo/prettier-config
```

### In a Project Outside the Monorepo

If you want to use this configuration in a separate project:

1. Install the package:

   ```bash
   npm install --save-dev prettier @vercel/style-guide @prettier/plugin-php prettier-plugin-packagejson prettier-plugin-sh
   ```

2. Create a `.prettierrc.ts` file:

   ```typescript
   import config from './path/to/this/repo/packages/config-prettier/index.ts';
   export default config;
   ```

## Configuration

The configuration includes specialized settings for:

- TypeScript/JavaScript
- Package.json
- YAML files
- PHP files
- Markdown
- GraphQL
- CSS/SCSS

See [index.ts](./index.ts) for detailed settings.

## Adding New File Types

To add support for additional file types, modify the `overrides` array in
`index.ts` and add the file extension to the format commands in `package.json`.
