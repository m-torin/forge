'use server';

import type {
  JrChartMethod,
  JrChartRuleFor,
  JrRuleAction,
} from '../../../../../prisma-generated/client';
import { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createJollyRogerOrm(args: Prisma.JollyRogerCreateArgs) {
  try {
    return await prisma.jollyRoger.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstJollyRogerOrm(args?: Prisma.JollyRogerFindFirstArgs) {
  return await prisma.jollyRoger.findFirst(args);
}

export async function findUniqueJollyRogerOrm(args: Prisma.JollyRogerFindUniqueArgs) {
  return await prisma.jollyRoger.findUnique(args);
}

export async function findUniqueJollyRogerOrmOrThrow(args: Prisma.JollyRogerFindUniqueOrThrowArgs) {
  try {
    return await prisma.jollyRoger.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JollyRoger not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyJollyRogersOrm(args?: Prisma.JollyRogerFindManyArgs) {
  return await prisma.jollyRoger.findMany(args);
}

// UPDATE
export async function updateJollyRogerOrm(args: Prisma.JollyRogerUpdateArgs) {
  try {
    return await prisma.jollyRoger.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JollyRoger not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyJollyRogersOrm(args: Prisma.JollyRogerUpdateManyArgs) {
  return await prisma.jollyRoger.updateMany(args);
}

// UPSERT
export async function upsertJollyRogerOrm(args: Prisma.JollyRogerUpsertArgs) {
  try {
    return await prisma.jollyRoger.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteJollyRogerOrm(args: Prisma.JollyRogerDeleteArgs) {
  try {
    return await prisma.jollyRoger.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JollyRoger not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyJollyRogersOrm(args?: Prisma.JollyRogerDeleteManyArgs) {
  return await prisma.jollyRoger.deleteMany(args);
}

// AGGREGATE
export async function aggregateJollyRogersOrm(args?: Prisma.JollyRogerAggregateArgs) {
  return await prisma.jollyRoger.aggregate(args ?? {});
}

export async function countJollyRogersOrm(args?: Prisma.JollyRogerCountArgs) {
  return await prisma.jollyRoger.count(args);
}

export async function groupByJollyRogersOrm(args: Prisma.JollyRogerGroupByArgs) {
  return await prisma.jollyRoger.groupBy(args);
}

// CREATE
export async function createJrExtractionRuleOrm(args: Prisma.JrExtractionRuleCreateArgs) {
  try {
    return await prisma.jrExtractionRule.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstJrExtractionRuleOrm(args?: Prisma.JrExtractionRuleFindFirstArgs) {
  return await prisma.jrExtractionRule.findFirst(args);
}

export async function findUniqueJrExtractionRuleOrm(args: Prisma.JrExtractionRuleFindUniqueArgs) {
  return await prisma.jrExtractionRule.findUnique(args);
}

export async function findUniqueJrExtractionRuleOrmOrThrow(
  args: Prisma.JrExtractionRuleFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.jrExtractionRule.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JrExtractionRule not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleFindManyArgs) {
  return await prisma.jrExtractionRule.findMany(args);
}

// UPDATE
export async function updateJrExtractionRuleOrm(args: Prisma.JrExtractionRuleUpdateArgs) {
  try {
    return await prisma.jrExtractionRule.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JrExtractionRule not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyJrExtractionRulesOrm(args: Prisma.JrExtractionRuleUpdateManyArgs) {
  return await prisma.jrExtractionRule.updateMany(args);
}

// UPSERT
export async function upsertJrExtractionRuleOrm(args: Prisma.JrExtractionRuleUpsertArgs) {
  try {
    return await prisma.jrExtractionRule.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteJrExtractionRuleOrm(args: Prisma.JrExtractionRuleDeleteArgs) {
  try {
    return await prisma.jrExtractionRule.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JrExtractionRule not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleDeleteManyArgs) {
  return await prisma.jrExtractionRule.deleteMany(args);
}

// AGGREGATE
export async function aggregateJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleAggregateArgs) {
  return await prisma.jrExtractionRule.aggregate(args ?? {});
}

export async function countJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleCountArgs) {
  return await prisma.jrExtractionRule.count(args);
}

export async function groupByJrExtractionRulesOrm(args: Prisma.JrExtractionRuleGroupByArgs) {
  return await prisma.jrExtractionRule.groupBy(args);
}

// CREATE
export async function createJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectCreateArgs) {
  try {
    return await prisma.jrFindReplaceReject.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstJrFindReplaceRejectOrm(
  args?: Prisma.JrFindReplaceRejectFindFirstArgs,
) {
  return await prisma.jrFindReplaceReject.findFirst(args);
}

export async function findUniqueJrFindReplaceRejectOrm(
  args: Prisma.JrFindReplaceRejectFindUniqueArgs,
) {
  return await prisma.jrFindReplaceReject.findUnique(args);
}

export async function findUniqueJrFindReplaceRejectOrmOrThrow(
  args: Prisma.JrFindReplaceRejectFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.jrFindReplaceReject.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JrFindReplaceReject not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyJrFindReplaceRejectsOrm(
  args?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  return await prisma.jrFindReplaceReject.findMany(args);
}

// UPDATE
export async function updateJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectUpdateArgs) {
  try {
    return await prisma.jrFindReplaceReject.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JrFindReplaceReject not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyJrFindReplaceRejectsOrm(
  args: Prisma.JrFindReplaceRejectUpdateManyArgs,
) {
  return await prisma.jrFindReplaceReject.updateMany(args);
}

// UPSERT
export async function upsertJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectUpsertArgs) {
  try {
    return await prisma.jrFindReplaceReject.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectDeleteArgs) {
  try {
    return await prisma.jrFindReplaceReject.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JrFindReplaceReject not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyJrFindReplaceRejectsOrm(
  args?: Prisma.JrFindReplaceRejectDeleteManyArgs,
) {
  return await prisma.jrFindReplaceReject.deleteMany(args);
}

// AGGREGATE
export async function aggregateJrFindReplaceRejectsOrm(
  args?: Prisma.JrFindReplaceRejectAggregateArgs,
) {
  return await prisma.jrFindReplaceReject.aggregate(args ?? {});
}

export async function countJrFindReplaceRejectsOrm(args?: Prisma.JrFindReplaceRejectCountArgs) {
  return await prisma.jrFindReplaceReject.count(args);
}

export async function groupByJrFindReplaceRejectsOrm(args: Prisma.JrFindReplaceRejectGroupByArgs) {
  return await prisma.jrFindReplaceReject.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find JollyRogers by chartingMethod using JrChartMethod enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findJollyRogersByChartingMethodOrm(
  chartingMethod: JrChartMethod,
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      chartingMethod: chartingMethod,
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that can chart (canChart = true)
 */
export async function findJollyRogersWithChartingOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      canChart: true,
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that cannot chart (canChart = false)
 */
export async function findJollyRogersWithoutChartingOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      canChart: false,
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that have sitemaps set (not null)
 */
export async function findJollyRogersWithSitemapsOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      sitemaps: {
        not: null,
      },
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that don't have sitemaps (null)
 */
export async function findJollyRogersWithoutSitemapsOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      sitemaps: null,
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that have gridUrls set (not null)
 */
export async function findJollyRogersWithGridUrlsOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gridUrls: {
        not: null,
      },
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that don't have gridUrls (null)
 */
export async function findJollyRogersWithoutGridUrlsOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gridUrls: null,
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that have pdpUrlPatterns set (not null)
 */
export async function findJollyRogersWithPdpUrlPatternsOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      pdpUrlPatterns: {
        not: { equals: null },
      },
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that don't have pdpUrlPatterns (null)
 */
export async function findJollyRogersWithoutPdpUrlPatternsOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      pdpUrlPatterns: { equals: Prisma.JsonNull },
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JrExtractionRules by fieldName using JrChartRuleFor enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findJrExtractionRulesByFieldNameOrm(
  fieldName: JrChartRuleFor,
  additionalArgs?: Prisma.JrExtractionRuleFindManyArgs,
) {
  const args: Prisma.JrExtractionRuleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fieldName: fieldName,
    },
  };
  return await prisma.jrExtractionRule.findMany(args);
}

/**
 * Find active JrExtractionRules (isActive = true)
 */
export async function findActiveJrExtractionRulesOrm(
  additionalArgs?: Prisma.JrExtractionRuleFindManyArgs,
) {
  const args: Prisma.JrExtractionRuleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isActive: true,
    },
  };
  return await prisma.jrExtractionRule.findMany(args);
}

/**
 * Find inactive JrExtractionRules (isActive = false)
 */
export async function findInactiveJrExtractionRulesOrm(
  additionalArgs?: Prisma.JrExtractionRuleFindManyArgs,
) {
  const args: Prisma.JrExtractionRuleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isActive: false,
    },
  };
  return await prisma.jrExtractionRule.findMany(args);
}

/**
 * Find JrFindReplaceRejects by ruleAction using JrRuleAction enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findJrFindReplaceRejectsByRuleActionOrm(
  ruleAction: JrRuleAction,
  additionalArgs?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  const args: Prisma.JrFindReplaceRejectFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      ruleAction: ruleAction,
    },
  };
  return await prisma.jrFindReplaceReject.findMany(args);
}

/**
 * Find JrFindReplaceRejects that use regex (isRegex = true)
 */
export async function findJrFindReplaceRejectsWithRegexOrm(
  additionalArgs?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  const args: Prisma.JrFindReplaceRejectFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isRegex: true,
    },
  };
  return await prisma.jrFindReplaceReject.findMany(args);
}

/**
 * Find JrFindReplaceRejects that don't use regex (isRegex = false)
 */
export async function findJrFindReplaceRejectsWithoutRegexOrm(
  additionalArgs?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  const args: Prisma.JrFindReplaceRejectFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isRegex: false,
    },
  };
  return await prisma.jrFindReplaceReject.findMany(args);
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find JollyRogers that have associated brand
 */
export async function findJollyRogersWithBrandOrm(additionalArgs?: Prisma.JollyRogerFindManyArgs) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      brand: {
        isNot: null,
      },
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JollyRogers that have extraction rules
 */
export async function findJollyRogersWithExtractionRulesOrm(
  additionalArgs?: Prisma.JollyRogerFindManyArgs,
) {
  const args: Prisma.JollyRogerFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      extractionRules: {
        some: {},
      },
    },
  };
  return await prisma.jollyRoger.findMany(args);
}

/**
 * Find JrExtractionRules that have find/replace rules
 */
export async function findJrExtractionRulesWithFindReplaceRulesOrm(
  additionalArgs?: Prisma.JrExtractionRuleFindManyArgs,
) {
  const args: Prisma.JrExtractionRuleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      findReplaceRules: {
        some: {},
      },
    },
  };
  return await prisma.jrExtractionRule.findMany(args);
}

/**
 * Find JollyRoger with all relations included
 */
export async function findJollyRogerWithAllRelationsOrm(id: string) {
  return await prisma.jollyRoger.findUnique({
    where: { id },
    include: {
      brand: true,
      extractionRules: {
        include: {
          findReplaceRules: true,
        },
      },
    },
  });
}

/**
 * Find JrExtractionRule with all relations included
 */
export async function findJrExtractionRuleWithAllRelationsOrm(id: string) {
  return await prisma.jrExtractionRule.findUnique({
    where: { id },
    include: {
      jollyRoger: {
        include: {
          brand: true,
        },
      },
      findReplaceRules: true,
    },
  });
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find JollyRoger by brandId (leverages unique index)
 */
export async function findJollyRogerByBrandIdIndexOrm(brandId: string) {
  return await prisma.jollyRoger.findUnique({
    where: { brandId },
  });
}

/**
 * Find JrExtractionRules by jollyRogerId and fieldName (leverages unique index)
 */
export async function findJrExtractionRuleByJollyRogerAndFieldOrm(
  jollyRogerId: string,
  fieldName: JrChartRuleFor,
) {
  return await prisma.jrExtractionRule.findUnique({
    where: {
      jollyRogerId_fieldName: {
        jollyRogerId,
        fieldName,
      },
    },
  });
}

/**
 * Search JrFindReplaceRejects by lookFor pattern (case-insensitive contains)
 */
export async function searchJrFindReplaceRejectsByLookForOrm(
  searchTerm: string,
  additionalArgs?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  const args: Prisma.JrFindReplaceRejectFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lookFor: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.jrFindReplaceReject.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * JollyRoger with brand relation
 */
export type JollyRogerWithBrand = Prisma.JollyRogerGetPayload<{
  include: { brand: true };
}>;

/**
 * JollyRoger with extraction rules relation
 */
export type JollyRogerWithExtractionRules = Prisma.JollyRogerGetPayload<{
  include: { extractionRules: true };
}>;

/**
 * JollyRoger with all relations for complete data access
 */
export type JollyRogerWithAllRelations = Prisma.JollyRogerGetPayload<{
  include: {
    brand: true;
    extractionRules: {
      include: {
        findReplaceRules: true;
      };
    };
  };
}>;

/**
 * JrExtractionRule with jollyRoger relation
 */
export type JrExtractionRuleWithJollyRoger = Prisma.JrExtractionRuleGetPayload<{
  include: { jollyRoger: true };
}>;

/**
 * JrExtractionRule with find/replace rules relation
 */
export type JrExtractionRuleWithFindReplaceRules = Prisma.JrExtractionRuleGetPayload<{
  include: { findReplaceRules: true };
}>;

/**
 * JrExtractionRule with all relations for complete data access
 */
export type JrExtractionRuleWithAllRelations = Prisma.JrExtractionRuleGetPayload<{
  include: {
    jollyRoger: {
      include: {
        brand: true;
      };
    };
    findReplaceRules: true;
  };
}>;

/**
 * JrFindReplaceReject with extraction rules relation
 */
export type JrFindReplaceRejectWithExtractionRules = Prisma.JrFindReplaceRejectGetPayload<{
  include: { extractionRules: true };
}>;

/**
 * JollyRoger search result type for optimized queries
 */
export type JollyRogerSearchResult = Prisma.JollyRogerGetPayload<{
  select: {
    id: true;
    canChart: true;
    chartingMethod: true;
    brandId: true;
    _count: {
      select: {
        extractionRules: true;
      };
    };
  };
}>;

/**
 * JrExtractionRule search result type for optimized queries
 */
export type JrExtractionRuleSearchResult = Prisma.JrExtractionRuleGetPayload<{
  select: {
    id: true;
    jollyRogerId: true;
    fieldName: true;
    isActive: true;
    successRate: true;
    lastTestedAt: true;
    _count: {
      select: {
        findReplaceRules: true;
      };
    };
  };
}>;

//==============================================================================
// SPECIALIZED JOLLYROGER OPERATIONS
//==============================================================================

/**
 * Get brand with JollyRoger data for sitemap processing
 */
export async function getBrandWithJollyRogerOrm(brandId: string) {
  try {
    return await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        jollyRoger: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Get JollyRoger data by brand ID
 */
export async function getJollyRogerByBrandIdOrm(brandId: string) {
  try {
    return await prisma.jollyRoger.findUnique({
      where: { brandId },
      include: {
        brand: true,
        extractionRules: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Parse and return sitemaps from JollyRoger
 */
export async function getJollyRogerSitemapsOrm(brandId: string) {
  try {
    const jollyRoger = await prisma.jollyRoger.findUnique({
      where: { brandId },
      select: {
        sitemaps: true,
        canChart: true,
        chartingMethod: true,
      },
    });

    if (!jollyRoger || !jollyRoger.sitemaps) {
      return null;
    }

    // Parse sitemaps (stored as newline-separated URLs)
    const sitemapUrls = jollyRoger.sitemaps
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    return {
      ...jollyRoger,
      sitemapUrls,
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Update JollyRoger sitemaps
 */
export async function updateJollyRogerSitemapsOrm(brandId: string, sitemapUrls: string[]) {
  try {
    return await prisma.jollyRoger.update({
      where: { brandId },
      data: {
        sitemaps: sitemapUrls.join('\n'),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`JollyRoger not found for sitemap update with brandId: ${brandId}`);
    }
    handlePrismaError(error);
  }
}
