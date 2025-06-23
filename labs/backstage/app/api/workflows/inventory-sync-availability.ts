/**
 * Inventory Sync & Availability Workflow
 * Real-time inventory synchronization across multiple merchants and channels
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const InventorySyncInput = z.object({
  alertConfig: z.object({
    alertThresholds: z.object({
      highDiscrepancy: z.number().default(0.1), // 10% difference
      lowStock: z.number().default(10),
      syncFailureRate: z.number().default(0.05), // 5% failure rate
    }),
    discrepancyAlerts: z.boolean().default(true),
    lowStockAlerts: z.boolean().default(true),
    performanceAlerts: z.boolean().default(true),
    stockoutAlerts: z.boolean().default(true),
  }),
  availabilityConfig: z.object({
    backorderEnabled: z.boolean().default(false),
    bufferStock: z.number().default(5), // Safety stock buffer
    lowStockThreshold: z.number().default(10),
    multiLocationLogic: z
      .enum(['any_available', 'all_locations', 'primary_first'])
      .default('any_available'),
    outOfStockThreshold: z.number().default(0),
    preorderEnabled: z.boolean().default(true),
  }),
  integrationConfig: z.object({
    apiKeys: z.record(z.string()).optional(),
    conflictResolution: z
      .enum(['latest_wins', 'source_priority', 'manual_review'])
      .default('latest_wins'),
    enableRealTime: z.boolean().default(true),
    updateFrequency: z.number().default(300), // seconds
    webhookEndpoints: z.array(z.string()).optional(),
  }),
  scope: z.object({
    all: z.boolean().default(false),
    channels: z.array(z.string()).optional(),
    merchants: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
    warehouses: z.array(z.string()).optional(),
  }),
  syncConfig: z.object({
    validateStock: z.boolean().default(true),
    batchSize: z.number().default(1000),
    maxConcurrency: z.number().default(10),
    reconcileDiscrepancies: z.boolean().default(true),
    retryAttempts: z.number().default(3),
    timeoutMs: z.number().default(30000),
  }),
  syncMode: z.enum(['full', 'incremental', 'real-time', 'batch']).default('incremental'),
});

// Inventory item schema
const InventoryItem = z.object({
  itemId: z.string(),
  lastUpdated: z.string().datetime(),
  location: z
    .object({
      aisle: z.string().optional(),
      bin: z.string().optional(),
      shelf: z.string().optional(),
    })
    .optional(),
  merchantId: z.string(),
  metadata: z.record(z.any()),
  pricing: z.object({
    cost: z.number(),
    currency: z.string().default('USD'),
    retail: z.number().optional(),
    wholesale: z.number().optional(),
  }),
  productId: z.string(),
  quantities: z.object({
    available: z.number(),
    damaged: z.number(),
    inTransit: z.number(),
    reserved: z.number(),
    total: z.number(),
  }),
  source: z.string(),
  status: z.enum(['active', 'inactive', 'discontinued', 'backorder', 'preorder']),
  tracking: z.object({
    barcode: z.string().optional(),
    expirationDate: z.string().datetime().optional(),
    lotNumber: z.string().optional(),
    serialNumbers: z.array(z.string()).optional(),
    sku: z.string(),
  }),
  warehouseId: z.string(),
});

// Sync result schema
const SyncResult = z.object({
  conflictReason: z.string().optional(),
  discrepancy: z.number().optional(),
  itemId: z.string(),
  lastSynced: z.string().datetime(),
  newQuantity: z.number(),
  previousQuantity: z.number().optional(),
  source: z.string(),
  status: z.enum(['synced', 'failed', 'conflict', 'unchanged']),
});

// Step factory for inventory synchronization
const inventorySyncFactory = createWorkflowStep(
  {
    name: 'Inventory Synchronizer',
    category: 'inventory',
    tags: ['sync', 'real-time', 'availability'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, items } = context.input;
    const syncResults = [];

    for (const item of items) {
      const result = await syncInventoryItem(item, config);
      syncResults.push(result);
    }

    return syncResults;
  },
);

// Mock inventory sync
async function syncInventoryItem(item: any, config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Simulate different sync scenarios
  const scenario = Math.random();

  if (scenario < 0.8) {
    // Successful sync
    const previousQuantity = item.quantities.available;
    const variance = Math.floor((Math.random() - 0.5) * 20);
    const newQuantity = Math.max(0, previousQuantity + variance);

    return {
      discrepancy: Math.abs(newQuantity - previousQuantity),
      itemId: item.itemId,
      lastSynced: new Date().toISOString(),
      newQuantity,
      previousQuantity,
      source: item.source,
      status: newQuantity !== previousQuantity ? 'synced' : 'unchanged',
    };
  } else if (scenario < 0.9) {
    // Conflict scenario
    return {
      conflictReason: 'Multiple sources updated simultaneously',
      itemId: item.itemId,
      lastSynced: new Date().toISOString(),
      newQuantity: item.quantities.available,
      previousQuantity: item.quantities.available,
      source: item.source,
      status: 'conflict',
    };
  } else {
    // Sync failure
    return {
      conflictReason: 'API connection timeout',
      itemId: item.itemId,
      lastSynced: new Date().toISOString(),
      newQuantity: item.quantities.available,
      previousQuantity: item.quantities.available,
      source: item.source,
      status: 'failed',
    };
  }
}

// Step 1: Collect inventory sources
export const collectInventorySourcesStep = compose(
  createStepWithValidation(
    'collect-sources',
    async (input: z.infer<typeof InventorySyncInput>) => {
      const { scope } = input;

      let inventorySources = [];

      // Collect inventory from different sources
      if (scope.all) {
        inventorySources = await fetchAllInventorySources();
      } else {
        if (scope.merchants) {
          const merchantSources = await fetchMerchantInventory(scope.merchants);
          inventorySources.push(...merchantSources);
        }
        if (scope.warehouses) {
          const warehouseSources = await fetchWarehouseInventory(scope.warehouses);
          inventorySources.push(...warehouseSources);
        }
        if (scope.products) {
          const productSources = await fetchProductInventory(scope.products);
          inventorySources.push(...productSources);
        }
      }

      // Remove duplicates based on itemId
      const uniqueSources = Array.from(
        new Map(inventorySources.map((item) => [item.itemId, item])).values(),
      );

      return {
        ...input,
        collectionStarted: new Date().toISOString(),
        inventorySources: uniqueSources,
        sourceCount: new Set(uniqueSources.map((item) => item.source)).size,
        totalItems: uniqueSources.length,
      };
    },
    (input) =>
      input.scope.all ||
      input.scope.merchants?.length > 0 ||
      input.scope.products?.length > 0 ||
      input.scope.warehouses?.length > 0,
    (output) => output.inventorySources.length > 0,
  ),
  (step: any) => withStepTimeout(step, 120000), // 2 minutes
  (step: any) => withStepMonitoring(step),
);

// Mock inventory fetching functions
async function fetchAllInventorySources(): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const count = 2000 + Math.floor(Math.random() * 3000);
  return generateMockInventoryItems(count);
}

async function fetchMerchantInventory(merchantIds: string[]): Promise<any[]> {
  const allItems = await fetchAllInventorySources();
  return allItems.filter((item) => merchantIds.includes(item.merchantId));
}

async function fetchWarehouseInventory(warehouseIds: string[]): Promise<any[]> {
  const allItems = await fetchAllInventorySources();
  return allItems.filter((item) => warehouseIds.includes(item.warehouseId));
}

async function fetchProductInventory(productIds: string[]): Promise<any[]> {
  const allItems = await fetchAllInventorySources();
  return allItems.filter((item) => productIds.includes(item.productId));
}

function generateMockInventoryItems(count: number): any[] {
  const sources = ['merchant-api', 'warehouse-system', 'pos-system', 'erp-system'];
  const statuses = ['active', 'inactive', 'discontinued', 'backorder', 'preorder'];

  return Array.from({ length: count }, (_, i) => {
    const available = Math.floor(Math.random() * 500);
    const reserved = Math.floor(Math.random() * 50);
    const inTransit = Math.floor(Math.random() * 100);
    const damaged = Math.floor(Math.random() * 10);

    return {
      itemId: `item_${i}`,
      lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        aisle: `A${Math.floor(Math.random() * 20) + 1}`,
        bin: `B${Math.floor(Math.random() * 50) + 1}`,
        shelf: `S${Math.floor(Math.random() * 10) + 1}`,
      },
      merchantId: `merchant_${Math.floor(Math.random() * 50)}`,
      metadata: {
        category: ['Electronics', 'Clothing', 'Home', 'Books'][Math.floor(Math.random() * 4)],
        dimensions: {
          width: Math.random() * 100,
          height: Math.random() * 100,
          length: Math.random() * 100,
        },
        supplier: `supplier_${Math.floor(Math.random() * 20)}`,
        weight: Math.random() * 10,
      },
      pricing: {
        cost: 10 + Math.random() * 100,
        currency: 'USD',
        retail: 20 + Math.random() * 200,
        wholesale: 15 + Math.random() * 150,
      },
      productId: `prod_${Math.floor(Math.random() * 1000)}`,
      quantities: {
        available,
        damaged,
        inTransit,
        reserved,
        total: available + reserved + inTransit + damaged,
      },
      source: sources[Math.floor(Math.random() * sources.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      tracking: {
        barcode: `${Math.floor(Math.random() * 1000000000000)}`,
        expirationDate:
          Math.random() > 0.8
            ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        lotNumber: Math.random() > 0.7 ? `LOT-${Math.floor(Math.random() * 10000)}` : undefined,
        sku: `SKU-${i}`,
      },
      warehouseId: `warehouse_${Math.floor(Math.random() * 20)}`,
    };
  });
}

// Step 2: Validate inventory data
export const validateInventoryDataStep = createStep('validate-inventory', async (data: any) => {
  const { inventorySources, syncConfig } = data;
  const validatedItems = [];
  const invalidItems = [];
  const warnings = [];

  for (const item of inventorySources) {
    const validation = validateInventoryItem(item);

    if (validation.isValid) {
      // Apply data enrichment
      const enrichedItem = enrichInventoryItem(item);
      validatedItems.push(enrichedItem);

      if (validation.warnings.length > 0) {
        warnings.push({
          itemId: item.itemId,
          warnings: validation.warnings,
        });
      }
    } else {
      invalidItems.push({
        errors: validation.errors,
        item,
      });
    }
  }

  return {
    ...data,
    invalidItems,
    validatedItems,
    validationStats: {
      invalid: invalidItems.length,
      valid: validatedItems.length,
      validationRate: validatedItems.length / inventorySources.length,
      total: inventorySources.length,
      warnings: warnings.length,
    },
    warnings,
  };
});

function validateInventoryItem(item: any): any {
  const errors = [];
  const warnings = [];

  // Required field validation
  if (!item.itemId) errors.push('Missing itemId');
  if (!item.productId) errors.push('Missing productId');
  if (!item.merchantId) errors.push('Missing merchantId');
  if (!item.quantities) errors.push('Missing quantities');

  // Quantity validation
  if (item.quantities) {
    if (item.quantities.available < 0) errors.push('Negative available quantity');
    if (item.quantities.reserved < 0) errors.push('Negative reserved quantity');

    const calculatedTotal =
      item.quantities.available +
      item.quantities.reserved +
      item.quantities.inTransit +
      item.quantities.damaged;
    if (Math.abs(calculatedTotal - item.quantities.total) > 1) {
      warnings.push('Total quantity mismatch');
    }
  }

  // Business logic validation
  if (item.status === 'active' && item.quantities?.available === 0) {
    warnings.push('Active item with zero availability');
  }

  if (item.pricing) {
    if (
      item.pricing.retail &&
      item.pricing.wholesale &&
      item.pricing.retail <= item.pricing.wholesale
    ) {
      warnings.push('Retail price not higher than wholesale');
    }
  }

  // Date validation
  if (item.tracking?.expirationDate) {
    const expDate = new Date(item.tracking.expirationDate);
    if (expDate < new Date()) {
      warnings.push('Item has expired');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function enrichInventoryItem(item: any): any {
  // Calculate availability status
  const availabilityStatus = calculateAvailabilityStatus(item);

  // Calculate turnover metrics
  const turnoverMetrics = calculateTurnoverMetrics(item);

  // Add computed fields
  return {
    ...item,
    computed: {
      availabilityStatus,
      lastSyncAge: Date.now() - new Date(item.lastUpdated).getTime(),
      profitMargin:
        item.pricing.retail && item.pricing.cost
          ? ((item.pricing.retail - item.pricing.cost) / item.pricing.retail) * 100
          : 0,
      stockValue: item.quantities.total * (item.pricing.cost || 0),
      turnoverMetrics,
    },
  };
}

function calculateAvailabilityStatus(item: any): any {
  const available = item.quantities.available;

  let status = 'available';
  let priority = 'normal';

  if (available === 0) {
    status = 'out_of_stock';
    priority = 'high';
  } else if (available <= 5) {
    status = 'low_stock';
    priority = 'medium';
  } else if (available <= 10) {
    status = 'limited_stock';
    priority = 'low';
  }

  return {
    daysOfStock: available / Math.max(1, Math.random() * 10), // Mock daily sales rate
    priority,
    status,
  };
}

function calculateTurnoverMetrics(item: any): any {
  // Mock turnover calculations
  const dailySalesRate = Math.random() * 5;
  const turnoverRatio = (dailySalesRate * 365) / Math.max(1, item.quantities.total);

  return {
    dailySalesRate,
    turnoverRatio,
    velocityCategory: turnoverRatio > 4 ? 'fast' : turnoverRatio > 2 ? 'medium' : 'slow',
  };
}

// Step 3: Detect conflicts and discrepancies
export const detectConflictsStep = createStep('detect-conflicts', async (data: any) => {
  const { validatedItems } = data;
  const conflicts: any[] = [];
  const discrepancies: any[] = [];

  // Group items by product+warehouse to detect conflicts
  const itemGroups = new Map();

  validatedItems.forEach((item: any) => {
    const key = `${item.productId}_${item.warehouseId}`;
    if (!itemGroups.has(key)) {
      itemGroups.set(key, []);
    }
    itemGroups.get(key).push(item);
  });

  // Analyze each group for conflicts
  itemGroups.forEach((items, key) => {
    if (items.length > 1) {
      const conflict = analyzeItemConflict(items);
      if (conflict) {
        conflicts.push(conflict);
      }
    }

    // Check for discrepancies within single items
    items.forEach((item: any) => {
      const discrepancy = detectItemDiscrepancies(item);
      if (discrepancy) {
        discrepancies.push(discrepancy);
      }
    });
  });

  return {
    ...data,
    conflicts,
    conflictStats: {
      highPriorityConflicts: conflicts.filter((c) => c.severity === 'high').length,
      totalConflicts: conflicts.length,
      totalDiscrepancies: discrepancies.length,
    },
    discrepancies,
  };
});

function analyzeItemConflict(items: any[]): any | null {
  if (items.length < 2) return null;

  // Check for quantity conflicts
  const quantities = items.map((item) => item.quantities.available);
  const maxQuantity = Math.max(...quantities);
  const minQuantity = Math.min(...quantities);
  const variance = maxQuantity - minQuantity;

  if (variance > 10) {
    // Significant difference
    return {
      type: 'quantity_conflict',
      items: items.map((item) => ({
        itemId: item.itemId,
        lastUpdated: item.lastUpdated,
        quantity: item.quantities.available,
        source: item.source,
      })),
      productId: items[0].productId,
      recommendedAction: 'manual_review',
      severity: variance > 50 ? 'high' : variance > 20 ? 'medium' : 'low',
      variance,
      warehouseId: items[0].warehouseId,
    };
  }

  // Check for status conflicts
  const statuses = new Set(items.map((item) => item.status));
  if (statuses.size > 1) {
    return {
      type: 'status_conflict',
      conflictingStatuses: Array.from(statuses),
      items: items.map((item) => ({
        itemId: item.itemId,
        lastUpdated: item.lastUpdated,
        source: item.source,
        status: item.status,
      })),
      productId: items[0].productId,
      recommendedAction: 'source_priority',
      severity: 'medium',
      warehouseId: items[0].warehouseId,
    };
  }

  return null;
}

function detectItemDiscrepancies(item: any): any | null {
  const discrepancies = [];

  // Check total quantity calculation
  const calculatedTotal =
    item.quantities.available +
    item.quantities.reserved +
    item.quantities.inTransit +
    item.quantities.damaged;

  if (Math.abs(calculatedTotal - item.quantities.total) > 5) {
    discrepancies.push({
      type: 'quantity_mismatch',
      actual: item.quantities.total,
      difference: Math.abs(calculatedTotal - item.quantities.total),
      expected: calculatedTotal,
    });
  }

  // Check for stale data
  const lastUpdateAge = Date.now() - new Date(item.lastUpdated).getTime();
  if (lastUpdateAge > 24 * 60 * 60 * 1000) {
    // Older than 24 hours
    discrepancies.push({
      type: 'stale_data',
      ageHours: lastUpdateAge / (60 * 60 * 1000),
    });
  }

  // Check pricing consistency
  if (item.pricing.retail && item.pricing.wholesale && item.pricing.cost) {
    if (item.pricing.cost >= item.pricing.wholesale) {
      discrepancies.push({
        type: 'pricing_inconsistency',
        issue: 'Cost exceeds wholesale price',
      });
    }
  }

  if (discrepancies.length > 0) {
    return {
      discrepancies,
      itemId: item.itemId,
      productId: item.productId,
      severity: discrepancies.some((d) => d.type === 'quantity_mismatch') ? 'high' : 'medium',
    };
  }

  return null;
}

// Step 4: Synchronize inventory data
export const synchronizeInventoryStep = compose(
  createStep('sync-inventory', async (data: any) => {
    const { validatedItems, integrationConfig, syncConfig } = data;

    // Process items in batches
    const batchSize = syncConfig.batchSize;
    const allSyncResults = [];
    const errors = [];

    for (let i = 0; i < validatedItems.length; i += batchSize) {
      const batch = validatedItems.slice(i, i + batchSize);

      try {
        const batchResults = await inventorySyncFactory.handler({
          input: {
            config: { ...syncConfig, ...integrationConfig },
            items: batch,
          },
        });

        allSyncResults.push(...batchResults);

        console.log(
          `Synced ${Math.min(i + batchSize, validatedItems.length)}/${validatedItems.length} items`,
        );
      } catch (error) {
        errors.push({
          batchIndex: Math.floor(i / batchSize),
          error: (error as Error).message,
          itemCount: batch.length,
        });
      }
    }

    // Calculate sync statistics
    const syncStats = calculateSyncStatistics(allSyncResults);

    return {
      ...data,
      syncComplete: true,
      syncErrors: errors,
      syncResults: allSyncResults,
      syncStats,
    };
  }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      threshold: 5,
      resetTimeout: 60000,
    }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 600000, // 10 minutes
      threshold: 0.5,
      // timeout: 300000, // 5 minutes
    }),
);

function calculateSyncStatistics(syncResults: any[]): any {
  const stats: Record<string, number> = {
    averageDiscrepancy: 0,
    conflicts: 0,
    failed: 0,
    successRate: 0,
    synced: 0,
    total: syncResults.length,
    totalDiscrepancy: 0,
    unchanged: 0,
  };

  syncResults.forEach((result) => {
    stats[result.status]++;
    if (result.discrepancy) {
      stats.totalDiscrepancy += result.discrepancy;
    }
  });

  stats.averageDiscrepancy = stats.totalDiscrepancy / Math.max(1, stats.synced);
  stats.successRate = (stats.synced + stats.unchanged) / stats.total;

  return stats;
}

// Step 5: Resolve conflicts
export const resolveConflictsStep = createStep('resolve-conflicts', async (data: any) => {
  const { conflicts, integrationConfig } = data;
  const resolvedConflicts = [];
  const unresolvedConflicts = [];

  for (const conflict of conflicts) {
    const resolution = await resolveConflict(conflict, integrationConfig.conflictResolution);

    if (resolution.resolved) {
      resolvedConflicts.push({
        ...conflict,
        resolution,
        resolvedAt: new Date().toISOString(),
      });
    } else {
      unresolvedConflicts.push({
        ...conflict,
        reason: resolution.reason,
      });
    }
  }

  return {
    ...data,
    conflictResolution: {
      resolutionRate: resolvedConflicts.length / Math.max(1, conflicts.length),
      resolved: resolvedConflicts.length,
      total: conflicts.length,
      unresolved: unresolvedConflicts.length,
    },
    resolvedConflicts,
    unresolvedConflicts,
  };
});

async function resolveConflict(conflict: any, strategy: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  switch (strategy) {
    case 'latest_wins':
      return resolveByLatestTimestamp(conflict);
    case 'source_priority':
      return resolveBySourcePriority(conflict);
    case 'manual_review':
      return { reason: 'Requires manual review', resolved: false };
    default:
      return { reason: 'Unknown resolution strategy', resolved: false };
  }
}

function resolveByLatestTimestamp(conflict: any): any {
  const sortedItems = conflict.items.sort(
    (a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );

  return {
    method: 'latest_wins',
    reason: `Selected item with latest timestamp: ${sortedItems[0].lastUpdated}`,
    resolved: true,
    selectedItem: sortedItems[0],
  };
}

function resolveBySourcePriority(conflict: any): any {
  const sourcePriority: Record<string, number> = {
    'erp-system': 1,
    'merchant-api': 3,
    'pos-system': 4,
    'warehouse-system': 2,
  };

  const sortedItems = conflict.items.sort(
    (a: any, b: any) => (sourcePriority[a.source] || 999) - (sourcePriority[b.source] || 999),
  );

  return {
    method: 'source_priority',
    reason: `Selected item from highest priority source: ${sortedItems[0].source}`,
    resolved: true,
    selectedItem: sortedItems[0],
  };
}

// Step 6: Update availability status
export const updateAvailabilityStatusStep = createStep('update-availability', async (data: any) => {
  const { availabilityConfig, syncResults } = data;
  const availabilityUpdates = [];

  for (const result of syncResults) {
    if (result.status === 'synced' || result.status === 'unchanged') {
      const availabilityUpdate = calculateAvailabilityUpdate(result, availabilityConfig);
      availabilityUpdates.push(availabilityUpdate);
    }
  }

  // Group by product for marketplace availability
  const productAvailability = calculateProductAvailability(availabilityUpdates, availabilityConfig);

  return {
    ...data,
    availabilityStats: {
      available: Object.values(productAvailability).filter((p: any) => p.status === 'available')
        .length,
      lowStock: Object.values(productAvailability).filter((p: any) => p.status === 'low_stock')
        .length,
      outOfStock: Object.values(productAvailability).filter((p: any) => p.status === 'out_of_stock')
        .length,
      totalProducts: Object.keys(productAvailability).length,
    },
    availabilityUpdates,
    productAvailability,
  };
});

function calculateAvailabilityUpdate(syncResult: any, config: any): any {
  const quantity = syncResult.newQuantity;
  const bufferedQuantity = Math.max(0, quantity - config.bufferStock);

  let status = 'available';
  let availableForSale = bufferedQuantity;

  if (quantity <= config.outOfStockThreshold) {
    status = 'out_of_stock';
    availableForSale = 0;
  } else if (quantity <= config.lowStockThreshold) {
    status = 'low_stock';
    availableForSale = Math.max(0, quantity - config.bufferStock);
  }

  return {
    availableForSale,
    bufferStock: config.bufferStock,
    itemId: syncResult.itemId,
    lastUpdated: new Date().toISOString(),
    physicalQuantity: quantity,
    status,
  };
}

function calculateProductAvailability(updates: any[], config: any): any {
  const productGroups = new Map();

  // Group by product
  updates.forEach((update) => {
    // Extract productId from itemId (mock logic)
    const productId =
      update.itemId.replace(/item_/, 'prod_').split('_')[0] +
      '_' +
      Math.floor(Math.random() * 1000);

    if (!productGroups.has(productId)) {
      productGroups.set(productId, []);
    }
    productGroups.get(productId).push(update);
  });

  const productAvailability: Record<string, any> = {};

  productGroups.forEach((items, productId) => {
    const availability = calculateProductAvailabilityLogic(items, config);
    productAvailability[productId] = availability;
  });

  return productAvailability;
}

function calculateProductAvailabilityLogic(items: any[], config: any): any {
  switch (config.multiLocationLogic) {
    case 'any_available':
      return calculateAnyAvailable(items);
    case 'all_locations':
      return calculateAllLocations(items);
    case 'primary_first':
      return calculatePrimaryFirst(items);
    default:
      return calculateAnyAvailable(items);
  }
}

function calculateAnyAvailable(items: any[]): any {
  const totalAvailable = items.reduce((sum, item) => sum + item.availableForSale, 0);
  const hasStock = items.some((item) => item.availableForSale > 0);

  return {
    availableLocations: items.filter((item) => item.availableForSale > 0).length,
    locations: items.length,
    status: hasStock ? (totalAvailable <= 10 ? 'low_stock' : 'available') : 'out_of_stock',
    totalAvailable,
  };
}

function calculateAllLocations(items: any[]): any {
  const allHaveStock = items.every((item) => item.availableForSale > 0);
  const totalAvailable = items.reduce((sum, item) => sum + item.availableForSale, 0);

  return {
    availableLocations: items.filter((item) => item.availableForSale > 0).length,
    locations: items.length,
    status: allHaveStock ? (totalAvailable <= 10 ? 'low_stock' : 'available') : 'out_of_stock',
    totalAvailable,
  };
}

function calculatePrimaryFirst(items: any[]): any {
  // Sort by availability and use primary location logic
  const sortedItems = items.sort((a: any, b: any) => b.availableForSale - a.availableForSale);
  const primaryItem = sortedItems[0];

  return {
    availableLocations: items.filter((item) => item.availableForSale > 0).length,
    locations: items.length,
    primaryLocation: primaryItem.itemId,
    status:
      primaryItem.availableForSale > 0
        ? primaryItem.availableForSale <= 10
          ? 'low_stock'
          : 'available'
        : 'out_of_stock',
    totalAvailable: primaryItem.availableForSale,
  };
}

// Step 7: Generate alerts and notifications
export const generateInventoryAlertsStep = createStep('generate-alerts', async (data: any) => {
  const { alertConfig, availabilityUpdates, syncStats, unresolvedConflicts } = data;
  const alerts = [];

  // Low stock alerts
  if (alertConfig.lowStockAlerts) {
    const lowStockItems = availabilityUpdates.filter(
      (item: any) =>
        item.status === 'low_stock' &&
        item.physicalQuantity <= alertConfig.alertThresholds.lowStock,
    );

    if (lowStockItems.length > 0) {
      alerts.push({
        type: 'low_stock',
        action: 'Review replenishment needs',
        description: `${lowStockItems.length} items below stock threshold`,
        items: lowStockItems.slice(0, 10),
        severity: 'medium',
        timestamp: new Date().toISOString(),
        title: 'Low Stock Alert',
      });
    }
  }

  // Stock-out alerts
  if (alertConfig.stockoutAlerts) {
    const outOfStockItems = availabilityUpdates.filter(
      (item: any) => item.status === 'out_of_stock',
    );

    if (outOfStockItems.length > 0) {
      alerts.push({
        type: 'out_of_stock',
        action: 'Immediate replenishment required',
        description: `${outOfStockItems.length} items are out of stock`,
        items: outOfStockItems.slice(0, 10),
        severity: 'high',
        timestamp: new Date().toISOString(),
        title: 'Stock-Out Alert',
      });
    }
  }

  // Sync performance alerts
  if (
    alertConfig.performanceAlerts &&
    syncStats.successRate < 1 - alertConfig.alertThresholds.syncFailureRate
  ) {
    alerts.push({
      type: 'sync_performance',
      action: 'Investigate sync failures and API connectivity',
      description: `Sync success rate ${(syncStats.successRate * 100).toFixed(1)}% below threshold`,
      severity: 'high',
      timestamp: new Date().toISOString(),
      title: 'Sync Performance Issue',
    });
  }

  // Discrepancy alerts
  if (
    alertConfig.discrepancyAlerts &&
    syncStats.averageDiscrepancy > alertConfig.alertThresholds.highDiscrepancy * 100
  ) {
    alerts.push({
      type: 'discrepancy',
      action: 'Audit inventory sources and reconcile differences',
      description: `Average discrepancy ${syncStats.averageDiscrepancy.toFixed(1)} items above threshold`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      title: 'High Inventory Discrepancies',
    });
  }

  // Unresolved conflicts
  if (unresolvedConflicts && unresolvedConflicts.length > 0) {
    alerts.push({
      type: 'conflicts',
      action: 'Review and resolve inventory conflicts',
      conflicts: unresolvedConflicts.slice(0, 5),
      description: `${unresolvedConflicts.length} conflicts require manual resolution`,
      severity: 'high',
      timestamp: new Date().toISOString(),
      title: 'Unresolved Inventory Conflicts',
    });
  }

  return {
    ...data,
    alerts,
    alertStats: {
      high: alerts.filter((a) => a.severity === 'high').length,
      low: alerts.filter((a) => a.severity === 'low').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      total: alerts.length,
    },
  };
});

// Step 8: Send notifications
export const sendNotificationsStep = createStep('send-notifications', async (data: any) => {
  const { alerts, integrationConfig } = data;
  const notifications = [];

  // Send alerts to configured endpoints
  for (const alert of alerts) {
    if (alert.severity === 'high' || alert.severity === 'critical') {
      const notification = await sendAlert(alert, integrationConfig);
      notifications.push(notification);
    }
  }

  // Send webhook notifications
  if (integrationConfig.webhookEndpoints) {
    for (const endpoint of integrationConfig.webhookEndpoints) {
      const webhookNotification = await sendWebhookNotification(endpoint, data);
      notifications.push(webhookNotification);
    }
  }

  return {
    ...data,
    notifications,
    notificationStats: {
      failed: notifications.filter((n) => !n.sent).length,
      sent: notifications.filter((n) => n.sent).length,
    },
  };
});

async function sendAlert(alert: any, config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const sent = Math.random() > 0.05; // 95% success rate

  return {
    type: 'alert',
    alertId: alert.type,
    content: {
      action: alert.action,
      description: alert.description,
      title: alert.title,
    },
    recipient: 'inventory_team',
    sent,
    sentAt: sent ? new Date().toISOString() : undefined,
    severity: alert.severity,
  };
}

async function sendWebhookNotification(endpoint: string, data: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const sent = Math.random() > 0.1; // 90% success rate

  return {
    type: 'webhook',
    endpoint,
    payload: {
      alerts: data.alerts?.length || 0,
      syncRate: data.syncStats?.successRate,
      totalItems: data.totalItems,
    },
    sent,
    sentAt: sent ? new Date().toISOString() : undefined,
  };
}

// Step 9: Update search indices
export const updateSearchIndicesStep = createStep('update-indices', async (data: any) => {
  const { availabilityUpdates, productAvailability } = data;
  const indexUpdates = [];

  // Update product availability in search index
  for (const [productId, availability] of Object.entries(productAvailability)) {
    const indexUpdate = await updateProductIndex(productId, availability);
    indexUpdates.push(indexUpdate);
  }

  // Update item-level indices
  const itemIndexUpdates = await updateItemIndices(availabilityUpdates);
  indexUpdates.push(...itemIndexUpdates);

  return {
    ...data,
    indexStats: {
      failedUpdates: indexUpdates.filter((u) => !u.success).length,
      itemIndexUpdates: availabilityUpdates.length,
      productIndexUpdates: Object.keys(productAvailability).length,
      successfulUpdates: indexUpdates.filter((u) => u.success).length,
    },
    indexUpdates,
  };
});

async function updateProductIndex(productId: string, availability: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const success = Math.random() > 0.05; // 95% success rate

  return {
    id: productId,
    type: 'product',
    fields: {
      availability_status: availability.status,
      location_count: availability.locations,
      total_available: availability.totalAvailable,
    },
    success,
    updatedAt: new Date().toISOString(),
  };
}

async function updateItemIndices(items: any[]): Promise<any[]> {
  const updates = [];

  for (const item of items) {
    const success = Math.random() > 0.05;

    updates.push({
      id: item.itemId,
      type: 'item',
      fields: {
        availability_status: item.status,
        available_for_sale: item.availableForSale,
        physical_quantity: item.physicalQuantity,
      },
      success,
      updatedAt: new Date().toISOString(),
    });
  }

  return updates;
}

// Step 10: Generate sync report
export const generateSyncReportStep = createStep('generate-report', async (data: any) => {
  const {
    validationStats,
    alertStats,
    availabilityStats,
    conflictResolution,
    indexStats,
    sourceCount,
    syncStats,
    totalItems,
  } = data;

  const report = {
    alerts: {
      byType: {
        high: alertStats?.high || 0,
        low: alertStats?.low || 0,
        medium: alertStats?.medium || 0,
      },
      generated: alertStats?.total || 0,
    },
    availability: {
      stats: availabilityStats,
      stockDistribution: {
        available: availabilityStats?.available || 0,
        lowStock: availabilityStats?.lowStock || 0,
        outOfStock: availabilityStats?.outOfStock || 0,
      },
      totalProducts: availabilityStats?.totalProducts || 0,
    },
    indexing: indexStats || {},
    performance: {
      averageItemProcessingTime:
        (Date.now() - new Date(data.collectionStarted).getTime()) / totalItems,
      syncDuration: Date.now() - new Date(data.collectionStarted).getTime(),
      throughputPerSecond:
        totalItems / ((Date.now() - new Date(data.collectionStarted).getTime()) / 1000),
    },
    processing: {
      validation: validationStats,
      conflicts: conflictResolution,
      synchronization: syncStats,
    },
    recommendations: generateInventoryRecommendations(data),
    reportId: `inventory_sync_${Date.now()}`,
    summary: {
      validationRate: validationStats.validationRate,
      conflictResolutionRate: conflictResolution?.resolutionRate || 0,
      itemsProcessed: totalItems,
      sourcesIntegrated: sourceCount,
      syncSuccessRate: syncStats?.successRate || 0,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    inventorySyncComplete: true,
    report,
  };
});

function generateInventoryRecommendations(data: any): any[] {
  const recommendations = [];

  // Sync performance recommendations
  if (data.syncStats?.successRate < 0.95) {
    recommendations.push({
      type: 'sync_performance',
      action: 'Review API timeouts, implement retry logic, check network connectivity',
      description: `Sync success rate of ${(data.syncStats.successRate * 100).toFixed(1)}% needs improvement`,
      expectedImpact: 'Increase sync success rate to >98%',
      priority: 'high',
      title: 'Improve Sync Reliability',
    });
  }

  // Conflict resolution recommendations
  if (data.unresolvedConflicts?.length > 10) {
    recommendations.push({
      type: 'conflict_resolution',
      action: 'Implement better source prioritization, improve data validation',
      description: `${data.unresolvedConflicts.length} unresolved conflicts require attention`,
      expectedImpact: 'Reduce manual intervention by 70%',
      priority: 'medium',
      title: 'Reduce Inventory Conflicts',
    });
  }

  // Stock optimization recommendations
  const outOfStockRate =
    (data.availabilityStats?.outOfStock || 0) / (data.availabilityStats?.totalProducts || 1);
  if (outOfStockRate > 0.05) {
    recommendations.push({
      type: 'stock_optimization',
      action: 'Implement automated reordering, adjust safety stock levels',
      description: `${(outOfStockRate * 100).toFixed(1)}% of products are out of stock`,
      expectedImpact: 'Reduce stock-outs by 50%',
      priority: 'high',
      title: 'Reduce Stock-Outs',
    });
  }

  // Data quality recommendations
  if (data.validationStats.validationRate < 0.9) {
    recommendations.push({
      type: 'data_quality',
      action: 'Implement stricter data validation at source systems',
      description: `${((1 - data.validationStats.validationRate) * 100).toFixed(1)}% of inventory data failed validation`,
      expectedImpact: 'Improve data quality to >95%',
      priority: 'medium',
      title: 'Improve Data Quality',
    });
  }

  return recommendations;
}

// Main workflow definition
export const inventorySyncAvailabilityWorkflow = {
  id: 'inventory-sync-availability',
  name: 'Inventory Sync & Availability',
  config: {
    concurrency: {
      max: 10, // Limit concurrent inventory jobs
    },
    maxDuration: 1800000, // 30 minutes
    schedule: {
      cron: '*/15 * * * *', // Every 15 minutes
      timezone: 'UTC',
    },
  },
  description: 'Real-time inventory synchronization across multiple merchants and channels',
  features: {
    alerting: true,
    conflictResolution: true,
    multiLocationSupport: true,
    realTimeSync: true,
    searchIndexing: true,
  },
  steps: [
    collectInventorySourcesStep,
    validateInventoryDataStep,
    detectConflictsStep,
    synchronizeInventoryStep,
    resolveConflictsStep,
    updateAvailabilityStatusStep,
    generateInventoryAlertsStep,
    sendNotificationsStep,
    updateSearchIndicesStep,
    generateSyncReportStep,
  ],
  version: '1.0.0',
};
