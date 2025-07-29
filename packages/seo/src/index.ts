/**
 * Main SEO Package Index
 *
 * Re-exports commonly used SEO functionality from various modules.
 * This provides a convenient single import point for basic SEO needs.
 */

// Re-export client-side components
export { JsonLd } from './client';

// Re-export server-side utilities
export { createStructuredData, structuredData } from './server';

// Re-export structured data utilities
export {
  JsonLd as StructuredDataJsonLd,
  createStructuredData as createStructuredDataUtil,
  structuredData as structuredDataHelpers,
} from './components/structured-data';

// Re-export metadata utilities
export { createMetadata } from './utils/metadata';

// Re-export types
export type { StructuredDataType, Thing, WithContext } from './server';
