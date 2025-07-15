import { describe, expect, test } from 'vitest';

import { createStructuredData, structuredData } from '../src/server';

describe('@repo/seo/server', () => {
  describe('createStructuredData', () => {
    test('creates structured data with proper context and type', () => {
      const data = { name: 'Test Product' };
      const result = createStructuredData('Product', data);

      expect(result).toStrictEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test Product',
      });
    });

    test('preserves all data properties', () => {
      const data = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
      };
      const result = createStructuredData('Product', data);

      expect((result as any).name).toBe('Test Product');
      expect((result as any).description).toBe('A test product');
      expect((result as any).price).toBe(99.99);
    });
  });

  describe('structuredData.article', () => {
    test('creates article structured data with string author', () => {
      const result = structuredData.article({
        author: 'John Doe',
        datePublished: '2024-01-01',
        headline: 'Test Article',
        publisher: { name: 'Test Publisher' },
      });

      expect((result as any)['@type']).toBe('Article');
      expect((result as any).author).toStrictEqual({
        '@type': 'Person',
        name: 'John Doe',
      });
      expect((result as any).headline).toBe('Test Article');
    });

    test('creates article structured data with object author', () => {
      const result = structuredData.article({
        author: { name: 'John Doe', url: 'https://example.com' },
        datePublished: '2024-01-01',
        headline: 'Test Article',
        publisher: { name: 'Test Publisher' },
      });

      expect((result as any).author).toStrictEqual({
        '@type': 'Person',
        name: 'John Doe',
        url: 'https://example.com',
      });
    });

    test('handles optional fields correctly', () => {
      const result = structuredData.article({
        author: 'John Doe',
        datePublished: '2024-01-01',
        headline: 'Test Article',
        description: 'Test description',
        image: '/test-image.jpg',
        publisher: { name: 'Test Publisher' },
      });

      expect((result as any).description).toBe('Test description');
      expect((result as any).image).toBe('/test-image.jpg');
    });
  });

  describe('structuredData.breadcrumbs', () => {
    test('creates breadcrumb structured data', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: 'Category', url: '/products/category' },
      ];

      const result = structuredData.breadcrumbs(items);

      expect((result as any)['@type']).toBe('BreadcrumbList');
      expect((result as any).itemListElement).toHaveLength(3);
      expect((result as any).itemListElement[0]).toStrictEqual({
        '@type': 'ListItem',
        item: '/',
        name: 'Home',
        position: 1,
      });
    });
  });

  describe('structuredData.faq', () => {
    test('creates FAQ structured data', () => {
      const items = [
        { question: 'What is this?', answer: 'This is a test.' },
        { question: 'How does it work?', answer: 'It works like this.' },
      ];

      const result = structuredData.faq(items);

      expect((result as any)['@type']).toBe('FAQPage');
      expect((result as any).mainEntity).toHaveLength(2);
      expect((result as any).mainEntity[0]).toStrictEqual({
        '@type': 'Question',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This is a test.',
        },
        name: 'What is this?',
      });
    });
  });

  describe('structuredData.organization', () => {
    test('creates organization structured data', () => {
      const result = structuredData.organization({
        name: 'Test Organization',
        url: 'https://example.com',
        description: 'A test organization',
        logo: '/logo.png',
      });

      expect((result as any)['@type']).toBe('Organization');
      expect((result as any).name).toBe('Test Organization');
      expect((result as any).url).toBe('https://example.com');
      expect((result as any).description).toBe('A test organization');
      expect((result as any).logo).toBe('/logo.png');
    });

    test('handles contact point correctly', () => {
      const result = structuredData.organization({
        name: 'Test Organization',
        url: 'https://example.com',
        contactPoint: {
          contactType: 'customer service',
          telephone: '+1-555-0123',
        },
      });

      expect((result as any).contactPoint).toStrictEqual({
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+1-555-0123',
      });
    });
  });

  describe('structuredData.product', () => {
    test('creates product structured data', () => {
      const result = structuredData.product({
        name: 'Test Product',
        description: 'A test product',
        image: '/product.jpg',
      });

      expect((result as any)['@type']).toBe('Product');
      expect((result as any).name).toBe('Test Product');
      expect((result as any).description).toBe('A test product');
      expect((result as any).image).toBe('/product.jpg');
    });

    test('handles offers correctly', () => {
      const result = structuredData.product({
        name: 'Test Product',
        offers: {
          price: '99.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      });

      expect((result as any).offers).toStrictEqual({
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        price: '99.99',
        priceCurrency: 'USD',
      });
    });

    test('handles brand correctly', () => {
      const result = structuredData.product({
        name: 'Test Product',
        brand: 'Test Brand',
      });

      expect((result as any).brand).toStrictEqual({
        '@type': 'Brand',
        name: 'Test Brand',
      });
    });

    test('handles aggregate rating correctly', () => {
      const result = structuredData.product({
        name: 'Test Product',
        aggregateRating: {
          ratingValue: 4.5,
          reviewCount: 100,
        },
      });

      expect((result as any).aggregateRating).toStrictEqual({
        '@type': 'AggregateRating',
        ratingValue: 4.5,
        reviewCount: 100,
      });
    });
  });

  describe('structuredData.website', () => {
    test('creates website structured data', () => {
      const result = structuredData.website({
        name: 'Test Website',
        url: 'https://example.com',
        description: 'A test website',
      });

      expect((result as any)['@type']).toBe('WebSite');
      expect((result as any).name).toBe('Test Website');
      expect((result as any).url).toBe('https://example.com');
      expect((result as any).description).toBe('A test website');
    });

    test('handles potential action correctly', () => {
      const result = structuredData.website({
        name: 'Test Website',
        url: 'https://example.com',
        potentialAction: {
          queryInput: 'search_term_string',
          target: 'https://example.com/search?q={search_term_string}',
        },
      });

      expect((result as any).potentialAction).toStrictEqual({
        '@type': 'SearchAction',
        'query-input': 'required name=search_term_string',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://example.com/search?q={search_term_string}',
        },
      });
    });
  });
});
