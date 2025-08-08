/**
 * @fileoverview Next.js 15 SEO Features Comprehensive Example
 * @module @repo/seo/examples/nextjs-15-features
 *
 * This example demonstrates all the enhanced Next.js 15 SEO features
 * provided by the @repo/seo package, including:
 *
 * - Optimized JsonLd components with Script strategy
 * - Streaming-compatible structured data
 * - Metadata templates for common patterns
 * - Dynamic viewport configuration
 * - Multi-language sitemap generation
 * - Preview mode metadata handling
 * - Edge-compatible metadata generation
 *
 * @example
 * // Import the features you need
 * import { OptimizedJsonLd, metadataTemplates } from '@repo/seo/client/next';
 * import { generateMetadataAsync, generateI18nSitemap } from '@repo/seo/server/next';
 */

// ============================================
// CLIENT-SIDE EXAMPLES (client-next.tsx)
// ============================================

// ============================================
// SERVER-SIDE EXAMPLES (server-next.ts)
// ============================================
import { Metadata } from 'next';
import { Product, WithContext } from 'schema-dts';

import { OptimizedJsonLd, StreamingJsonLd, useOpenGraphPreview } from '@repo/seo/client/next';
import {
  generateI18nSitemap,
  generateMetadataAsync,
  generateMetadataEdge,
  generatePreviewMetadata,
  generateViewport,
  metadataTemplates,
  SEOManager,
  viewportPresets,
} from '@repo/seo/server/next';

/**
 * Example: Optimized JsonLd with Next.js Script component
 * This provides better performance by controlling when the script loads
 */
export function ProductPageWithOptimizedSEO({ product }: { product: any }) {
  const structuredData: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <OptimizedJsonLd data={structuredData} id="product-data" strategy="afterInteractive" />

      <OptimizedJsonLd
        data={structuredData}
        id="critical-product-data"
        strategy="beforeInteractive"
      />
    </>
  );
}

/**
 * Example: Streaming JsonLd for React Server Components
 * Perfect for async data that needs SEO optimization
 */
export function StreamingProductPage({ productId }: { productId: string }) {
  // This could be a fetch from your database
  const productPromise = (async () => {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
    } as WithContext<Product>;
  })();

  const fallbackData: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Loading...',
    description: 'Product information is loading',
  };

  return (
    <StreamingJsonLd dataPromise={productPromise} fallback={fallbackData} id="streaming-product" />
  );
}

/**
 * Example: Dynamic Open Graph Preview Hook
 * Useful for content editors or preview modes
 */
