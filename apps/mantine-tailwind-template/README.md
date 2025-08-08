# Mantine + Tailwind Template

- _Port:_ **3900** (Next.js App)

- _AI Hints:_

  ```typescript
  // Primary: Next.js 15 template with Mantine v8 + Tailwind v4 integration
  // Auth: import { auth } from "@repo/auth/server/next"
  // Analytics: import { track } from "@repo/analytics/server/next"
  // UI: import { Button } from "@mantine/core"
  // ❌ NEVER: Mix Mantine and Tailwind for same styling concerns
  ```

- _Key Features:_
  - **Next.js 15**: App Router with React 19, TypeScript strict mode
  - **Mantine v8**: Complete component library with form validation, hooks
  - **Tailwind CSS v4**: Utility-first styling with Mantine preset integration
  - **Workspace Integration**: 8 @repo packages (auth, analytics, observability,
    etc.)
  - **Testing Setup**: Vitest, Testing Library, Playwright E2E, centralized
    @repo/qa mocks
  - **Production Ready**: Environment validation, internationalization, SEO
    optimization

- _Documentation:_
  **[Mantine Tailwind Template](../docs/apps/next-app-mantine-tailwind-template.mdx)**

- _Workspace Packages:_
  - **@repo/auth**: Better Auth with session management
  - **@repo/analytics**: PostHog/Vercel Analytics tracking
  - **@repo/feature-flags**: Vercel Flags with PostHog integration
  - **@repo/internationalization**: Next.js i18n with automated translations
  - **@repo/observability**: Sentry error tracking and monitoring
  - **@repo/seo**: Next.js 15 metadata API with structured data
  - **@repo/uix-system**: Mantine/Tailwind component library
  - **@repo/config**: Shared Next.js, TypeScript, ESLint configurations

- _Environment Variables:_

  ```bash
  # Required for template functionality
  NEXT_PUBLIC_APP_URL=http://localhost:3900
  
  # Optional: Enable features
  NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
  SENTRY_DSN=your-sentry-dsn
  AUTH_SECRET=your-auth-secret
  ```

- _Styling Architecture:_
  - **Mantine Core**: Component library for complex UI elements
  - **Tailwind Utilities**: Spacing, colors, responsive design
  - **Mantine Preset**: Tailwind preset that matches Mantine design tokens
  - **CSS Variables**: Shared color system between Mantine and Tailwind

## Features

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
