// SEO Generation Utility Functions
// Non-async utility functions separated from server actions

import { ProductWithSeo, SeoContent } from './types';

/**
 * Categorizes products by SEO priority with enhanced logic
 */
export function categorizeProductsBySeoStrategy(products: ProductWithSeo[]): {
  highPriority: ProductWithSeo[];
  mediumPriority: ProductWithSeo[];
  lowPriority: ProductWithSeo[];
} {
  const highPriority: ProductWithSeo[] = [];
  const mediumPriority: ProductWithSeo[] = [];
  const lowPriority: ProductWithSeo[] = [];

  products.forEach((product) => {
    const isHighPriority =
      product.seoPriority === 'high' ||
      product.price > 1000 || // High-value products
      (product.reviewCount && product.reviewCount > 100) || // Popular products
      (product.rating && product.rating > 4.5) || // Highly rated
      product.category?.name?.toLowerCase().includes('featured') ||
      product.brand?.name?.toLowerCase().includes('premium');

    const isMediumPriority =
      product.seoPriority === 'medium' ||
      product.price > 100 ||
      (product.reviewCount && product.reviewCount > 10) ||
      (product.rating && product.rating > 4.0);

    if (isHighPriority) {
      highPriority.push(product);
    } else if (isMediumPriority) {
      mediumPriority.push(product);
    } else {
      lowPriority.push(product);
    }
  });

  return { highPriority, mediumPriority, lowPriority };
}

/**
 * Validates SEO content structure and quality
 */
export function validateSeoContentStructure(content: SeoContent): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Title validation
  if (!content.title) {
    errors.push('Title is required');
  } else if (content.title.length < 30 || content.title.length > 70) {
    errors.push('Title must be 30-70 characters');
  }

  // Meta description validation
  if (!content.metaDescription) {
    errors.push('Meta description is required');
  } else if (content.metaDescription.length < 120 || content.metaDescription.length > 170) {
    errors.push('Meta description must be 120-170 characters');
  }

  // Keywords validation
  if (!Array.isArray(content.keywords) || content.keywords.length < 3) {
    errors.push('At least 3 keywords are required');
  }

  // H1 validation
  if (!content.h1) {
    errors.push('H1 is required');
  }

  // Canonical URL validation
  if (!content.canonicalUrl || !content.canonicalUrl.startsWith('/products/')) {
    errors.push('Canonical URL must start with /products/');
  }

  // Structured data validation
  if (!content.structuredData || typeof content.structuredData !== 'object') {
    errors.push('Structured data must be a valid object');
  } else if (content.structuredData['@type'] !== 'Product') {
    errors.push('Structured data must be Product schema');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
