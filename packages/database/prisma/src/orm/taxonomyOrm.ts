'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// TAXONOMY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTaxonomyOrm(args: Prisma.TaxonomyCreateArgs) {
  return prisma.taxonomy.create(args);
}

// READ
export async function findFirstTaxonomyOrm(args?: Prisma.TaxonomyFindFirstArgs) {
  return prisma.taxonomy.findFirst(args);
}

export async function findUniqueTaxonomyOrm(args: Prisma.TaxonomyFindUniqueArgs) {
  return prisma.taxonomy.findUnique(args);
}

export async function findManyTaxonomiesOrm(args?: Prisma.TaxonomyFindManyArgs) {
  return prisma.taxonomy.findMany(args);
}

// UPDATE
export async function updateTaxonomyOrm(args: Prisma.TaxonomyUpdateArgs) {
  return prisma.taxonomy.update(args);
}

export async function updateManyTaxonomiesOrm(args: Prisma.TaxonomyUpdateManyArgs) {
  return prisma.taxonomy.updateMany(args);
}

// UPSERT
export async function upsertTaxonomyOrm(args: Prisma.TaxonomyUpsertArgs) {
  return prisma.taxonomy.upsert(args);
}

// DELETE
export async function deleteTaxonomyOrm(args: Prisma.TaxonomyDeleteArgs) {
  return prisma.taxonomy.delete(args);
}

export async function deleteManyTaxonomiesOrm(args?: Prisma.TaxonomyDeleteManyArgs) {
  return prisma.taxonomy.deleteMany(args);
}

// AGGREGATE
export async function aggregateTaxonomiesOrm<T extends Prisma.TaxonomyAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetTaxonomyAggregateType<T>> {
  return prisma.taxonomy.aggregate((args ?? {}) as T);
}

export async function countTaxonomiesOrm(args?: Prisma.TaxonomyCountArgs) {
  return prisma.taxonomy.count(args);
}

export async function groupByTaxonomiesOrm(args: Prisma.TaxonomyGroupByArgs) {
  return prisma.taxonomy.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
