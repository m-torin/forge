'use server';

import {
  countProductsOrm,
  countBrandsOrm,
  countCollectionsOrm,
  countTaxonomiesOrm,
  countArticlesOrm,
  countMediaOrm,
  countCastsOrm,
  countFandomsOrm,
  countLocationsOrm,
  countStoriesOrm,
  groupByProductsOrm,
  groupByBrandsOrm,
  groupByCollectionsOrm,
  groupByTaxonomiesOrm,
  groupByArticlesOrm,
  aggregateProductsOrm,
  aggregateBrandsOrm,
  aggregateCollectionsOrm,
  findManyProductsOrm,
  findManyBrandsOrm,
  findManyCollectionsOrm,
} from '../orm';
import { countProductCategoriesOrm, groupByProductCategoriesOrm } from '../orm/productCategoryOrm';
import {
  countRegistriesOrm,
  countRegistryItemsOrm,
  groupByRegistriesOrm,
} from '../orm/registryOrm';
import { countReviewsOrm, groupByReviewsOrm } from '../orm/guestActionsOrm';
import { countCartsOrm } from '../orm/cartOrm';
import { countOrdersOrm } from '../orm/ordersOrm';
import { countTransactionsOrm } from '../orm/transactionOrm';

// Temporary console logging until orchestration package is stable
const logger = {
  error: (message: string, ...args: any[]) =>
    console.error(`[database:analytics] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[database:analytics] ${message}`, ...args),
  info: (message: string, ...args: any[]) =>
    console.info(`[database:analytics] ${message}`, ...args),
  log: (message: string, ...args: any[]) => console.log(`[database:analytics] ${message}`, ...args),
};

type AnalyticsModel =
  | 'product'
  | 'brand'
  | 'collection'
  | 'taxonomy'
  | 'article'
  | 'media'
  | 'category'
  | 'cast'
  | 'fandom'
  | 'location'
  | 'story'
  | 'registry'
  | 'registryItem'
  | 'review'
  | 'cart'
  | 'order'
  | 'transaction';

/**
 * Get count statistics for an entity grouped by a field
 */
export async function getCountByFieldAction(
  model: AnalyticsModel,
  groupByField: string,
  where?: any,
): Promise<{ success: boolean; data?: Record<string, number>; error?: string }> {
  try {
    let results: any[] = [];

    switch (model) {
      case 'product':
        results = await groupByProductsOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'brand':
        results = await groupByBrandsOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'collection':
        results = await groupByCollectionsOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'taxonomy':
        results = await groupByTaxonomiesOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'article':
        results = await groupByArticlesOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'category':
        results = await groupByProductCategoriesOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'registry':
        results = await groupByRegistriesOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      case 'review':
        results = await groupByReviewsOrm({
          by: [groupByField as any],
          where,
          _count: true,
        });
        break;
      default:
        throw new Error(`Group by not implemented for ${model}`);
    }

    const data: Record<string, number> = {};
    results.forEach((result: any) => {
      data[result[groupByField]] = result._count;
    });

    return { success: true, data };
  } catch (error) {
    logger.error(`Error getting count by ${groupByField} for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get count statistics',
    };
  }
}

/**
 * Get time-based activity statistics
 */
export async function getActivityStatsAction(
  model: AnalyticsModel,
  dateField: 'createdAt' | 'updatedAt' = 'createdAt',
  days: number = 30,
  where?: any,
): Promise<{ success: boolean; data?: { date: string; count: number }[]; error?: string }> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereClause = {
      ...where,
      [dateField]: { gte: startDate },
    };

    let results: any[] = [];

    switch (model) {
      case 'product':
        results = await findManyProductsOrm({
          where: whereClause,
          select: { [dateField]: true },
        });
        break;
      case 'brand':
        results = await findManyBrandsOrm({
          where: whereClause,
          select: { [dateField]: true },
        });
        break;
      case 'collection':
        results = await findManyCollectionsOrm({
          where: whereClause,
          select: { [dateField]: true },
        });
        break;
      default:
        throw new Error(`Activity stats not implemented for ${model}`);
    }

    // Group by date
    const countByDate: Record<string, number> = {};
    results.forEach((item: any) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      countByDate[date] = (countByDate[date] || 0) + 1;
    });

    // Convert to array and fill missing dates
    const data: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data.unshift({
        date: dateStr,
        count: countByDate[dateStr] || 0,
      });
    }

    return { success: true, data };
  } catch (error) {
    logger.error(`Error getting activity stats for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get activity statistics',
    };
  }
}

/**
 * Get aggregated statistics for a model
 */
