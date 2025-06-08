# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Important Restrictions

**NEVER run `pnpm dev` or `npm dev` commands.** These commands should only be run by the user.

## Environment Variables & Doppler

This project uses Doppler for secret management in CI/CD environments, but local development uses
`.env.local` files:

- **Local Development**: Uses `.env.local` files (no Doppler required)
- **CI/CD & Production**: Uses Doppler for centralized secret management
- **Setup**: Run `pnpm doppler:pull:all` to download all secrets to `.env.local` files
- **Build Options**:
  - `pnpm build` - Production build with Doppler (for CI/CD)
  - `pnpm build:local` - Local build using `.env.local` files

## Project Context

This is a Next.js monorepo using Turborepo, based on the forge template. Key technologies:

- **Framework**: Next.js 15.4.0 (canary) with React 19.1.0
- **Package Manager**: pnpm (v10.6.3+) with workspaces
- **Language**: TypeScript with strict type checking
- **Build System**: Turborepo for parallel builds
- **Node Version**: 22+ (ESM modules only)
- **UI Framework**: Mantine UI v8 (preferred) + Tailwind CSS v4 (legacy/allowed)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth

## High-Level Architecture

This monorepo follows a modular architecture with clear separation of concerns:

1. **Apps Layer** (`/apps/`) - User-facing applications

   - Each app is independently deployable
   - Apps consume shared packages via `@repo/*` imports
   - No direct dependencies between apps

2. **Packages Layer** (`/packages/`) - Shared functionality organized in layers (see Package
   Architecture section for details)

3. **Authentication Flow** - Better Auth with organizations, teams, and API keys (see @repo/auth in
   Package Architecture)

4. **Data Flow** - PostgreSQL with Prisma ORM (see @repo/database in Package Architecture)

5. **Module System (Important)**
   - ESM modules only (no CommonJS)
   - **NO file extensions**: Never add `.js` extensions to imports - ESLint config handles this
   - **Packages** (`/packages/*`) MUST have `"type": "module"` in package.json
   - **Apps** (`/apps/*`) should NOT have `"type": "module"` - Next.js handles ESM automatically
   - Packages are consumed directly from source (no build step required)
   - All internal imports use `@repo/*` namespace
   - DO NOT build packages - they are used as ESM modules directly
   - **Dynamic imports**: Use `import('./path')` without extensions (TypeScript/ESLint handle
     resolution)

## Directory Structure

- `/apps/` - Contains all applications
- `/packages/` - Shared packages across apps
- `/turbo/` - Turbo generator configuration
- `/scripts/` - Build and utility scripts
- `/infra/` - Infrastructure as code

## Development Commands

Always run these commands from the repository root:

**IMPORTANT**: Do not use the `rg` (ripgrep) command directly. Use the Grep tool instead for
searching file contents.

````bash
# Install dependencies
pnpm install

# Development
pnpm dev                # Run all apps in development mode
pnpm dev --filter=app   # Run specific app

# Doppler Setup (for downloading secrets to .env.local)
pnpm doppler:pull:all   # Download all secrets to .env.local files in each app

# Testing
pnpm test              # Run all tests with Vitest (parallel, concurrency=10)
pnpm test --filter=app # Run tests for specific app
pnpm test:watch        # Run tests in watch mode (add to specific package.json)

# Linting & Formatting
pnpm lint              # Run ESLint and Prettier
pnpm prettier          # Format all code files

# Type checking
pnpm typecheck         # Run TypeScript type checking

## Fully Automated Workflow Development

**IMPORTANT**: For AI agent step flow development, use these fully automated commands that can
detect issues, fix them automatically, and repeat until all tests pass:

### Backstage Workflow Automation Commands

These commands are available in the `apps/backstage` directory and provide complete automation for
workflow development with continuous fixing and testing:

```bash
# Single-run automated fixing and testing
pnpm workflow:ai-fix        # AI-powered automatic error fixing
pnpm workflow:full-auto     # Run AI fixes + feedback cycle
pnpm workflow:ultimate      # Complete automation: AI fix + cycle + test

# Continuous automated development
pnpm workflow:auto-repeat   # Continuously retry until all tests pass
pnpm workflow:auto-dev      # Run dev server + continuous auto-fixing

# Development cycle commands
pnpm workflow:cycle         # Manual feedback loop (check → fix → test)
pnpm workflow:cycle:watch   # Watch files and run feedback loop on changes

# Monitoring and reporting
pnpm workflow:test          # Run workflow-specific e2e tests
pnpm workflow:report        # Generate detailed test reports
pnpm workflow:feedback      # Run cycle with success/failure feedback
````

### How Full Automation Works

The fully automated system uses AI-powered analysis and fixing:

1. **AI Error Analysis**: Uses `@repo/ai` package to intelligently analyze TypeScript errors, eslint
   issues, and test failures
2. **Automatic Code Fixing**: Applies intelligent fixes using pattern recognition and AI suggestions
3. **Continuous Feedback Loop**: Repeats the cycle until all tests pass or maximum retries reached
4. **Real-time Monitoring**: Watches files for changes and triggers automated fixing

### Automation Flow

```
Code Change → TypeScript Check → AI Analysis → Auto Fix → Lint → Test → ✅ Success
     ↑                                                                      ↓
     ← ← ← ← ← ← ← ← ← ← ← Retry if Failed ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Usage Examples

```bash
# Start fully automated development with live server
cd apps/backstage
pnpm workflow:auto-dev

# Single automated fix and test cycle
pnpm workflow:ultimate

# Continuous retry until everything passes (for CI/CD)
pnpm workflow:auto-repeat
```

The system automatically handles:

- TypeScript compilation errors
- Missing type definitions
- API compatibility issues
- Test assertion failures
- Code style violations

## Autonomous Workflow Development and Repair System

The backstage app includes a comprehensive autonomous workflow development system that can generate,
test, and repair Upstash workflow code without human intervention. This system leverages Claude CLI
for intelligent code generation and repair.

### Autonomous System Commands

```bash
# Core autonomous commands (run from apps/backstage)
pnpm autonomous              # Show help and available commands
pnpm autonomous:process      # Process workflow with standard loop
pnpm autonomous:zhi          # Execute Zero-Human-Intervention protocol
pnpm autonomous:zhi:rapid    # Quick prototype generation
pnpm autonomous:zhi:reliable # High-reliability workflow generation
pnpm autonomous:protocols    # List available protocols
pnpm autonomous:metrics      # View system learning metrics
```

### Zero-Human-Intervention (ZHI) Protocols

The system provides three ZHI protocols for different use cases:

1. **Standard Workflow** (`standard-workflow`)

   - Complete autonomous development from specification to deployment
   - Includes code generation, testing, repair, Git commits, and PR creation
   - Maximum 15 iterations, 30-minute timeout
   - Best for production-ready workflows

2. **Rapid Prototype** (`rapid-prototype`)

   - Quick workflow generation with relaxed validation
   - Basic functionality testing only
   - Single repair attempt if needed
   - 15-minute timeout
   - Best for proof-of-concepts and demos

3. **High Reliability** (`high-reliability`)
   - Extensive validation and testing for critical workflows
   - Security scanning and performance benchmarks
   - Quality gates and staging deployment
   - 60-minute timeout
   - Best for mission-critical workflows

### Workflow Specification Format

To use the autonomous system, define a workflow specification:

```typescript
const workflowSpec = {
  name: 'my-workflow',
  description: 'Process customer orders',
  type: 'data-processing', // optional: general|data-processing|api-integration|notification|scheduled
  inputContract: {
    type: 'object',
    properties: {
      orderId: { type: 'string' },
      items: { type: 'array' },
    },
    required: ['orderId', 'items'],
  },
  outputContract: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      processedAt: { type: 'string' },
    },
  },
  businessLogic: [
    'Validate order data',
    'Check inventory availability',
    'Process payment',
    'Update order status',
    'Send confirmation email',
  ],
  errorHandling: [
    'Retry failed operations up to 3 times',
    'Send to dead letter queue on permanent failure',
    'Alert operations team for critical errors',
  ],
  performance: {
    timeout: 300000, // 5 minutes
    retries: 3,
  },
};
```

### Autonomous Development Process

The autonomous system follows this process:

