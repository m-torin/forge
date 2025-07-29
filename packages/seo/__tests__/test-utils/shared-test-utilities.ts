/**
 * Shared Test Utilities
 *
 * Common utilities and patterns used across SEO test suites.
 * Provides helpers for mocking, assertions, and test data generation.
 */

import { vi } from 'vitest';

/**
 * Creates a mock Next.js metadata response
 */
export function createMockMetadata(overrides: any = {}) {
  return {
    title: 'Test Page | Test Site',
    description: 'Test page description',
    applicationName: 'Test App',
    publisher: 'Test Publisher',
    keywords: ['test', 'seo'],
    authors: [{ name: 'Test Author' }],
    creator: 'Test Creator',
    referrer: 'origin-when-cross-origin',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: 'Test Page',
      description: 'Test page description',
      type: 'website',
      url: 'https://test.com',
      siteName: 'Test Site',
      images: [
        {
          url: 'https://test.com/image.jpg',
          width: 1200,
          height: 630,
          alt: 'Test Image',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@testsite',
      creator: '@testcreator',
      title: 'Test Page',
      description: 'Test page description',
      images: ['https://test.com/twitter-image.jpg'],
    },
    ...overrides,
  };
}

/**
 * Creates a mock viewport configuration
 */
export function createMockViewport(overrides: any = {}) {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    colorScheme: 'light dark',
    themeColor: '#000000',
    ...overrides,
  };
}

/**
 * Creates a mock structured data schema
 */
export function createMockStructuredData(type: string, overrides: any = {}) {
  const baseSchemas: Record<string, any> = {
    Person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Test Person',
      email: 'test@example.com',
      url: 'https://test.com',
    },
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test Organization',
      url: 'https://test.com',
      logo: 'https://test.com/logo.png',
    },
    Product: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
      description: 'Test product description',
      image: 'https://test.com/product.jpg',
    },
    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
      description: 'Test article description',
      author: {
        '@type': 'Person',
        name: 'Test Author',
      },
      datePublished: '2024-01-01T00:00:00Z',
    },
    BreadcrumbList: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://test.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Test Page',
          item: 'https://test.com/test',
        },
      ],
    },
  };

  return {
    ...baseSchemas[type],
    ...overrides,
  };
}

/**
 * Creates a mock React component for testing
 */
export function createMockReactComponent() {
  return vi.fn().mockImplementation((props: any) => ({
    type: 'div',
    props: {
      ...props,
      children: props.children || 'Mock Component',
    },
  }));
}

/**
 * Creates a mock JSON-LD script element
 */
export function createMockJsonLdScript(data: any) {
  return {
    type: 'script',
    props: {
      type: 'application/ld+json',
      dangerouslySetInnerHTML: {
        __html: JSON.stringify(data),
      },
    },
  };
}

/**
 * Assertion helpers for SEO tests
 */
export const seoAssertions = {
  /**
   * Asserts that metadata has required SEO properties
   */
  hasRequiredSEOProperties: (metadata: any) => {
    expect(metadata).toBeDefined();
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(typeof metadata.title).toBe('string');
    expect(typeof metadata.description).toBe('string');
  },

  /**
   * Asserts that OpenGraph data is properly formatted
   */
  hasValidOpenGraph: (metadata: any) => {
    expect(metadata).toHaveProperty('openGraph');
    expect(metadata.openGraph).toHaveProperty('title');
    expect(metadata.openGraph).toHaveProperty('description');
    expect(metadata.openGraph).toHaveProperty('type');

    if (metadata.openGraph.images) {
      expect(Array.isArray(metadata.openGraph.images)).toBeTruthy();
      metadata.openGraph.images.forEach((image: any) => {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('width');
        expect(image).toHaveProperty('height');
      });
    }
  },

  /**
   * Asserts that Twitter Card data is properly formatted
   */
  hasValidTwitterCard: (metadata: any) => {
    expect(metadata).toHaveProperty('twitter');
    expect(metadata.twitter).toHaveProperty('card');
    expect(['summary', 'summary_large_image', 'app', 'player']).toContain(metadata.twitter.card);
  },

  /**
   * Asserts that structured data follows schema.org format
   */
  hasValidSchemaOrg: (schema: any) => {
    expect(schema).toBeDefined();
    expect(schema).toHaveProperty('@context');
    expect(schema).toHaveProperty('@type');
    expect(schema['@context']).toBe('https://schema.org');
    expect(typeof schema['@type']).toBe('string');
  },

  /**
   * Asserts that viewport configuration is valid
   */
  hasValidViewport: (viewport: any) => {
    expect(viewport).toBeDefined();
    expect(viewport).toHaveProperty('width');
    expect(viewport).toHaveProperty('initialScale');

    if (viewport.width !== 'device-width') {
      expect(typeof viewport.width).toBe('number');
    }
    expect(typeof viewport.initialScale).toBe('number');
  },

  /**
   * Asserts that JSON-LD component output is valid
   */
  hasValidJsonLd: (component: any) => {
    expect(component).toBeDefined();
    expect(component.type).toBe('script');
    expect(component.props.type).toBe('application/ld+json');
    expect(component.props.dangerouslySetInnerHTML).toBeDefined();
    expect(component.props.dangerouslySetInnerHTML.__html).toBeDefined();

    // Verify JSON is valid
    const parsed = JSON.parse(component.props.dangerouslySetInnerHTML.__html);
    expect(parsed).toBeDefined();
  },
};

/**
 * Test data generators for common scenarios
 */
