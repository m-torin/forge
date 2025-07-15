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

describe('final Coverage Push', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
    process.env.NEXT_PUBLIC_URL = 'https://test.com';
  });

  describe('server-next.ts - Missing Coverage', () => {
    test('should test SEOManager createErrorMetadata with all status codes', async () => {
      const { SEOManager } = await import('../src/server-next');

      const seoManager = new SEOManager({
        applicationName: 'Test App',
        author: { name: 'Test Author', url: 'https://test.com' },
        publisher: 'Test Publisher',
        twitterHandle: '@test',
      });

      // Test all the specific error code mappings
      const errorCodes = [404, 500, 503, 418]; // 418 for unknown code
      const expectedTitles = [
        'Page Not Found',
        'Internal Server Error',
        'Service Unavailable',
        'Error',
      ];

      errorCodes.forEach((code, index) => {
        const metadata = seoManager.createErrorMetadata(code);
        expect(metadata.title).toStrictEqual({
          default: `${expectedTitles[index]} | Test App`,
          template: '%s | Test App',
        });
        expect(metadata.description).toBe(`Error ${code}`);
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
    });

    test('should test metadata template functions exhaustively', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      // Test product template with missing brand
      const productWithoutBrand = metadataTemplates.product({
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        currency: 'USD',
        image: 'https://example.com/image.jpg',
        availability: 'InStock',
      });

      expect(productWithoutBrand.other).not.toHaveProperty('product:brand');

      // Test article template with missing optional fields
      const articleMinimal = metadataTemplates.article({
        title: 'Test Article',
        description: 'Test description',
        author: 'Test Author',
        publishedTime: new Date('2024-01-01'),
        image: 'https://example.com/image.jpg',
      });

      expect(articleMinimal.openGraph?.modifiedTime).toBeUndefined();
      expect(articleMinimal.openGraph?.tags).toBeUndefined();
      expect(articleMinimal.openGraph?.section).toBeUndefined();

      // Test profile template with all optional fields
      const profileComplete = metadataTemplates.profile({
        name: 'John Doe',
        bio: 'Software engineer',
        image: 'https://example.com/john.jpg',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(profileComplete.openGraph?.username).toBe('johndoe');
      expect(profileComplete.openGraph?.firstName).toBe('John');
      expect(profileComplete.openGraph?.lastName).toBe('Doe');
    });

    test('should test sitemap generation functions', async () => {
      const { generateI18nSitemap, generateSitemapObject, convertToNextSitemap } = await import(
        '../src/server-next'
      );

      // Test generateI18nSitemap with images and videos
      const routesWithMedia = [
        {
          url: 'https://example.com/media-page',
          images: [
            { url: 'https://example.com/image1.jpg', title: 'Image 1' },
            { url: 'https://example.com/image2.jpg', title: 'Image 2' },
          ],
          videos: [
            {
              title: 'Test Video',
              thumbnail_url: 'https://example.com/thumb.jpg',
              description: 'Video description',
              content_url: 'https://example.com/video.mp4',
              duration: 120,
            },
          ],
        },
      ];

      const i18nSitemap = generateI18nSitemap(routesWithMedia, ['en', 'es'], 'en');
      expect(i18nSitemap).toHaveLength(2);
      expect(i18nSitemap[0].images).toStrictEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
      expect(i18nSitemap[0].videos).toStrictEqual(routesWithMedia[0].videos);

      // Test generateSitemapObject with default values
      const routesMinimal = [{ url: 'https://example.com/minimal' }];

      const sitemapMinimal = generateSitemapObject(routesMinimal);
      expect(sitemapMinimal[0].changeFrequency).toBe('weekly');
      expect(sitemapMinimal[0].priority).toBe(0.5);
      expect(sitemapMinimal[0].lastModified).toBeInstanceOf(Date);

      // Test convertToNextSitemap with missing lastModified
      const nextjsSitemapMinimal = [
        {
          url: 'https://example.com/page',
          changeFrequency: 'daily',
          priority: 0.8,
        },
      ];

      const converted = convertToNextSitemap(nextjsSitemapMinimal);
      expect(converted[0].lastmod).toBeUndefined();
    });

    test('should test createIntegratedSitemapConfig branches', async () => {
      const { createIntegratedSitemapConfig } = await import('../src/server-next');

      // Test without appDirSitemaps or mergeAppDirRoutes
      const basicConfig = createIntegratedSitemapConfig({
        siteUrl: 'https://example.com',
      });

      expect(basicConfig.siteUrl).toBe('https://example.com');

      // Test with appDirSitemaps
      const configWithSitemaps = createIntegratedSitemapConfig({
        siteUrl: 'https://example.com',
        appDirSitemaps: ['/custom-sitemap.xml', 'another-sitemap.xml'],
      });

      expect(configWithSitemaps.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://example.com/custom-sitemap.xml',
      );
      expect(configWithSitemaps.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://example.com/another-sitemap.xml',
      );

      // Test with existing robotsTxtOptions
      const configWithExisting = createIntegratedSitemapConfig({
        siteUrl: 'https://example.com',
        appDirSitemaps: ['/new-sitemap.xml'],
        robotsTxtOptions: {
          additionalSitemaps: ['https://existing.com/sitemap.xml'],
          policies: [{ userAgent: '*', allow: '/' }],
        },
      });

      expect(configWithExisting.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://existing.com/sitemap.xml',
      );
      expect(configWithExisting.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://example.com/new-sitemap.xml',
      );
    });

    test('should test edge metadata generation edge cases', async () => {
      const { generateMetadataEdge } = await import('../src/server-next');

      const request = { url: 'https://example.com/page' };

      // Test with image - should use summary_large_image
      const metadataWithImage = await generateMetadataEdge(request, {
        title: 'Test Page',
        description: 'Test description',
        image: 'https://example.com/image.jpg',
      });

      expect(metadataWithImage.twitter?.card).toBe('summary_large_image');
      expect(metadataWithImage.twitter?.images).toStrictEqual(['https://example.com/image.jpg']);

      // Test without image - should use summary
      const metadataWithoutImage = await generateMetadataEdge(request, {
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadataWithoutImage.twitter?.card).toBe('summary');
      expect(metadataWithoutImage.openGraph?.images).toBeUndefined();
    });

    test('should test createSitemapConfig with environment fallback', async () => {
      const { createSitemapConfig } = await import('../src/server-next');

      // Clear environment variables
      delete process.env.NEXT_PUBLIC_URL;

      const config = createSitemapConfig({
        siteUrl: '', // Empty siteUrl to trigger fallback
      });

      expect(config.siteUrl).toBe('https://example.com'); // Default fallback
    });

    test('should test viewport generation edge cases', async () => {
      const { generateViewport } = await import('../src/server-next');

      // Test with empty user agent
      const emptyViewport = generateViewport('');
      expect(emptyViewport).toStrictEqual(
        expect.objectContaining({
          width: 'device-width',
          initialScale: 1,
          maximumScale: 5,
          userScalable: true,
          viewportFit: 'cover',
        }),
      );

      // Test with mobile but not tablet
      const mobileViewport = generateViewport('Mozilla/5.0 (iPhone; Mobile');
      expect(mobileViewport.maximumScale).toBe(1);
      expect(mobileViewport.userScalable).toBeFalsy();

      // Test with mobile and tablet (tablet should win)
      const tabletViewport = generateViewport('Mozilla/5.0 (iPad; Mobile tablet');
      expect(tabletViewport.maximumScale).toBe(3);
      expect(tabletViewport.userScalable).toBeTruthy();
      expect(tabletViewport.viewportFit).toBe('auto');
    });

    test('should test generatePreviewMetadata edge cases', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      // Test with null robots
      const metadataWithNullRobots = {
        title: 'Test Page',
        description: 'Test description',
        robots: null,
      };

      const result = generatePreviewMetadata(true, metadataWithNullRobots);
      expect(result.robots).toStrictEqual({
        index: false,
        follow: false,
      });

      // Test with string robots
      const metadataWithStringRobots = {
        title: 'Test Page',
        description: 'Test description',
        robots: 'noindex,nofollow',
      };

      const resultString = generatePreviewMetadata(true, metadataWithStringRobots);
      expect(resultString.robots).toStrictEqual({
        index: false,
        follow: false,
      });

      // Test with missing openGraph
      const metadataWithoutOG = {
        title: 'Test Page',
        description: 'Test description',
      };

      const resultNoOG = generatePreviewMetadata(true, metadataWithoutOG);
      expect(resultNoOG.openGraph).toBeUndefined();
    });
  });

  describe('components/json-ld.tsx - Missing Coverage', () => {
    test('should test JsonLd function export', async () => {
      const { JsonLd } = await import('../src/components/json-ld');

      // This should test line 8 which seems to be missing coverage
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
      };

      // Test the component function directly
      expect(typeof JsonLd).toBe('function');

      // Test with props
      const result = JsonLd({ data, id: 'test-id' });
      expect(result).toBeDefined();
    });
  });

  describe('server.ts - Missing Coverage', () => {
    test('should test server.ts edge cases', async () => {
      const { createStructuredData, structuredData } = await import('../src/server');

      // Test createStructuredData function (might be missing coverage)
      const articleData = createStructuredData('Article', {
        headline: 'Test Article',
        author: { name: 'Test Author' },
      });

      expect(articleData).toStrictEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        author: { name: 'Test Author' },
      });

      // Test structuredData utility functions
      expect(structuredData.article).toBeDefined();
      expect(structuredData.breadcrumbs).toBeDefined();
      expect(structuredData.faq).toBeDefined();
      expect(structuredData.organization).toBeDefined();
      expect(structuredData.product).toBeDefined();
      expect(structuredData.website).toBeDefined();
    });
  });
});
