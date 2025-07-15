/**
 * Server-side SEO exports for Next.js
 *
 * This file provides server-side SEO functionality specifically for Next.js applications.
 */

import merge from 'lodash.merge';
import { Metadata, MetadataRoute, Viewport } from 'next';
import 'server-only';

// Re-export all server-side utilities
export { createStructuredData, structuredData } from './server';
export type { StructuredDataType } from './server';

// Enhanced viewport configuration for better mobile experience
export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  width: 'device-width',
};

// Simple metadata generator for Next.js
type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  description: string;
  image?: string;
  title: string;
};

const applicationName = 'forge';
const author: Metadata['authors'] = {
  name: 'Hayden Bleasel',
  url: 'https://haydenbleasel.com/',
};
const publisher = 'Hayden Bleasel';
const twitterHandle = '@haydenbleasel';

export const createMetadata = ({
  description,
  image,
  title,
  ...properties
}: MetadataGenerator): Metadata => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const parsedTitle = `${title} | ${applicationName}`;
  const defaultMetadata: Metadata = {
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
    },
    applicationName,
    authors: [author],
    creator: author.name,
    description,
    formatDetection: {
      telephone: false,
    },
    metadataBase: productionUrl ? new URL(`${protocol}://${productionUrl}`) : undefined,
    openGraph: {
      description,
      locale: 'en_US',
      siteName: applicationName,
      title: parsedTitle,
      type: 'website',
    },
    publisher,
    title: parsedTitle,
    twitter: {
      card: 'summary_large_image',
      creator: twitterHandle,
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        alt: title,
        height: 630,
        url: image,
        width: 1200,
      },
    ];
  }

  return metadata;
};

// Enhanced metadata options
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

// Re-export types
export type { Metadata, Viewport } from 'next';
export type { Thing, WithContext } from 'schema-dts';

// ============================================
// Next.js 15 Enhanced Features
// ============================================

// Metadata templates for common SEO patterns
export const metadataTemplates = {
  // Product page metadata template
  product: (product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    availability: 'InStock' | 'OutOfStock';
    brand?: string;
  }): Metadata => ({
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      images: [product.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image],
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': product.currency,
      'product:availability': product.availability,
      ...(product.brand && { 'product:brand': product.brand }),
    },
  }),

  // Article/blog post metadata template
  article: (article: {
    title: string;
    description: string;
    author: string;
    publishedTime: Date;
    modifiedTime?: Date;
    image: string;
    tags?: string[];
    section?: string;
  }): Metadata => ({
    title: article.title,
    description: article.description,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedTime.toISOString(),
      modifiedTime: article.modifiedTime?.toISOString(),
      authors: [article.author],
      images: [article.image],
      tags: article.tags,
      section: article.section,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.image],
    },
  }),

  // User profile metadata template
  profile: (profile: {
    name: string;
    bio: string;
    image: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Metadata => ({
    title: profile.name,
    description: profile.bio,
    openGraph: {
      title: profile.name,
      description: profile.bio,
      type: 'profile',
      images: [profile.image],
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
    },
    twitter: {
      card: 'summary',
      title: profile.name,
      description: profile.bio,
      images: [profile.image],
    },
  }),
};

// Viewport presets for different device types
export const viewportPresets = {
  // Default responsive viewport
  default: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  } as Viewport,

  // Mobile-optimized viewport (prevents zoom)
  mobileOptimized: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  } as Viewport,

  // Tablet-optimized viewport
  tablet: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 3,
    userScalable: true,
    viewportFit: 'auto',
  } as Viewport,

  // Desktop viewport (allows full zoom)
  desktop: {
    width: 'device-width',
    initialScale: 1,
    userScalable: true,
    viewportFit: 'auto',
  } as Viewport,
};

// Generate viewport based on user agent
export function generateViewport(userAgent?: string): Viewport {
  if (!userAgent) return viewportPresets.default;

  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);

  if (isMobile && !isTablet) return viewportPresets.mobileOptimized;
  if (isTablet) return viewportPresets.tablet;
  return viewportPresets.desktop;
}

// Multi-language sitemap generation with hreflang support
export function generateI18nSitemap(
  routes: DynamicSitemapRoute[],
  locales: string[],
  defaultLocale: string = 'en',
): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  routes.forEach((route: any) => {
    // Add entry for each locale
    locales.forEach((locale: any) => {
      const localizedUrl =
        locale === defaultLocale
          ? route.url
          : route.url.replace(/^https?:\/\/[^\/]+/, (match: any) => `${match}/${locale}`);

      const entry: any = {
        url: localizedUrl,
        lastModified: route.lastModified || new Date(),
        changeFrequency: route.changeFrequency || 'weekly',
        priority: route.priority || 0.5,
      };

      // Next.js expects images as string array
      if (route.images) {
        entry.images = route.images.map((img: any) => img.url);
      }

      if (route.videos) {
        entry.videos = route.videos;
      }

      sitemapEntries.push(entry);
    });
  });

  return sitemapEntries;
}

// Preview mode metadata handling
export function generatePreviewMetadata(
  isDraft: boolean,
  metadata: Metadata,
  options?: {
    draftIndicator?: string;
    noIndexDrafts?: boolean;
  },
): Metadata {
  if (!isDraft) return metadata;

  const draftIndicator = options?.draftIndicator || '[DRAFT]';
  const noIndexDrafts = options?.noIndexDrafts ?? true;

  return {
    ...metadata,
    title: `${draftIndicator} ${metadata.title}`,
    robots: noIndexDrafts
      ? {
          index: false,
          follow: false,
          ...(typeof metadata.robots === 'object' && metadata.robots !== null
            ? metadata.robots
            : {}),
        }
      : metadata.robots,
    openGraph: metadata.openGraph
      ? {
          ...metadata.openGraph,
          title: `${draftIndicator} ${metadata.openGraph.title || metadata.title}`,
        }
      : undefined,
  };
}

