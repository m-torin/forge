import type { Metadata } from 'next';
import { SEOManager } from './metadata-enhanced';

interface I18nSEOConfig {
  defaultLocale: string;
  locales: string[];
  localeNames: Record<string, string>;
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
    }
  ): Metadata {
    const { locale, translations, ...baseOptions } = options;
    
    // Use translated title and description if available
    const localizedTitle = translations?.[locale]?.title || baseOptions.title;
    const localizedDescription = translations?.[locale]?.description || baseOptions.description;

    // Generate language alternates automatically
    const languageAlternates: Record<string, string> = {};
    this.i18nConfig.locales.forEach(loc => {
      if (baseOptions.alternates?.canonical) {
        const basePath = baseOptions.alternates.canonical.replace(/^\/[a-z]{2}\//, '/');
        languageAlternates[loc] = `/${loc}${basePath}`;
      }
    });

    // Determine OpenGraph locale format
    const ogLocale = this.formatOpenGraphLocale(locale);

    // Get alternate locales for OpenGraph
    const alternateLocales = this.i18nConfig.locales
      .filter(loc => loc !== locale)
      .map(loc => this.formatOpenGraphLocale(loc));

    const metadata = super.createMetadata({
      ...baseOptions,
      title: localizedTitle,
      description: localizedDescription,
      alternates: {
        ...baseOptions.alternates,
        languages: languageAlternates,
      },
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
        'direction': 'rtl',
      };
    }

    return metadata;
  }

  // Format locale for OpenGraph (e.g., 'en' -> 'en_US', 'fr' -> 'fr_FR')
  private formatOpenGraphLocale(locale: string): string {
    const localeMap: Record<string, string> = {
      'en': 'en_US',
      'fr': 'fr_FR',
      'es': 'es_ES',
      'pt': 'pt_BR',
      'de': 'de_DE',
      'it': 'it_IT',
      'ja': 'ja_JP',
      'ko': 'ko_KR',
      'zh': 'zh_CN',
      'ar': 'ar_SA',
      'ru': 'ru_RU',
      'nl': 'nl_NL',
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
    this.i18nConfig.locales.forEach(locale => {
      hreflangTags[locale] = `/${locale}${basePath}`;
    });
    
    return hreflangTags;
  }

  // Create localized structured data
  createLocalizedStructuredData<T>(
    type: string,
    data: T,
    locale: string,
    translations?: Record<string, Partial<T>>
  ): T {
    const localizedData = translations?.[locale] 
      ? { ...data, ...translations[locale] }
      : data;
      
    return {
      ...localizedData,
      '@context': 'https://schema.org',
      '@type': type,
      inLanguage: locale,
    } as T;
  }
}