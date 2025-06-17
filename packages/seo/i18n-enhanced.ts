import { Metadata } from 'next';

import { SEOManager } from './metadata-enhanced';

interface I18nSEOConfig {
  defaultLocale: string;
  localeNames: Record<string, string>;
  locales: string[];
  rtlLocales?: string[];
}

export class I18nSEOManager extends SEOManager {
  private i18nConfig: I18nSEOConfig;

  constructor(config: ConstructorParameters<typeof SEOManager>[0] & { i18n: I18nSEOConfig }) {
    super(config);
    this.i18nConfig = config.i18n;
  }

  createI18nMetadata(
    options: Parameters<SEOManager['createMetadata']>[0] & {
      locale: string;
      translations?: Record<string, { description: string; title: string }>;
    },
  ): Metadata {
    const { locale, translations, ...baseOptions } = options;

    // Use translated title and description if available
    const localizedTitle = translations?.[locale]?.title ?? baseOptions.title;
    const localizedDescription = translations?.[locale]?.description ?? baseOptions.description;

    // Generate language alternates automatically
    const languageAlternates: Record<string, string> = {};
    this.i18nConfig.locales.forEach((loc: any) => {
      if (baseOptions.alternates?.canonical) {
        const basePath = baseOptions.alternates.canonical.replace(/^\/[a-z]{2}\//, '/');
        languageAlternates[loc] = `/${loc}${basePath}`;
      }
    });

    // Determine OpenGraph locale format
    const ogLocale = this.formatOpenGraphLocale(locale);

    // Get alternate locales for OpenGraph
    const alternateLocales = this.i18nConfig.locales
      .filter((loc: any) => loc !== locale)
      .map((loc: any) => this.formatOpenGraphLocale(loc));

    const metadata = super.createMetadata({
      ...baseOptions,
      alternates: {
        ...baseOptions.alternates,
        languages: languageAlternates,
      },
      description: localizedDescription,
      title: localizedTitle,
    });

    // Enhance OpenGraph with locale information
    if (metadata.openGraph) {
      metadata.openGraph.locale = ogLocale;
      metadata.openGraph.alternateLocale = alternateLocales;
    }

    // Add language meta tag
    const otherMetadata: Record<string, (number | string)[] | number | string> = {
      'content-language': locale,
    };

    // Handle RTL languages
    if (this.i18nConfig.rtlLocales?.includes(locale)) {
      otherMetadata.direction = 'rtl';
    }

    // Merge with existing metadata.other
    if (metadata.other) {
      Object.entries(metadata.other).forEach(([key, value]: [string, any]) => {
        otherMetadata[key] = value;
      });
    }

    metadata.other = otherMetadata;

    return metadata;
  }

  // Create localized structured data
  createLocalizedStructuredData<T>(
    type: string,
    data: T,
    locale: string,
    translations?: Record<string, Partial<T>>,
  ): T {
    const localizedData = translations?.[locale] ? { ...data, ...translations[locale] } : data;

    return {
      ...localizedData,
      '@context': 'https://schema.org',
      '@type': type,
      inLanguage: locale,
    } as T;
  }

  // Generate hreflang tags for international SEO
  generateHreflangTags(currentPath: string, _currentLocale: string): Record<string, string> {
    const hreflangTags: Record<string, string> = {};

    // Add x-default for default locale
    const basePath = currentPath.replace(/^\/[a-z]{2}\//, '/');
    hreflangTags['x-default'] = `/${this.i18nConfig.defaultLocale}${basePath}`;

    // Add all locale variations
    this.i18nConfig.locales.forEach((locale: any) => {
      hreflangTags[locale] = `/${locale}${basePath}`;
    });

    return hreflangTags;
  }

  // Format locale for OpenGraph (e.g., 'en' -> 'en_US', 'fr' -> 'fr_FR')
  private formatOpenGraphLocale(locale: string): string {
    const localeMap: Record<string, string> = {
      ar: 'ar_SA',
      de: 'de_DE',
      en: 'en_US',
      es: 'es_ES',
      fr: 'fr_FR',
      it: 'it_IT',
      ja: 'ja_JP',
      ko: 'ko_KR',
      nl: 'nl_NL',
      pt: 'pt_BR',
      ru: 'ru_RU',
      zh: 'zh_CN',
    };
    return localeMap[locale] ?? `${locale}_${locale.toUpperCase()}`;
  }
}
