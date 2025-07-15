# Mantine + Tailwind Template

- _Type:_ **Template**

- _Purpose:_ **Modern Next.js template with Mantine v8 and Tailwind CSS v4,
  following Forge repository standards**

- _Documentation:_
  **[Mantine Tailwind Template](../docs/apps/next-app-mantine-tailwind-template.mdx)**

## Features

- **Next.js 15** with App Router
- **Mantine v8** React components library
- **Tailwind CSS** utility-first styling
- **TypeScript** with strict configuration
- **Testing** with Vitest and Testing Library
- **Linting** with ESLint and custom configurations
- **Environment** management with type-safe validation

## Development

```bash
# Install dependencies
pnpm install

# Start development server (port 3900)
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build
```

## Architecture

This template follows the Forge repository conventions:

- Uses `@repo/*` workspace packages
- Catalog versions for consistent dependencies
- Proper TypeScript configuration extending shared configs
- Environment variable validation
- Testing setup with centralized mocks
- Modern Mantine patterns with proper accessibility
