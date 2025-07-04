/**
 * Affiliate Product Sync Workflow
 * Automated synchronization of products from multiple affiliate networks
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  StepTemplates,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
} from '@repo/orchestration/server/next';

// Input schemas
const AffiliateProductSyncInput = z.object({
  deduplication: z.object({
    strategy: z.enum(['upc', 'title-brand', 'image-hash']).default('upc'),
    threshold: z.number().min(0).max(1).default(0.9),
  }),
  networks: z.array(
    z.object({
      id: z.string(),
      name: z.enum(['amazon', 'walmart', 'target', 'ebay', 'shareasale', 'cj', 'rakuten']),
      config: z.object({
        categories: z.array(z.string()).optional(), // Filter by categories
        includeOutOfStock: z.boolean().default(false),
        maxProducts: z.number().default(1000),
      }),
      credentials: z.object({
        affiliateId: z.string(),
        apiKey: z.string(),
        secretKey: z.string().optional(),
      }),
    }),
  ),
  syncMode: z.enum(['full', 'incremental', 'price-only']).default('incremental'),
});

// Product schema for affiliate products
const AffiliateProduct = z.object({
  asin: z.string().optional(), // Amazon
  ean: z.string().optional(),
  isbn: z.string().optional(),
  // Universal identifiers
  upc: z.string().optional(),

  brand: z.string(),
  category: z.array(z.string()),
  description: z.string(),
  // Basic info
  title: z.string(),

  videos: z.array(z.string()).optional(),
  // Media
  images: z.array(z.string()),

  // Seller info
  sellers: z.array(
    z.object({
      affiliateUrl: z.string().url(),
      availability: z.enum(['in_stock', 'out_of_stock', 'limited', 'preorder']),
      currency: z.string().default('USD'),
      directUrl: z.string().url().optional(),
      lastChecked: z.string(),
      networkId: z.string(),
      networkName: z.string(),
      originalPrice: z.number().optional(),
      price: z.number(),
      productId: z.string(), // Network-specific ID
      shippingCost: z.number().optional(),
      shippingTime: z.string().optional(),
    }),
  ),

  // Metadata
  metadata: z.object({
    firstSeen: z.string(),
    lastUpdated: z.string(),
    priceHistory: z
      .array(
        z.object({
          averagePrice: z.number(),
          date: z.string(),
          lowestPrice: z.number(),
        }),
      )
      .optional(),
  }),
});

// Step 1: Fetch products from each network
export const fetchFromNetworksStep = compose(
  createStep('fetch-from-networks', async (input: z.infer<typeof AffiliateProductSyncInput>) => {
    const { networks, syncMode } = input;
    const networkResults = [];

    for (const network of networks) {
      try {
        let products = [];

        switch (network.name) {
          case 'amazon':
            products = await fetchFromAmazon(network);
            break;
          case 'walmart':
            products = await fetchFromWalmart(network);
            break;
          case 'target':
            products = await fetchFromTarget(network);
            break;
          case 'ebay':
            products = await fetchFromEbay(network);
            break;
          case 'shareasale':
            products = await fetchFromShareASale(network);
            break;
          case 'cj':
            products = await fetchFromCJ(network);
            break;
          case 'rakuten':
            products = await fetchFromRakuten(network);
            break;
        }

        networkResults.push({
          fetchedAt: new Date().toISOString(),
          fetchedCount: products.length,
          networkId: network.id,
          networkName: network.name,
          products,
          success: true,
        });
      } catch (error) {
        networkResults.push({
          error: (error as Error).message,
          fetchedAt: new Date().toISOString(),
          fetchedCount: 0,
          networkId: network.id,
          networkName: network.name,
          products: [],
          success: false,
        });
      }
    }

    return {
      ...input,
      networkResults,
      totalProductsFetched: networkResults.reduce((sum, r) => sum + r.fetchedCount, 0),
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
    }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 300000, // 5 minutes
      threshold: 0.5,
      // timeout: 30000,
    }),
  (step: any) => withStepMonitoring(step),
);

// Mock network fetchers (in production, these would call real APIs)
async function fetchFromAmazon(network: any): Promise<any[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock Amazon products
  return Array.from({ length: 50 }, (_, i) => ({
    affiliateUrl: `https://amazon.com/dp/B0${i}?tag=${network.credentials.affiliateId}`,
    asin: `B0${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    availability: Math.random() > 0.2 ? 'in_stock' : 'out_of_stock',
    brand: ['Nike', 'Adidas', 'Apple', 'Samsung'][Math.floor(Math.random() * 4)],
    category: ['Electronics', 'Clothing', 'Home'][Math.floor(Math.random() * 3)],
    description: 'High quality product available on Amazon',
    images: [`https://amazon.com/image${i}.jpg`],
    price: Math.floor(Math.random() * 500) + 10,
    title: `Product ${i} from Amazon`,
  }));
}

async function fetchFromWalmart(network: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return Array.from({ length: 40 }, (_, i) => ({
    name: `Product ${i} from Walmart`,
    brand: ['Great Value', 'Equate', 'Mainstays'][Math.floor(Math.random() * 3)],
    categoryPath: 'Home/Kitchen/Appliances',
    images: [`https://walmart.com/image${i}.jpg`],
    itemId: `WM${Math.floor(Math.random() * 1000000)}`,
    productUrl: `https://walmart.com/ip/product-${i}`,
    salePrice: Math.floor(Math.random() * 300) + 5,
    shortDescription: 'Great value product from Walmart',
    stock: 'Available',
  }));
}

async function fetchFromTarget(network: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return Array.from({ length: 35 }, (_, i) => ({
    availability: 'IN_STOCK',
    brand: ['Room Essentials', 'Threshold', 'Cat & Jack'][Math.floor(Math.random() * 3)],
    description: 'Stylish product from Target',
    images: [`https://target.com/image${i}.jpg`],
    price: { current_retail: Math.floor(Math.random() * 200) + 8 },
    tcin: `T${Math.floor(Math.random() * 100000000)}`,
    title: `Product ${i} from Target`,
  }));
}

async function fetchFromEbay(network: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return Array.from({ length: 60 }, (_, i) => ({
    categoryName: 'Electronics',
    condition: 'New',
    currentPrice: Math.floor(Math.random() * 1000) + 1,
    images: [`https://ebay.com/image${i}.jpg`],
    itemId: `EB${Math.floor(Math.random() * 1000000000)}`,
    title: `Product ${i} from eBay`,
  }));
}

async function fetchFromShareASale(network: any): Promise<any[]> {
  return fetchFromAmazon(network); // Simplified
}

async function fetchFromCJ(network: any): Promise<any[]> {
  return fetchFromWalmart(network); // Simplified
}

async function fetchFromRakuten(network: any): Promise<any[]> {
  return fetchFromTarget(network); // Simplified
}

// Step 2: Normalize product data
export const normalizeProductsStep = createStep('normalize-products', async (data: any) => {
  const { networkResults } = data;
  const normalizedProducts = [];

  for (const networkData of networkResults) {
    if (!networkData.success) continue;

    for (const product of networkData.products) {
      // Normalize based on network type
      let normalized: any = {
        metadata: {
          firstSeen: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        sellers: [],
      };

      switch (networkData.networkName) {
        case 'amazon':
          normalized = {
            ...normalized,
            asin: product.asin,
            brand: product.brand,
            category: [product.category],
            description: product.description,
            images: product.images,
            sellers: [
              {
                affiliateUrl: product.affiliateUrl,
                availability: product.availability,
                currency: 'USD',
                lastChecked: new Date().toISOString(),
                networkId: networkData.networkId,
                networkName: 'amazon',
                price: product.price,
                productId: product.asin,
              },
            ],
            title: product.title,
          };
          break;

        case 'walmart':
          normalized = {
            ...normalized,
            brand: product.brand,
            category: product.categoryPath.split('/'),
            description: product.shortDescription,
            images: product.images,
            sellers: [
              {
                affiliateUrl: `${product.productUrl}?affil=${networkData.credentials.affiliateId}`,
                availability: product.stock === 'Available' ? 'in_stock' : 'out_of_stock',
                currency: 'USD',
                directUrl: product.productUrl,
                lastChecked: new Date().toISOString(),
                networkId: networkData.networkId,
                networkName: 'walmart',
                price: product.salePrice,
                productId: product.itemId,
              },
            ],
            title: product.name,
          };
          break;

        case 'target':
          normalized = {
            ...normalized,
            brand: product.brand,
            category: ['General'], // Would parse from actual API
            description: product.description,
            images: product.images,
            sellers: [
              {
                affiliateUrl: `https://target.com/p/-/${product.tcin}?afid=${networkData.credentials.affiliateId}`,
                availability: product.availability === 'IN_STOCK' ? 'in_stock' : 'out_of_stock',
                currency: 'USD',
                lastChecked: new Date().toISOString(),
                networkId: networkData.networkId,
                networkName: 'target',
                price: product.price.current_retail,
                productId: product.tcin,
              },
            ],
            title: product.title,
          };
          break;

        // Add other networks...
      }

      normalizedProducts.push(normalized);
    }
  }

  return {
    ...data,
    normalizedProducts,
    totalNormalized: normalizedProducts.length,
  };
});

// Step 3: Deduplicate and merge products
export const deduplicateProductsStep = createStep('deduplicate-products', async (data: any) => {
  const { deduplication, normalizedProducts } = data;
  const { strategy, threshold } = deduplication;

  const productGroups = new Map<string, any[]>();

  // Group products by deduplication key
  for (const product of normalizedProducts) {
    let key: string;

    switch (strategy) {
      case 'upc':
        key = product.upc || `${product.brand}_${product.title}`;
        break;
      case 'title-brand':
        key = `${product.brand.toLowerCase()}_${product.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        break;
      case 'image-hash':
        // In production, would use perceptual hashing
        key = product.images[0] || product.title;
        break;
      default:
        key = product.title;
    }

    if (!productGroups.has(key)) {
      productGroups.set(key, []);
    }
    productGroups.get(key)!.push(product);
  }

  // Merge products with multiple sellers
  const mergedProducts = [];
  for (const [key, products] of productGroups.entries()) {
    if (products.length === 1) {
      mergedProducts.push(products[0]);
    } else {
      // Merge multiple products into one with multiple sellers
      const merged = {
        ...products[0], // Use first product as base
        images: [...new Set(products.flatMap((p) => p.images))],
        sellers: products.flatMap((p) => p.sellers),
      };

      // Update metadata
      merged.metadata.lastUpdated = new Date().toISOString();

      mergedProducts.push(merged);
    }
  }

  // Calculate lowest price for each product
  mergedProducts.forEach((product) => {
    const prices = product.sellers
      .filter((s: any) => s.availability === 'in_stock')
      .map((s: any) => s.price);

    if (prices.length > 0) {
      product.lowestPrice = Math.min(...prices);
      product.highestPrice = Math.max(...prices);
      product.priceRange = product.highestPrice - product.lowestPrice;
      product.averagePrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    }
  });

  return {
    ...data,
    deduplicationStats: {
      deduplicationRate:
        ((normalizedProducts.length - mergedProducts.length) / normalizedProducts.length) * 100,
      mergedCount: mergedProducts.length,
      originalCount: normalizedProducts.length,
      productsWithMultipleSellers: mergedProducts.filter((p: any) => p.sellers.length > 1).length,
    },
    mergedProducts,
  };
});

// Step 4: Calculate affiliate metrics
export const calculateMetricsStep = createStep('calculate-metrics', async (data: any) => {
  const { mergedProducts } = data;

  const metrics = {
    byBrand: {} as Record<string, any>,
    byCategory: {} as Record<string, any>,
    byNetwork: {} as Record<string, any>,
    overall: {
      averagePriceDifference: 0,
      averageSellersPerProduct: 0,
      productsWithCompetition: 0,
      totalProducts: mergedProducts.length,
      totalSellers: 0,
    },
  };

  // Calculate metrics
  mergedProducts.forEach((product: any) => {
    // Network metrics
    product.sellers.forEach((seller: any) => {
      if (!metrics.byNetwork[seller.networkName]) {
        metrics.byNetwork[seller.networkName] = {
          averagePrice: 0,
          inStockCount: 0,
          productCount: 0,
          totalPrice: 0,
        };
      }

      const networkMetric = metrics.byNetwork[seller.networkName];
      networkMetric.productCount++;
      if (seller.availability === 'in_stock') {
        networkMetric.inStockCount++;
      }
      networkMetric.totalPrice += seller.price;
    });

    // Category metrics
    const category = product.category[0] || 'Uncategorized';
    if (!metrics.byCategory[category]) {
      metrics.byCategory[category] = {
        averagePrice: 0,
        productCount: 0,
        totalPrice: 0,
      };
    }
    metrics.byCategory[category].productCount++;
    metrics.byCategory[category].totalPrice += product.lowestPrice || 0;

    // Brand metrics
    if (!metrics.byBrand[product.brand]) {
      metrics.byBrand[product.brand] = {
        averagePrice: 0,
        productCount: 0,
        totalPrice: 0,
      };
    }
    metrics.byBrand[product.brand].productCount++;
    metrics.byBrand[product.brand].totalPrice += product.lowestPrice || 0;

    // Overall metrics
    metrics.overall.totalSellers += product.sellers.length;
    if (product.sellers.length > 1) {
      metrics.overall.productsWithCompetition++;
      metrics.overall.averagePriceDifference += product.priceRange || 0;
    }
  });

  // Calculate averages
  metrics.overall.averageSellersPerProduct =
    metrics.overall.totalSellers / metrics.overall.totalProducts;
  metrics.overall.averagePriceDifference /= metrics.overall.productsWithCompetition || 1;

  // Calculate network averages
  Object.values(metrics.byNetwork).forEach((network: any) => {
    network.averagePrice = network.totalPrice / network.productCount;
    network.inStockRate = (network.inStockCount / network.productCount) * 100;
  });

  return {
    ...data,
    metrics,
    metricsCalculated: true,
  };
});

// Step 5: Update product database
export const updateDatabaseStep = compose(
  StepTemplates.database('update-products', 'Update affiliate products in database'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 6: Update search indexes
export const updateSearchIndexesStep = createStep('update-search-indexes', async (data: any) => {
  const { mergedProducts } = data;

  // Prepare search documents
  const searchDocuments = mergedProducts.map((product: any) => ({
    id: product.asin || product.upc || `${product.brand}_${product.title}`.replace(/\s+/g, '_'),
    availability: product.sellers.some((s: any) => s.availability === 'in_stock'),
    brand: product.brand,
    category: product.category,
    description: product.description,
    networks: [...new Set(product.sellers.map((s: any) => s.networkName))],
    price: product.lowestPrice,
    priceRange: `${product.lowestPrice}-${product.highestPrice}`,
    searchText: [product.title, product.brand, product.description, ...product.category]
      .join(' ')
      .toLowerCase(),
    sellerCount: product.sellers.length,
    title: product.title,
  }));

  // In production, would update Elasticsearch/Algolia
  console.log(`Updating ${searchDocuments.length} search documents`);

  return {
    ...data,
    documentsIndexed: searchDocuments.length,
    searchIndexUpdated: true,
  };
});

// Step 7: Generate sync report
export const generateSyncReportStep = createStep('generate-report', async (data: any) => {
  const { deduplicationStats, metrics, networkResults } = data;

  const report = {
    metrics,
    networks: networkResults.map((r: any) => ({
      name: r.networkName,
      error: r.error,
      productCount: r.fetchedCount,
      success: r.success,
    })),
    recommendations: [] as any[],
    summary: {
      networksProcessed: networkResults.length,
      productsWithMultipleSellers: deduplicationStats.productsWithMultipleSellers,
      successfulNetworks: networkResults.filter((r: any) => r.success).length,
      totalProductsFetched: data.totalProductsFetched,
      uniqueProducts: deduplicationStats.mergedCount,
    },
    syncId: `sync_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // Generate recommendations
  if (deduplicationStats.deduplicationRate > 30) {
    report.recommendations.push({
      type: 'deduplication',
      message: `High duplication rate (${deduplicationStats.deduplicationRate.toFixed(1)}%). Consider adding UPC/EAN data for better matching.`,
      priority: 'medium',
    });
  }

  const failedNetworks = networkResults.filter((r: any) => !r.success);
  if (failedNetworks.length > 0) {
    report.recommendations.push({
      type: 'network-errors',
      details: failedNetworks.map((n: any) => ({ error: n.error, network: n.networkName })),
      message: `${failedNetworks.length} networks failed to sync. Check API credentials and rate limits.`,
      priority: 'high',
    });
  }

  return {
    ...data,
    report,
    syncComplete: true,
  };
});

// Step 8: Send notifications
export const sendNotificationsStep = StepTemplates.notification('sync-complete', 'success');

// Main workflow definition
export const affiliateProductSyncWorkflow = {
  id: 'affiliate-product-sync',
  name: 'Affiliate Product Sync',
  config: {
    concurrency: {
      max: 3, // Allow 3 sync jobs in parallel
    },
    maxDuration: 1800000, // 30 minutes
    schedule: {
      cron: '0 */4 * * *', // Every 4 hours
      timezone: 'UTC',
    },
  },
  description: 'Automated synchronization of products from multiple affiliate networks',
  features: {
    deduplication: true,
    multiNetworkIntegration: true,
    priceComparison: true,
    searchIndexing: true,
  },
  steps: [
    fetchFromNetworksStep,
    normalizeProductsStep,
    deduplicateProductsStep,
    calculateMetricsStep,
    updateDatabaseStep,
    updateSearchIndexesStep,
    generateSyncReportStep,
    sendNotificationsStep,
  ],
  version: '1.0.0',
};
