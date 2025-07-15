/**
 * SEO Test Data
 *
 * Provides specialized test data for SEO components and structured data testing.
 */

/**
 * SEO test data with specific patterns for different test scenarios
 */
export const seoTestData = {
  // Component-specific test data
  components: {
    jsonLd: {
      simple: () => ({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Website',
        url: 'https://example.com',
      }),
      complex: () => ({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Complex Article',
        author: {
          '@type': 'Person',
          name: 'John Doe',
        },
        datePublished: '2024-01-01T00:00:00Z',
        image: 'https://example.com/article-image.jpg',
        publisher: {
          '@type': 'Organization',
          name: 'Example Publisher',
          logo: {
            '@type': 'ImageObject',
            url: 'https://example.com/logo.png',
          },
        },
      }),
    },
  },

  // Structured data patterns
  structuredData: {
    article: () => ({
      headline: 'Test Article',
      author: {
        '@type': 'Person',
        name: 'Test Author',
      },
      datePublished: '2024-01-01T00:00:00Z',
      image: 'https://example.com/test-article.jpg',
    }),
    product: () => ({
      name: 'Test Product',
      description: 'A test product for structured data',
      image: 'https://example.com/test-product.jpg',
      offers: {
        '@type': 'Offer',
        price: '29.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
    organization: () => ({
      name: 'Test Organization',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
      },
    }),
    person: () => ({
      name: 'Test Person',
      jobTitle: 'Software Engineer',
      url: 'https://example.com/person',
      sameAs: ['https://twitter.com/testperson', 'https://linkedin.com/in/testperson'],
    }),
  },

  // Metadata patterns
  metadata: {
    basic: () => ({
      title: 'Home Page',
      description: 'Welcome to our amazing website with great content',
    }),
    withImage: () => ({
      title: 'Test Page with Image',
      description: 'A test page with an image',
      image: 'https://example.com/test-image.jpg',
    }),
    complete: () => ({
      title: 'Complete Test Page',
      description: 'A complete test page with all metadata',
      image: 'https://example.com/complete-image.jpg',
      keywords: ['test', 'page', 'seo'],
      openGraph: {
        type: 'website',
        siteName: 'Test Site',
      },
      twitter: {
        card: 'summary_large_image',
        site: '@testsite',
      },
    }),
    blog: () => ({
      title: 'How to Build Better SEO',
      description: 'Learn advanced SEO techniques to improve your website ranking',
      keywords: ['seo', 'marketing', 'web development'],
      image: 'https://example.com/blog-image.jpg',
      openGraph: {
        type: 'article',
        publishedTime: '2024-01-01T00:00:00Z',
        authors: ['SEO Expert'],
        section: 'SEO',
        tags: ['seo', 'optimization', 'ranking'],
      },
    }),
    product: () => ({
      title: 'Awesome Product - Buy Now',
      description: 'The best product you can buy online with fast shipping',
      image: 'https://example.com/product-image.jpg',
      keywords: ['product', 'shopping', 'ecommerce'],
      openGraph: {
        type: 'product',
        brand: 'Example Brand',
        availability: 'in stock',
        condition: 'new',
        price: {
          amount: '99.99',
          currency: 'USD',
        },
      },
    }),
  },

  // Edge cases and error scenarios
  edgeCases: {
    empty: () => ({}),
    null: () => null,
    undefined: () => undefined,
    invalidData: () => ({
      '@context': 'invalid-context',
      '@type': null,
      name: undefined,
    }),
  },
};

/**
 * Creates test data with specific patterns
 */
export const createTestData = {
  /**
   * Creates metadata with specific characteristics
   */
  metadata: (overrides = {}) => ({
    title: 'Default Test Title',
    description: 'Default test description for SEO testing',
    image: 'https://example.com/default-image.jpg',
    keywords: ['test', 'seo', 'metadata'],
    ...overrides,
  }),

  /**
   * Creates OpenGraph data with specific characteristics
   */
  openGraph: (overrides = {}) => ({
    title: 'OpenGraph Test Title',
    description: 'OpenGraph test description',
    type: 'website',
    url: 'https://example.com',
    siteName: 'Test Site',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OpenGraph Test Image',
      },
    ],
    ...overrides,
  }),

  /**
   * Creates structured data schema with specific characteristics
   */
  structuredDataSchema: (type: string, overrides = {}) => {
    const baseSchemas = {
      Person: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Test Person',
        email: 'test@example.com',
        url: 'https://example.com/person',
      },
      Organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Organization',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
      },
      Product: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test Product',
        description: 'A test product for schema testing',
        image: 'https://example.com/product.jpg',
      },
    };

    return {
      ...baseSchemas[type as keyof typeof baseSchemas],
      ...overrides,
    };
  },
};