1. **Specification Validation**: Ensures the workflow spec is complete
2. **Code Generation**: Uses Claude CLI to generate implementation and tests
3. **Test Execution**: Runs Vitest unit tests and Playwright E2E tests
4. **Error Analysis**: Categorizes failures and determines repair strategies
5. **AI-Powered Repair**: Applies targeted fixes using Claude CLI
6. **Iteration**: Repeats until tests pass or limits reached
7. **Git Operations**: Commits code and creates pull requests
8. **CI/CD Integration**: Triggers deployment pipelines

### Self-Learning Capabilities

The system includes machine learning features:

- **Pattern Recognition**: Identifies common error patterns
- **Strategy Optimization**: Learns which repair strategies work best
- **Success Prediction**: Estimates likelihood of successful generation
- **Performance Tracking**: Monitors improvement over time

Learning data is stored in `data/autonomous-learning/` and includes:

- Error patterns and successful fixes
- Repair strategy performance metrics
- Workflow complexity analysis
- Time-to-completion statistics

### Claude CLI Integration

The system uses Claude CLI programmatically:

- **Non-interactive mode**: Uses `-p` flag with prompt files
- **Model selection**: Uses Claude Opus for highest quality
- **Temperature control**: Lower temperature (0.2) for consistent code
- **Output management**: Parses generated files automatically

### Example Usage

```bash
# Generate a simple workflow
cd apps/backstage
cat > workflow-spec.json << EOF
{
  "name": "hello-workflow",
  "description": "Simple greeting workflow",
  "inputContract": {
    "type": "object",
    "properties": {
      "name": { "type": "string" }
    },
    "required": ["name"]
  },
  "outputContract": {
    "type": "object",
    "properties": {
      "greeting": { "type": "string" }
    }
  },
  "businessLogic": [
    "Validate input name",
    "Generate personalized greeting",
    "Return greeting message"
  ]
}
EOF

# Process with standard protocol
pnpm autonomous:zhi < workflow-spec.json

# Or use rapid prototyping
pnpm autonomous:zhi:rapid < workflow-spec.json
```

### Monitoring and Metrics

View system performance and learning progress:

```bash
pnpm autonomous:metrics
```

This shows:

- Total workflows processed
- Success rate trends
- Common error patterns
- Strategy effectiveness
- Learning rate improvements

### CI/CD Integration

The autonomous system can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/autonomous-workflow.yml
name: Autonomous Workflow Generation
on:
  workflow_dispatch:
    inputs:
      specification:
        description: 'Workflow specification JSON'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install
      - name: Run autonomous generation
        run: |
          echo '${{ github.event.inputs.specification }}' > spec.json
          cd apps/backstage
          pnpm autonomous:zhi < spec.json
```

### Best Practices

1. **Start with simple specifications** and gradually add complexity
2. **Use rapid prototype mode** for initial development
3. **Switch to high-reliability mode** for production workflows
4. **Monitor learning metrics** to track system improvement
5. **Review generated code** before production deployment
6. **Contribute patterns** back to the learning system

# CLI Usage Notes:

# - ESLint: Use `eslint . --fix` in apps/packages (the . is required, --fix auto-fixes issues)

# - TypeScript: Use `tsc --noEmit --emitDeclarationOnly false` for type checking

# - Prettier: Run at repo root only with `pnpm prettier`

# Building (see Environment Variables section for Doppler details)

pnpm build # Production build with Doppler pnpm build:local # Local build using .env.local files
pnpm build --filter=app # Build specific app

# Database operations

pnpm migrate # Run Prisma migrations (uses Doppler) pnpm --filter @repo/database generate #
Regenerate Prisma client pnpm studio # Open Prisma Studio (port 3600)

# Dependency management

pnpm bump-deps # Update all dependencies pnpm madge --circular # Check for circular dependencies

# Other utilities

pnpm clean # Clean all build artifacts (./clean-everything.sh) pnpm translate # Run translations
pnpm analyze # Analyze bundles pnpm boundaries # Check module boundaries

````

## Configuration Standards

All apps and packages must extend their respective shared configurations. Choose the appropriate
config based on the context:

**IMPORTANT**: Always use `"catalog:"` versions in package.json when the dependency exists in the
pnpm-workspace.yaml catalog. If a dependency is NOT in the catalog, use the appropriate version
number (check root package.json or other apps for the version to use).

1. **TypeScript**: Extend from `@repo/typescript-config`

   ```json
   {
     "extends": "@repo/typescript-config/base.json" // or nextjs.json, react-library.json, etc.
   }
