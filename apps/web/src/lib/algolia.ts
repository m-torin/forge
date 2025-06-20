import { logger } from '@/lib/logger';
import { liteClient as algoliasearch, LiteClient } from 'algoliasearch/lite';
import { createInMemoryCache } from '@algolia/cache-in-memory';
import { env } from '@/env';
import { AlgoliaSearchConfig } from '@/types/algolia';

// Default to Algolia's public demo data if no keys are provided
const DEFAULT_CONFIG: AlgoliaSearchConfig = {
  appId: 'latency',
  searchKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
};

// Get configuration with fallbacks
export function getAlgoliaConfig(): AlgoliaSearchConfig {
  const config: AlgoliaSearchConfig = {
    appId: env.NEXT_PUBLIC_ALGOLIA_APP_ID || DEFAULT_CONFIG.appId,
    searchKey: env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || DEFAULT_CONFIG.searchKey,
    indexName: env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || DEFAULT_CONFIG.indexName,
  };

  // Log warning in development if using demo data
  if (process.env.NODE_ENV === 'development' && config.appId === DEFAULT_CONFIG.appId) {
    logger.warn(
      'Using Algolia demo data. Set NEXT_PUBLIC_ALGOLIA_* environment variables for production use.',
    );
  }

  return config;
}

// Create a singleton search client with caching
let searchClient: LiteClient | null = null;

export function getSearchClient(): LiteClient {
  if (!searchClient) {
    const config = getAlgoliaConfig();

    searchClient = algoliasearch(config.appId, config.searchKey, {
      // Enable caching for better performance
      responsesCache: createInMemoryCache(),
      requestsCache: createInMemoryCache({ serializable: false }),

      // Set reasonable timeouts
      timeouts: {
        connect: 2000,
        read: 5000,
        write: 30000,
      },
    });
  }

  return searchClient;
}

// Get the default index name
export function getIndexName(): string {
  return getAlgoliaConfig().indexName;
}

// Utility function to check if using demo data
export function isUsingDemoData(): boolean {
  const config = getAlgoliaConfig();
  return config.appId === DEFAULT_CONFIG.appId;
}

// Search utilities
export const searchUtils = {
  // Format price for display
  formatPrice(price: number | undefined, currency = '$'): string {
    if (!price) return `${currency}0`;
    return `${currency}${price.toFixed(2)}`;
  },

  // Get product image URL with fallback
  getProductImage(product: any): string {
    return (
      product.image || product.image_url || product.images?.[0] || '/images/placeholder-product.png'
    );
  },

  // Get product name with fallback
  getProductName(product: any): string {
    return product.name || product.title || 'Untitled Product';
  },

  // Check if product is on sale
  isOnSale(product: any): boolean {
    return product.on_sale || (product.sale_price && product.sale_price < product.price);
  },

  // Get display price (sale price or regular price)
  getDisplayPrice(product: any): number {
    if (product.sale_price && product.sale_price < product.price) {
      return product.sale_price;
    }
    return product.price || product.price_range?.min || 0;
  },
};
