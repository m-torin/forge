import { SEOManager } from '@repo/seo/metadata-enhanced';

// Create a global SEO manager instance
export const seoManager = new SEOManager({
  applicationName: 'Ciseco Store',
  author: {
    name: 'Ciseco Team',
    url: 'https://ciseco.com',
  },
  keywords: ['ecommerce', 'fashion', 'clothing', 'accessories'],
  locale: 'en_US',
  publisher: 'Ciseco Inc.',
  themeColor: '#0ea5e9',
  twitterHandle: '@ciseco',
});

// Use in your pages
export async function generateProductMetadata(product: any, locale: string) {
  return seoManager.createMetadata({
    title: product.title,
    description: product.description,
    image: {
      url: product.featuredImage?.src,
      alt: product.title,
      width: 1200,
      height: 630,
    },
    keywords: product.tags || [],
    article: product.publishedAt ? {
      publishedTime: product.publishedAt,
      modifiedTime: product.updatedAt,
      section: 'Products',
      tags: product.tags,
    } : undefined,
    alternates: {
      canonical: `/products/${product.handle}`,
      languages: {
        'en': `/en/products/${product.handle}`,
        'fr': `/fr/products/${product.handle}`,
        'es': `/es/products/${product.handle}`,
        'pt': `/pt/products/${product.handle}`,
        'de': `/de/products/${product.handle}`,
      },
    },
  });
}