````

2. **ESLint**: Extend from `@repo/eslint-config` - choose the right config:

   - `base` - for Node.js packages
   - `next` - for Next.js apps
   - `react-internal` - for internal React packages
   - `react-library` - for publishable React libraries

   ```js
   import baseConfig from '@repo/eslint-config/next'; // Choose appropriate config
   export default [...baseConfig];
   ```

3. **Next.js**: Import and use `@repo/next-config`

   ```js
   import config from '@repo/next-config';
   export default config(/* your config */);
   ```

4. **Vitest**: Extend from `@repo/testing` configs:
   - Use `config/next.ts` for Next.js apps
   - Use `config/react.ts` for React packages
   - Use `config/node.ts` for Node.js packages
   ```js
   import { defineConfig } from 'vitest/config';
   import baseConfig from '@repo/testing/config/next'; // Choose appropriate config
   export default defineConfig({
     ...baseConfig,
     // your overrides
   });
   ```

Always select the most specific configuration that matches your package/app type for optimal
settings.

## Task Management

**IMPORTANT**: Use the TodoWrite and TodoRead tools to track your work:

- Create a todo list at the start of any multi-step task
- Update task status as you progress (pending → in_progress → completed)
- This helps maintain context and ensures all steps are completed

## Code Style Guidelines

1. **TypeScript Usage**

   - Always use TypeScript (.ts/.tsx files)
   - Define proper types/interfaces (no `any` except when absolutely necessary)
   - Use `_` prefix for unused variables (per ESLint config)
   - Environment variables: Use `@t3-oss/env-nextjs` without explicit ReturnType
   - **IMPORTANT**: When creating new files or updating existing code, ensure all code is
     type-accurate:
     - **Prefer types from dependency packages** (e.g.,
       `import type { User } from '@prisma/client'`,
       `import type { NotificationData } from '@mantine/notifications'`)
     - Import and use existing types from the codebase when dependency types aren't available
     - Create proper interfaces/types for new data structures only when necessary
     - Avoid type assertions unless absolutely necessary
     - Leverage TypeScript's type inference where appropriate
     - Run `pnpm typecheck` to verify type accuracy before committing

2. **React/Next.js**

   - Use React 19.1.0 and Next.js 15.4.0 (canary) features
   - Follow Next.js App Router conventions
   - Use server components by default, client components only when needed
   - Always optimize images using Next.js `Image` component
   - Server actions for form handling
   - Parallel routes and intercepting routes where appropriate
   - **Use typed routes**: Enable `typedRoutes: true` in `next.config.ts` and use
     `import { Link } from 'next/link'` for type-safe navigation

3. **Imports**

   - Use workspace imports for internal packages: `@repo/*`
   - Use absolute imports from `@/` for app-specific code
   - Group imports logically: external, internal packages, local

4. **Component Structure**

   - One component per file
   - Co-locate related files (styles, tests, types)
   - Use Mantine UI components directly (not through design-system re-exports)
   - Only use design-system for custom/composite components

5. **Styling**
   - **Mantine UI v8** as preferred UI framework for new components
   - **Tailwind CSS v4** (only v4, not v3) allowed for existing components or when specifically
     directed
   - Use Mantine's theme system for consistent styling
   - Use Mantine's color scheme support for dark mode (no `dark` prop)
   - Use responsive props: `{ base: value, sm: value, md: value, lg: value, xl: value }`
   - Avoid inline styles - use Mantine's style props or Tailwind classes

## Testing Guidelines

- **Test Framework**: Vitest with React Testing Library
- **Test Location**: `__tests__` directories in each package/app
- **File Naming**: `*.test.ts(x)` for unit tests, `*.component.test.ts(x)` for component tests
- **Running Tests**:
  ```bash
  pnpm test                    # Run all tests in parallel
  pnpm test --filter=@repo/auth # Test specific package
  pnpm test -- --watch         # Watch mode
  pnpm test -- --coverage      # With coverage report
  ```
