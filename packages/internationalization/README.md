# @repo/internationalization

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Middleware**: `./middleware`
  - **Navigation**: `./navigation`
  - **Routing**: `./routing`
  - **Request**: `./request`
  - **Types**: `./types`

- _AI Hints:_

  ```typescript
  // Primary: Next.js App Router i18n with next-intl v4
  import { createMiddleware } from "next-intl/middleware";
  import { routing } from "@/i18n/routing";
  import { getTranslations } from "@repo/internationalization/server/next";
  import { Link, useRouter } from "@repo/internationalization/client/next";
  // ❌ NEVER: Hardcode strings or ignore locale routing
  ```

- _Key Features:_
  - **next-intl v4**: Full compatibility with next-intl v4 features
  - **Next.js App Router**: Built for App Router with static rendering support
  - **Type-Safe Routing**: Centralized routing configuration with TypeScript
    support
  - **Dictionary System**: Type-safe dictionary loading with automatic fallbacks
    to English
  - **Automated Translation**: AI-powered translation generation with Languine
  - **Locale-Aware Navigation**: Link, redirect, and router with automatic
    locale handling
  - **5 Supported Languages**: English (default), Spanish, French, German,
    Portuguese
  - **SEO Support**: Automatic alternate links generation for better SEO
  - **Advanced Features**: Domain-based routing and pathname localization ready

- _Supported Locales:_
  - `en` (English - default), `es` (Spanish), `fr` (French), `de` (German), `pt`
    (Portuguese)

- _Environment Variables:_

  ```bash
  # Optional - for automated AI translations
  DEEPSEEK_API_KEY=your_deepseek_api_key
  
  # Environment detection
  NODE_ENV=development
  NEXT_PUBLIC_NODE_ENV=development
  ```

- _Quick Setup:_

  ```typescript
  // 1. Create routing configuration (src/i18n/routing.ts)
  export { routing, locales, type Locale } from '@repo/internationalization/routing';

  // 2. Middleware setup (middleware.ts)
  import createMiddleware from 'next-intl/middleware';
  import { routing } from '#/i18n/routing';

  export default createMiddleware(routing);
  export const config = {
    matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/']
  };

  // 3. Layout with static rendering (app/[locale]/layout.tsx)
  import { setRequestLocale, hasLocale } from '@repo/internationalization/server/next';
  import { routing } from '#/i18n/routing';
  import { notFound } from 'next/navigation';

  export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
  }

  export default async function LocaleLayout({ params }) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);
    // ...
  }

  // 4. Server component usage
  import { getTranslations } from "@repo/internationalization/server/next";
  export default async function Page() {
    const t = await getTranslations('HomePage');
    return <h1>{t('title')}</h1>;
  }

  // 5. Client component with navigation
  import { Link, useRouter, usePathname } from "@repo/internationalization/client/next";
  import { useTranslations } from "@repo/internationalization/client/next";

  export default function Navigation() {
    const t = useTranslations('Navigation');
    const router = useRouter();
    const pathname = usePathname();

    return (
      <>
        <Link href="/products">{t('products')}</Link>
        <button onClick={() => router.replace(pathname, { locale: 'es' })}>
          Español
        </button>
      </>
    );
  }
  ```

- _Dictionary Structure:_

  ```json
  {
    "common": { "locale": "English", "language": "Language" },
    "web": {
      "global": { "primaryCta": "Book a call" },
      "header": { "home": "Home", "product": { "title": "Product" } },
      "home": { "meta": { "title": "Transform Your Business" } }
    }
  }
  ```

- _Automated Translation:_

  ```bash
  # Generate translations using Languine AI
  pnpm translate
  ```

- _Documentation:_
  - **[Internationalization Package](../../apps/docs/packages/internationalization.mdx)**
  - **[next-intl v4 Documentation](https://next-intl-docs.vercel.app/)**
