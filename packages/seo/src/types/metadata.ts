/**
 * Metadata Type Definitions
 *
 * Provides TypeScript types for metadata and OpenGraph structures.
 */

/**
 * Enhanced metadata options for SEO generators
 */
export interface MetadataOptions {
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

/**
 * OpenGraph data structure
 */
export interface OpenGraphData {
  title: string;
  description: string;
  type: 'website' | 'article' | 'profile' | 'product';
  url?: string;
  siteName?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  section?: string;
}

/**
 * Twitter Card data structure
 */
export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  images?: string[];
}

/**
 * Complete metadata structure
 */
export interface CompleteMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: OpenGraphData;
  twitter?: TwitterCardData;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  themeColor?: string;
}
