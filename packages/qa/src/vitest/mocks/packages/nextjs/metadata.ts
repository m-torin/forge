// Next.js Metadata Generation mocks
import { vi } from 'vitest';

// Mock generateMetadata function
export const mockGenerateMetadata = vi.fn(async (props: any, parent?: any) => {
  return {
    title: 'Mock Title',
    description: 'Mock Description',
    openGraph: {
      title: 'Mock OG Title',
      description: 'Mock OG Description',
      images: ['/mock-og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mock Twitter Title',
      description: 'Mock Twitter Description',
      images: ['/mock-twitter-image.jpg'],
    },
  };
});

// Mock generateImageMetadata function
const mockGenerateImageMetadata = vi.fn(async (props: any) => {
  return [
    {
      id: 0,
      size: { width: 1200, height: 630 },
      contentType: 'image/png',
      alt: 'Mock Open Graph Image',
    },
    {
      id: 1,
      size: { width: 800, height: 600 },
      contentType: 'image/jpeg',
      alt: 'Mock Twitter Image',
    },
  ];
});

// Mock generateStaticParams function
const mockGenerateStaticParams = vi.fn(async () => {
  return [
    { id: '1', slug: 'first-post' },
    { id: '2', slug: 'second-post' },
    { id: '3', slug: 'third-post' },
  ];
});

// Mock generateViewport function
const mockGenerateViewport = vi.fn(async (props: any) => {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
    colorScheme: 'light',
  };
});

// Mock generateSitemaps function
const mockGenerateSitemaps = vi.fn(async () => {
  return [{ id: 'sitemap-1' }, { id: 'sitemap-2' }];
});

// Mock ImageResponse from next/og
const mockImageResponse = vi.fn((element: any, options: any = {}) => {
  const mockResponse = {
    body: 'mock-image-body',
    headers: new Headers({
      'Content-Type': options.contentType || 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    }),
    status: 200,
    statusText: 'OK',
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: vi.fn().mockResolvedValue(new Blob()),
  };
  return mockResponse;
});

// Mock next/og
vi.mock('next/og', () => ({
  ImageResponse: mockImageResponse,
}));

