# @repo/config

- _Can build:_ **NO**

- _Exports:_
  - **Config**: `./next`, `./typescript`, `./prettier`, `./knip`
  - **Utilities**: `./keys`

- _AI Hints:_

  ```typescript
  // Primary: Shared configuration for Next.js, TypeScript, Prettier, Knip
  // Next: import { config, withAnalyzer } from "@repo/config/next"
  // TS: "extends": ["@repo/config/typescript/base"]
  // Prettier: import prettierConfig from "@repo/config/prettier"
  // ❌ NEVER: Duplicate config setup - extend from @repo/config
  ```

- _Key Features:_
  - **Next.js Configuration**: Optimized monorepo setup with Prisma plugin,
    bundle analyzer, PostHog rewrites
  - **TypeScript Configs**: Base, Next.js, React library, Cloudflare Worker
    configurations
  - **Prettier Integration**: Organized imports, package.json formatting,
    Tailwind sorting
  - **Knip Configuration**: Dependency analysis for monorepo, Next.js apps, and
    packages
  - **Webpack Optimization**: External package handling, Node.js fallbacks,
    cache configuration

- _Configuration Options:_
  - **TypeScript**: Base, Next.js, React library, Cloudflare Worker targets
  - **Next.js**: Bundle analyzer, Prisma plugin, PostHog analytics, image
    optimization
  - **Prettier**: Organize imports, package.json formatting, shell script
    formatting
  - **Knip**: Unused dependency detection, entry point analysis, workspace
    support

- _Quick Setup:_

  ```typescript
  // Next.js configuration
  import { config, withAnalyzer, mergeConfig } from "@repo/config/next";

  export default withAnalyzer(
    mergeConfig(config, {
      experimental: {
        serverComponentsExternalPackages: ["my-package"]
      }
    })
  );

  // TypeScript configuration (tsconfig.json)
  {
    "extends": "@repo/config/typescript/nextjs",
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./app/*"]
      }
    }
  }

  // Prettier configuration
  import prettierConfig from "@repo/config/prettier";
  export default prettierConfig;
  ```

- _Environment Variables:_

  ```bash
  # Bundle analyzer
  ANALYZE=true # Enable bundle analysis
  
  # Node environment
  NODE_ENV=development # or production
  
  # PostHog (automatically configured)
  # Rewrites configured for: /ingest/*, /ingest/decide
  ```

- _TypeScript Configurations:_
  - **base.json**: ES2024, strict mode, ESM, bundler resolution
  - **nextjs.json**: Next.js App Router, JSX, DOM types
  - **react-library.json**: React library development
  - **cloudflare.json**: Cloudflare Workers runtime

- _Build Optimizations:_
  - **Prisma Plugin**: Monorepo Prisma client generation
  - **Package Optimization**: Mantine core and hooks pre-bundled
  - **External Packages**: Prisma, database, observability packages excluded
    from client
  - **Image Optimization**: AVIF/WebP formats, Pexels/Unsplash domains
  - **Bundle Analysis**: Webpack bundle analyzer integration

- _Documentation:_ **[Config Package](../../apps/docs/packages/config/)**
