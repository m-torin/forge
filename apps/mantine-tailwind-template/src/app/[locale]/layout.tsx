import { getDictionary, type Locale } from '#/lib/i18n';
import { createBaseMetadata, createWebsiteStructuredData } from '#/lib/seo';
import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
  auth: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
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

export default function LocaleLayout({ children, main, sidebar, auth, params }: Props) {
  return (
    <>
      <div className="harmony-bg-background flex min-h-screen">
        <aside className="harmony-bg-surface harmony-border-r harmony-sidebar w-80 sm:fixed sm:inset-y-0 sm:left-0 sm:z-50 sm:w-0 md:w-64 lg:w-80">
          {sidebar}
        </aside>
        <main className="harmony-bg-background min-w-0 flex-1">
          <div className="harmony-bg-surface">{main || children}</div>
        </main>
      </div>
      {auth}
      <LocaleStructuredData params={params} />
    </>
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