- **Test Structure**:
  - Unit tests for utilities and pure functions
  - Integration tests for API routes
  - Component tests with user interactions and Storybook integration
  - Mock external services (database, auth, email)

### Data-TestID Standards

All components in the design system now implement standardized `data-testid` attributes for reliable testing:

- **Component Interface**: Every component includes `'data-testid'?: string` in its props interface
- **Default Values**: Components provide descriptive default testid values (e.g., `'add-to-cart-button'`, `'product-card-large'`)
- **Naming Convention**: Use kebab-case naming that describes the component's function
- **Testing Pattern**: Prefer `getByTestId()` over role-based or text-based selectors for reliability
- **Documentation**: See `/packages/design-system/mantine-ciseco/DATA_TESTID_STANDARDS.md` for complete implementation guide

**Example Implementation:**
```typescript
interface ComponentProps {
  'data-testid'?: string;
  // ... other props
}

const Component = ({ 'data-testid': testId = 'component-name', ...props }) => {
  return <element data-testid={testId} {...props} />
}
```

**Testing Usage:**
```typescript
// Preferred: Reliable data-testid selector
const button = screen.getByTestId('add-to-cart-button');

// Avoid: Brittle text/role selectors that can break
const button = screen.getByRole('button'); // Less reliable
const button = screen.getByText('Add to Cart'); // Breaks with text changes
```

## Git Workflow

1. Create feature branches from `master`
2. Use conventional commit messages with detailed descriptions
3. Never commit sensitive data (API keys, secrets)
4. Always run `pnpm lint` and `pnpm typecheck` before committing

### Commit Message Format

Follow this standardized format for all commits:

```
<type>: <brief description>

<detailed description with bullet points>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

**Example:**

```
feat: complete Headless UI to Mantine migration in mantine-ciseco

Replace all remaining Headless UI components with Mantine equivalents:

- **Transition components** → **Mantine transitions/animations**:
  - AddToCardButton: Remove Transition wrapper, use notification animations
  - HeaderFilterSection: Transition → Collapse component

- **Switch components** → **Mantine Switch**:
  - MySwitch: Headless UI Switch → Mantine Switch with proper sizing
  - SwitchDarkMode2: Switch → Mantine Switch with dark mode integration

All components maintain original styling and UX patterns while leveraging
Mantine's component system for better maintainability.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Guidelines:**

- Use descriptive subject lines (50-72 characters)
- Include bullet points for multiple changes
- Use **bold formatting** for component categories
- Use → arrows to show transformations
- Explain the "why" not just the "what"
- Always include the Claude Code footer

## Mantine UI Guidelines

1. **Theme Configuration**

   - Use MantineProvider with custom theme in root layout
   - Define color schemes for light/dark mode support
   - Use CSS variables for dynamic theming

2. **Component Usage**

   - Import Mantine components directly: `import { Button, Card } from '@mantine/core'`
   - Use Mantine hooks: `useDisclosure`, `useMediaQuery`, etc.
   - Prefer Mantine form hooks over react-hook-form
   - For new work: Use Mantine unless specifically directed to use Tailwind

3. **Dark Mode**

   - Never use `dark` prop (removed in Mantine v8)
   - Use `useMantineColorScheme` hook for color scheme detection
   - Style dark mode with CSS variables or theme functions

4. **Notifications**
   - Use centralized notification configuration from `@repo/notifications/mantine-notifications`
   - Consistent notification styles across all apps

## Internationalization Guidelines

When implementing internationalization in apps:

1. **Dictionary Structure**

   - Use concise property names for better readability
   - **Preferred**: Use `l` for language translations instead of `languages`
   - Example:
     ```json
     {
       "app": {
         "l": {
           "en": "English",
           "fr": "Français",
           "es": "Español"
         }
       }
     }
     ```

2. **Extending Base Dictionaries**

   - Apps should extend the base internationalization package
   - Create app-specific dictionaries in `/src/i18n/dictionaries/`
   - Use `createDictionary` from `@repo/internationalization/extend`

