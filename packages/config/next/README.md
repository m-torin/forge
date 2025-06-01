# @repo/next-config

Shared Next.js configuration for the Forge Ahead monorepo.

## Features

### Statically Typed Links

This configuration enables Next.js's experimental typed routes feature, which provides type safety
when navigating between pages using `next/link`.

When `experimental.typedRoutes` is enabled (which it is by default in this config), Next.js will:

1. Generate a hidden `.d.ts` file in `.next/types` containing information about all existing routes
2. Provide TypeScript feedback in your editor about invalid links
3. Prevent typos and other errors when using `next/link`

### Usage with next/link

```tsx
import type { Route } from 'next';
import Link from 'next/link'

// ✅ No TypeScript errors if href is a valid route
<Link href="/about" />
<Link href="/blog/nextjs" />
<Link href={`/blog/${slug}`} />
<Link href={('/blog' + slug) as Route} />

// ❌ TypeScript errors if href is not a valid route
<Link href="/aboot" /> // Error: Type '"/aboot"' is not assignable to type 'Route'
```

### Custom Components

To accept href in a custom component wrapping `next/link`, use a generic:

```tsx
import type { Route } from 'next';
import Link from 'next/link';

function Card<T extends string>({ href }: { href: Route<T> | URL }) {
  return (
    <Link href={href}>
      <div>My Card</div>
    </Link>
  );
}
```

### Requirements

- TypeScript must be enabled in your project
- The feature works with both `next dev` and `next build`
- TypeScript compiler will check the generated `.d.ts` file and provide feedback

### Other Features

- **Image Optimization**: Configured with AVIF and WebP formats
- **Prisma Integration**: Includes Prisma monorepo workaround plugin for server-side builds
- **Analytics Support**: Includes bundle analyzer for build analysis
- **PostHog Integration**: Configured rewrites for PostHog analytics
- **OpenTelemetry**: Configured to ignore OpenTelemetry instrumentation warnings

## Usage

```typescript
import { config } from '@repo/next-config';

// Use the config directly
export default config;

// Or extend it
import type { NextConfig } from 'next';

const myConfig: NextConfig = {
  ...config,
  // your custom configuration
};

export default myConfig;
```

### With Bundle Analyzer

```typescript
import { config, withAnalyzer } from '@repo/next-config';

const finalConfig = process.env.ANALYZE === 'true' ? withAnalyzer(config) : config;

export default finalConfig;
```
