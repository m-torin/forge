/**
 * Core SEO Type Definitions
 *
 * Provides TypeScript types for SEO functionality and configurations.
 */

// Re-export from schema-dts for convenience
export type { Thing, WithContext } from 'schema-dts';

/**
 * Common structured data types with better type safety
 */
export type StructuredDataType =
  | 'Article'
  | 'BlogPosting'
  | 'BreadcrumbList'
  | 'Course'
  | 'Event'
  | 'FAQPage'
  | 'HowTo'
  | 'LocalBusiness'
  | 'Organization'
  | 'Person'
  | 'Product'
  | 'Recipe'
  | 'SoftwareApplication'
  | 'VideoObject'
  | 'WebSite';

/**
 * Configuration for SEO setup
 */
export interface SEOConfig {
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

/**
 * Basic SEO metadata structure
 */
export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}
