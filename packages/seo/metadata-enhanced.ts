import merge from 'lodash.merge';

import type { Metadata, Viewport } from 'next';

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

interface MetadataGeneratorOptions {
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    expirationTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
  canonical?: string;
  description: string;
  image?: string | { url: string; alt?: string; width?: number; height?: number };
  keywords?: string[];
  noFollow?: boolean;
  noIndex?: boolean;
  title: string;
}

// Enhanced viewport configuration for better mobile experience
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export class SEOManager {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  createMetadata(options: MetadataGeneratorOptions): Metadata {
    const {
      alternates,
      article,
      canonical,
      description,
      image,
      keywords = [],
      noFollow = false,
      noIndex = false,
      title,
      ...additionalProperties
    } = options;

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_URL;
    const parsedTitle = `${title} | ${this.config.applicationName}`;

    // Combine default keywords with page-specific ones
    const allKeywords = [...(this.config.keywords || []), ...keywords];

    const defaultMetadata: Metadata = {
      applicationName: this.config.applicationName,
      authors: [{ name: this.config.author.name, url: this.config.author.url }],
      creator: this.config.author.name,
      description,
      keywords: allKeywords,
      publisher: this.config.publisher,
      title: {
        default: parsedTitle,
        template: `%s | ${this.config.applicationName}`,
      },

      // Enhanced format detection
      formatDetection: {
        address: false,
        date: false,
        email: false,
        telephone: false,
      },

      // Metadata base for absolute URLs
      metadataBase: productionUrl ? new URL(`${protocol}://${productionUrl}`) : undefined,

      // Robots directives
      robots: {
        follow: !noFollow,
        googleBot: {
          'max-video-preview': -1,
          follow: !noFollow,
          index: !noIndex,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
        index: !noIndex,
      },

      // Alternates for i18n and canonical URLs
      alternates: alternates || (canonical ? { canonical } : undefined),

      // Apple Web App
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: title,
      },

      // Open Graph
      openGraph: {
        type: article ? 'article' : 'website',
        description,
        locale: this.config.locale || 'en_US',
        siteName: this.config.applicationName,
        title: parsedTitle,
        ...(article && {
          article: {
            authors: article.authors,
            expirationTime: article.expirationTime,
            modifiedTime: article.modifiedTime,
            publishedTime: article.publishedTime,
            section: article.section,
            tags: article.tags,
          },
        }),
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        creator: this.config.twitterHandle,
        description,
        site: this.config.twitterHandle,
        title: parsedTitle,
      },

      // Verification (can be extended)
      verification: {},

      // App Links for mobile deep linking
      appLinks: {},
    };

    // Handle image configuration
    if (image) {
      const imageData =
        typeof image === 'string'
          ? { width: 1200, url: image, alt: title, height: 630 }
          : { width: 1200, alt: title, height: 630, ...image };

      if (defaultMetadata.openGraph) {
        defaultMetadata.openGraph.images = [imageData];
      }
      if (defaultMetadata.twitter) {
        defaultMetadata.twitter.images = [imageData.url];
      }
    }

    // Theme color
    if (this.config.themeColor) {
      defaultMetadata.themeColor = [
        { color: this.config.themeColor, media: '(prefers-color-scheme: light)' },
        { color: this.config.themeColor, media: '(prefers-color-scheme: dark)' },
      ];
    }

    return merge(defaultMetadata, additionalProperties);
  }

  // Generate metadata for error pages
  createErrorMetadata(statusCode: number): Metadata {
    const titles: Record<number, string> = {
      404: 'Page Not Found',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };

    return this.createMetadata({
      description: `Error ${statusCode}`,
      noFollow: true,
      noIndex: true,
      title: titles[statusCode] || 'Error',
    });
  }
}