export function ContentEditor() {
  const { preview, updatePreview, generatePreviewHtml } = useOpenGraphPreview({
    title: 'My Article',
    description: 'Article description',
    image: '/images/article-hero.jpg',
    url: 'https://example.com/article',
  });

  return (
    <div>
      <h2>SEO Preview</h2>
      <input
        placeholder="Title"
        value={preview.title}
        onChange={(e: any) => updatePreview({ title: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={preview.description}
        onChange={(e: any) => updatePreview({ description: e.target.value })}
      />
      <div>
        <h3>Generated Meta Tags:</h3>
        <pre>{generatePreviewHtml()}</pre>
      </div>
    </div>
  );
}

/**
 * Example: Using metadata templates for a product page
 */
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return metadataTemplates.product({
    name: product.name,
    description: product.description,
    price: product.price,
    currency: 'USD',
    image: product.image,
    availability: product.inStock ? 'InStock' : 'OutOfStock',
    brand: product.brand,
  });
}

/**
 * Example: Article metadata with author and publishing info
 */
export function ArticleMetadata({ article }: { article: any }): Metadata {
  return metadataTemplates.article({
    title: article.title,
    description: article.excerpt,
    author: article.author.name,
    publishedTime: new Date(article.publishedAt),
    modifiedTime: article.updatedAt ? new Date(article.updatedAt) : undefined,
    image: article.featuredImage,
    tags: article.tags,
    section: article.category,
  });
}

/**
 * Example: User profile metadata
 */
export function ProfileMetadata({ user }: { user: any }): Metadata {
  return metadataTemplates.profile({
    name: user.displayName,
    bio: user.bio,
    image: user.avatar,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}

/**
 * Example: Dynamic viewport based on user agent
 */
export function generateDynamicViewport(request: any) {
  const userAgent = request.headers.get('user-agent') || '';
  return generateViewport(userAgent);
}

/**
 * Example: Using viewport presets
 */
export const viewportExamples = {
  // Default responsive viewport
  default: viewportPresets.default,

  // Mobile app that shouldn't zoom
  mobileApp: viewportPresets.mobileOptimized,

  // Content-heavy tablet site
  tablet: viewportPresets.tablet,

  // Desktop-first application
  desktop: viewportPresets.desktop,
};

/**
 * Example: Multi-language sitemap generation
 */
export async function generateMultiLangSitemap() {
  const products = await getProducts();
  const locales = ['en', 'es', 'fr', 'de'];
  const baseUrl = 'https://example.com';

  const routes = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return generateI18nSitemap(routes, locales, 'en');
}

/**
 * Example: Preview mode metadata
 */
export function DraftPageMetadata({ isDraft, page }: { isDraft: boolean; page: any }) {
  const baseMetadata: Metadata = {
    title: page.title,
    description: page.description,
  };

  return generatePreviewMetadata(isDraft, baseMetadata, {
    draftIndicator: '🚧 DRAFT',
    noIndexDrafts: true,
  });
}

/**
 * Example: Async metadata generation with Next.js 15 patterns
 */
export async function ProductPageMetadata(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  return generateMetadataAsync({
    params: props.params,
    searchParams: props.searchParams,
    generator: async (params, searchParams: any) => {
      const product = await getProduct(params.id);
      const variant = searchParams.variant;

      return {
        title: variant ? `${product.name} - ${variant}` : product.name,
        description: product.description,
      };
    },
  });
}

/**
 * Example: Edge-compatible metadata generation
 */
export async function EdgeMetadata(request: any) {
  // This runs on the edge runtime
  const url = new URL(request.url);
  const slug = url.pathname.split('/').pop();

  return generateMetadataEdge(request, {
    title: `Edge Page - ${slug}`,
    description: 'This metadata was generated on the edge',
    image: '/images/edge-og.jpg',
  });
}

/**
 * Example: Using SEOManager for consistent configuration
 */
const seoManager = new SEOManager({
  applicationName: 'My E-commerce Store',
  author: {
    name: 'John Doe',
    url: 'https://johndoe.com',
  },
  keywords: ['ecommerce', 'shopping', 'online store'],
  locale: 'en_US',
  publisher: 'My Company',
  themeColor: '#0070f3',
  twitterHandle: '@mystore',
});

/**
 * Example: Generate error page metadata
 */
export function ErrorPageMetadata(statusCode: number) {
  return seoManager.createErrorMetadata(statusCode);
}

/**
 * Example: Generate metadata with SEOManager
 */
export function PageWithSEOManager({ page }: { page: any }) {
  return seoManager.createMetadata({
    title: page.title,
    description: page.description,
    image: page.image,
    keywords: page.tags,
    article:
      page.type === 'article'
        ? {
            publishedTime: page.publishedAt,
            modifiedTime: page.updatedAt,
            authors: [page.author],
            tags: page.tags,
          }
        : undefined,
  });
}

// ============================================
// HELPER FUNCTIONS (for examples)
// ============================================

async function getProduct(id: string) {
  // Mock implementation
  return {
    id,
    name: 'Example Product',
    description: 'A great product',
    price: 99.99,
    currency: 'USD',
    image: '/images/product.jpg',
    inStock: true,
    brand: 'Example Brand',

    slug: 'example-product',
    updatedAt: new Date(),
  };
}

async function getProducts() {
  // Mock implementation
  return [
    { slug: 'product-1', updatedAt: new Date() },
    { slug: 'product-2', updatedAt: new Date() },
  ];
}

/**
 * Example: Complete page with all SEO features
 */
export default async function ComprehensiveSEOExample() {
  const product = await getProduct('123');

  // Generate metadata
  const metadata = metadataTemplates.product({
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.image,
    availability: 'InStock',
  });

  // Return complete page setup
  return {
    metadata,
    viewport: viewportPresets.default,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
    },
  };
}
