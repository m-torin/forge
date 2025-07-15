/**
 * Centralized Test Data Generators
 *
 * Provides consistent test data generation across SEO test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

// Common test data patterns
export const testPatterns = {
  // Basic metadata patterns
  metadata: {
    simple: {
      title: 'Test Page',
      description: 'A simple test page description',
    },
    withImage: {
      title: 'Test Page with Image',
      description: 'A test page with an image',
      image: 'https://example.com/image.jpg',
    },
    complex: {
      title: 'Complex Test Page',
      description: 'A complex test page with many properties',
      image: 'https://example.com/complex-image.jpg',
      keywords: ['seo', 'testing', 'nextjs'],
      locale: 'en-US',
    },
    production: {
      title: 'Production Page',
      description: 'A page for production environment testing',
    },
  },

  // OpenGraph patterns
  openGraph: {
    basic: {
      title: 'OpenGraph Test',
      description: 'OpenGraph description',
      type: 'website',
      url: 'https://example.com',
    },
    withImage: {
      title: 'OpenGraph with Image',
      description: 'OpenGraph with image',
      images: [
        {
          url: 'https://example.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'OpenGraph Image',
        },
      ],
    },
    article: {
      title: 'Article Title',
      description: 'Article description',
      type: 'article',
      publishedTime: '2024-01-01T00:00:00Z',
      authors: ['John Doe'],
      tags: ['tech', 'seo'],
    },
  },

  // Twitter Card patterns
  twitter: {
    summary: {
      card: 'summary',
      site: '@example',
      creator: '@johndoe',
    },
    summaryLargeImage: {
      card: 'summary_large_image',
      site: '@example',
      creator: '@johndoe',
      images: ['https://example.com/twitter-image.jpg'],
    },
  },

  // Structured data patterns
  structuredData: {
    person: {
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://johndoe.com',
      jobTitle: 'Software Engineer',
    },
    organization: {
      name: 'Example Corp',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      contactPoint: {
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
      },
    },
    product: {
      name: 'Test Product',
      description: 'A test product',
      image: 'https://example.com/product.jpg',
      offers: {
        price: '19.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
    breadcrumb: [
      { name: 'Home', url: 'https://example.com' },
      { name: 'Products', url: 'https://example.com/products' },
      { name: 'Category', url: 'https://example.com/products/category' },
    ],
  },

  // Viewport patterns
  viewport: {
    basic: {
      width: 'device-width',
      initialScale: 1,
    },
    custom: {
      width: 1200,
      initialScale: 1.5,
      maximumScale: 2,
      userScalable: false,
    },
  },

  // Locale patterns
  locales: ['en', 'en-US', 'fr', 'fr-FR', 'es', 'es-ES', 'de', 'de-DE'],

  // URL patterns
  urls: [
    'https://example.com',
    'https://example.com/page',
    'https://example.com/page?param=value',
    'https://example.com/page#section',
    'https://subdomain.example.com',
    'https://example.com/deep/nested/path',
  ],

  // Image URLs
  imageUrls: [
    'https://example.com/image.jpg',
    'https://example.com/image.png',
    'https://example.com/image.webp',
    'https://example.com/image.svg',
    'https://cdn.example.com/optimized-image.jpg',
  ],
};

/**
 * Generates realistic SEO test data
 */
export const seoTestData = {
  // Complete metadata examples
  metadataExamples: [
    {
      title: 'Homepage - Example Site',
      description:
        'Welcome to Example Site, your trusted source for amazing products and services.',
      image: 'https://example.com/homepage-image.jpg',
      keywords: ['homepage', 'example', 'products', 'services'],
      openGraph: {
        type: 'website',
        siteName: 'Example Site',
      },
      twitter: {
        card: 'summary_large_image',
        site: '@examplesite',
      },
    },
    {
      title: 'Blog Post: SEO Best Practices',
      description:
        'Learn the latest SEO best practices to improve your website ranking and visibility.',
      image: 'https://example.com/blog-seo-post.jpg',
      keywords: ['seo', 'best practices', 'ranking', 'optimization'],
      openGraph: {
        type: 'article',
        publishedTime: '2024-01-15T10:00:00Z',
        authors: ['SEO Expert'],
        section: 'SEO',
        tags: ['seo', 'optimization', 'ranking'],
      },
    },
    {
      title: 'Product: Amazing Widget Pro',
      description: 'The Amazing Widget Pro is the ultimate solution for all your widget needs.',
      image: 'https://example.com/products/widget-pro.jpg',
      keywords: ['widget', 'pro', 'amazing', 'product'],
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
    },
  ],

  // Structured data examples
  structuredDataExamples: [
    {
      type: 'Organization',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Example Corporation',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        sameAs: [
          'https://facebook.com/example',
          'https://twitter.com/example',
          'https://linkedin.com/company/example',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-123-4567',
          contactType: 'customer service',
          availableLanguage: ['English', 'Spanish'],
        },
      },
    },
    {
      type: 'Product',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Premium Widget',
        description: 'High-quality premium widget for professional use',
        image: 'https://example.com/premium-widget.jpg',
        brand: {
          '@type': 'Brand',
          name: 'Example Brand',
        },
        offers: {
          '@type': 'Offer',
          price: '149.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Example Store',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          reviewCount: '127',
        },
      },
    },
    {
      type: 'BreadcrumbList',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://example.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: 'https://example.com/products',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Widgets',
            item: 'https://example.com/products/widgets',
          },
        ],
      },
    },
  ],

  // Sitemap examples
  sitemapExamples: [
    {
      url: 'https://example.com',
      lastModified: '2024-01-01',
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://example.com/about',
      lastModified: '2024-01-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://example.com/products',
      lastModified: '2024-01-15',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ],

  // robots.txt examples
  robotsExamples: [
    {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/admin', '/private'],
      sitemap: 'https://example.com/sitemap.xml',
    },
    {
      userAgent: 'Googlebot',
      allow: ['/'],
      disallow: ['/no-google'],
      crawlDelay: 1,
    },
  ],
};