3. **Locale Codes**

   - Use standard locale codes: `en`, `fr`, `es`, `pt`, `de`
   - For regional variants: `fr-CA`, `es-MX`, `pt-BR`
   - The package normalizes locales (e.g., `fr-CA` → `fr`)

4. **Best Practices**
   - All user-facing strings should be in dictionaries
   - Pass dictionary strings as props to client components
   - Use the locale-aware Link component for navigation
   - Implement locale switchers for user control

## Package Architecture & Hierarchy

The packages follow a strict layered architecture to prevent circular dependencies. Each layer can
only depend on packages from lower layers, never from higher layers.

**IMPORTANT: To avoid circular dependencies, packages must only use feature flags at the application
level, not within the package itself. For example, the analytics package should NOT import from
feature-flags package.**

### Layer 1: Foundation Packages (Core Infrastructure)

These packages have no dependencies on other internal packages:

#### Configuration & Build Tools

- `@repo/typescript-config` - Shared TypeScript configurations
- `@repo/eslint-config` - ESLint rules and configurations
- `@repo/next-config` - Next.js configuration wrapper

### Layer 2: Core Services

Low-level services that other packages depend on:

#### Testing & Development

- `@repo/testing` - Vitest configuration and test utilities

#### Security & Infrastructure

- `@repo/security` - Security headers, middleware, and Upstash rate limiting
  - **Rate limiting**: Implemented via `createRateLimiter()` using Upstash Redis
  - **Usage**: `import { createRateLimiter } from '@repo/security/rate-limit'`
  - **Default**: 10 requests per 10 seconds sliding window
  - **No-op fallback**: Works without Redis configuration (returns unlimited limiter)
- `@repo/observability` - Sentry error tracking and monitoring

### Layer 3: Data Management

Core data services:

- `@repo/database` - Prisma ORM with PostgreSQL
  - Type-safe database client
  - Migration management
  - Shared models across apps
  - Seed data utilities

### Layer 4: Core Business Services

Services that implement core functionality:

#### Analytics & Communication

- `@repo/analytics` - Multi-provider analytics (Segment, PostHog, GA) + Feature Flags
  - **Now includes feature flags**: Feature flags are part of analytics since PostHog treats them as
    analytics events
  - **No circular dependencies**: Packages import only types from `@repo/analytics/types/flags`
  - **Usage**: `import { flag, useFlag, getAuthFlags } from '@repo/analytics'`
  - **Local dev**: Use `LOCAL_FLAGS` environment variable to override
- `@repo/email` - Email templates with React Email and Resend
- `@repo/notifications` - Knock (backend) and Mantine (frontend) notifications
  - Backend: Knock integration for transactional notifications
  - Frontend: Mantine notifications with consistent styling
  - Email, in-app, and push notification support
  - Template management

### Layer 5: Business Logic

Higher-level services that compose core services:

#### Authentication & Payments

- `@repo/auth` - Better Auth with organizations, teams, and API keys
  - Organization-based multi-tenancy
  - Role-based permissions (owner, admin, member)
  - API key management
  - Session caching and middleware
  - Impersonation support
- `@repo/payments` - Stripe integration for subscriptions and credits

#### Content & Orchestration

- `@repo/orchestration` - Workflow execution and job processing
- `@repo/seo` - SEO metadata and structured data generation
- `@repo/internationalization` - Multi-language support

### Layer 5.5: Specialized Services

Domain-specific services that may depend on multiple business logic packages:

- `@repo/ai` - AI/LLM integrations and utilities
- `@repo/scraping` - Web scraping utilities
- `@repo/storage` - File storage abstraction

### Layer 6: UI Layer

Frontend packages that consume all other services:

- `@repo/design-system` - Composite UI components

### Layer 7: Applications

End-user applications that consume all packages:

## Dependency Rules

1. **Strict Layering**: Packages can only depend on packages from lower layers
2. **No Circular Dependencies**: A package cannot import from a package that depends on it
3. **Feature Flag Usage**:
   - Feature flags should be used at the application level (Layer 7)
   - Packages provide the functionality, apps control whether it's enabled
   - Example: Analytics package provides tracking, apps use feature flags to enable/disable it