export const testDataGenerators = {
  /**
   * Generates test metadata with various characteristics
   */
  generateTestMetadata: (count = 10) => {
    const titles = [
      'Homepage',
      'About Us',
      'Products',
      'Services',
      'Contact',
      'Blog',
      'News',
      'FAQ',
      'Help',
      'Support',
    ];
    const descriptions = [
      'Learn more about our amazing products and services',
      'Get in touch with our friendly team',
      'Discover the latest news and updates',
      'Find answers to frequently asked questions',
      'Browse our comprehensive product catalog',
    ];

    return Array.from({ length: count }, (_, i) => ({
      title: `${titles[i % titles.length]} - Test Site`,
      description: descriptions[i % descriptions.length],
      image: `https://test.com/image-${i}.jpg`,
      keywords: [`keyword-${i}`, 'test', 'seo'],
    }));
  },

  /**
   * Generates test structured data schemas
   */
  generateTestSchemas: (types: string[], count = 5) => {
    return types.flatMap(type =>
      Array.from({ length: count }, (_, i) =>
        createMockStructuredData(type, { name: `${type} ${i}` }),
      ),
    );
  },

  /**
   * Generates test URLs with various characteristics
   */
  generateTestUrls: (count = 10) => {
    const domains = ['test.com', 'example.org', 'demo.net'];
    const paths = ['', '/page', '/products', '/about', '/contact'];
    const params = ['', '?param=value', '?utm_source=test', '?page=1'];
    const fragments = ['', '#section', '#top', '#content'];

    return Array.from({ length: count }, (_, i) => {
      const domain = domains[i % domains.length];
      const path = paths[i % paths.length];
      const param = params[i % params.length];
      const fragment = fragments[i % fragments.length];
      return `https://${domain}${path}${param}${fragment}`;
    });
  },

  /**
   * Generates test breadcrumb data
   */
  generateTestBreadcrumbs: (depth = 5) => {
    const levels = ['Home', 'Category', 'Subcategory', 'Product', 'Details'];

    return Array.from({ length: depth }, (_, i) => ({
      name: levels[i] || `Level ${i}`,
      url: `https://test.com/${levels[i]?.toLowerCase() || `level-${i}`}`,
    }));
  },
};

/**
 * Performance test helpers
 */
export const performanceHelpers = {
  /**
   * Measures execution time of a function
   */
  measureExecutionTime: async <T>(
    fn: () => T | Promise<T>,
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    return { result, duration };
  },

  /**
   * Tests metadata generation performance
   */
  testMetadataPerformance: async (metadataFn: Function, inputs: any[], maxDuration = 100) => {
    const { duration } = await performanceHelpers.measureExecutionTime(() => {
      return inputs.map(input => metadataFn(input));
    });

    expect(duration).toBeLessThan(maxDuration);
  },

  /**
   * Tests structured data generation performance
   */
  testSchemaPerformance: async (schemaFn: Function, inputs: any[], maxDuration = 50) => {
    const { duration } = await performanceHelpers.measureExecutionTime(() => {
      return inputs.map(input => schemaFn(input));
    });

    expect(duration).toBeLessThan(maxDuration);
  },
};

/**
 * Mock setup helpers
 */
export const mockHelpers = {
  /**
   * Sets up standard SEO environment mocks
   */
  setupSEOMocks: () => {
    // Mock Next.js modules
    vi.doMock('next', () => ({
      Metadata: {},
      Viewport: {},
      MetadataRoute: {},
    }));

    // Mock server-only
    vi.doMock('server-only', () => ({}));

    // Mock React
    vi.doMock('react', async () => {
      const actual = await vi.importActual('react');
      return {
        ...actual,
        createElement: vi.fn().mockImplementation((type, props, ...children) => ({
          type,
          props: { ...props, children },
        })),
      };
    });

    // Mock environment variables
    const mockEnv = {
      NODE_ENV: 'development',
      VERCEL_PROJECT_PRODUCTION_URL: 'test.com',
      NEXT_PUBLIC_URL: 'https://test.com',
      NEXT_PUBLIC_SITE_NAME: 'Test Site',
      NEXT_PUBLIC_SITE_DESCRIPTION: 'Test site description',
    };

    vi.stubGlobal('process', {
      ...process,
      env: {
        ...process.env,
        ...mockEnv,
      },
    });

    return { mockEnv };
  },

  /**
   * Sets up browser environment mocks
   */
  setupBrowserMocks: () => {
    const mockWindow = {
      location: {
        href: 'https://test.com/page',
        origin: 'https://test.com',
        pathname: '/page',
        search: '?param=value',
        hash: '#section',
      },
      document: {
        title: 'Test Page',
        createElement: vi.fn().mockReturnValue({
          setAttribute: vi.fn(),
          appendChild: vi.fn(),
        }),
        head: {
          appendChild: vi.fn(),
        },
      },
    };

    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('document', mockWindow.document);

    return { mockWindow };
  },

  /**
   * Resets all mocks to their default state
   */
  resetAllMocks: () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  },
};

/**
 * Validation helpers
 */
export const validationHelpers = {
  /**
   * Validates URL format
   */
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates email format
   */
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates schema.org structured data
   */
  isValidSchemaOrg: (schema: any) => {
    if (!schema || typeof schema !== 'object') return false;
    return schema['@context'] === 'https://schema.org' && typeof schema['@type'] === 'string';
  },

  /**
   * Validates metadata completeness
   */
  hasCompleteMetadata: (metadata: any) => {
    const required = ['title', 'description'];
    const optional = ['openGraph', 'twitter', 'keywords'];

    const hasRequired = required.every(prop => metadata[prop]);
    const hasOptional = optional.some(prop => metadata[prop]);

    return { hasRequired, hasOptional, score: hasRequired ? (hasOptional ? 100 : 75) : 0 };
  },
};
