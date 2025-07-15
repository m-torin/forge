import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock Next.js modules
vi.mock('next', () => ({
  Metadata: {},
}));

vi.mock('lodash.merge', () => ({
  default: vi.fn((target, source) => ({ ...target, ...source })),
}));

describe('i18n Enhanced - Comprehensive Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
    process.env.NEXT_PUBLIC_URL = 'https://test.com';
  });

  describe('i18nSEOManager', () => {
    test('should create I18nSEOManager instance', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es', 'fr'],
          localeNames: {
            en: 'English',
            es: 'Español',
            fr: 'Français',
          },
        },
      });

      expect(seoManager).toBeInstanceOf(I18nSEOManager);
    });

    test('should create basic i18n metadata', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es', 'fr'],
          localeNames: {
            en: 'English',
            es: 'Español',
            fr: 'Français',
          },
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'en',
      });

      expect(metadata.title).toStrictEqual({
        default: 'Test Page | Test App',
        template: '%s | Test App',
      });
      expect(metadata.description).toBe('Test description');
      expect(metadata.openGraph?.locale).toBe('en_US');
      expect(metadata.other?.['content-language']).toBe('en');
    });

    test('should create i18n metadata with translations', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es', 'fr'],
          localeNames: {
            en: 'English',
            es: 'Español',
            fr: 'Français',
          },
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'es',
        translations: {
          es: {
            title: 'Página de Prueba',
            description: 'Descripción de prueba',
          },
        },
      });

      expect(metadata.title).toStrictEqual({
        default: 'Página de Prueba | Test App',
        template: '%s | Test App',
      });
      expect(metadata.description).toBe('Descripción de prueba');
      expect(metadata.openGraph?.locale).toBe('es_ES');
      expect(metadata.other?.['content-language']).toBe('es');
    });

    test('should generate language alternates with canonical URL', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es', 'fr'],
          localeNames: {
            en: 'English',
            es: 'Español',
            fr: 'Français',
          },
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'en',
        alternates: {
          canonical: '/en/test-page',
        },
      });

      expect(metadata.alternates?.languages).toStrictEqual({
        en: '/en/test-page',
        es: '/es/test-page',
        fr: '/fr/test-page',
      });
    });

    test('should handle RTL languages', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'ar', 'he'],
          localeNames: {
            en: 'English',
            ar: 'العربية',
            he: 'עברית',
          },
          rtlLocales: ['ar', 'he'],
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'ar',
      });

      expect(metadata.other?.direction).toBe('rtl');
      expect(metadata.openGraph?.locale).toBe('ar_SA');
    });

    test('should generate alternate locales for OpenGraph', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es', 'fr'],
          localeNames: {
            en: 'English',
            es: 'Español',
            fr: 'Français',
          },
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'en',
      });

      expect(metadata.openGraph?.alternateLocale).toStrictEqual(['es_ES', 'fr_FR']);
    });

    test('should merge existing metadata.other properties', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es'],
          localeNames: {
            en: 'English',
            es: 'Español',
          },
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'en',
        other: {
          'custom-tag': 'custom-value',
          'another-tag': 'another-value',
        },
      });

      expect(metadata.other).toStrictEqual({
        'content-language': 'en',
        'custom-tag': 'custom-value',
        'another-tag': 'another-value',
      });
    });

    test('should create localized structured data', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es'],
          localeNames: {
            en: 'English',
            es: 'Español',
          },
        },
      });

      const data = {
        name: 'Test Product',
        description: 'Test product description',
        price: '99.99',
      };

      const structuredData = seoManager.createLocalizedStructuredData('Product', data, 'en');

      expect(structuredData).toStrictEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        inLanguage: 'en',
        name: 'Test Product',
        description: 'Test product description',
        price: '99.99',
      });
    });

    test('should create localized structured data with translations', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es'],
          localeNames: {
            en: 'English',
            es: 'Español',
          },
        },
      });

      const data = {
        name: 'Test Product',
        description: 'Test product description',
        price: '99.99',
      };

      const translations = {
        es: {
          name: 'Producto de Prueba',
          description: 'Descripción del producto de prueba',
        },
      };

      const structuredData = seoManager.createLocalizedStructuredData(
        'Product',
        data,
        'es',
        translations,
      );

      expect(structuredData).toStrictEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        inLanguage: 'es',
        name: 'Producto de Prueba',
        description: 'Descripción del producto de prueba',
        price: '99.99',
      });
    });

    test('should generate hreflang tags', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es', 'fr'],
          localeNames: {
            en: 'English',
            es: 'Español',
            fr: 'Français',
          },
        },
      });

      const hreflangTags = seoManager.generateHreflangTags('/en/test-page', 'en');

      expect(hreflangTags).toStrictEqual({
        'x-default': '/en/test-page',
        en: '/en/test-page',
        es: '/es/test-page',
        fr: '/fr/test-page',
      });
    });

    test('should generate hreflang tags for root path', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es'],
          localeNames: {
            en: 'English',
            es: 'Español',
          },
        },
      });

      const hreflangTags = seoManager.generateHreflangTags('/', 'en');

      expect(hreflangTags).toStrictEqual({
        'x-default': '/en/',
        en: '/en/',
        es: '/es/',
      });
    });

    test('should format OpenGraph locales correctly', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: [
            'en',
            'es',
            'fr',
            'de',
            'ar',
            'ja',
            'ko',
            'nl',
            'pt',
            'ru',
            'zh',
            'it',
            'custom',
          ],
          localeNames: {},
        },
      });

      // Test known locale mappings
      const testCases = [
        { locale: 'en', expected: 'en_US' },
        { locale: 'es', expected: 'es_ES' },
        { locale: 'fr', expected: 'fr_FR' },
        { locale: 'de', expected: 'de_DE' },
        { locale: 'ar', expected: 'ar_SA' },
        { locale: 'ja', expected: 'ja_JP' },
        { locale: 'ko', expected: 'ko_KR' },
        { locale: 'nl', expected: 'nl_NL' },
        { locale: 'pt', expected: 'pt_BR' },
        { locale: 'ru', expected: 'ru_RU' },
        { locale: 'zh', expected: 'zh_CN' },
        { locale: 'it', expected: 'it_IT' },
        { locale: 'custom', expected: 'custom_CUSTOM' },
      ];

      for (const { locale, expected } of testCases) {
        const metadata = seoManager.createI18nMetadata({
          title: 'Test',
          description: 'Test',
          locale,
        });
        expect(metadata.openGraph?.locale).toBe(expected);
      }
    });

    test('should handle missing translations gracefully', async () => {
      const { I18nSEOManager } = await import('../src/utils/i18n-enhanced');

      const seoManager = new I18nSEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'es'],
          localeNames: {
            en: 'English',
            es: 'Español',
          },
        },
      });

      const metadata = seoManager.createI18nMetadata({
        title: 'Test Page',
        description: 'Test description',
        locale: 'es',
        translations: {
          fr: {
            title: 'Page de Test',
            description: 'Description de test',
          },
        },
      });

      // Should fallback to original title/description
      expect(metadata.title).toStrictEqual({
        default: 'Test Page | Test App',
        template: '%s | Test App',
      });
      expect(metadata.description).toBe('Test description');
    });
  });
});
