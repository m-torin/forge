'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateJollyRogersOrm,
  aggregateJrExtractionRulesOrm,
  aggregateJrFindReplaceRejectsOrm,
  countJollyRogersOrm,
  countJrExtractionRulesOrm,
  countJrFindReplaceRejectsOrm,
  createJollyRogerOrm,
  createJrExtractionRuleOrm,
  createJrFindReplaceRejectOrm,
  deleteJollyRogerOrm,
  deleteJrExtractionRuleOrm,
  deleteJrFindReplaceRejectOrm,
  deleteManyJollyRogersOrm,
  deleteManyJrExtractionRulesOrm,
  deleteManyJrFindReplaceRejectsOrm,
  findFirstJollyRogerOrm,
  findFirstJrExtractionRuleOrm,
  findFirstJrFindReplaceRejectOrm,
  findManyJollyRogersOrm,
  findManyJrExtractionRulesOrm,
  findManyJrFindReplaceRejectsOrm,
  findUniqueJollyRogerOrm,
  findUniqueJrExtractionRuleOrm,
  findUniqueJrFindReplaceRejectOrm,
  // Specialized operations
  getBrandWithJollyRogerOrm,
  getJollyRogerByBrandIdOrm,
  getJollyRogerSitemapsOrm,
  groupByJollyRogersOrm,
  groupByJrExtractionRulesOrm,
  groupByJrFindReplaceRejectsOrm,
  updateJollyRogerOrm,
  updateJollyRogerSitemapsOrm,
  updateJrExtractionRuleOrm,
  updateJrFindReplaceRejectOrm,
  updateManyJollyRogersOrm,
  updateManyJrExtractionRulesOrm,
  updateManyJrFindReplaceRejectsOrm,
  upsertJollyRogerOrm,
  upsertJrExtractionRuleOrm,
  upsertJrFindReplaceRejectOrm,
} from '../orm/ecommerce/jollyRogerOrm';

//==============================================================================
// JOLLYROGER SERVER ACTIONS
//==============================================================================

export async function createJollyRogerAction(args: Prisma.JollyRogerCreateArgs) {
  'use server';
  return createJollyRogerOrm(args);
}

export async function findFirstJollyRogerAction(args?: Prisma.JollyRogerFindFirstArgs) {
  'use server';
  return findFirstJollyRogerOrm(args);
}

export async function findUniqueJollyRogerAction(args: Prisma.JollyRogerFindUniqueArgs) {
  'use server';
  return findUniqueJollyRogerOrm(args);
}

export async function findManyJollyRogersAction(args?: Prisma.JollyRogerFindManyArgs) {
  'use server';
  return findManyJollyRogersOrm(args);
}

export async function updateJollyRogerAction(args: Prisma.JollyRogerUpdateArgs) {
  'use server';
  return updateJollyRogerOrm(args);
}

export async function updateManyJollyRogersAction(args: Prisma.JollyRogerUpdateManyArgs) {
  'use server';
  return updateManyJollyRogersOrm(args);
}

export async function upsertJollyRogerAction(args: Prisma.JollyRogerUpsertArgs) {
  'use server';
  return upsertJollyRogerOrm(args);
}

export async function deleteJollyRogerAction(args: Prisma.JollyRogerDeleteArgs) {
  'use server';
  return deleteJollyRogerOrm(args);
}

export async function deleteManyJollyRogersAction(args?: Prisma.JollyRogerDeleteManyArgs) {
  'use server';
  return deleteManyJollyRogersOrm(args);
}

export async function aggregateJollyRogersAction(args?: Prisma.JollyRogerAggregateArgs) {
  'use server';
  return aggregateJollyRogersOrm(args);
}

export async function countJollyRogersAction(args?: Prisma.JollyRogerCountArgs) {
  'use server';
  return countJollyRogersOrm(args);
}

export async function groupByJollyRogersAction(args: Prisma.JollyRogerGroupByArgs) {
  'use server';
  return groupByJollyRogersOrm(args);
}

//==============================================================================
// JR EXTRACTION RULE SERVER ACTIONS
//==============================================================================

export async function createJrExtractionRuleAction(args: Prisma.JrExtractionRuleCreateArgs) {
  'use server';
  return createJrExtractionRuleOrm(args);
}

export async function findFirstJrExtractionRuleAction(args?: Prisma.JrExtractionRuleFindFirstArgs) {
  'use server';
  return findFirstJrExtractionRuleOrm(args);
}

export async function findUniqueJrExtractionRuleAction(
  args: Prisma.JrExtractionRuleFindUniqueArgs,
) {
  'use server';
  return findUniqueJrExtractionRuleOrm(args);
}

export async function findManyJrExtractionRulesAction(args?: Prisma.JrExtractionRuleFindManyArgs) {
  'use server';
  return findManyJrExtractionRulesOrm(args);
}

export async function updateJrExtractionRuleAction(args: Prisma.JrExtractionRuleUpdateArgs) {
  'use server';
  return updateJrExtractionRuleOrm(args);
}

