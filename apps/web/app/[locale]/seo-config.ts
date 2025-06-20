import { SEOManager } from '@repo/seo/server/next';

// Site-wide SEO configuration
export const seoManager = new SEOManager({
  applicationName: 'Web Template',
  author: {
    name: 'Web Template Team',
    url: 'https://example.com',
  },
  publisher: 'Web Template Inc.',
  twitterHandle: '@webtemplate',
  locale: 'en_US',
  keywords: ['ecommerce', 'shopping', 'online store', 'web template'],
  themeColor: '#1890ff', // Brand color from theme
});

// Helper function to get localized SEO manager
export function getLocalizedSEOManager(locale: string) {
  return new SEOManager({
    applicationName: 'Web Template',
    author: {
      name: 'Web Template Team',
      url: 'https://example.com',
    },
    publisher: 'Web Template Inc.',
    twitterHandle: '@webtemplate',
    locale: getLocaleCode(locale),
    keywords: ['ecommerce', 'shopping', 'online store', 'web template'],
    themeColor: '#1890ff',
  });
}

// Convert our locale codes to standard locale format
function getLocaleCode(locale: string): string {
  const localeMap: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    pt: 'pt_PT',
  };
  return localeMap[locale] || 'en_US';
}