export async function getAggregateStatsAction(
  model: AnalyticsModel,
  where?: any,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    let total = 0;

    switch (model) {
      case 'product':
        total = await countProductsOrm({ where });
        break;
      case 'brand':
        total = await countBrandsOrm({ where });
        break;
      case 'collection':
        total = await countCollectionsOrm({ where });
        break;
      case 'taxonomy':
        total = await countTaxonomiesOrm({ where });
        break;
      case 'article':
        total = await countArticlesOrm({ where });
        break;
      case 'media':
        total = await countMediaOrm({ where });
        break;
      case 'category':
        total = await countProductCategoriesOrm({ where });
        break;
      case 'cast':
        total = await countCastsOrm({ where });
        break;
      case 'fandom':
        total = await countFandomsOrm({ where });
        break;
      case 'location':
        total = await countLocationsOrm({ where });
        break;
      case 'story':
        total = await countStoriesOrm({ where });
        break;
      case 'registry':
        total = await countRegistriesOrm({ where });
        break;
      case 'registryItem':
        total = await countRegistryItemsOrm({ where });
        break;
      case 'review':
        total = await countReviewsOrm({ where });
        break;
      case 'cart':
        total = await countCartsOrm({ where });
        break;
      case 'order':
        total = await countOrdersOrm({ where });
        break;
      case 'transaction':
        total = await countTransactionsOrm({ where });
        break;
    }

    const stats: any = { total };

    // Add status counts if the model has a status field
    try {
      const statusStats = await getCountByFieldAction(model, 'status', where);
      if (statusStats.success && statusStats.data) {
        stats.byStatus = statusStats.data;
      }
    } catch {
      // Model doesn't have status field
    }

    // Add soft delete stats if applicable
    try {
      let active = 0;
      let deleted = 0;

      switch (model) {
        case 'product':
          active = await countProductsOrm({
            where: { ...where, deletedAt: null },
          });
          deleted = await countProductsOrm({
            where: { ...where, deletedAt: { not: null } },
          });
          break;
        case 'brand':
          active = await countBrandsOrm({
            where: { ...where, deletedAt: null },
          });
          deleted = await countBrandsOrm({
            where: { ...where, deletedAt: { not: null } },
          });
          break;
        case 'collection':
          active = await countCollectionsOrm({
            where: { ...where, deletedAt: null },
          });
          deleted = await countCollectionsOrm({
            where: { ...where, deletedAt: { not: null } },
          });
          break;
      }

      if (active > 0 || deleted > 0) {
        stats.active = active;
        stats.deleted = deleted;
      }
    } catch {
      // Model doesn't support soft delete
    }

    // Add recent activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      let recentlyCreated = 0;

      switch (model) {
        case 'product':
          recentlyCreated = await countProductsOrm({
            where: { ...where, createdAt: { gte: sevenDaysAgo } },
          });
          break;
        case 'brand':
          recentlyCreated = await countBrandsOrm({
            where: { ...where, createdAt: { gte: sevenDaysAgo } },
          });
          break;
        case 'collection':
          recentlyCreated = await countCollectionsOrm({
            where: { ...where, createdAt: { gte: sevenDaysAgo } },
          });
          break;
      }

      if (recentlyCreated > 0) {
        stats.recentlyCreated = recentlyCreated;
      }
    } catch {
      // Model doesn't have createdAt
    }

    return { success: true, data: stats };
  } catch (error) {
    logger.error(`Error getting aggregate stats for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get aggregate statistics',
    };
  }
}

/**
 * Get conversion/completion rates
 */
export async function getConversionRateAction(
  model: AnalyticsModel,
  totalField: string,
  convertedField: string,
  where?: any,
): Promise<{
  success: boolean;
  data?: { total: number; converted: number; rate: number };
  error?: string;
}> {
  try {
    let aggregate: any = null;

    switch (model) {
      case 'product':
        aggregate = await aggregateProductsOrm({
          where,
          _sum: {
            [totalField]: true,
            [convertedField]: true,
          },
        });
        break;
      case 'brand':
        aggregate = await aggregateBrandsOrm({
          where,
          _sum: {
            [totalField]: true,
            [convertedField]: true,
          },
        });
        break;
      case 'collection':
        aggregate = await aggregateCollectionsOrm({
          where,
          _sum: {
            [totalField]: true,
            [convertedField]: true,
          },
        });
        break;
      default:
        throw new Error(`Conversion rate not implemented for ${model}`);
    }

    const total = aggregate._sum[totalField] || 0;
    const converted = aggregate._sum[convertedField] || 0;
    const rate = total > 0 ? (converted / total) * 100 : 0;

    return {
      success: true,
      data: { total, converted, rate },
    };
  } catch (error) {
    logger.error(`Error calculating conversion rate for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate conversion rate',
    };
  }
}
