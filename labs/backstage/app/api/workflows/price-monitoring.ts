/**
 * Price Monitoring Workflow
 * Real-time price tracking and alerts for affiliate products
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const PriceMonitoringInput = z.object({
  alertSettings: z.object({
    alertChannels: z.array(z.enum(['email', 'push', 'sms', 'webhook'])).default(['email']),
    alertFrequency: z.enum(['immediate', 'hourly', 'daily']).default('hourly'),
    batchAlerts: z.boolean().default(true), // Batch multiple alerts together
    enableAdminAlerts: z.boolean().default(true),
    enableUserAlerts: z.boolean().default(true),
  }),
  filters: z
    .object({
      brands: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      minPriceDropPercent: z.number().default(10), // Alert if price drops by 10%
      networks: z.array(z.string()).optional(),
      priceRange: z
        .object({
          max: z.number().optional(),
          min: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  mode: z.enum(['all', 'watchlist', 'trending', 'deals']).default('all'),
});

// Price history entry
const PriceHistoryEntry = z.object({
  availability: z.string(),
  change: z
    .object({
      amount: z.number(),
      direction: z.enum(['up', 'down', 'same']),
      percent: z.number(),
    })
    .optional(),
  currency: z.string(),
  networkId: z.string(),
  originalPrice: z.number().optional(),
  price: z.number(),
  productId: z.string(),
  timestamp: z.string(),
});

// Step 1: Fetch products to monitor
export const fetchProductsToMonitorStep = compose(
  createStepWithValidation(
    'fetch-products',
    async (input: z.infer<typeof PriceMonitoringInput>) => {
      const { filters, mode } = input;

      // In production, would query database based on mode and filters
      const products = [];

      switch (mode) {
        case 'all':
          // Fetch all active products
          products.push(...generateMockProducts(500));
          break;
        case 'watchlist':
          // Fetch products in user watchlists
          products.push(...generateMockProducts(100, true));
          break;
        case 'trending':
          // Fetch trending products
          products.push(...generateMockProducts(200, false, true));
          break;
        case 'deals':
          // Fetch products already on sale
          products.push(...generateMockProducts(150, false, false, true));
          break;
      }

      // Apply filters
      let filteredProducts = products;
      if (filters?.categories?.length) {
        filteredProducts = filteredProducts.filter((p) =>
          filters.categories!.some((cat) => p.categories.includes(cat)),
        );
      }
      if (filters?.brands?.length) {
        filteredProducts = filteredProducts.filter((p) => filters.brands!.includes(p.brand));
      }
      if (filters?.priceRange) {
        filteredProducts = filteredProducts.filter((p) => {
          const price = p.currentPrice;
          return (
            (!filters.priceRange!.min || price >= filters.priceRange!.min) &&
            (!filters.priceRange!.max || price <= filters.priceRange!.max)
          );
        });
      }

      return {
        ...input,
        fetchedAt: new Date().toISOString(),
        products: filteredProducts,
        totalProducts: filteredProducts.length,
      };
    },
    (input) => true,
    (output) => output.products.length > 0,
  ),
  (step: any) => withStepTimeout(step, 30000),
  (step: any) => withStepMonitoring(step),
);

// Mock product generator
function generateMockProducts(
  count: number,
  inWatchlist = false,
  trending = false,
  onSale = false,
): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `prod_${i}`,
    brand: ['Nike', 'Adidas', 'Apple', 'Samsung'][Math.floor(Math.random() * 4)],
    categories: [['Electronics', 'Clothing', 'Home'][Math.floor(Math.random() * 3)]],
    currentPrice: Math.floor(Math.random() * 500) + 10,
    lastPrice: Math.floor(Math.random() * 500) + 10,
    metadata: {
      inWatchlist,
      onSale,
      trending,
      watcherCount: Math.floor(Math.random() * 100),
    },
    sellers: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
      lastChecked: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      networkId: `network_${j}`,
      networkName: ['amazon', 'walmart', 'target', 'ebay'][j],
      price: Math.floor(Math.random() * 500) + 10,
      productId: `${i}_${j}`,
    })),
    title: `Product ${i}`,
  }));
}

// Step 2: Check current prices
export const checkCurrentPricesStep = compose(
  createStep('check-prices', async (data: any) => {
    const { products } = data;
    const priceChecks = [];
    const BATCH_SIZE = 50;

    // Process in batches to avoid overwhelming APIs
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (product: any) => {
          const sellerPrices = await Promise.all(
            product.sellers.map(async (seller: any) => {
              // Simulate API call to check price
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

              // Generate new price (90% same, 10% changed)
              const priceChanged = Math.random() > 0.9;
              const oldPrice = seller.price;
              let newPrice = oldPrice;

              if (priceChanged) {
                const changePercent = (Math.random() - 0.5) * 0.3; // -15% to +15%
                newPrice = Math.round(oldPrice * (1 + changePercent));
              }

              return {
                availability: Math.random() > 0.1 ? 'in_stock' : 'out_of_stock',
                changeAmount: newPrice - oldPrice,
                changed: priceChanged,
                changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
                currency: 'USD',
                networkId: seller.networkId,
                networkName: seller.networkName,
                newPrice,
                oldPrice,
                productId: product.id,
                timestamp: new Date().toISOString(),
              };
            }),
          );

          return {
            averagePrice:
              sellerPrices.reduce((sum, s) => sum + s.newPrice, 0) / sellerPrices.length,
            brand: product.brand,
            highestPrice: Math.max(...sellerPrices.map((s) => s.newPrice)),
            lowestPrice: Math.min(...sellerPrices.map((s) => s.newPrice)),
            priceChanges: sellerPrices.filter((s) => s.changed),
            productId: product.id,
            productTitle: product.title,
            sellerPrices,
          };
        }),
      );

      priceChecks.push(...batchResults);
    }

    return {
      ...data,
      checkedAt: new Date().toISOString(),
      priceChecks,
      productsWithChanges: priceChecks.filter((p) => p.priceChanges.length > 0).length,
      totalChecked: priceChecks.length,
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
      // trackingMetrics: ['defaultMetric'],
    }),
);

// Step 3: Analyze price changes
export const analyzePriceChangesStep = createStep('analyze-changes', async (data: any) => {
  const { filters, priceChecks } = data;
  const { minPriceDropPercent = 10 } = filters || {};

  const analysis = {
    backInStock: [] as any[],
    newDeals: [] as any[],
    outOfStock: [] as any[],
    priceHistory: [] as any[],
    significantDrops: [] as any[],
    significantIncreases: [] as any[],
  };

  priceChecks.forEach((check: any) => {
    check.priceChanges.forEach((change: any) => {
      // Track all price changes for history
      analysis.priceHistory.push({
        changePercent: change.changePercent,
        networkId: change.networkId,
        oldPrice: change.oldPrice,
        price: change.newPrice,
        productId: check.productId,
        timestamp: change.timestamp,
      });

      // Significant price drops
      if (change.changePercent <= -minPriceDropPercent) {
        analysis.significantDrops.push({
          discount: Math.abs(change.changePercent),
          network: change.networkName,
          newPrice: change.newPrice,
          oldPrice: change.oldPrice,
          product: {
            id: check.productId,
            brand: check.brand,
            title: check.productTitle,
          },
          savings: change.oldPrice - change.newPrice,
        });
      }

      // Significant price increases
      if (change.changePercent >= 20) {
        analysis.significantIncreases.push({
          increasePercent: change.changePercent,
          network: change.networkName,
          newPrice: change.newPrice,
          oldPrice: change.oldPrice,
          product: {
            id: check.productId,
            brand: check.brand,
            title: check.productTitle,
          },
        });
      }
    });

    // Check for new deals (lowest price across all sellers dropped)
    const currentLowest = check.lowestPrice;
    const previousLowest = Math.min(...check.sellerPrices.map((s: any) => s.oldPrice));

    if (currentLowest < previousLowest * 0.9) {
      analysis.newDeals.push({
        bestNetwork: check.sellerPrices.find((s: any) => s.newPrice === currentLowest)?.networkName,
        currentLowest,
        discount: ((previousLowest - currentLowest) / previousLowest) * 100,
        previousLowest,
        product: {
          id: check.productId,
          brand: check.brand,
          title: check.productTitle,
        },
      });
    }

    // Track availability changes
    check.sellerPrices.forEach((seller: any) => {
      if (seller.availability === 'in_stock' && seller.oldAvailability === 'out_of_stock') {
        analysis.backInStock.push({
          network: seller.networkName,
          price: seller.newPrice,
          productId: check.productId,
          productTitle: check.productTitle,
        });
      } else if (seller.availability === 'out_of_stock' && seller.oldAvailability === 'in_stock') {
        analysis.outOfStock.push({
          network: seller.networkName,
          productId: check.productId,
          productTitle: check.productTitle,
        });
      }
    });
  });

  return {
    ...data,
    alertStats: {
      backInStock: analysis.backInStock.length,
      newDeals: analysis.newDeals.length,
      priceDrops: analysis.significantDrops.length,
      totalAlerts:
        analysis.significantDrops.length + analysis.newDeals.length + analysis.backInStock.length,
    },
    analysis,
  };
});

// Step 4: Store price history
export const storePriceHistoryStep = compose(
  StepTemplates.database('store-price-history', 'Store price history in time-series database'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 5: Generate alerts
export const generateAlertsStep = createStep('generate-alerts', async (data: any) => {
  const { alertSettings, analysis, products } = data;
  const alerts = {
    adminAlerts: [] as any[],
    userAlerts: [] as any[],
    webhookPayloads: [] as any[],
  };

  // Generate user alerts for watchlist items
  if (alertSettings.enableUserAlerts) {
    // Price drop alerts
    analysis.significantDrops.forEach((drop: any) => {
      const product = products.find((p: any) => p.id === drop.product.id);
      if (product?.metadata?.inWatchlist) {
        alerts.userAlerts.push({
          type: 'price_drop',
          createdAt: new Date().toISOString(),
          message: `Price dropped ${drop.discount.toFixed(0)}% on ${drop.network}!`,
          network: drop.network,
          newPrice: drop.newPrice,
          oldPrice: drop.oldPrice,
          priority: drop.discount > 30 ? 'high' : 'medium',
          product: drop.product,
          userId: 'user_123', // In production, would get from watchlist
        });
      }
    });

    // Back in stock alerts
    analysis.backInStock.forEach((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (product?.metadata?.inWatchlist) {
        alerts.userAlerts.push({
          type: 'back_in_stock',
          createdAt: new Date().toISOString(),
          message: `${item.productTitle} is back in stock on ${item.network}!`,
          network: item.network,
          price: item.price,
          priority: 'high',
          product: {
            id: item.productId,
            title: item.productTitle,
          },
          userId: 'user_123',
        });
      }
    });
  }

  // Generate admin alerts
  if (alertSettings.enableAdminAlerts) {
    // Trending deals alert
    if (analysis.newDeals.length > 10) {
      alerts.adminAlerts.push({
        type: 'trending_deals',
        createdAt: new Date().toISOString(),
        deals: analysis.newDeals.slice(0, 10),
        message: `${analysis.newDeals.length} new deals detected`,
        priority: 'medium',
      });
    }

    // Price increase alerts
    if (analysis.significantIncreases.length > 5) {
      alerts.adminAlerts.push({
        type: 'price_increases',
        createdAt: new Date().toISOString(),
        increases: analysis.significantIncreases.slice(0, 10),
        message: `${analysis.significantIncreases.length} significant price increases detected`,
        priority: 'low',
      });
    }
  }

  // Generate webhook payloads
  if (alertSettings.alertChannels.includes('webhook')) {
    alerts.webhookPayloads.push({
      event: 'price_monitoring_complete',
      significantChanges: {
        drops: analysis.significantDrops.slice(0, 5),
        increases: analysis.significantIncreases.slice(0, 5),
      },
      summary: data.alertStats,
      timestamp: new Date().toISOString(),
      topDeals: analysis.newDeals.slice(0, 5),
    });
  }

  return {
    ...data,
    alerts,
    totalAlertsGenerated: alerts.userAlerts.length + alerts.adminAlerts.length,
  };
});

// Step 6: Send alerts
export const sendAlertsStep = compose(
  createStep('send-alerts', async (data: any) => {
    const { alerts, alertSettings } = data;
    const { alertFrequency, batchAlerts } = alertSettings;

    const sendResults = {
      failed: [] as any[],
      queued: [] as any[],
      sent: [] as any[],
    };

    // Process user alerts
    if (batchAlerts && alertFrequency !== 'immediate') {
      // Queue alerts for batch sending
      alerts.userAlerts.forEach((alert: any) => {
        sendResults.queued.push({
          ...alert,
          scheduledFor: getNextBatchTime(alertFrequency),
        });
      });
    } else {
      // Send immediately
      for (const alert of alerts.userAlerts) {
        try {
          // Simulate sending alert
          await new Promise((resolve) => setTimeout(resolve, 50));
          sendResults.sent.push({
            ...alert,
            sentAt: new Date().toISOString(),
          });
        } catch (error) {
          sendResults.failed.push({
            ...alert,
            error: (error as Error).message,
          });
        }
      }
    }

    // Send admin alerts immediately
    for (const alert of alerts.adminAlerts) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));
        sendResults.sent.push({
          ...alert,
          sentAt: new Date().toISOString(),
        });
      } catch (error) {
        sendResults.failed.push({
          ...alert,
          error: (error as Error).message,
        });
      }
    }

    // Send webhook notifications
    for (const payload of alerts.webhookPayloads) {
      try {
        // Simulate webhook call
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log('Webhook sent:', payload);
      } catch (error) {
        console.error('Webhook failed:', error);
      }
    }

    return {
      ...data,
      alertsFailed: sendResults.failed.length,
      alertsQueued: sendResults.queued.length,
      alertsSent: sendResults.sent.length,
      sendResults,
    };
  }),
  (step: any) => withStepRetry(step, { maxRetries: 2 }),
);

// Helper function to get next batch time
function getNextBatchTime(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'hourly':
      now.setHours(now.getHours() + 1, 0, 0, 0);
      break;
    case 'daily':
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0); // 9 AM
      break;
    default:
      now.setMinutes(now.getMinutes() + 5);
  }
  return now.toISOString();
}

// Step 7: Update monitoring metrics
export const updateMetricsStep = createStep('update-metrics', async (data: any) => {
  const { analysis, priceChecks, sendResults } = data;

  const metrics = {
    alerts: {
      failed: sendResults.failed.length,
      generated: data.totalAlertsGenerated,
      queued: sendResults.queued.length,
      sent: sendResults.sent.length,
    },
    monitoring: {
      changesDetected: priceChecks.reduce((sum: number, p: any) => sum + p.priceChanges.length, 0),
      pricesChecked: priceChecks.reduce((sum: number, p: any) => sum + p.sellerPrices.length, 0),
      productsMonitored: priceChecks.length,
    },
    performance: {
      avgCheckTime: (Date.now() - new Date(data.fetchedAt).getTime()) / priceChecks.length,
      checkDuration: Date.now() - new Date(data.fetchedAt).getTime(),
    },
    trends: {
      averagePriceChange: calculateAveragePriceChange(analysis.priceHistory),
      mostVolatileBrands: getMostVolatileBrands(analysis.priceHistory, data.products),
      topDroppingCategories: getTopCategories(analysis.significantDrops, data.products),
    },
  };

  return {
    ...data,
    metrics,
    monitoringComplete: true,
  };
});

// Helper functions for metrics
function calculateAveragePriceChange(priceHistory: any[]): number {
  if (priceHistory.length === 0) return 0;
  const totalChange = priceHistory.reduce((sum, h) => sum + h.changePercent, 0);
  return totalChange / priceHistory.length;
}

function getTopCategories(drops: any[], products: any[]): any[] {
  const categoryCount: Record<string, number> = {};

  drops.forEach((drop) => {
    const product = products.find((p) => p.id === drop.product.id);
    if (product) {
      product.categories.forEach((cat: string) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    }
  });

  return Object.entries(categoryCount)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
}

function getMostVolatileBrands(priceHistory: any[], products: any[]): any[] {
  const brandVolatility: Record<string, { changes: number; avgChange: number }> = {};

  priceHistory.forEach((history) => {
    const product = products.find((p) => p.id === history.productId);
    if (product) {
      if (!brandVolatility[product.brand]) {
        brandVolatility[product.brand] = { avgChange: 0, changes: 0 };
      }
      brandVolatility[product.brand].changes++;
      brandVolatility[product.brand].avgChange += Math.abs(history.changePercent);
    }
  });

  return Object.entries(brandVolatility)
    .map(([brand, data]) => ({
      brand,
      changeCount: data.changes,
      volatility: data.avgChange / data.changes,
    }))
    .sort((a: any, b: any) => b.volatility - a.volatility)
    .slice(0, 5);
}

// Main workflow definition
export const priceMonitoringWorkflow = {
  id: 'price-monitoring',
  name: 'Price Monitoring',
  config: {
    concurrency: {
      max: 10, // Allow multiple monitoring jobs
    },
    maxDuration: 600000, // 10 minutes
    schedule: {
      cron: '*/15 * * * *', // Every 15 minutes
      timezone: 'UTC',
    },
  },
  description: 'Real-time price tracking and alerts for affiliate products',
  features: {
    priceAlerts: true,
    realTimeMonitoring: true,
    trendAnalysis: true,
    watchlistSupport: true,
  },
  steps: [
    fetchProductsToMonitorStep,
    checkCurrentPricesStep,
    analyzePriceChangesStep,
    storePriceHistoryStep,
    generateAlertsStep,
    sendAlertsStep,
    updateMetricsStep,
  ],
  version: '1.0.0',
};
