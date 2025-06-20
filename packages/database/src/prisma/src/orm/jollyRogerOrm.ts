'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// JOLLYROGER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createJollyRogerOrm(args: Prisma.JollyRogerCreateArgs) {
  return prisma.jollyRoger.create(args);
}

// READ
export async function findFirstJollyRogerOrm(args?: Prisma.JollyRogerFindFirstArgs) {
  return prisma.jollyRoger.findFirst(args);
}

export async function findUniqueJollyRogerOrm(args: Prisma.JollyRogerFindUniqueArgs) {
  return prisma.jollyRoger.findUnique(args);
}

export async function findManyJollyRogersOrm(args?: Prisma.JollyRogerFindManyArgs) {
  return prisma.jollyRoger.findMany(args);
}

// UPDATE
export async function updateJollyRogerOrm(args: Prisma.JollyRogerUpdateArgs) {
  return prisma.jollyRoger.update(args);
}

export async function updateManyJollyRogersOrm(args: Prisma.JollyRogerUpdateManyArgs) {
  return prisma.jollyRoger.updateMany(args);
}

// UPSERT
export async function upsertJollyRogerOrm(args: Prisma.JollyRogerUpsertArgs) {
  return prisma.jollyRoger.upsert(args);
}

// DELETE
export async function deleteJollyRogerOrm(args: Prisma.JollyRogerDeleteArgs) {
  return prisma.jollyRoger.delete(args);
}

export async function deleteManyJollyRogersOrm(args?: Prisma.JollyRogerDeleteManyArgs) {
  return prisma.jollyRoger.deleteMany(args);
}

// AGGREGATE
export async function aggregateJollyRogersOrm(args?: Prisma.JollyRogerAggregateArgs) {
  return prisma.jollyRoger.aggregate(args ?? {});
}

export async function countJollyRogersOrm(args?: Prisma.JollyRogerCountArgs) {
  return prisma.jollyRoger.count(args);
}

export async function groupByJollyRogersOrm(args: Prisma.JollyRogerGroupByArgs) {
  return prisma.jollyRoger.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// JR EXTRACTION RULE CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createJrExtractionRuleOrm(args: Prisma.JrExtractionRuleCreateArgs) {
  return prisma.jrExtractionRule.create(args);
}

// READ
export async function findFirstJrExtractionRuleOrm(args?: Prisma.JrExtractionRuleFindFirstArgs) {
  return prisma.jrExtractionRule.findFirst(args);
}

export async function findUniqueJrExtractionRuleOrm(args: Prisma.JrExtractionRuleFindUniqueArgs) {
  return prisma.jrExtractionRule.findUnique(args);
}

export async function findManyJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleFindManyArgs) {
  return prisma.jrExtractionRule.findMany(args);
}

// UPDATE
export async function updateJrExtractionRuleOrm(args: Prisma.JrExtractionRuleUpdateArgs) {
  return prisma.jrExtractionRule.update(args);
}

export async function updateManyJrExtractionRulesOrm(args: Prisma.JrExtractionRuleUpdateManyArgs) {
  return prisma.jrExtractionRule.updateMany(args);
}

// UPSERT
export async function upsertJrExtractionRuleOrm(args: Prisma.JrExtractionRuleUpsertArgs) {
  return prisma.jrExtractionRule.upsert(args);
}

// DELETE
export async function deleteJrExtractionRuleOrm(args: Prisma.JrExtractionRuleDeleteArgs) {
  return prisma.jrExtractionRule.delete(args);
}

export async function deleteManyJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleDeleteManyArgs) {
  return prisma.jrExtractionRule.deleteMany(args);
}

// AGGREGATE
export async function aggregateJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleAggregateArgs) {
  return prisma.jrExtractionRule.aggregate(args ?? {});
}

export async function countJrExtractionRulesOrm(args?: Prisma.JrExtractionRuleCountArgs) {
  return prisma.jrExtractionRule.count(args);
}

export async function groupByJrExtractionRulesOrm(args: Prisma.JrExtractionRuleGroupByArgs) {
  return prisma.jrExtractionRule.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// JR FIND REPLACE REJECT CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectCreateArgs) {
  return prisma.jrFindReplaceReject.create(args);
}

// READ
export async function findFirstJrFindReplaceRejectOrm(
  args?: Prisma.JrFindReplaceRejectFindFirstArgs,
) {
  return prisma.jrFindReplaceReject.findFirst(args);
}

export async function findUniqueJrFindReplaceRejectOrm(
  args: Prisma.JrFindReplaceRejectFindUniqueArgs,
) {
  return prisma.jrFindReplaceReject.findUnique(args);
}

export async function findManyJrFindReplaceRejectsOrm(
  args?: Prisma.JrFindReplaceRejectFindManyArgs,
) {
  return prisma.jrFindReplaceReject.findMany(args);
}

// UPDATE
export async function updateJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectUpdateArgs) {
  return prisma.jrFindReplaceReject.update(args);
}

export async function updateManyJrFindReplaceRejectsOrm(
  args: Prisma.JrFindReplaceRejectUpdateManyArgs,
) {
  return prisma.jrFindReplaceReject.updateMany(args);
}

// UPSERT
export async function upsertJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectUpsertArgs) {
  return prisma.jrFindReplaceReject.upsert(args);
}

// DELETE
export async function deleteJrFindReplaceRejectOrm(args: Prisma.JrFindReplaceRejectDeleteArgs) {
  return prisma.jrFindReplaceReject.delete(args);
}

export async function deleteManyJrFindReplaceRejectsOrm(
  args?: Prisma.JrFindReplaceRejectDeleteManyArgs,
) {
  return prisma.jrFindReplaceReject.deleteMany(args);
}

// AGGREGATE
export async function aggregateJrFindReplaceRejectsOrm(
  args?: Prisma.JrFindReplaceRejectAggregateArgs,
) {
  return prisma.jrFindReplaceReject.aggregate(args ?? {});
}

export async function countJrFindReplaceRejectsOrm(args?: Prisma.JrFindReplaceRejectCountArgs) {
  return prisma.jrFindReplaceReject.count(args);
}

export async function groupByJrFindReplaceRejectsOrm(args: Prisma.JrFindReplaceRejectGroupByArgs) {
  return prisma.jrFindReplaceReject.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
