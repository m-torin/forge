/**
 * @fileoverview Next.js 15 Metadata Generation Patterns
 * @module @repo/seo/examples/metadata-patterns
 *
 * This example demonstrates various metadata generation patterns
 * for Next.js 15 applications using the @repo/seo package.
 *
 * Topics covered:
 * - Static metadata generation
 * - Dynamic metadata with async data
 * - Metadata composition and inheritance
 * - Multi-language metadata
 * - Conditional metadata based on environment
 * - Error and edge case handling
 *
 * @example
 * // Use these patterns in your app/[route]/page.tsx files
 * export { generateMetadata } from '@repo/seo/examples/metadata-patterns';
 */

import { Metadata } from 'next';

import {
  createMetadata,
  generatePreviewMetadata,
  metadataTemplates,
  SEOManager,
} from '@repo/seo/server/next';

// ============================================
// BASIC PATTERNS
// ============================================

/**
 * Pattern 1: Static metadata for fixed pages
 */
export const staticMetadata: Metadata = createMetadata({
  title: 'About Us',
  description: 'Learn more about our company and mission',
  image: '/images/about-hero.jpg',
});

/**
 * Pattern 2: Function-based metadata for simple dynamic content
 */
export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const categoryTitles: Record<string, string> = {
    electronics: 'Electronics & Gadgets',
    clothing: 'Fashion & Apparel',
    home: 'Home & Living',
  };

  return createMetadata({
    title: categoryTitles[params.category] || 'Products',
    description: `Browse our selection of ${params.category}`,
  });
}

// ============================================
// ASYNC PATTERNS
// ============================================

/**
 * Pattern 3: Async metadata with database queries
 */
export async function generateProductMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const product = await fetchProduct(params.id);

    return metadataTemplates.product({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      image: product.images[0],
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
      brand: product.brand,
    });
  } catch {
    // Fallback for errors
    return createMetadata({
      title: 'Product Not Found',
      description: 'The requested product could not be found',
    });
  }
}

/**
 * Pattern 4: Parallel data fetching for metadata
 */
export async function generateBlogMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Fetch multiple data sources in parallel
  const [post, author, _relatedPosts] = await Promise.all([
    fetchBlogPost(params.slug),
    fetchAuthor(params.slug),
    fetchRelatedPosts(params.slug),
  ]);

  return metadataTemplates.article({
    title: post.title,
    description: post.excerpt,
    author: author.name,
    publishedTime: new Date(post.publishedAt),
    modifiedTime: post.updatedAt ? new Date(post.updatedAt) : undefined,
    image: post.featuredImage,
    tags: post.tags,
    section: post.category,
  });
}

// ============================================
// COMPOSITION PATTERNS
// ============================================

/**
 * Pattern 5: Metadata composition with base configuration
 */
const baseMetadata = {
  authors: [{ name: 'My Company' }],
  creator: 'My Company',
  publisher: 'My Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export function composeMetadata(pageMetadata: Partial<Metadata>): Metadata {
  return {
    ...baseMetadata,
    ...pageMetadata,
    openGraph: pageMetadata.openGraph
      ? {
          ...pageMetadata.openGraph,
        }
      : undefined,
  };
}

/**
 * Pattern 6: Metadata inheritance with SEOManager
 */
const seoManager = new SEOManager({
  applicationName: 'My App',
  author: { name: 'John Doe', url: 'https://example.com' },
  publisher: 'My Company',
  twitterHandle: '@myapp',
  locale: 'en_US',
  keywords: ['app', 'service', 'platform'],
});

export function inheritedMetadata(page: {
  title: string;
  description: string;
  keywords?: string[];
}): Metadata {
  return seoManager.createMetadata({
    title: page.title,
    description: page.description,
    keywords: page.keywords,
  });
}

// ============================================
// CONDITIONAL PATTERNS
// ============================================

/**
 * Pattern 7: Environment-based metadata
 */
export function environmentalMetadata(title: string, description: string): Metadata {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isStaging = process.env.VERCEL_ENV === 'preview';

  let metadata = createMetadata({ title, description });

  if (isDevelopment) {
    metadata.robots = { index: false, follow: false };
    metadata.title = `[DEV] ${metadata.title}`;
  } else if (isStaging) {
    metadata = generatePreviewMetadata(true, metadata, {
      draftIndicator: '[STAGING]',
      noIndexDrafts: true,
    });
  }

  return metadata;
}

/**
 * Pattern 8: Feature flag based metadata
 */
export async function featureFlagMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const [product, flags] = await Promise.all([fetchProduct(params.id), fetchFeatureFlags()]);

  const baseMetadata = metadataTemplates.product({
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.images[0],
    availability: 'InStock',
  });

  // Add experimental features based on flags
  if (flags.enableRichSnippets) {
    baseMetadata.other = {
      'product:condition': 'new',
      'product:retailer_item_id': product.id,
    } as Record<string, string | number | (string | number)[]>;
  }

  if (flags.enableVideoMetadata && product.video) {
    baseMetadata.openGraph = {
      ...baseMetadata.openGraph,
      videos: [product.video],
    };
  }

  return baseMetadata;
}

