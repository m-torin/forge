'use server';

import {
  // PdpJoin CRUD functions
  createPdpJoinOrm,
  findFirstPdpJoinOrm,
  findUniquePdpJoinOrm,
  findManyPdpJoinsOrm,
  updatePdpJoinOrm,
  updateManyPdpJoinsOrm,
  upsertPdpJoinOrm,
  deletePdpJoinOrm,
  deleteManyPdpJoinsOrm,
  aggregatePdpJoinsOrm,
  countPdpJoinsOrm,
  groupByPdpJoinsOrm,
  // PdpUrl CRUD functions
  createPdpUrlOrm,
  findFirstPdpUrlOrm,
  findUniquePdpUrlOrm,
  findManyPdpUrlsOrm,
  updatePdpUrlOrm,
  updateManyPdpUrlsOrm,
  upsertPdpUrlOrm,
  deletePdpUrlOrm,
  deleteManyPdpUrlsOrm,
  aggregatePdpUrlsOrm,
  countPdpUrlsOrm,
  groupByPdpUrlsOrm,
} from '../orm/productOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// PDPJOIN SERVER ACTIONS
//==============================================================================

export async function createPdpJoinAction(args: Prisma.PdpJoinCreateArgs) {
  'use server';
  return createPdpJoinOrm(args);
}

export async function findFirstPdpJoinAction(args?: Prisma.PdpJoinFindFirstArgs) {
  'use server';
  return findFirstPdpJoinOrm(args);
}

export async function findUniquePdpJoinAction(args: Prisma.PdpJoinFindUniqueArgs) {
  'use server';
  return findUniquePdpJoinOrm(args);
}

export async function findManyPdpJoinsAction(args?: Prisma.PdpJoinFindManyArgs) {
  'use server';
  return findManyPdpJoinsOrm(args);
}

export async function updatePdpJoinAction(args: Prisma.PdpJoinUpdateArgs) {
  'use server';
  return updatePdpJoinOrm(args);
}

export async function updateManyPdpJoinsAction(args: Prisma.PdpJoinUpdateManyArgs) {
  'use server';
  return updateManyPdpJoinsOrm(args);
}

export async function upsertPdpJoinAction(args: Prisma.PdpJoinUpsertArgs) {
  'use server';
  return upsertPdpJoinOrm(args);
}

export async function deletePdpJoinAction(args: Prisma.PdpJoinDeleteArgs) {
  'use server';
  return deletePdpJoinOrm(args);
}

export async function deleteManyPdpJoinsAction(args?: Prisma.PdpJoinDeleteManyArgs) {
  'use server';
  return deleteManyPdpJoinsOrm(args);
}

export async function aggregatePdpJoinsAction(args?: Prisma.PdpJoinAggregateArgs) {
  'use server';
  return aggregatePdpJoinsOrm(args);
}

export async function countPdpJoinsAction(args?: Prisma.PdpJoinCountArgs) {
  'use server';
  return countPdpJoinsOrm(args);
}

export async function groupByPdpJoinsAction(args: Prisma.PdpJoinGroupByArgs) {
  'use server';
  return groupByPdpJoinsOrm(args);
}

//==============================================================================
// PDPURL SERVER ACTIONS
//==============================================================================

export async function createPdpUrlAction(args: Prisma.PdpUrlCreateArgs) {
  'use server';
  return createPdpUrlOrm(args);
}

export async function findFirstPdpUrlAction(args?: Prisma.PdpUrlFindFirstArgs) {
  'use server';
  return findFirstPdpUrlOrm(args);
}

export async function findUniquePdpUrlAction(args: Prisma.PdpUrlFindUniqueArgs) {
  'use server';
  return findUniquePdpUrlOrm(args);
}

export async function findManyPdpUrlsAction(args?: Prisma.PdpUrlFindManyArgs) {
  'use server';
  return findManyPdpUrlsOrm(args);
}

export async function updatePdpUrlAction(args: Prisma.PdpUrlUpdateArgs) {
  'use server';
  return updatePdpUrlOrm(args);
}

export async function updateManyPdpUrlsAction(args: Prisma.PdpUrlUpdateManyArgs) {
  'use server';
  return updateManyPdpUrlsOrm(args);
}

export async function upsertPdpUrlAction(args: Prisma.PdpUrlUpsertArgs) {
  'use server';
  return upsertPdpUrlOrm(args);
}

export async function deletePdpUrlAction(args: Prisma.PdpUrlDeleteArgs) {
  'use server';
  return deletePdpUrlOrm(args);
}

export async function deleteManyPdpUrlsAction(args?: Prisma.PdpUrlDeleteManyArgs) {
  'use server';
  return deleteManyPdpUrlsOrm(args);
}

export async function aggregatePdpUrlsAction(args?: Prisma.PdpUrlAggregateArgs) {
  'use server';
  return aggregatePdpUrlsOrm(args);
}

export async function countPdpUrlsAction(args?: Prisma.PdpUrlCountArgs) {
  'use server';
  return countPdpUrlsOrm(args);
}

export async function groupByPdpUrlsAction(args: Prisma.PdpUrlGroupByArgs) {
  'use server';
  return groupByPdpUrlsOrm(args);
}
