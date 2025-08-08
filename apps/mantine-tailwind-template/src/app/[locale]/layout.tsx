import { ErrorBoundary } from '#/components/ErrorBoundary';
import { ResponsiveLayout } from '#/components/ResponsiveLayout';
import { SidebarProvider } from '#/components/SidebarProvider';
import { routing } from '#/i18n/routing';
import { getDictionary, type Locale } from '#/lib/i18n';
import { createBaseMetadata, createWebsiteStructuredData } from '#/lib/seo';
import { hasLocale, setRequestLocale } from '@repo/internationalization/server/next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Providers } from './providers';

type Props = {
  children: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
  auth: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  // Use SEO manager for enhanced metadata
  const baseMetadata = createBaseMetadata(locale);

  return {
    ...baseMetadata,
    title: {
      template: `%s | ${dict.meta.title}`,
      default: dict.meta.title,
    },
    description: dict.meta.description,
    alternates: {
      ...baseMetadata.alternates,
      canonical: `/${locale}`,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
      locale:
        locale === 'en'
          ? 'en_US'
          : locale === 'es'
            ? 'es_ES'
            : locale === 'de'
              ? 'de_DE'
              : locale === 'fr'
                ? 'fr_FR'
                : locale === 'pt'
                  ? 'pt_PT'
                  : 'en_US',
    },
    twitter: {
      ...baseMetadata.twitter,
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function LocaleLayout({ children, main, sidebar, auth, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  return (
    <Providers locale={locale}>
      <ErrorBoundary>
        <SidebarProvider>
          <ResponsiveLayout sidebar={sidebar} auth={auth}>
            {main || children}
          </ResponsiveLayout>
          <LocaleStructuredData params={params} />
        </SidebarProvider>
      </ErrorBoundary>
    </Providers>
  );
}

// Component to add locale-specific structured data
async function LocaleStructuredData({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const websiteSchema = createWebsiteStructuredData(locale);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema),
      }}
    />
  );
}
