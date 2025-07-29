import { describe, expect } from 'vitest';
import { setupSEOMocks } from '../seo-mocks';
import { createTestData, seoTestData } from '../seo-test-data';
import { createMetadataTestSuite } from '../seo-test-factory';

// Setup mocks
setupSEOMocks();

// Test createMetadata utility using factory pattern
createMetadataTestSuite({
  functionName: 'createMetadata',
  importPath: '../../src/server-next',
  scenarios: [
    // Basic metadata scenarios
    {
      name: 'generate basic metadata with required fields',
      input: seoTestData.metadata.basic(),
      expectedProperties: {
        title: 'Home Page | forge',
        description: 'Welcome to our amazing website with great content',
        applicationName: 'forge',
      },
      customAssertions: result => {
        expect(result.openGraph?.title).toBe('Home Page | forge');
        expect(result.openGraph?.description).toBe(
          'Welcome to our amazing website with great content',
        );
      },
    },

    // Metadata with image
    {
      name: 'handle image URLs in OpenGraph',
      input: createTestData.metadata({
        title: 'Test Page',
        description: 'Test description',
        image: '/path/to/image.jpg',
      }),
      expectedProperties: {
        title: 'Test Page | forge',
        description: 'Test description',
      },
      customAssertions: result => {
        expect(result.openGraph?.images).toStrictEqual([
          {
            width: 1200,
            url: '/path/to/image.jpg',
            alt: 'Test Page',
            height: 630,
          },
        ]);
      },
    },

    // Production environment
    {
      name: 'use https protocol in production',
      environment: 'production',
      envVars: {
        VERCEL_PROJECT_PRODUCTION_URL: 'test-project.vercel.app',
        NODE_ENV: 'production',
      },
      input: createTestData.metadata({
        title: 'Test Page',
        description: 'Test description',
      }),
      expectedProperties: {
        title: 'Test Page | forge',
      },
      customAssertions: result => {
        expect(result.metadataBase?.href).toBe('https://test-project.vercel.app/');
      },
    },

    // Test environment with metadataBase
    {
      name: 'set metadataBase based on production URL',
      envVars: {
        VERCEL_PROJECT_PRODUCTION_URL: 'test-project.vercel.app',
      },
      input: createTestData.metadata({
        title: 'Test Page',
        description: 'Test description',
      }),
      expectedProperties: {
        title: 'Test Page | forge',
      },
      customAssertions: result => {
        expect(result.metadataBase?.href).toBe('http://test-project.vercel.app/');
      },
    },

    // Custom properties merging
    {
      name: 'merge custom properties with defaults',
      input: createTestData.metadata({
        title: 'Test Page',
        description: 'Test description',
        openGraph: {
          type: 'article',
          publishedTime: '2023-01-01',
        },
        themeColor: '#ff0000',
      }),
      expectedProperties: {
        title: 'Test Page | forge',
        themeColor: '#ff0000',
      },
      customAssertions: result => {
        expect((result.openGraph as any)?.type).toBe('article');
        expect((result.openGraph as any)?.publishedTime).toBe('2023-01-01');
        // Default properties should still be present (merged by lodash.merge)
        expect(result.openGraph?.title).toBe('Test Page | forge');
        expect(result.openGraph?.description).toBe('Test description');
        expect(result.openGraph?.locale).toBe('en_US');
        expect(result.openGraph?.siteName).toBe('forge');
      },
    },

    // No production URL fallback
    {
      name: 'fall back to undefined metadataBase when no production URL is set',
      envVars: {
        VERCEL_PROJECT_PRODUCTION_URL: '',
      },
      input: createTestData.metadata({
        title: 'Test Page',
        description: 'Test description',
      }),
      expectedProperties: {
        title: 'Test Page | forge',
      },
      customAssertions: result => {
        expect(result.metadataBase).toBeUndefined();
      },
    },

    // Blog metadata scenario
    {
      name: 'handle blog metadata with author and keywords',
      input: seoTestData.metadata.blog(),
      expectedProperties: {
        title: 'How to Build Better SEO | forge',
        description: 'Learn advanced SEO techniques to improve your website ranking',
      },
      customAssertions: result => {
        // The createMetadata function defaults to 'website' type unless explicitly overridden
        expect(result.openGraph?.type).toBe('website');
        // Additional blog-specific properties from input should be present if merged
        expect(result.keywords).toStrictEqual(['seo', 'marketing', 'web development']);
      },
    },

    // Product metadata scenario
    {
      name: 'handle product metadata with pricing',
      input: seoTestData.metadata.product(),
      expectedProperties: {
        title: 'Awesome Product - Buy Now | forge',
        description: 'The best product you can buy online with fast shipping',
      },
      customAssertions: result => {
        expect(result.openGraph?.images).toBeDefined();
        expect(result.openGraph?.images?.length).toBeGreaterThan(0);
      },
    },
  ],
});

// Additional module structure test
describe('@repo/seo/metadata module', () => {
  test('should export createMetadata function', async () => {
    const module = await import('../../src/server-next');
    expect(module).toHaveProperty('createMetadata');
    expect(typeof module.createMetadata).toBe('function');
  });
});
