import { describe, expect, test } from 'vitest';
import { setupSEOMocks } from '../seo-mocks';
import { seoTestData } from '../seo-test-data';
import { createComponentTestSuite, createModuleTestSuite } from '../seo-test-factory';

// Setup mocks
setupSEOMocks();

// Test structured data module exports
createModuleTestSuite({
  moduleName: 'structured-data',
  importPath: '../../src/components/structured-data',
  expectedExports: ['createStructuredData', 'structuredData', 'JsonLd'],
});

// Test JsonLd component
createComponentTestSuite({
  componentName: 'JsonLd',
  importPath: '../../src/components/structured-data',
  scenarios: [
    {
      name: 'render with simple structured data',
      props: {
        data: seoTestData.components.jsonLd.simple(),
      },
      customAssertions: result => {
        expect(result).toBeDefined();
        expect(result.type).toBe('script');
        expect(result.props.type).toBe('application/ld+json');
      },
    },
    {
      name: 'render with complex article data',
      props: {
        data: seoTestData.components.jsonLd.complex(),
      },
      customAssertions: result => {
        expect(result).toBeDefined();
        expect(result.type).toBe('script');
        const htmlContent = result.props.dangerouslySetInnerHTML.__html;
        const parsedData = JSON.parse(htmlContent);
        expect(parsedData['@type']).toBe('Article');
        expect(parsedData.headline).toBe('Complex Article');
      },
    },
    {
      name: 'handle invalid data gracefully',
      props: {
        data: null,
      },
      shouldRender: false,
    },
  ],
});

// Test createStructuredData utility
describe('createStructuredData utility', () => {
  test('should create article structured data', async () => {
    const { createStructuredData } = await import('../../src/components/structured-data');

    const articleData = seoTestData.structuredData.article();
    const result = createStructuredData('Article', articleData);

    expect(result).toHaveProperty('@context', 'https://schema.org');
    expect(result).toHaveProperty('@type', 'Article');
    expect((result as any).headline).toBe(articleData.headline);
    expect((result as any).author).toStrictEqual(articleData.author);
  });

  test('should create product structured data', async () => {
    const { createStructuredData } = await import('../../src/components/structured-data');

    const productData = seoTestData.structuredData.product();
    const result = createStructuredData('Product', productData);

    expect(result).toHaveProperty('@context', 'https://schema.org');
    expect(result).toHaveProperty('@type', 'Product');
    expect((result as any).name).toBe(productData.name);
    expect((result as any).offers).toStrictEqual(productData.offers);
  });

  test('should handle empty data', async () => {
    const { createStructuredData } = await import('../../src/components/structured-data');

    const result = createStructuredData('Thing', {});

    expect(result).toHaveProperty('@context', 'https://schema.org');
    expect(result).toHaveProperty('@type', 'Thing');
  });
});
