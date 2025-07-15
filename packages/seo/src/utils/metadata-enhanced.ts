import merge from 'lodash.merge';
import { Metadata, Viewport } from 'next';

interface MetadataGeneratorOptions {
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
  article?: {
    authors?: string[];
    expirationTime?: string;
    modifiedTime?: string;
    publishedTime?: string;
    section?: string;
    tags?: string[];
  };
  canonical?: string;
  description: string;
  image?: string | { alt?: string; height?: number; url: string; width?: number };
  keywords?: string[];
  noFollow?: boolean;
  noIndex?: boolean;
  title: string;
}

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

// Enhanced viewport configuration for better mobile experience
export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  width: 'device-width',
};

export class SEOManager {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
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
      title: titles[statusCode] ?? 'Error',
    });
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
    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_URL;
    const parsedTitle = `${title} | ${this.config.applicationName}`;

    // Combine default keywords with page-specific ones
    const allKeywords = [...(this.config.keywords ?? []), ...keywords];

    const defaultMetadata: Metadata = {
      // Alternates for i18n and canonical URLs
      alternates: alternates ?? (canonical ? { canonical } : undefined),
      // Apple Web App
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: title,
      },
      applicationName: this.config.applicationName,
      // App Links for mobile deep linking
      appLinks: {},
      authors: [{ name: this.config.author.name, url: this.config.author.url }],
      creator: this.config.author.name,
      description,

      // Enhanced format detection
      formatDetection: {
        address: false,
        date: false,
        email: false,
        telephone: false,
      },

      keywords: allKeywords,

      // Metadata base for absolute URLs
      metadataBase: productionUrl ? new URL(`${protocol}://${productionUrl}`) : undefined,

      // Open Graph
      openGraph: {
        description,
        locale: this.config.locale ?? 'en_US',
        siteName: this.config.applicationName,
        title: parsedTitle,
        type: article ? 'article' : 'website',
        ...(article && {
          article: {
            ...(article.authors && { authors: article.authors }),
            ...(article.expirationTime && { expirationTime: article.expirationTime }),
            ...(article.modifiedTime && { modifiedTime: article.modifiedTime }),
            ...(article.publishedTime && { publishedTime: article.publishedTime }),
            ...(article.section && { section: article.section }),
            ...(article.tags && { tags: article.tags }),
          },
        }),
      },

      publisher: this.config.publisher,

      // Robots directives
      robots: {
        follow: !noFollow,
        googleBot: {
          follow: !noFollow,
          index: !noIndex,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
        index: !noIndex,
      },

      title: {
        default: parsedTitle,
        template: `%s | ${this.config.applicationName}`,
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
    };

    // Handle image configuration
    if (image) {
      const imageData =
        typeof image === 'string'
          ? { alt: title, height: 630, url: image, width: 1200 }
          : { alt: title, height: 630, width: 1200, ...image };

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
}