4. **Provider Pattern**: Use providers at the app level to inject feature flag decisions into
   packages

## Applications (Port Assignments)

### Core Applications

- `/apps/web` (Port: 3200) - Marketing website with blog and demo functionality
- `/apps/backstage` (Port: 3300) - Admin panel with user management
- `/apps/workers` (Port: 3400) - Background job processing

### Development Tools

- `/apps/email` (Port: 3500) - Email template preview
- `/apps/studio` (Port: 3600) - Prisma Studio database UI
- `/apps/storybook` (Port: 3700) - Component documentation
- `/apps/documentation` (Port: 3800) - Nextra documentation

## Detailed Package Specifications

### Foundation Layer Packages

#### `@repo/typescript-config`

- Base TypeScript configurations for different contexts
- Strict type checking enabled
- ESM module support
- Configurations: base, nextjs, react-library

#### `@repo/eslint-config`

- Shared ESLint rules
- Prettier integration
- Context-specific configs: base, next, react-internal, react-library

#### `@repo/testing`

- Vitest configuration presets
- React Testing Library setup
- Mock utilities and helpers
- Coverage configuration

### Core Services Layer

#### `@repo/security`

- Security headers middleware
- CSRF protection
- Content Security Policy
- Edge-compatible
- **Upstash rate limiting** via `rate-limit.ts`
  - `createRateLimiter()` function with Redis backend
  - Configurable limits and time windows
  - Graceful fallback when Redis not configured

#### `@repo/observability`

- Sentry error tracking
- Performance monitoring
- Custom error boundaries
- Health check endpoints

### Data & Communication Layer

#### `@repo/database`

See Layer 3 section above for database package details.

#### `@repo/analytics`

See Layer 4 section above for analytics package details.

#### `@repo/notifications`

See Layer 4 section above for notifications package details.

### Business Logic Layer

#### `@repo/auth`

See Layer 5 section above for auth package details.

#### `@repo/payments`

- Stripe integration
- Subscription management
- Usage-based billing (AI credits)
- Webhook handling
- Payment method management
- Invoice generation

#### `@repo/orchestration`

- Workflow execution engine
- QStash integration for distributed processing
- Event-driven architecture
- Retry and error handling
- Progress tracking

### UI Layer

#### `@repo/design-system`

- Composite UI components
- Custom auth components (sign-in, user-button)
- Admin components (user-list, organization-detail)
- Form handling utilities
- Theme provider configuration

## Environment Variables

- Never commit `.env` files
- Use `.env.local` for local development
- All environment variables should be properly typed in `env.ts`
- **CRITICAL**: `env.ts` files MUST be in the package/app root directory, NEVER in `src/`
- Use `@t3-oss/env-nextjs` for validation
- Each app has its own `env.ts` with required variables
- Keys functions should NOT use explicit ReturnType annotations

## Security

1. Always validate user input
2. Use CSRF protection
3. Implement proper authentication/authorization
4. Security headers via `@repo/security`

## Performance

1. Optimize bundle size
2. Use dynamic imports for code splitting
3. Implement proper caching strategies
4. Monitor performance with `@repo/observability`
5. Use Mantine's built-in performance optimizations

## Common Patterns

### API Routes with Better Auth

```typescript
// Protected API route example
import { auth } from '@repo/auth/server';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Handle request...
}
```

### Database Queries

```typescript
// Use the shared database client
import { database } from '@repo/database';

const users = await database.user.findMany({
  where: { organizationId: session.session.activeOrganizationId },
});
```

### Protected Pages

```typescript
// Use middleware for route protection
import { authMiddleware } from '@repo/auth/middleware';
export const middleware = authMiddleware;
```

### Mantine Notifications

```typescript
// Use centralized notification system
import { notify } from '@repo/notifications/mantine-notifications';

// Success notification
notify.success('Operation completed successfully');

// Error notification
notify.error('Something went wrong', { title: 'Error' });
```

## Debugging Common Issues

