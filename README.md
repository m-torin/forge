# Forge

**Enterprise-grade monorepo template for building production-ready Next.js
applications.**

Forge is a comprehensive, batteries-included monorepo that provides everything
you need to build, deploy, and scale modern web applications. Built on Next.js
15, React 19, and TypeScript with a focus on developer experience, type safety,
and production readiness.

## ✨ What's Included

### 🏗️ **Architecture**

- **Turborepo** - Optimized monorepo with intelligent caching and parallel
  execution
- **TypeScript** - Full type safety across all packages and applications
- **ESM modules** - Modern JavaScript with Node.js 22+ native TypeScript support
- **Layered packages** - 7-layer architecture preventing circular dependencies

### 🚀 **Applications**

- **Documentation** ([Mintlify](https://mintlify.com)) - Comprehensive docs with
  AI optimization
- **Email Preview** ([React Email](https://react.email)) - Email template
  development
- **Component Library** ([Storybook](https://storybook.js.org)) - UI component
  showcase
- **Database Studio** ([Prisma Studio](https://www.prisma.io/studio)) - Database
  management

### 📦 **Core Packages**

| Package               | Description                    | Key Technologies                        |
| --------------------- | ------------------------------ | --------------------------------------- |
| `@repo/auth`          | Authentication & authorization | Better Auth, organizations, API keys    |
| `@repo/database`      | Multi-provider database layer  | Prisma, PostgreSQL, Redis, Firestore    |
| `@repo/qa`            | Enterprise testing framework   | Vitest, Playwright, comprehensive mocks |
| `@repo/analytics`     | Multi-provider analytics       | PostHog, Vercel Analytics, Segment      |
| `@repo/payments`      | Subscription & billing         | Stripe integration                      |
| `@repo/email`         | Transactional emails           | React Email, Resend                     |
| `@repo/uix-system`    | UI components & themes         | Mantine v8, Tailwind CSS v4             |
| `@repo/observability` | Monitoring & error tracking    | Sentry, OpenTelemetry                   |

### 🛠️ **Developer Experience**

- **Environment Management** - SafeEnv pattern with Zod validation
- **Code Quality** - ESLint, Prettier, TypeScript strict mode
- **Testing** - Unit, integration, and E2E testing with coverage
- **Build System** - Optimized builds with type checking and linting
- **Git Hooks** - Pre-commit checks ensuring code quality

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** - Required for ESM and native TypeScript support
- **pnpm 10.6.3+** - Package manager (required for workspace support)
- **PostgreSQL** - Database (local or hosted)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/forge.git
cd forge

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up database
pnpm migrate

# Start all applications
pnpm dev
```

### Applications & Services

| App Name  | Summary                                      | Port |
| --------- | -------------------------------------------- | ---- |
| Email     | React Email template development and preview | 3500 |
| Studio    | Prisma Studio database management interface  | 3600 |
| Storybook | UI component development and showcase        | 3700 |
| Docs      | Mintlify documentation site                  | 3800 |

## 📚 Documentation

**📖 [Complete Documentation](./apps/docs/)** - Comprehensive guides, API
references, and best practices

### Key Documentation Sections:

- **[Get Started](./apps/docs/repo/quickstart.mdx)** - Quick setup guide
- **[Architecture](./apps/docs/repo/architecture/overview.mdx)** - System design
  and patterns
- **[Package References](./apps/docs/packages/)** - Detailed package
  documentation
- **[Development Guides](./apps/docs/repo/development/overview.mdx)** -
  Workflows and best practices
- **[AI Hints](./apps/docs/ai-hints/)** - AI-optimized development guidance

## 🏗️ Architecture Overview

Forge follows a layered architecture with clear separation of concerns:

```
forge/
├── apps/                    # User-facing applications
│   ├── docs/               # Documentation site
│   ├── email/              # Email preview
│   ├── storybook/          # Component library
│   └── studio/             # Database management
├── packages/               # Shared packages (7 layers)
│   ├── auth/               # Authentication
│   ├── database/           # Database layer
│   ├── qa/                 # Testing framework
│   ├── analytics/          # Analytics
│   └── ...                 # Additional packages
└── scripts/                # Build and utility scripts
```

### Package Layers

1. **Foundation** - TypeScript, ESLint, Next.js configs
2. **Core Services** - QA, Security, Observability
3. **Data** - Database (Prisma)
4. **Business Services** - Analytics, Email, Notifications
5. **Business Logic** - Auth, Payments, Orchestration
6. **Specialized** - AI, Scraping, Storage
7. **UI** - Design System

## 🛠️ Development

### Common Commands

```bash
# Development
pnpm dev               # Run all apps
pnpm dev --filter=docs # Run specific app

# Building
pnpm build         # Build all packages and apps
pnpm build:doppler # Production build with Doppler

# Testing
pnpm test               # Run all tests
pnpm test -- --coverage # Run tests with coverage
pnpm test:ui            # Open Vitest UI

# Code Quality
pnpm typecheck        # TypeScript checking
pnpm lint             # ESLint and Prettier
pnpm madge --circular # Check circular dependencies

# Database
pnpm migrate # Run Prisma migrations
pnpm studio  # Open Prisma Studio
```

### Environment Setup

Forge uses a standardized environment configuration pattern:

```bash
# Required environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/forge"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Optional services
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key"
RESEND_API_KEY="re_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"
```

## 🎯 Key Features

### 🔐 **Authentication & Security**

- Multi-tenant organizations with role-based access
- Social OAuth (Google, GitHub), magic links, passkeys
- API key management with rate limiting
- Admin panel with user management

### 💾 **Database & Storage**

- PostgreSQL with Prisma ORM
- Redis for caching and real-time features
- Firestore for document storage
- Vector database for AI/ML features
- File storage (local or S3-compatible)

### 🧪 **Testing & Quality Assurance**

- Vitest for unit and integration testing
- Playwright for E2E testing
- Comprehensive mocking system
- Performance and accessibility testing
- 90%+ test coverage targets

### 📊 **Analytics & Observability**

- Multi-provider analytics (PostHog, Vercel, Segment)
- Error tracking with Sentry
- Performance monitoring
- Feature flags and A/B testing

### 💳 **Payments & Commerce**

- Stripe integration for subscriptions
- Webhook handling and event processing
- Customer portal and billing management
- Tax calculation and compliance

## 🚦 Best Practices

### Import Patterns

```typescript
// ✅ Correct - Use package imports
import { auth } from "@repo/auth/server/next";
import { render } from "@repo/qa/vitest";

// ❌ Wrong - Don't use deep imports
import { auth } from "@repo/auth/src/server/next";
```

### Environment Variables

```typescript
// ✅ Correct - Use SafeEnv pattern
import { safeEnv } from "@/env";
const env = safeEnv();

// ❌ Wrong - Direct process.env access
const apiKey = process.env.API_KEY;
```

### Testing

```typescript
// ✅ Correct - Use data-testid
<button data-testid="submit-button">Submit</button>

// ✅ Correct - Use QA package utilities
import { render, screen } from '@repo/qa/vitest';
```

## 🤝 Contributing

1. **Read the Documentation** - Start with
   [Development Guide](./apps/docs/repo/development/overview.mdx)
2. **Follow Conventions** - Use existing patterns and code style
3. **Write Tests** - Maintain high test coverage
4. **Update Documentation** - Keep docs current with changes

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Pre-commit hooks enforce standards
- All tests must pass before merge

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

Built with modern tools and frameworks:

- [Next.js](https://nextjs.org/) - React framework
- [Turborepo](https://turbo.build/) - Monorepo build system
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Mantine](https://mantine.dev/) - UI components
- [Vitest](https://vitest.dev/) - Testing framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

**Ready to build something amazing?**
[Get Started](./apps/docs/repo/quickstart.mdx) with Forge today.
