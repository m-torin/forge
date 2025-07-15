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

describe('server Next - Comprehensive Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
    process.env.NEXT_PUBLIC_URL = 'https://test.com';
  });

  describe('createMetadata function', () => {
    test('should create metadata with image', async () => {
      const { createMetadata } = await import('../src/server-next');

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
      const { createMetadata } = await import('../src/server-next');

      const metadata = createMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.metadataBase?.protocol).toBe('https:');
    });
  });

  describe('metadataTemplates', () => {
    test('should create product metadata template', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      const metadata = metadataTemplates.product({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        currency: 'USD',
        image: 'https://example.com/product.jpg',
        availability: 'InStock',
        brand: 'Test Brand',
      });

      expect(metadata.title).toBe('Test Product');
      expect(metadata.description).toBe('Test product description');
      expect(metadata.other).toStrictEqual({
        'product:price:amount': '99.99',
        'product:price:currency': 'USD',
        'product:availability': 'InStock',
        'product:brand': 'Test Brand',
      });
    });

    test('should create product metadata without brand', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      const metadata = metadataTemplates.product({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        currency: 'USD',
        image: 'https://example.com/product.jpg',
        availability: 'InStock',
      });

      expect(metadata.other?.['product:brand']).toBeUndefined();
    });

    test('should create article metadata template', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      const publishedTime = new Date('2024-01-01T00:00:00Z');
      const modifiedTime = new Date('2024-01-02T00:00:00Z');

      const metadata = metadataTemplates.article({
        title: 'Test Article',
        description: 'Test article description',
        author: 'Test Author',
        publishedTime,
        modifiedTime,
        image: 'https://example.com/article.jpg',
        tags: ['test', 'article'],
        section: 'Technology',
      });

      expect(metadata.title).toBe('Test Article');
      expect(metadata.description).toBe('Test article description');
      expect(metadata.authors).toStrictEqual([{ name: 'Test Author' }]);
      expect(metadata.openGraph?.publishedTime).toBe('2024-01-01T00:00:00.000Z');
      expect(metadata.openGraph?.modifiedTime).toBe('2024-01-02T00:00:00.000Z');
      expect(metadata.openGraph?.tags).toStrictEqual(['test', 'article']);
      expect(metadata.openGraph?.section).toBe('Technology');
    });

    test('should create article metadata without modifiedTime', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      const publishedTime = new Date('2024-01-01T00:00:00Z');

      const metadata = metadataTemplates.article({
        title: 'Test Article',
        description: 'Test article description',
        author: 'Test Author',
        publishedTime,
        image: 'https://example.com/article.jpg',
      });

      expect(metadata.openGraph?.modifiedTime).toBeUndefined();
    });

    test('should create profile metadata template', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      const metadata = metadataTemplates.profile({
        name: 'Test User',
        bio: 'Test user bio',
        image: 'https://example.com/user.jpg',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(metadata.title).toBe('Test User');
      expect(metadata.description).toBe('Test user bio');
      expect(metadata.openGraph?.firstName).toBe('Test');
      expect(metadata.openGraph?.lastName).toBe('User');
      expect(metadata.openGraph?.username).toBe('testuser');
    });

    test('should create profile metadata without optional fields', async () => {
      const { metadataTemplates } = await import('../src/server-next');

      const metadata = metadataTemplates.profile({
        name: 'Test User',
        bio: 'Test user bio',
        image: 'https://example.com/user.jpg',
      });

      expect(metadata.openGraph?.firstName).toBeUndefined();
      expect(metadata.openGraph?.lastName).toBeUndefined();
      expect(metadata.openGraph?.username).toBeUndefined();
    });
  });

  describe('viewportPresets', () => {
    test('should export all viewport presets', async () => {
      const { viewportPresets } = await import('../src/server-next');

      expect(viewportPresets.default).toStrictEqual({
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        viewportFit: 'cover',
      });

      expect(viewportPresets.mobileOptimized).toStrictEqual({
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: 'cover',
      });

      expect(viewportPresets.tablet).toStrictEqual({
        width: 'device-width',
        initialScale: 1,
        maximumScale: 3,
        userScalable: true,
        viewportFit: 'auto',
      });

      expect(viewportPresets.desktop).toStrictEqual({
        width: 'device-width',
        initialScale: 1,
        userScalable: true,
        viewportFit: 'auto',
      });
    });
  });

  describe('generateViewport', () => {
    test('should return default viewport for no user agent', async () => {
      const { generateViewport, viewportPresets } = await import('../src/server-next');

      const viewport = generateViewport();
      expect(viewport).toStrictEqual(viewportPresets.default);
    });

    test('should return mobile viewport for mobile user agent', async () => {
      const { generateViewport, viewportPresets } = await import('../src/server-next');

      const viewport = generateViewport(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      );
      expect(viewport).toStrictEqual(viewportPresets.mobileOptimized);
    });

    test('should return tablet viewport for tablet user agent', async () => {
      const { generateViewport, viewportPresets } = await import('../src/server-next');

      const viewport = generateViewport(
        'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      );
      expect(viewport).toStrictEqual(viewportPresets.tablet);
    });

    test('should return desktop viewport for desktop user agent', async () => {
      const { generateViewport, viewportPresets } = await import('../src/server-next');

      const viewport = generateViewport(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );
      expect(viewport).toStrictEqual(viewportPresets.desktop);
    });

    test('should return tablet viewport for iPad user agent', async () => {
      const { generateViewport, viewportPresets } = await import('../src/server-next');

      const viewport = generateViewport('Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) tablet');
      expect(viewport).toStrictEqual(viewportPresets.tablet);
    });
  });

  describe('generateI18nSitemap', () => {
    test('should generate i18n sitemap', async () => {
      const { generateI18nSitemap } = await import('../src/server-next');

      const routes = [
        {
          url: 'https://example.com/page1',
          lastModified: new Date('2024-01-01'),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        },
        {
          url: 'https://example.com/page2',
        },
      ];

      const locales = ['en', 'es', 'fr'];
      const sitemap = generateI18nSitemap(routes, locales);

      expect(sitemap).toHaveLength(6); // 2 routes × 3 locales
      expect(sitemap[0].url).toBe('https://example.com/page1');
      expect(sitemap[1].url).toBe('https://example.com/es/page1');
      expect(sitemap[2].url).toBe('https://example.com/fr/page1');
    });

    test('should generate i18n sitemap with custom default locale', async () => {
      const { generateI18nSitemap } = await import('../src/server-next');

      const routes = [
        {
          url: 'https://example.com/page1',
        },
      ];

      const locales = ['es', 'en'];
      const sitemap = generateI18nSitemap(routes, locales, 'es');

      expect(sitemap[0].url).toBe('https://example.com/page1'); // Default locale
      expect(sitemap[1].url).toBe('https://example.com/en/page1'); // Non-default locale
    });

    test('should handle routes with images and videos', async () => {
      const { generateI18nSitemap } = await import('../src/server-next');

      const routes = [
        {
          url: 'https://example.com/page1',
          images: [
            { url: 'https://example.com/image1.jpg' },
            { url: 'https://example.com/image2.jpg' },
          ],
          videos: [
            {
              title: 'Video 1',
              thumbnail_url: 'https://example.com/thumb1.jpg',
              description: 'Video description',
            },
          ],
        },
      ];

      const locales = ['en'];
      const sitemap = generateI18nSitemap(routes, locales);

      expect(sitemap[0].images).toStrictEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
      expect(sitemap[0].videos).toStrictEqual(routes[0].videos);
    });
  });

  describe('generatePreviewMetadata', () => {
    test('should return original metadata for non-draft', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = { title: 'Test Page', description: 'Test description' };
      const result = generatePreviewMetadata(false, metadata);

      expect(result).toStrictEqual(metadata);
    });

    test('should modify metadata for draft with default options', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = { title: 'Test Page', description: 'Test description' };
      const result = generatePreviewMetadata(true, metadata);

      expect(result.title).toBe('[DRAFT] Test Page');
      expect(result.robots).toStrictEqual({
        index: false,
        follow: false,
      });
    });

    test('should use custom draft indicator', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = { title: 'Test Page', description: 'Test description' };
      const result = generatePreviewMetadata(true, metadata, {
        draftIndicator: '[PREVIEW]',
      });

      expect(result.title).toBe('[PREVIEW] Test Page');
    });

    test('should not modify robots when noIndexDrafts is false', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = { title: 'Test Page', description: 'Test description', robots: 'index' };
      const result = generatePreviewMetadata(true, metadata, {
        noIndexDrafts: false,
      });

      expect(result.robots).toBe('index');
    });

    test('should handle openGraph metadata', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = {
        title: 'Test Page',
        description: 'Test description',
        openGraph: { title: 'OG Title', description: 'OG Description' },
      };
      const result = generatePreviewMetadata(true, metadata);

      expect(result.openGraph?.title).toBe('[DRAFT] OG Title');
    });

    test('should handle missing openGraph title', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = {
        title: 'Test Page',
        description: 'Test description',
        openGraph: { description: 'OG Description' },
      };
      const result = generatePreviewMetadata(true, metadata);

      expect(result.openGraph?.title).toBe('[DRAFT] Test Page');
    });

    test('should merge existing robots object', async () => {
      const { generatePreviewMetadata } = await import('../src/server-next');

      const metadata = {
        title: 'Test Page',
        description: 'Test description',
        robots: { index: true, follow: true, noarchive: true },
      };
      const result = generatePreviewMetadata(true, metadata);

      // The implementation spreads the existing robots after setting index/follow to false
      // So the existing values override the false values
      expect(result.robots).toStrictEqual({
        index: true,
        follow: true,
        noarchive: true,
      });
    });
  });

  describe('generateMetadataAsync', () => {
    test('should generate metadata asynchronously', async () => {
      const { generateMetadataAsync } = await import('../src/server-next');

      const params = Promise.resolve({ slug: 'test-page' });
      const searchParams = Promise.resolve({ q: 'search-term' });
      const generator = vi.fn().mockResolvedValue({ title: 'Generated Title' });

      const result = await generateMetadataAsync({ params, searchParams, generator });

      expect(generator).toHaveBeenCalledWith({ slug: 'test-page' }, { q: 'search-term' });
      expect(result).toStrictEqual({ title: 'Generated Title' });
    });
  });

  describe('generateMetadataEdge', () => {
    test('should generate metadata for edge runtime', async () => {
      const { generateMetadataEdge } = await import('../src/server-next');

      const request = {
        url: 'https://example.com/page',
      };

      const result = await generateMetadataEdge(request, {
        title: 'Edge Title',
        description: 'Edge Description',
        image: 'https://example.com/image.jpg',
      });

      expect(result.title).toBe('Edge Title');
      expect(result.description).toBe('Edge Description');
      expect(result.metadataBase?.href).toBe('https://example.com/');
      expect(result.openGraph?.images).toStrictEqual(['https://example.com/image.jpg']);
      expect(result.twitter?.images).toStrictEqual(['https://example.com/image.jpg']);
    });

    test('should generate metadata without image', async () => {
      const { generateMetadataEdge } = await import('../src/server-next');

      const request = {
        url: 'https://example.com/page',
      };

      const result = await generateMetadataEdge(request, {
        title: 'Edge Title',
        description: 'Edge Description',
      });

      expect(result.twitter?.card).toBe('summary');
      expect(result.openGraph?.images).toBeUndefined();
    });
  });

  describe('createSitemapConfig', () => {
    test('should create sitemap config with defaults', async () => {
      const { createSitemapConfig } = await import('../src/server-next');

      const config = createSitemapConfig({
        siteUrl: 'https://example.com',
      });

      expect(config.siteUrl).toBe('https://example.com');
      expect(config.generateRobotsTxt).toBeTruthy();
      expect(config.generateIndexSitemap).toBeTruthy();
      expect(config.sitemapSize).toBe(7000);
      expect(config.changefreq).toBe('daily');
      expect(config.priority).toBe(0.7);
    });

    test('should use environment variable for siteUrl', async () => {
      const { createSitemapConfig } = await import('../src/server-next');

      process.env.NEXT_PUBLIC_URL = 'https://env-example.com';

      const config = createSitemapConfig({
        siteUrl: '',
      });

      expect(config.siteUrl).toBe('https://env-example.com');
    });

    test('should merge custom exclude paths', async () => {
      const { createSitemapConfig } = await import('../src/server-next');

      const config = createSitemapConfig({
        siteUrl: 'https://example.com',
        exclude: ['/custom-exclude'],
      });

      expect(config.exclude).toContain('/custom-exclude');
      expect(config.exclude).toContain('/404');
      expect(config.exclude).toContain('/api/*');
    });

    test('should preserve custom robotsTxtOptions', async () => {
      const { createSitemapConfig } = await import('../src/server-next');

      const config = createSitemapConfig({
        siteUrl: 'https://example.com',
        robotsTxtOptions: {
          additionalSitemaps: ['https://example.com/custom-sitemap.xml'],
        },
      });

      expect(config.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://example.com/custom-sitemap.xml',
      );
    });
  });

  describe('generateSitemapObject', () => {
    test('should generate sitemap object', async () => {
      const { generateSitemapObject } = await import('../src/server-next');

      const routes = [
        {
          url: 'https://example.com/page1',
          lastModified: new Date('2024-01-01'),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        },
        {
          url: 'https://example.com/page2',
        },
      ];

      const sitemap = generateSitemapObject(routes);

      expect(sitemap).toHaveLength(2);
      expect(sitemap[0]).toStrictEqual(
        expect.objectContaining({
          url: 'https://example.com/page1',
          lastModified: new Date('2024-01-01'),
          changeFrequency: 'daily',
          priority: 0.8,
        }),
      );
      expect(sitemap[1]).toStrictEqual(
        expect.objectContaining({
          url: 'https://example.com/page2',
          changeFrequency: 'weekly',
          priority: 0.5,
        }),
      );
    });

    test('should handle routes with images and videos', async () => {
      const { generateSitemapObject } = await import('../src/server-next');

      const routes = [
        {
          url: 'https://example.com/page1',
          images: [
            { url: 'https://example.com/image1.jpg', title: 'Image 1' },
            { url: 'https://example.com/image2.jpg', title: 'Image 2' },
          ],
          videos: [
            {
              title: 'Video 1',
              thumbnail_url: 'https://example.com/thumb1.jpg',
              description: 'Video description',
            },
          ],
        },
      ];

      const sitemap = generateSitemapObject(routes);

      expect(sitemap[0].images).toStrictEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
      expect(sitemap[0].videos).toStrictEqual(routes[0].videos);
    });
  });

  describe('convertToNextSitemap', () => {
    test('should convert Next.js sitemap to next-sitemap format', async () => {
      const { convertToNextSitemap } = await import('../src/server-next');

      const nextjsSitemap = [
        {
          url: 'https://example.com/page1',
          lastModified: new Date('2024-01-01T00:00:00Z'),
          changeFrequency: 'daily',
          priority: 0.8,
        },
        {
          url: 'https://example.com/page2',
          changeFrequency: 'weekly',
          priority: 0.5,
        },
      ];

      const converted = convertToNextSitemap(nextjsSitemap);

      expect(converted).toStrictEqual([
        {
          loc: 'https://example.com/page1',
          lastmod: '2024-01-01T00:00:00.000Z',
          changefreq: 'daily',
          priority: 0.8,
        },
        {
          loc: 'https://example.com/page2',
          lastmod: undefined,
          changefreq: 'weekly',
          priority: 0.5,
        },
      ]);
    });
  });

  describe('createIntegratedSitemapConfig', () => {
    test('should create integrated sitemap config', async () => {
      const { createIntegratedSitemapConfig } = await import('../src/server-next');

      const config = createIntegratedSitemapConfig({
        siteUrl: 'https://example.com',
      });

      expect(config.siteUrl).toBe('https://example.com');
    });

    test('should add app directory sitemaps', async () => {
      const { createIntegratedSitemapConfig } = await import('../src/server-next');

      const config = createIntegratedSitemapConfig({
        siteUrl: 'https://example.com',
        appDirSitemaps: ['/sitemap.xml', 'products/sitemap.xml'],
      });

      expect(config.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://example.com/sitemap.xml',
      );
      expect(config.robotsTxtOptions?.additionalSitemaps).toContain(
        'https://example.com/products/sitemap.xml',
      );
    });

    test('should merge app directory routes', async () => {
      const { createIntegratedSitemapConfig } = await import('../src/server-next');

      const originalAdditionalPaths = vi
        .fn()
        .mockResolvedValue([{ loc: 'https://example.com/original', priority: 0.5 }]);

      const config = createIntegratedSitemapConfig({
        siteUrl: 'https://example.com',
        mergeAppDirRoutes: true,
        additionalPaths: originalAdditionalPaths,
      });

      expect(config.additionalPaths).toBeDefined();

      // Test the wrapped function
      const context = { siteUrl: 'https://example.com' };
      const result = await config.additionalPaths!(context);

      expect(originalAdditionalPaths).toHaveBeenCalledWith(context);
      expect(result).toStrictEqual([{ loc: 'https://example.com/original', priority: 0.5 }]);
    });
  });
});
