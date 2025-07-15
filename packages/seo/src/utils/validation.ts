/**
 * SEO Validation Utilities
 *
 * Provides validation functions for SEO data structures and formats.
 */

/**
 * Validates that metadata has all required properties
 */
export function validateMetadata(metadata: any): string[] {
  const required = ['title', 'description'];
  const missing = required.filter(prop => !metadata[prop]);
  return missing;
}

/**
 * Validates that OpenGraph data is properly formatted
 */
export function validateOpenGraph(og: any): boolean {
  if (!og) return false;
  return og.title && og.description && og.type;
}

/**
 * Validates that structured data follows schema.org format
 */
export function validateSchemaOrg(schema: any): boolean {
  if (!schema) return false;
  return schema['@context'] === 'https://schema.org' && schema['@type'];
}

/**
 * Validates that URLs are properly formatted
 */
export function validateUrls(urls: string[]): boolean {
  return urls.every(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Validates that image URLs are accessible
 */
export function validateImages(images: string[]): boolean {
  return images.every(img => {
    try {
      new URL(img);
      return img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null;
    } catch {
      return false;
    }
  });
}
