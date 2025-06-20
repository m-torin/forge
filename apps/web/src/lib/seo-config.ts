// import { SEOManager } from "@repo/seo/server/next";

// Temporary type definition until package dependencies are resolved
interface SEOConfig {
  applicationName: string;
  author: {
    name: string;
    url: string;
  };
  keywords?: string[];
  locale?: string;
  publisher: string;
  themeColor?: string;
  twitterHandle: string;
}

class SEOManager {
  constructor(_config: SEOConfig) {}
  createMetadata(_options: any): any {
    return {};
  }
  createErrorMetadata(_statusCode: number): any {
    return {};
  }
}

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
export async function generateProductMetadata(product: any, _locale: string) {
  return seoManager.createMetadata({
    alternates: {
      canonical: `/products/${product.handle}`,
      languages: {
        de: `/de/products/${product.handle}`,
        en: `/en/products/${product.handle}`,
        es: `/es/products/${product.handle}`,
        fr: `/fr/products/${product.handle}`,
        pt: `/pt/products/${product.handle}`,
      },
    },
    article: product.publishedAt
      ? {
          modifiedTime: product.updatedAt,
          publishedTime: product.publishedAt,
          section: 'Products',
          tags: product.tags,
        }
      : undefined,
    description: product.description,
    image: {
      width: 1200,
      url: product.featuredImage?.src,
      alt: product.title,
      height: 630,
    },
    keywords: product.tags || [],
    title: product.title,
  });
}
