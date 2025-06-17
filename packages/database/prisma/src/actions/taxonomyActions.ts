'use server';

import {
  createTaxonomyOrm,
  findFirstTaxonomyOrm,
  findUniqueTaxonomyOrm,
  findManyTaxonomiesOrm,
  updateTaxonomyOrm,
  updateManyTaxonomiesOrm,
  upsertTaxonomyOrm,
  deleteTaxonomyOrm,
  deleteManyTaxonomiesOrm,
  aggregateTaxonomiesOrm,
  countTaxonomiesOrm,
  groupByTaxonomiesOrm,
} from '../orm/taxonomyOrm';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// TAXONOMY SERVER ACTIONS
//==============================================================================

export async function createTaxonomyAction(args: Prisma.TaxonomyCreateArgs) {
  'use server';
  return createTaxonomyOrm(args);
}

export async function findFirstTaxonomyAction(args?: Prisma.TaxonomyFindFirstArgs) {
  'use server';
  return findFirstTaxonomyOrm(args);
}

export async function findUniqueTaxonomyAction(args: Prisma.TaxonomyFindUniqueArgs) {
  'use server';
  return findUniqueTaxonomyOrm(args);
}

export async function findManyTaxonomiesAction(args?: Prisma.TaxonomyFindManyArgs) {
  'use server';
  return findManyTaxonomiesOrm(args);
}

export async function updateTaxonomyAction(args: Prisma.TaxonomyUpdateArgs) {
  'use server';
  return updateTaxonomyOrm(args);
}

export async function updateManyTaxonomiesAction(args: Prisma.TaxonomyUpdateManyArgs) {
  'use server';
  return updateManyTaxonomiesOrm(args);
}

export async function upsertTaxonomyAction(args: Prisma.TaxonomyUpsertArgs) {
  'use server';
  return upsertTaxonomyOrm(args);
}

export async function deleteTaxonomyAction(args: Prisma.TaxonomyDeleteArgs) {
  'use server';
  return deleteTaxonomyOrm(args);
}

export async function deleteManyTaxonomiesAction(args?: Prisma.TaxonomyDeleteManyArgs) {
  'use server';
  return deleteManyTaxonomiesOrm(args);
}

export async function aggregateTaxonomiesAction(args?: Prisma.TaxonomyAggregateArgs) {
  'use server';
  return aggregateTaxonomiesOrm(args);
}

export async function countTaxonomiesAction(args?: Prisma.TaxonomyCountArgs) {
  'use server';
  return countTaxonomiesOrm(args);
}

export async function groupByTaxonomiesAction(args: Prisma.TaxonomyGroupByArgs) {
  'use server';
  return groupByTaxonomiesOrm(args);
}
