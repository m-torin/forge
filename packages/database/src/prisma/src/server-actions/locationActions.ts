'use server';

import {
  createLocationOrm,
  findFirstLocationOrm,
  findUniqueLocationOrm,
  findManyLocationsOrm,
  updateLocationOrm,
  updateManyLocationsOrm,
  upsertLocationOrm,
  deleteLocationOrm,
  deleteManyLocationsOrm,
  aggregateLocationsOrm,
  countLocationsOrm,
  groupByLocationsOrm,
} from '../orm/locationOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// LOCATION SERVER ACTIONS
//==============================================================================

export async function createLocationAction(args: Prisma.LocationCreateArgs) {
  'use server';
  return createLocationOrm(args);
}

export async function findFirstLocationAction(args?: Prisma.LocationFindFirstArgs) {
  'use server';
  return findFirstLocationOrm(args);
}

export async function findUniqueLocationAction(args: Prisma.LocationFindUniqueArgs) {
  'use server';
  return findUniqueLocationOrm(args);
}

export async function findManyLocationsAction(args?: Prisma.LocationFindManyArgs) {
  'use server';
  return findManyLocationsOrm(args);
}

export async function updateLocationAction(args: Prisma.LocationUpdateArgs) {
  'use server';
  return updateLocationOrm(args);
}

export async function updateManyLocationsAction(args: Prisma.LocationUpdateManyArgs) {
  'use server';
  return updateManyLocationsOrm(args);
}

export async function upsertLocationAction(args: Prisma.LocationUpsertArgs) {
  'use server';
  return upsertLocationOrm(args);
}

export async function deleteLocationAction(args: Prisma.LocationDeleteArgs) {
  'use server';
  return deleteLocationOrm(args);
}

export async function deleteManyLocationsAction(args?: Prisma.LocationDeleteManyArgs) {
  'use server';
  return deleteManyLocationsOrm(args);
}

export async function aggregateLocationsAction(args?: Prisma.LocationAggregateArgs) {
  'use server';
  return aggregateLocationsOrm(args);
}

export async function countLocationsAction(args?: Prisma.LocationCountArgs) {
  'use server';
  return countLocationsOrm(args);
}

export async function groupByLocationsAction(args: Prisma.LocationGroupByArgs) {
  'use server';
  return groupByLocationsOrm(args);
}
