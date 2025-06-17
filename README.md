# forge

**Production-grade Turborepo template for Next.js apps.**

<div>
  <img src="https://img.shields.io/npm/dy/forge" alt="" />
  <img src="https://img.shields.io/npm/v/forge" alt="" />
  <img src="https://img.shields.io/github/license/haydenbleasel/forge" alt="" />
</div>

[forge](https://github.com/haydenbleasel/forge) is a [Next.js](https://nextjs.org/) project
boilerplate for modern web application. It is designed to be a comprehensive starting point for new
apps, providing a solid, opinionated foundation with a minimal amount of configuration.

Clone the repo using:

```sh
npx forge@latest init
```

Then read the [docs](https://docs.forge.com) for more information.

## Apps and Port Assignments

This repository contains the following applications:

- **web** (Marketing Website) - Port **3200**
  - Public marketing site with SEO optimization and demo functionality
- **backstage** (Admin Panel) - Port **3300**
  - Admin dashboard for user and organization management
- **workers** (Worker Service) - Port **3400**
  - Background job processing and workflow management
- **email** (Email Service) - Port **3500**
  - React Email development server
- **studio** (Prisma Studio) - Port **3600**
  - Database management interface
- **storybook** (Component Library) - Port **3700**
  - UI component development and documentation
- **docs** (Documentation) - Port **3800**
  - Mintlify documentation site

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all apps in development mode
pnpm dev

# Run a specific app
pnpm dev --filter=app
```

<a href="https://github.com/haydenbleasel/forge/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=haydenbleasel/forge" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