1. **Module not found errors**: Ensure packages have `"type": "module"` and use `@repo/*` imports
2. **Type errors**: Run `pnpm typecheck` and ensure Prisma client is generated
3. **Auth issues**: Verify environment variables and Better Auth configuration
4. **Build failures**: Check for circular dependencies with `pnpm madge --circular`
5. **Test failures**: Ensure test setup files are imported and mocks are configured
6. **Dark mode issues**: Remove `dark` prop, use Mantine's color scheme system

## Documentation References

The monorepo documentation is located in `/apps/documentation`. Here are direct links to all
documentation files:

### Getting Started

- **Overview**: `/apps/documentation/content/en/docs/get-started/index.mdx`
- **Architecture**: `/apps/documentation/content/en/docs/architecture/index.mdx`
- **Concepts**: `/apps/documentation/content/en/docs/concepts/index.mdx` - Common patterns, files
  (keys.ts, env.ts), conventions
- **Design System**: `/apps/documentation/content/en/docs/design-system/index.mdx`
- **Authentication**: `/apps/documentation/content/en/docs/auth/index.mdx`
- **Email**: `/apps/documentation/content/en/docs/email/index.mdx`
- **Workflows**: `/apps/documentation/content/en/docs/workflows/index.mdx`
- **Deployment**: `/apps/documentation/content/en/docs/deployment/index.mdx`

### Applications Documentation

- **Web App**: `/apps/documentation/content/en/docs/apps/web.mdx`
- **Backstage Admin**: `/apps/documentation/content/en/docs/apps/backstage.mdx`
- **Workers**: `/apps/documentation/content/en/docs/apps/workers.mdx`
- **Email Preview**: `/apps/documentation/content/en/docs/apps/email.mdx`
- **Prisma Studio**: `/apps/documentation/content/en/docs/apps/studio.mdx`
- **Storybook**: `/apps/documentation/content/en/docs/apps/storybook.mdx`
- **Documentation**: `/apps/documentation/content/en/docs/apps/documentation.mdx`

### Package Documentation

#### Core Infrastructure

- **TypeScript Config**: `/apps/documentation/content/en/docs/packages/typescript-config.mdx`
- **ESLint Config**: `/apps/documentation/content/en/docs/packages/config-eslint.mdx`
- **Next.js Config**: `/apps/documentation/content/en/docs/packages/next-config.mdx`
- **Config**: `/apps/documentation/content/en/docs/packages/config.mdx`
- **Testing**: `/apps/documentation/content/en/docs/packages/testing.mdx`

#### Data & Storage

- **Database**: `/apps/documentation/content/en/docs/packages/database.mdx`
- **Storage**: `/apps/documentation/content/en/docs/packages/storage.mdx`

#### Authentication & Security

- **Auth**: `/apps/documentation/content/en/docs/packages/auth.mdx`
- **Security**: `/apps/documentation/content/en/docs/packages/security.mdx`

#### Analytics & Monitoring

- **Analytics**: `/apps/documentation/content/en/docs/packages/analytics.mdx`
- **Observability**: `/apps/documentation/content/en/docs/packages/observability.mdx`

#### Communication

- **Email**: `/apps/documentation/content/en/docs/packages/email.mdx`
- **Notifications**: `/apps/documentation/content/en/docs/packages/notifications.mdx`

#### Business Logic

- **Payments**: `/apps/documentation/content/en/docs/packages/payments.mdx`
- **Orchestration**: `/apps/documentation/content/en/docs/packages/orchestration.mdx`
- **AI**: `/apps/documentation/content/en/docs/packages/ai.mdx`
- **Scraping**: `/apps/documentation/content/en/docs/packages/scraping.mdx`

#### UI & Content

- **Design System**: `/apps/documentation/content/en/docs/packages/design-system.mdx`
- **Internationalization**: `/apps/documentation/content/en/docs/packages/internationalization.mdx`
- **SEO**: `/apps/documentation/content/en/docs/packages/seo.mdx`

### Advanced Topics

- **Code Highlighting**: `/apps/documentation/content/en/docs/advanced/code-highlighting.mdx`
- **Advanced Features**: `/apps/documentation/content/en/docs/advanced/index.mdx`

### Reference Example

- **Nextra Example**: `/apps/documentation/content/en/docs/nextra-complete-example.mdx`