// Async metadata generation with Next.js 15 patterns
export async function generateMetadataAsync({
  params,
  searchParams,
  generator,
}: {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  generator: (
    params: Record<string, string>,
    searchParams: Record<string, string | string[] | undefined>,
  ) => Promise<Metadata>;
}): Promise<Metadata> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);

  return generator(resolvedParams, resolvedSearchParams);
}

// Edge-compatible metadata generation
export const generateMetadataEdge = async (
  request: any,
  options: {
    title: string;
    description: string;
    image?: string;
  },
): Promise<Metadata> => {
  const url = new URL(request.url);

  return {
    title: options.title,
    description: options.description,
    metadataBase: new URL(url.origin),
    openGraph: {
      title: options.title,
      description: options.description,
      url: url.href,
      siteName: 'Your Site',
      locale: 'en_US',
      type: 'website',
      ...(options.image && { images: [options.image] }),
    },
    twitter: {
      card: options.image ? 'summary_large_image' : 'summary',
      title: options.title,
      description: options.description,
      ...(options.image && { images: [options.image] }),
    },
  };
};

// Next-sitemap configuration helper (optional)
// This provides type-safe configuration for next-sitemap package
// Install next-sitemap separately: npm install next-sitemap
export interface NextSitemapConfig {
  siteUrl: string;
  generateRobotsTxt?: boolean;
  robotsTxtOptions?: {
    policies?: Array<{
      userAgent: string;
      allow?: string | string[];
      disallow?: string | string[];
      crawlDelay?: number;
    }>;
    additionalSitemaps?: string[];
  };
  exclude?: string[];
  generateIndexSitemap?: boolean;
  sitemapSize?: number;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  transform?: (config: any, url: string) => any;
  additionalPaths?: (config: any) => Promise<Array<{ loc: string; [key: string]: any }>>;
}

// Helper function to create next-sitemap config with defaults
export function createSitemapConfig(config: NextSitemapConfig): NextSitemapConfig {
  const baseUrl = config.siteUrl || process.env.NEXT_PUBLIC_URL || 'https://example.com';

  return {
    ...config,
    siteUrl: baseUrl,
    generateRobotsTxt: config.generateRobotsTxt ?? true,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
      ...config.robotsTxtOptions,
    },
    exclude: [
      '/404',
      '/500',
      '/api/*',
      '/admin/*',
      '*/edit',
      '*/settings',
      ...(config.exclude || []),
    ],
    generateIndexSitemap: config.generateIndexSitemap ?? true,
    sitemapSize: config.sitemapSize ?? 7000,
    changefreq: config.changefreq ?? 'daily',
    priority: config.priority ?? 0.7,
  };
}

// Dynamic sitemap generation helper for App Router
export interface DynamicSitemapRoute {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    url: string;
    title?: string;
    alt?: string;
    caption?: string;
    geo_location?: string;
    license?: string;
  }>;
  videos?: Array<{
    thumbnail_url: string;
    title: string;
    description: string;
    content_url?: string;
    player_url?: string;
    duration?: number;
    expiration_date?: string;
    rating?: number;
    view_count?: number;
  }>;
}

export function generateSitemapObject(routes: DynamicSitemapRoute[]): MetadataRoute.Sitemap {
  return routes.map((route: any) => {
    const entry: any = {
      url: route.url,
      lastModified: route.lastModified || new Date(),
      changeFrequency: route.changeFrequency || 'weekly',
      priority: route.priority || 0.5,
    };

    // Next.js expects images as string array
    if (route.images) {
      entry.images = route.images.map((img: any) => img.url);
    }

    // Videos are supported in the expected format
    if (route.videos) {
      entry.videos = route.videos;
    }

    return entry;
  });
}

// Integration helper: Convert Next.js 15 sitemap to next-sitemap format
export function convertToNextSitemap(
  nextjsSitemap: Array<{
    url: string;
    lastModified?: Date;
    changeFrequency?: string;
    priority?: number;
  }>,
): Array<{
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}> {
  return nextjsSitemap.map((item: any) => ({
    loc: item.url,
    lastmod: item.lastModified?.toISOString(),
    changefreq: item.changeFrequency,
    priority: item.priority,
  }));
}

// Integration helper: Use Next.js 15 dynamic routes with next-sitemap
export interface NextSitemapIntegrationConfig extends NextSitemapConfig {
  // Use Next.js 15 app directory sitemaps as additional sources
  appDirSitemaps?: string[];
  // Merge Next.js 15 dynamic routes
  mergeAppDirRoutes?: boolean;
}

export function createIntegratedSitemapConfig(
  config: NextSitemapIntegrationConfig,
): NextSitemapConfig {
  const baseConfig = createSitemapConfig(config);

  // If using Next.js 15 app directory sitemaps
  if (config.appDirSitemaps && config.appDirSitemaps.length > 0) {
    baseConfig.robotsTxtOptions = {
      ...baseConfig.robotsTxtOptions,
      additionalSitemaps: [
        ...(baseConfig.robotsTxtOptions?.additionalSitemaps || []),
        ...config.appDirSitemaps.map(
          (path: any) => `${config.siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
        ),
      ],
    };
  }

  // If merging app directory routes
  if (config.mergeAppDirRoutes && config.additionalPaths) {
    const originalAdditionalPaths = config.additionalPaths;
    baseConfig.additionalPaths = async (context: any) => {
      const original = await originalAdditionalPaths(context);

      // Here you can fetch and merge routes from Next.js 15 app directory
      // This is where you'd integrate with your app/sitemap.ts exports

      return original;
    };
  }

  return baseConfig;
}
