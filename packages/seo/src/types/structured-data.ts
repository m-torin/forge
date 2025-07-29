/**
 * Structured Data Type Definitions
 *
 * Provides TypeScript types for schema.org structured data.
 */

// Re-export from schema-dts for convenience
export type { Thing, WithContext } from 'schema-dts';

/**
 * Article structured data input
 */
export interface ArticleData {
  author: string | { name: string; url?: string };
  dateModified?: string;
  datePublished: string;
  description?: string;
  headline: string;
  image?: string | string[];
  mainEntityOfPage?: string;
  publisher: {
    logo?: string;
    name: string;
  };
}

/**
 * Product structured data input
 */
export interface ProductData {
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  brand?: string;
  description?: string;
  image?: string | string[];
  name: string;
  offers?: {
    availability?: string;
    price: string;
    priceCurrency: string;
    seller?: string;
  };
}

/**
 * Organization structured data input
 */
export interface OrganizationData {
  contactPoint?: {
    areaServed?: string | string[];
    availableLanguage?: string | string[];
    contactType: string;
    telephone: string;
  };
  description?: string;
  logo?: string;
  name: string;
  sameAs?: string[];
  url: string;
}

/**
 * Website structured data input
 */
export interface WebsiteData {
  description?: string;
  name: string;
  potentialAction?: {
    queryInput: string;
    target: string;
  };
  url: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * FAQ item
 */
export interface FAQItem {
  answer: string;
  question: string;
}