/**
 * Generates edge case test data
 */
export const edgeCaseTestData = {
  // Empty/null/undefined values
  emptyValues: {
    emptyString: '',
    nullValue: null,
    undefinedValue: undefined,
    emptyObject: {},
    emptyArray: [],
  },

  // Very long content
  longContent: {
    longTitle:
      'This is a very long title that exceeds the typical recommended length for SEO purposes and should be tested to ensure proper handling'.repeat(
        2,
      ),
    longDescription:
      'This is a very long description that far exceeds the typical recommended length for meta descriptions in SEO and should be tested for proper truncation and handling in various scenarios'.repeat(
        5,
      ),
    longKeywords: Array.from({ length: 100 }, (_, i) => `keyword${i}`),
  },

  // Special characters
  specialCharacters: {
    title: 'Title with "quotes" & ampersands < and > brackets',
    description: 'Description with émojis 🎉, ñoñó characters, and © symbols',
    keywords: ['keyword with spaces', 'keyword-with-dashes', 'keyword_with_underscores'],
  },

  // Invalid data
  invalidData: {
    invalidUrl: 'not-a-valid-url',
    invalidImage: 'invalid-image-url',
    invalidDate: 'not-a-date',
    invalidStructuredData: {
      '@context': 'invalid-context',
      '@type': null,
      name: undefined,
    },
  },

  // Large datasets
  largeDatasets: {
    manyImages: Array.from({ length: 50 }, (_, i) => `https://example.com/image${i}.jpg`),
    manyKeywords: Array.from({ length: 100 }, (_, i) => `keyword${i}`),
    manyBreadcrumbs: Array.from({ length: 20 }, (_, i) => ({
      name: `Level ${i}`,
      url: `https://example.com/level${i}`,
    })),
  },

  // Multilingual content
  multilingualContent: {
    titles: {
      en: 'English Title',
      fr: 'Titre Français',
      es: 'Título Español',
      de: 'Deutsche Titel',
      ja: '日本語のタイトル',
      zh: '中文标题',
    },
    descriptions: {
      en: 'English description',
      fr: 'Description française',
      es: 'Descripción en español',
      de: 'Deutsche Beschreibung',
      ja: '日本語の説明',
      zh: '中文描述',
    },
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

  /**
   * Creates breadcrumb data with specific characteristics
   */
  breadcrumbSchema: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Large metadata object
    largeMetadata: (propertyCount = 100) =>
      Array.from({ length: propertyCount }, (_, i) => [`property_${i}`, `value_${i}`]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {
          title: 'Large Metadata Test',
          description: 'Testing with many properties',
        },
      ),

    // Many structured data schemas
    manySchemas: (count = 20) =>
      Array.from({ length: count }, (_, i) =>
        createTestData.structuredDataSchema('Person', { name: `Person ${i}` }),
      ),

    // Complex nested structured data
    complexSchema: () => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Complex Product',
      brand: {
        '@type': 'Brand',
        name: 'Complex Brand',
        logo: 'https://example.com/brand-logo.jpg',
      },
      offers: Array.from({ length: 10 }, (_, i) => ({
        '@type': 'Offer',
        price: `${10 + i * 5}.99`,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: `Seller ${i}`,
        },
      })),
      reviews: Array.from({ length: 50 }, (_, i) => ({
        '@type': 'Review',
        author: `Reviewer ${i}`,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: Math.floor(Math.random() * 5) + 1,
        },
        reviewBody: `This is review number ${i}`,
      })),
    }),
  },
};

/**
 * Validation helpers for test data
 */
export const validateTestData = {
  /**
   * Validates that metadata has all required properties
   */
  hasRequiredMetadata: (metadata: any) => {
    const required = ['title', 'description'];
    const missing = required.filter(prop => !metadata[prop]);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that OpenGraph data is properly formatted
   */
  hasValidOpenGraph: (og: any) => {
    if (!og) return false;
    return og.title && og.description && og.type;
  },

  /**
   * Validates that structured data follows schema.org format
   */
  hasValidSchemaOrg: (schema: any) => {
    if (!schema) return false;
    return schema['@context'] === 'https://schema.org' && schema['@type'];
  },

  /**
   * Validates that URLs are properly formatted
   */
  hasValidUrls: (urls: string[]) => {
    return urls.every(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  },

  /**
   * Validates that image URLs are accessible
   */
  hasValidImages: (images: string[]) => {
    return images.every(img => {
      try {
        new URL(img);
        return img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null;
      } catch {
        return false;
      }
    });
  },
};
