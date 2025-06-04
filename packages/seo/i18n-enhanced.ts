import { SEOManager } from './metadata-enhanced';

import type { Metadata } from 'next';

interface I18nSEOConfig {
  defaultLocale: string;
  localeNames: Record<string, string>;
  locales: string[];
  rtlLocales?: string[];
}

export class I18nSEOManager extends SEOManager {
  private i18nConfig: I18nSEOConfig;

  constructor(config: Parameters<typeof SEOManager>[0] & { i18n: I18nSEOConfig }) {
    super(config);
    this.i18nConfig = config.i18n;
  }

  createI18nMetadata(
    options: Parameters<SEOManager['createMetadata']>[0] & {
      locale: string;
      translations?: Record<string, { title: string; description: string }>;
    },
  ): Metadata {
    const { locale, translations, ...baseOptions } = options;

    // Use translated title and description if available
    const localizedTitle = translations?.[locale]?.title || baseOptions.title;
    const localizedDescription = translations?.[locale]?.description || baseOptions.description;

    // Generate language alternates automatically
    const languageAlternates: Record<string, string> = {};
    this.i18nConfig.locales.forEach((loc) => {
      if (baseOptions.alternates?.canonical) {
        const basePath = baseOptions.alternates.canonical.replace(/^\/[a-z]{2}\//, '/');
        languageAlternates[loc] = `/${loc}${basePath}`;
      }
    });

    // Determine OpenGraph locale format
    const ogLocale = this.formatOpenGraphLocale(locale);

    // Get alternate locales for OpenGraph
    const alternateLocales = this.i18nConfig.locales
      .filter((loc) => loc !== locale)
      .map((loc) => this.formatOpenGraphLocale(loc));

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
    metadata.other = {
      ...metadata.other,
      'content-language': locale,
    };

    // Handle RTL languages
    if (this.i18nConfig.rtlLocales?.includes(locale)) {
      metadata.other = {
        ...metadata.other,
        direction: 'rtl',
      };
    }

    return metadata;
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
    return localeMap[locale] || `${locale}_${locale.toUpperCase()}`;
  }

  // Generate hreflang tags for international SEO
  generateHreflangTags(currentPath: string, currentLocale: string): Record<string, string> {
    const hreflangTags: Record<string, string> = {};

    // Add x-default for default locale
    const basePath = currentPath.replace(/^\/[a-z]{2}\//, '/');
    hreflangTags['x-default'] = `/${this.i18nConfig.defaultLocale}${basePath}`;

    // Add all locale variations
    this.i18nConfig.locales.forEach((locale) => {
      hreflangTags[locale] = `/${locale}${basePath}`;
    });

    return hreflangTags;
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
      '@type': type,
      '@context': 'https://schema.org',
      inLanguage: locale,
    } as T;
  }
}