// Mock metadata types
export const mockMetadataTypes = {
  createMetadata: (overrides: any = {}) => ({
    title: 'Default Title',
    description: 'Default Description',
    keywords: ['next.js', 'react', 'typescript'],
    authors: [{ name: 'Test Author', url: 'https://example.com' }],
    creator: 'Test Creator',
    publisher: 'Test Publisher',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://example.com',
      title: 'Default OG Title',
      description: 'Default OG Description',
      siteName: 'Test Site',
      images: [
        {
          url: 'https://example.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Default OG Image',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Default Twitter Title',
      description: 'Default Twitter Description',
      creator: '@testcreator',
      images: ['https://example.com/twitter-image.jpg'],
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon-16x16.png',
    },
    manifest: '/manifest.json',
    themeColor: '#000000',
    colorScheme: 'light',
    viewport: 'width=device-width, initial-scale=1',
    category: 'technology',
    ...overrides,
  }),

  createImageMetadata: (overrides: any = {}) => ({
    id: 0,
    size: { width: 1200, height: 630 },
    contentType: 'image/png',
    alt: 'Default Image Alt',
    ...overrides,
  }),

  createViewport: (overrides: any = {}) => ({
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
    colorScheme: 'light',
    ...overrides,
  }),
};

// Mock metadata utilities
export const mockMetadataUtils = {
  resolveMetadata: vi.fn(async (metadata: any, parent?: any) => {
    const resolvedParent = parent || {};
    return {
      ...resolvedParent,
      ...metadata,
    };
  }),

  mergeOpenGraphImages: vi.fn((current: any[], parent: any[] = []) => {
    return [...current, ...parent];
  }),

  generateMetadataId: vi.fn(() => {
    return `metadata-${Math.random().toString(36).substring(2, 15)}`;
  }),

  validateMetadata: vi.fn((metadata: any) => {
    const errors = [];
    if (!metadata.title) errors.push('Title is required');
    if (!metadata.description) errors.push('Description is required');
    return { valid: errors.length === 0, errors };
  }),
};

// Mock metadata route handlers
export const mockMetadataRoutes = {
  robots: vi.fn(() => ({
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://example.com/sitemap.xml',
  })),

  sitemap: vi.fn(() => [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]),

  manifest: vi.fn(() => ({
    name: 'Mock App',
    short_name: 'MockApp',
    description: 'Mock Application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  })),
};

// Mock metadata caching
export const mockMetadataCache = {
  get: vi.fn((key: string) => null),
  set: vi.fn((key: string, value: any) => undefined),
  clear: vi.fn(() => undefined),
  has: vi.fn((key: string) => false),
};

// Mock metadata validation
export const mockMetadataValidation = {
  validateTitle: vi.fn((title: any) => {
    if (typeof title === 'string') return { valid: true };
    if (typeof title === 'object' && title.default) return { valid: true };
    return { valid: false, error: 'Invalid title format' };
  }),

  validateDescription: vi.fn((description: any) => {
    if (typeof description === 'string' && description.length > 0) {
      return { valid: true };
    }
    return { valid: false, error: 'Description must be a non-empty string' };
  }),

  validateOpenGraph: vi.fn((og: any) => {
    if (!og) return { valid: true };
    const errors = [];
    if (og.images && !Array.isArray(og.images)) {
      errors.push('OpenGraph images must be an array');
    }
    return { valid: errors.length === 0, errors };
  }),
};

// Mock metadata transformation
export const mockMetadataTransformation = {
  transformTitle: vi.fn((title: any, template?: string) => {
    if (typeof title === 'string') {
      return template ? template.replace('%s', title) : title;
    }
    if (typeof title === 'object') {
      return title.template ? title.template.replace('%s', title.default) : title.default;
    }
    return 'Untitled';
  }),

  transformImages: vi.fn((images: any[], baseUrl?: string) => {
    return images.map(image => {
      if (typeof image === 'string') {
        return {
          url: baseUrl ? new URL(image, baseUrl).toString() : image,
          width: 1200,
          height: 630,
        };
      }
      return image;
    });
  }),

  transformMetadataBase: vi.fn((metadata: any, base?: string) => {
    if (!base) return metadata;

    const transformed = { ...metadata };

    // Transform relative URLs to absolute
    if (transformed.openGraph?.images) {
      transformed.openGraph.images = mockMetadataTransformation.transformImages(
        transformed.openGraph.images,
        base,
      );
    }

    return transformed;
  }),
};

// Mock metadata testing utilities
export const metadataTestUtils = {
  createMockMetadata: mockMetadataTypes.createMetadata,
  createMockImageMetadata: mockMetadataTypes.createImageMetadata,
  createMockViewport: mockMetadataTypes.createViewport,

  expectMetadataGenerated: (generateMetadata: any, expectedMetadata: any) => {
    expect(generateMetadata).toHaveBeenCalledWith();
    expect(generateMetadata).toHaveReturnedWith(expect.objectContaining(expectedMetadata));
  },

  expectImageMetadataGenerated: (generateImageMetadata: any, expectedImages: any[]) => {
    expect(generateImageMetadata).toHaveBeenCalledWith();
    expect(generateImageMetadata).toHaveReturnedWith(expect.arrayContaining(expectedImages));
  },

  mockMetadataProps: (overrides: any = {}) => ({
    params: { id: '1', slug: 'test-post' },
    searchParams: { page: '1' },
    ...overrides,
  }),

  mockParentMetadata: (overrides: any = {}) => ({
    title: 'Parent Title',
    description: 'Parent Description',
    openGraph: {
      images: ['/parent-og-image.jpg'],
    },
    ...overrides,
  }),
};
