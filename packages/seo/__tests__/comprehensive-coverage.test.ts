import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock Next.js modules
vi.mock('next', () => ({
  Metadata: {},
  Viewport: {},
  MetadataRoute: {},
}));

vi.mock('server-only', () => ({}));

vi.mock('lodash.merge', () => ({
  default: vi.fn((target, source) => ({ ...target, ...source })),
}));

// Mock schema-dts
vi.mock('schema-dts', () => ({
  Thing: {},
  WithContext: {},
}));

describe('sEO Package - Comprehensive Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup environment variables for testing
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
    process.env.NEXT_PUBLIC_URL = 'https://test.com';
  });

  describe('utils/metadata.ts', () => {
    test('should create basic metadata', async () => {
      const { createMetadata } = await import('../src/utils/metadata');

      const metadata = createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata).toStrictEqual(
        expect.objectContaining({
          title: 'Test Page | forge',
          description: 'Test description',
          applicationName: 'forge',
          publisher: 'Hayden Bleasel',
        }),
      );
    });

    test('should create metadata with image', async () => {
      const { createMetadata } = await import('../src/utils/metadata');

      const metadata = createMetadata({
        title: 'Test Page',
        description: 'Test description',
        image: 'https://example.com/image.jpg',
      });

      expect(metadata.openGraph?.images).toStrictEqual([
        {
          alt: 'Test Page',
          height: 630,
          url: 'https://example.com/image.jpg',
          width: 1200,
        },
      ]);
    });

    test('should handle production environment', async () => {
      process.env.NODE_ENV = 'production';
      const { createMetadata } = await import('../src/utils/metadata');

      const metadata = createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.metadataBase?.protocol).toBe('https:');
    });

    test('should handle missing production URL', async () => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      const { createMetadata } = await import('../src/utils/metadata');

      const metadata = createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.metadataBase).toBeUndefined();
    });

    test('should merge additional properties', async () => {
      const { createMetadata } = await import('../src/utils/metadata');

      const metadata = createMetadata({
        title: 'Test Page',
        description: 'Test description',
        keywords: ['test', 'seo'],
        robots: 'noindex',
      });

      expect(metadata.keywords).toStrictEqual(['test', 'seo']);
      expect(metadata.robots).toBe('noindex');
    });
  });

  describe('utils/metadata-enhanced.ts', () => {
    test('should create SEOManager instance', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      expect(seoManager).toBeInstanceOf(SEOManager);
    });

    test('should create basic metadata with SEOManager', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.title).toStrictEqual({
        default: 'Test Page | Test App',
        template: '%s | Test App',
      });
      expect(metadata.description).toBe('Test description');
    });

    test('should create metadata with image string', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
        image: 'https://example.com/image.jpg',
      });

      expect(metadata.openGraph?.images).toStrictEqual([
        {
          alt: 'Test Page',
          height: 630,
          url: 'https://example.com/image.jpg',
          width: 1200,
        },
      ]);
    });

    test('should create metadata with image object', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
        image: {
          url: 'https://example.com/image.jpg',
          alt: 'Custom alt text',
          width: 800,
          height: 400,
        },
      });

      expect(metadata.openGraph?.images).toStrictEqual([
        {
          alt: 'Custom alt text',
          height: 400,
          url: 'https://example.com/image.jpg',
          width: 800,
        },
      ]);
    });

    test('should create metadata with article type', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Article',
        description: 'Test article description',
        article: {
          authors: ['Author 1', 'Author 2'],
          publishedTime: '2024-01-01T00:00:00Z',
          modifiedTime: '2024-01-02T00:00:00Z',
          section: 'Technology',
          tags: ['tech', 'seo'],
        },
      });

      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.article).toStrictEqual({
        authors: ['Author 1', 'Author 2'],
        publishedTime: '2024-01-01T00:00:00Z',
        modifiedTime: '2024-01-02T00:00:00Z',
        section: 'Technology',
        tags: ['tech', 'seo'],
      });
    });

    test('should create metadata with alternates and canonical', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
        alternates: {
          canonical: 'https://example.com/canonical',
          languages: {
            en: 'https://example.com/en',
            es: 'https://example.com/es',
          },
        },
      });

      expect(metadata.alternates).toStrictEqual({
        canonical: 'https://example.com/canonical',
        languages: {
          en: 'https://example.com/en',
          es: 'https://example.com/es',
        },
      });
    });

    test('should create metadata with canonical only', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
        canonical: 'https://example.com/canonical',
      });

      expect(metadata.alternates).toStrictEqual({
        canonical: 'https://example.com/canonical',
      });
    });

    test('should create metadata with noIndex and noFollow', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
        noIndex: true,
        noFollow: true,
      });

      expect(metadata.robots).toStrictEqual({
        follow: false,
        index: false,
        googleBot: {
          follow: false,
          index: false,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      });
    });

    test('should create metadata with keywords', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        keywords: ['default1', 'default2'],
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
        keywords: ['page1', 'page2'],
      });

      expect(metadata.keywords).toStrictEqual(['default1', 'default2', 'page1', 'page2']);
    });

    test('should create metadata with theme color', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        themeColor: '#000000',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.themeColor).toStrictEqual([
        { color: '#000000', media: '(prefers-color-scheme: light)' },
        { color: '#000000', media: '(prefers-color-scheme: dark)' },
      ]);
    });

    test('should create metadata with custom locale', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
        locale: 'es_ES',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.openGraph?.locale).toBe('es_ES');
    });

    test('should create error metadata for 404', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createErrorMetadata(404);

      expect(metadata.title).toStrictEqual({
        default: 'Page Not Found | Test App',
        template: '%s | Test App',
      });
      expect(metadata.description).toBe('Error 404');
    });

    test('should create error metadata for 500', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createErrorMetadata(500);

      expect(metadata.title).toStrictEqual({
        default: 'Internal Server Error | Test App',
        template: '%s | Test App',
      });
    });

    test('should create error metadata for 503', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createErrorMetadata(503);

      expect(metadata.title).toStrictEqual({
        default: 'Service Unavailable | Test App',
        template: '%s | Test App',
      });
    });

    test('should create error metadata for unknown status code', async () => {
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createErrorMetadata(418);

      expect(metadata.title).toStrictEqual({
        default: 'Error | Test App',
        template: '%s | Test App',
      });
      expect(metadata.description).toBe('Error 418');
    });

    test('should export viewport configuration', async () => {
      const { viewport } = await import('../src/utils/metadata-enhanced');

      expect(viewport).toStrictEqual({
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        viewportFit: 'cover',
        width: 'device-width',
      });
    });

    test('should handle production environment', async () => {
      process.env.NODE_ENV = 'production';
      const { SEOManager } = await import('../src/utils/metadata-enhanced');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      const metadata = seoManager.createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.metadataBase?.protocol).toBe('https:');
    });
  });

  describe('components/structured-data.tsx', () => {
    test('should create structured data with createStructuredData', async () => {
      const { createStructuredData } = await import('../src/components/structured-data');

      const data = createStructuredData('Article', {
        headline: 'Test Article',
        author: { name: 'Test Author' },
      });

      expect(data).toStrictEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        author: { name: 'Test Author' },
      });
    });

    test('should create article structured data with string author', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.article({
        headline: 'Test Article',
        author: 'Test Author',
        datePublished: '2024-01-01T00:00:00Z',
        publisher: { name: 'Test Publisher' },
      });

      expect(data.author).toStrictEqual({
        '@type': 'Person',
        name: 'Test Author',
      });
      expect(data.headline).toBe('Test Article');
      expect(data.datePublished).toBe('2024-01-01T00:00:00Z');
    });

    test('should create article structured data with object author', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.article({
        headline: 'Test Article',
        author: { name: 'Test Author', url: 'https://author.com' },
        datePublished: '2024-01-01T00:00:00Z',
        publisher: { name: 'Test Publisher' },
      });

      expect(data.author).toStrictEqual({
        '@type': 'Person',
        name: 'Test Author',
        url: 'https://author.com',
      });
    });

    test('should create article with dateModified', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.article({
        headline: 'Test Article',
        author: 'Test Author',
        datePublished: '2024-01-01T00:00:00Z',
        dateModified: '2024-01-02T00:00:00Z',
        publisher: { name: 'Test Publisher' },
      });

      expect(data.dateModified).toBe('2024-01-02T00:00:00Z');
    });

    test('should create article with all optional fields', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.article({
        headline: 'Test Article',
        author: 'Test Author',
        datePublished: '2024-01-01T00:00:00Z',
        description: 'Test description',
        image: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        mainEntityOfPage: 'https://example.com/article',
        publisher: {
          name: 'Test Publisher',
          logo: 'https://example.com/logo.jpg',
        },
      });

      expect(data.description).toBe('Test description');
      expect(data.image).toStrictEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
      expect(data.mainEntityOfPage).toStrictEqual({
        '@id': 'https://example.com/article',
        '@type': 'WebPage',
      });
      expect(data.publisher.logo).toStrictEqual({
        '@type': 'ImageObject',
        url: 'https://example.com/logo.jpg',
      });
    });

    test('should create breadcrumbs structured data', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.breadcrumbs([
        { name: 'Home', url: 'https://example.com' },
        { name: 'Category', url: 'https://example.com/category' },
        { name: 'Current Page', url: 'https://example.com/category/page' },
      ]);

      expect(data.itemListElement).toHaveLength(3);
      expect(data.itemListElement[0]).toStrictEqual({
        '@type': 'ListItem',
        item: 'https://example.com',
        name: 'Home',
        position: 1,
      });
      expect(data.itemListElement[2].position).toBe(3);
    });

    test('should create FAQ structured data', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.faq([
        { question: 'What is SEO?', answer: 'Search Engine Optimization' },
        { question: 'How does it work?', answer: 'It improves visibility' },
      ]);

      expect(data.mainEntity).toHaveLength(2);
      expect(data.mainEntity[0]).toStrictEqual({
        '@type': 'Question',
        name: 'What is SEO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Search Engine Optimization',
        },
      });
    });

    test('should create organization structured data', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.organization({
        name: 'Test Organization',
        url: 'https://example.com',
        description: 'Test description',
        logo: 'https://example.com/logo.jpg',
        sameAs: ['https://twitter.com/test', 'https://facebook.com/test'],
      });

      expect(data.name).toBe('Test Organization');
      expect(data.url).toBe('https://example.com');
      expect(data.description).toBe('Test description');
      expect(data.logo).toBe('https://example.com/logo.jpg');
      expect(data.sameAs).toStrictEqual(['https://twitter.com/test', 'https://facebook.com/test']);
    });

    test('should create organization with contact point', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.organization({
        name: 'Test Organization',
        url: 'https://example.com',
        contactPoint: {
          contactType: 'Customer Service',
          telephone: '+1-555-0123',
          areaServed: ['US', 'CA'],
          availableLanguage: ['en', 'es'],
        },
      });

      expect(data.contactPoint).toStrictEqual({
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        telephone: '+1-555-0123',
        areaServed: ['US', 'CA'],
        availableLanguage: ['en', 'es'],
      });
    });

    test('should create product structured data', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.product({
        name: 'Test Product',
        description: 'Test product description',
        image: 'https://example.com/product.jpg',
      });

      expect(data.name).toBe('Test Product');
      expect(data.description).toBe('Test product description');
      expect(data.image).toBe('https://example.com/product.jpg');
    });

    test('should create product with brand', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.product({
        name: 'Test Product',
        brand: 'Test Brand',
      });

      expect(data.brand).toStrictEqual({
        '@type': 'Brand',
        name: 'Test Brand',
      });
    });

    test('should create product with offers', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.product({
        name: 'Test Product',
        offers: {
          price: '99.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          seller: 'Test Seller',
        },
      });

      expect(data.offers).toStrictEqual({
        '@type': 'Offer',
        price: '99.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Test Seller',
        },
      });
    });

    test('should create product with offers using default availability', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.product({
        name: 'Test Product',
        offers: {
          price: '99.99',
          priceCurrency: 'USD',
        },
      });

      expect(data.offers?.availability).toBe('https://schema.org/InStock');
    });

    test('should create product with aggregate rating', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.product({
        name: 'Test Product',
        aggregateRating: {
          ratingValue: 4.5,
          reviewCount: 123,
        },
      });

      expect(data.aggregateRating).toStrictEqual({
        '@type': 'AggregateRating',
        ratingValue: 4.5,
        reviewCount: 123,
      });
    });

    test('should create website structured data', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.website({
        name: 'Test Website',
        url: 'https://example.com',
        description: 'Test website description',
      });

      expect(data.name).toBe('Test Website');
      expect(data.url).toBe('https://example.com');
      expect(data.description).toBe('Test website description');
    });

    test('should create website with potential action', async () => {
      const { structuredData } = await import('../src/components/structured-data');

      const data = structuredData.website({
        name: 'Test Website',
        url: 'https://example.com',
        potentialAction: {
          target: 'https://example.com/search?q={search_term_string}',
          queryInput: 'required name=search_term_string',
        },
      });

      expect(data.potentialAction).toStrictEqual({
        '@type': 'SearchAction',
        'query-input': 'required name=required name=search_term_string',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://example.com/search?q={search_term_string}',
        },
      });
    });
  });

  describe('utils/i18n-enhanced.ts', () => {
    test('should import i18n-enhanced module', async () => {
      const i18nModule = await import('../src/utils/i18n-enhanced');
      expect(i18nModule).toBeDefined();
    });
  });

  describe('examples modules', () => {
    test('should import all example modules', async () => {
      const modules = [
        '../src/examples/app-router-sitemap',
        '../src/examples/metadata-patterns',
        '../src/examples/next-sitemap-config',
        '../src/examples/nextjs-15-features',
        '../src/examples/nextjs-15-integration',
      ];

      for (const modulePath of modules) {
        const module = await import(modulePath);
        expect(module).toBeDefined();
      }
    });
  });
});
