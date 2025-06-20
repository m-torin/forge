# Mantine Ciseco for Next.js 15

This package provides a flexible approach for using Ciseco components in Next.js 15 applications
with internationalization support. Components can work as both server and client components
depending on your needs.

## Key Features

- ✅ Hybrid approach: Server components where possible, client components when needed
- ✅ Automatic locale detection from URL params or context
- ✅ No component renaming - use original component names
- ✅ Flexible usage patterns for different scenarios
- ✅ Next.js 15 async params support

## Usage Patterns

### Pattern 1: Server Layout with Client Components (Recommended)

This is the recommended approach for most applications. Use the `LocaleWrapper` to provide locale
context to client components:

```tsx
// app/[locale]/layout.tsx
import { LocaleWrapper } from '@repo/design-system/mantine-ciseco';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <LocaleWrapper locale={locale}>
          {/* All child components can now use useLocalizeHref() */}
          <Header2 />
          <main>{children}</main>
          <Footer />
        </LocaleWrapper>
      </body>
    </html>
  );
}
```

### Pattern 2: Direct Locale Passing (For Pure Server Components)

For components that don't use client-side features, you can create server wrappers:

```tsx
// components/ServerFooter.tsx
import { Footer } from '@repo/design-system/mantine-ciseco';
import { serverLocalizeHref } from '@repo/design-system/mantine-ciseco';

export default function ServerFooter({ locale }: { locale: string }) {
  // Override the href behavior for server rendering
  // This would require modifying the Footer component to accept a localizeHref prop
  return <Footer />;
}
```

### Pattern 3: Mixed Server/Client Pages

```tsx
// app/[locale]/page.tsx
import {
  SectionPromo1,
  SectionGridFeatureItems,
  LocaleWrapper,
} from '@repo/design-system/mantine-ciseco';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const products = await getProducts(); // Server-side data fetching

  return (
    <LocaleWrapper locale={locale}>
      <SectionPromo1 />
      <SectionGridFeatureItems data={products} />
    </LocaleWrapper>
  );
}
```

## Available Utilities

### Client-Side Hooks

```tsx
import { useLocalizeHref, useLocale } from '@repo/design-system/mantine-ciseco';

function MyComponent() {
  const locale = useLocale(); // Gets current locale
  const localizeHref = useLocalizeHref(); // Returns localization function

  return <a href={localizeHref('/products')}>Products</a>;
}
```

### Server-Side Utilities

```tsx
import { serverLocalizeHref, extractLocaleFromPathname } from '@repo/design-system/mantine-ciseco';

// In server components or middleware
const localizedPath = serverLocalizeHref('/products', 'en'); // '/en/products'
const locale = extractLocaleFromPathname('/en/products'); // 'en'
```

## Component Behavior

### Client Components (with 'use client')

These components use `useLocalizeHref()` hook and must be wrapped in `LocaleWrapper`:

- Navigation
- Header, Header2
- Footer
- Most interactive components

### Server-Compatible Components

These components can be used without LocaleWrapper:

- Static display components
- Components without navigation links
- Pure presentational components

## Migration from Previous Versions

If you were using separate client/server components, you can now use the original components:

```tsx
// Before
import { ServerHeader2 } from '@repo/design-system/mantine-ciseco/server';
<ServerHeader2 locale={locale} />;

// After
import { Header2, LocaleWrapper } from '@repo/design-system/mantine-ciseco';
<LocaleWrapper locale={locale}>
  <Header2 />
</LocaleWrapper>;
```

## Best Practices

1. **Wrap at the highest level**: Place `LocaleWrapper` in your layout to provide locale to all
   child components
2. **Server-first approach**: Use server components where possible for better performance
3. **Explicit locale passing**: For server-only components, consider passing locale as a prop
4. **Type safety**: All utilities are fully typed with TypeScript

## Examples

### Complete Layout Example

```tsx
// app/[locale]/layout.tsx
import { LocaleWrapper, Header2, Footer } from '@repo/design-system/mantine-ciseco';
import { getDictionary } from '@/i18n';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <LocaleWrapper locale={locale}>
      <div className="min-h-screen">
        <Header2 />
        <main className="container mx-auto">{children}</main>
        <Footer />
      </div>
    </LocaleWrapper>
  );
}
```

### Dynamic Route Example

```tsx
// app/[locale]/products/[id]/page.tsx
import { ProductQuickView, LocaleWrapper } from '@repo/design-system/mantine-ciseco';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const product = await getProduct(id);

  return (
    <LocaleWrapper locale={locale}>
      <ProductQuickView product={product} />
    </LocaleWrapper>
  );
}
```

## Troubleshooting

### "useLocalizeHref is not a function" error

Make sure the component is wrapped in `LocaleWrapper`:

```tsx
<LocaleWrapper locale={locale}>
  <YourComponent />
</LocaleWrapper>
```

### Hydration mismatches

Ensure locale is consistent between server and client by using the same source (URL params).

### Components not using correct locale

Check that `LocaleWrapper` is placed high enough in the component tree to cover all components that
need locale access.