// ============================================
// MULTI-LANGUAGE PATTERNS
// ============================================

/**
 * Pattern 9: Multi-language metadata
 */
export async function i18nMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const translations = await fetchTranslations(params.locale, params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com';

  return createMetadata({
    title: translations.title,
    description: translations.description,
    alternates: {
      canonical: `${baseUrl}/${params.locale}/${params.slug}`,
      languages: {
        en: `${baseUrl}/en/${params.slug}`,
        es: `${baseUrl}/es/${params.slug}`,
        fr: `${baseUrl}/fr/${params.slug}`,
        de: `${baseUrl}/de/${params.slug}`,
      },
    },
    openGraph: {
      locale: params.locale,
      alternateLocale: ['en', 'es', 'fr', 'de'].filter((l: any) => l !== params.locale),
    },
  });
}

// ============================================
// ERROR HANDLING PATTERNS
// ============================================

/**
 * Pattern 10: Robust error handling with fallbacks
 */
export async function robustMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const product = await fetchProductWithTimeout(params.id, 3000);

    if (!product) {
      return seoManager.createErrorMetadata(404);
    }

    return metadataTemplates.product({
      name: product.name,
      description: product.description || 'No description available',
      price: product.price || 0,
      currency: product.currency || 'USD',
      image: product.images?.[0] || '/images/placeholder.jpg',
      availability: 'InStock',
    });
  } catch (error: any) {
    console.error('Metadata generation error:', error);

    // Return safe fallback
    return createMetadata({
      title: 'Product',
      description: 'View product details',
      robots: { index: true, follow: true },
    });
  }
}

// ============================================
// ADVANCED PATTERNS
// ============================================

/**
 * Pattern 11: A/B testing metadata
 */
export async function abTestMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { variant?: string };
}): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  const variant = searchParams.variant || 'control';

  const variants: Record<string, Partial<Metadata>> = {
    control: {
      title: product.name,
      description: product.description,
    },
    testA: {
      title: `${product.name} - Best Price Guaranteed`,
      description: `${product.description} Shop now for exclusive deals!`,
    },
    testB: {
      title: `${product.name} | ${product.brand}`,
      description: `Discover ${product.name}. ${product.description}`,
    },
  };

  const selectedVariant = variants[variant] || variants.control;

  return createMetadata({
    title: selectedVariant.title || product.name,
    description: selectedVariant.description || product.description,
    image: product.images[0],
  });
}

/**
 * Pattern 12: Schema.org rich results optimization
 */
export function richResultsMetadata(data: {
  type: 'product' | 'article' | 'recipe' | 'event';
  content: any;
}): Metadata {
  const base = createMetadata({
    title: data.content.name || data.content.title,
    description: data.content.description,
  });

  // Add type-specific metadata
  switch (data.type) {
    case 'product':
      return {
        ...base,
        ...metadataTemplates.product(data.content),
      };

    case 'article':
      return {
        ...base,
        ...metadataTemplates.article(data.content),
      };

    case 'recipe':
      return {
        ...base,
        other: {
          'recipe:prep_time': data.content.prepTime,
          'recipe:cook_time': data.content.cookTime,
          'recipe:yield': data.content.servings,
        },
      };

    case 'event':
      return {
        ...base,
        other: {
          'event:start_date': data.content.startDate,
          'event:end_date': data.content.endDate,
          'event:location': data.content.location,
        },
      };

    default:
      return base;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchProduct(id: string): Promise<any> {
  // Mock implementation
  return {
    id,
    name: 'Sample Product',
    description: 'A great product for testing',
    price: 99.99,
    currency: 'USD',
    images: ['/images/product.jpg'],
    stock: 10,
    brand: 'Test Brand',
  };
}

async function fetchBlogPost(_slug: string): Promise<any> {
  // Mock implementation
  return {
    title: 'Sample Blog Post',
    excerpt: 'This is a sample blog post excerpt',
    publishedAt: new Date().toISOString(),
    featuredImage: '/images/blog.jpg',
    tags: ['sample', 'test'],
    category: 'Technology',
  };
}

async function fetchAuthor(_slug: string): Promise<any> {
  return { name: 'John Doe' };
}

async function fetchRelatedPosts(_slug: string): Promise<any[]> {
  return [];
}

async function fetchFeatureFlags(): Promise<any> {
  return { enableRichSnippets: true, enableVideoMetadata: false };
}

async function fetchTranslations(locale: string, _slug: string): Promise<any> {
  return {
    title: `Title in ${locale}`,
    description: `Description in ${locale}`,
  };
}

async function fetchProductWithTimeout(id: string, timeout: number): Promise<any> {
  return Promise.race([
    fetchProduct(id),
    new Promise((_resolve, reject: any) => setTimeout(() => reject(new Error('Timeout')), timeout)),
  ]);
}
