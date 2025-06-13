import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

import { AppLayout, AppLayoutProvider } from '@/components/layout';
import { getNavigationRoutes } from '@/data/navigation';
import { getDictionary } from '@/i18n';
import { createMetadata, viewportPresets } from '@repo/seo/server/next';

import { Providers } from './providers';

import { Metadata, Viewport } from 'next';

import '@/styles/globals.css';

// Export viewport configuration for mobile SEO
export const viewport: Viewport = viewportPresets.default;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const currentUrl = `${baseUrl}/${locale}`;

  return createMetadata({
    title: dict.app?.brand || 'Web Template',
    description: dict.app?.appDescription || 'Web Template Application',
    applicationName: dict.app?.brand || 'Web Template',
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    alternates: {
      canonical: currentUrl,
      languages: {
        en: `${baseUrl}/en`,
        es: `${baseUrl}/es`,
        fr: `${baseUrl}/fr`,
        de: `${baseUrl}/de`,
        pt: `${baseUrl}/pt`,
      },
    },
    openGraph: {
      locale: locale,
      alternateLocale: ['en', 'es', 'fr', 'de', 'pt'].filter((l) => l !== locale),
    },
  });
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