export async function updateManyJrExtractionRulesAction(
  args: Prisma.JrExtractionRuleUpdateManyArgs,
) {
  'use server';
  return updateManyJrExtractionRulesOrm(args);
}

export async function upsertJrExtractionRuleAction(args: Prisma.JrExtractionRuleUpsertArgs) {
  'use server';
  return upsertJrExtractionRuleOrm(args);
}

export async function deleteJrExtractionRuleAction(args: Prisma.JrExtractionRuleDeleteArgs) {
  'use server';
  return deleteJrExtractionRuleOrm(args);
}

export async function deleteManyJrExtractionRulesAction(
  args?: Prisma.JrExtractionRuleDeleteManyArgs,
) {
  'use server';
  return deleteManyJrExtractionRulesOrm(args);
}

export async function aggregateJrExtractionRulesAction(
  args?: Prisma.JrExtractionRuleAggregateArgs,
) {
  'use server';
  return aggregateJrExtractionRulesOrm(args);
}

export async function countJrExtractionRulesAction(args?: Prisma.JrExtractionRuleCountArgs) {
  'use server';
  return countJrExtractionRulesOrm(args);
}

export async function groupByJrExtractionRulesAction(args: Prisma.JrExtractionRuleGroupByArgs) {
  'use server';
  return groupByJrExtractionRulesOrm(args);
}

//==============================================================================
// JR FIND REPLACE REJECT SERVER ACTIONS
//==============================================================================

export async function createJrFindReplaceRejectAction(args: Prisma.JrFindReplaceRejectCreateArgs) {
  'use server';
  return createJrFindReplaceRejectOrm(args);
}

export async function findFirstJrFindReplaceRejectAction(
  args?: Prisma.JrFindReplaceRejectFindFirstArgs,
) {
  'use server';
  return findFirstJrFindReplaceRejectOrm(args);
}

export async function findUniqueJrFindReplaceRejectAction(
  args: Prisma.JrFindReplaceRejectFindUniqueArgs,
) {
  'use server';
  return findUniqueJrFindReplaceRejectOrm(args);
}

export async function findManyJrFindReplaceRejectsAction(
  args?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  'use server';
  return findManyJrFindReplaceRejectsOrm(args);
}

export async function updateJrFindReplaceRejectAction(args: Prisma.JrFindReplaceRejectUpdateArgs) {
  'use server';
  return updateJrFindReplaceRejectOrm(args);
}

export async function updateManyJrFindReplaceRejectsAction(
  args: Prisma.JrFindReplaceRejectUpdateManyArgs,
) {
  'use server';
  return updateManyJrFindReplaceRejectsOrm(args);
}

export async function upsertJrFindReplaceRejectAction(args: Prisma.JrFindReplaceRejectUpsertArgs) {
  'use server';
  return upsertJrFindReplaceRejectOrm(args);
}

export async function deleteJrFindReplaceRejectAction(args: Prisma.JrFindReplaceRejectDeleteArgs) {
  'use server';
  return deleteJrFindReplaceRejectOrm(args);
}

export async function deleteManyJrFindReplaceRejectsAction(
  args?: Prisma.JrFindReplaceRejectDeleteManyArgs,
) {
  'use server';
  return deleteManyJrFindReplaceRejectsOrm(args);
}

export async function aggregateJrFindReplaceRejectsAction(
  args?: Prisma.JrFindReplaceRejectAggregateArgs,
) {
  'use server';
  return aggregateJrFindReplaceRejectsOrm(args);
}

export async function countJrFindReplaceRejectsAction(args?: Prisma.JrFindReplaceRejectCountArgs) {
  'use server';
  return countJrFindReplaceRejectsOrm(args);
}

export async function groupByJrFindReplaceRejectsAction(
  args: Prisma.JrFindReplaceRejectGroupByArgs,
) {
  'use server';
  return groupByJrFindReplaceRejectsOrm(args);
}

//==============================================================================
// SPECIALIZED JOLLYROGER SERVER ACTIONS
//==============================================================================

/**
 * Get brand with JollyRoger data for sitemap processing
 */
export async function getBrandWithJollyRogerAction(brandId: string) {
  'use server';
  return getBrandWithJollyRogerOrm(brandId);
}

/**
 * Get JollyRoger data by brand ID
 */
export async function getJollyRogerByBrandIdAction(brandId: string) {
  'use server';
  return getJollyRogerByBrandIdOrm(brandId);
}

/**
 * Parse and return sitemaps from JollyRoger
 */
export async function getJollyRogerSitemapsAction(brandId: string) {
  'use server';
  return getJollyRogerSitemapsOrm(brandId);
}

/**
 * Update JollyRoger sitemaps
 */
export async function updateJollyRogerSitemapsAction(brandId: string, sitemapUrls: string[]) {
  'use server';
  return updateJollyRogerSitemapsOrm(brandId, sitemapUrls);
}
