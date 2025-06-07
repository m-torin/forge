/**
 * Data Sync Workflow
 * Synchronize Chart PDPs and sitemaps with external systems
 */

import {
  createStep,
  StepTemplates,
  withStepRetry,
  withStepCircuitBreaker,
  withStepTimeout,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';

// Input schemas
const DataSyncInput = z.object({
  syncType: z.enum(['chart-pdps', 'sitemaps', 'inventory', 'all']),
  source: z.string(),
  destination: z.string(),
  incremental: z.boolean().default(true),
  lastSyncTimestamp: z.string().optional(),
});

// Step 1: Fetch source data
export const fetchSourceDataStep = compose(
  createStep('fetch-source-data', async (input: z.infer<typeof DataSyncInput>) => {
    const { syncType, source, lastSyncTimestamp } = input;
    
    // Simulate fetching data based on sync type
    const dataMap = {
      'chart-pdps': {
        items: Array.from({ length: 150 }, (_, i) => ({
          id: `pdp-${i}`,
          title: `Product ${i}`,
          url: `/products/product-${i}`,
          lastModified: new Date(Date.now() - i * 3600000).toISOString(),
        })),
        totalCount: 150,
      },
      'sitemaps': {
        items: Array.from({ length: 50 }, (_, i) => ({
          loc: `https://example.com/category-${i}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        })),
        totalCount: 50,
      },
      'inventory': {
        items: Array.from({ length: 200 }, (_, i) => ({
          sku: `SKU-${i}`,
          quantity: Math.floor(Math.random() * 100),
          location: 'warehouse-1',
        })),
        totalCount: 200,
      },
      'all': {
        items: [],
        totalCount: 400,
      },
    };

    const data = dataMap[syncType];
    
    // Filter by timestamp if incremental
    if (input.incremental && lastSyncTimestamp) {
      data.items = data.items.filter((item: any) => 
        new Date(item.lastModified || item.lastmod || '').getTime() > 
        new Date(lastSyncTimestamp).getTime()
      );
    }

    return {
      syncType,
      items: data.items,
      totalCount: data.totalCount,
      fetchedAt: new Date().toISOString(),
    };
  }),
  (step) => withStepTimeout(step, { execution: 30000, warning: 20000 }),
  (step) => withStepCircuitBreaker(step, {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  })
);

// Step 2: Transform data
export const transformDataStep = createStep(
  'transform-data',
  async (sourceData: any) => {
    const { items, syncType } = sourceData;
    
    // Apply transformations based on sync type
    const transformed = items.map((item: any) => {
      switch (syncType) {
        case 'chart-pdps':
          return {
            ...item,
            canonicalUrl: `https://destination.com${item.url}`,
            metadata: {
              indexed: true,
              priority: 'high',
            },
          };
        case 'sitemaps':
          return {
            ...item,
            loc: item.loc.replace('example.com', 'destination.com'),
          };
        default:
          return item;
      }
    });

    return {
      ...sourceData,
      items: transformed,
      transformedAt: new Date().toISOString(),
    };
  }
);

// Step 3: Validate data
export const validateDataStep = createStep(
  'validate-data',
  async (data: any) => {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    data.items.forEach((item: any, index: number) => {
      // Basic validation
      if (!item.id && !item.sku && !item.loc) {
        errors.push({
          index,
          message: 'Missing required identifier',
          item,
        });
      }
      
      // Check for data quality issues
      if (item.title && item.title.length < 3) {
        warnings.push({
          index,
          message: 'Title too short',
          item,
        });
      }
    });

    return {
      ...data,
      validation: {
        errors,
        warnings,
        valid: errors.length === 0,
        validatedAt: new Date().toISOString(),
      },
    };
  }
);

// Step 4: Chunk data for batch processing
export const chunkDataStep = createStep(
  'chunk-data',
  async (data: any) => {
    const CHUNK_SIZE = 50;
    const chunks = [];
    
    for (let i = 0; i < data.items.length; i += CHUNK_SIZE) {
      chunks.push({
        chunkId: `chunk-${i / CHUNK_SIZE}`,
        items: data.items.slice(i, i + CHUNK_SIZE),
        startIndex: i,
        endIndex: Math.min(i + CHUNK_SIZE, data.items.length),
      });
    }

    return {
      ...data,
      chunks,
      totalChunks: chunks.length,
    };
  }
);

// Step 5: Sync chunks in parallel
export const syncChunksStep = compose(
  createStep('sync-chunks', async (data: any) => {
    const { chunks, destination } = data;
    
    // Simulate parallel chunk processing
    const results = await Promise.all(
      chunks.map(async (chunk: any) => {
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
        
        return {
          chunkId: chunk.chunkId,
          success: Math.random() > 0.1, // 90% success rate
          itemsProcessed: chunk.items.length,
          errors: Math.random() > 0.9 ? ['Network timeout'] : [],
        };
      })
    );

    const totalProcessed = results.reduce((sum, r) => sum + r.itemsProcessed, 0);
    const failedChunks = results.filter(r => !r.success);

    return {
      ...data,
      syncResults: results,
      totalProcessed,
      failedChunks,
      syncedAt: new Date().toISOString(),
    };
  }),
  (step) => withStepRetry(step, { 
    maxAttempts: 3, 
    backoff: 'exponential',
    retryIf: (error) => error.message.includes('timeout'),
  })
);

// Step 6: Generate sync report
export const generateReportStep = StepTemplates.dataTransformation(
  'generate-report',
  'Create sync summary report',
  {
    transformFunction: async (data: any) => {
      const { syncType, totalCount, totalProcessed, failedChunks, validation } = data;
      
      return {
        report: {
          syncType,
          status: failedChunks.length === 0 ? 'success' : 'partial',
          summary: {
            totalItems: totalCount,
            processedItems: totalProcessed,
            failedItems: failedChunks.reduce((sum: number, chunk: any) => 
              sum + chunk.itemsProcessed, 0
            ),
            successRate: (totalProcessed / totalCount) * 100,
          },
          validation: {
            errors: validation.errors.length,
            warnings: validation.warnings.length,
          },
          timing: {
            startedAt: data.fetchedAt,
            completedAt: data.syncedAt,
            duration: new Date(data.syncedAt).getTime() - 
                     new Date(data.fetchedAt).getTime(),
          },
        },
      };
    },
  }
);

// Step 7: Store sync metadata
export const storeSyncMetadataStep = StepTemplates.database(
  'store-sync-metadata',
  'Save sync results to database'
);

// Step 8: Send notification
export const sendNotificationStep = StepTemplates.notification(
  'sync-notification',
  'Notify about sync completion',
  {
    channels: ['email', 'slack'],
    condition: (data: any) => data.report.status !== 'success',
  }
);

// Main workflow definition
export const dataSyncWorkflow = {
  id: 'data-sync',
  name: 'Data Synchronization',
  description: 'Sync Chart PDPs, sitemaps, and inventory with external systems',
  version: '1.0.0',
  steps: [
    fetchSourceDataStep,
    transformDataStep,
    validateDataStep,
    chunkDataStep,
    syncChunksStep,
    generateReportStep,
    storeSyncMetadataStep,
    sendNotificationStep,
  ],
  config: {
    maxDuration: 300000, // 5 minutes
    concurrency: {
      max: 5, // Max parallel syncs
    },
  },
};