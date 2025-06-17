'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// ADDRESS CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createAddressOrm(args: Prisma.AddressCreateArgs) {
  return prisma.address.create(args);
}

// READ
export async function findFirstAddressOrm(args?: Prisma.AddressFindFirstArgs) {
  return prisma.address.findFirst(args);
}

export async function findUniqueAddressOrm(args: Prisma.AddressFindUniqueArgs) {
  return prisma.address.findUnique(args);
}

export async function findManyAddressesOrm(args?: Prisma.AddressFindManyArgs) {
  return prisma.address.findMany(args);
}

// UPDATE
export async function updateAddressOrm(args: Prisma.AddressUpdateArgs) {
  return prisma.address.update(args);
}

export async function updateManyAddressesOrm(args: Prisma.AddressUpdateManyArgs) {
  return prisma.address.updateMany(args);
}

// UPSERT
export async function upsertAddressOrm(args: Prisma.AddressUpsertArgs) {
  return prisma.address.upsert(args);
}

// DELETE
export async function deleteAddressOrm(args: Prisma.AddressDeleteArgs) {
  return prisma.address.delete(args);
}

export async function deleteManyAddressesOrm(args?: Prisma.AddressDeleteManyArgs) {
  return prisma.address.deleteMany(args);
}

// AGGREGATE
export async function aggregateAddressesOrm<T extends Prisma.AddressAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetAddressAggregateType<T>> {
  return prisma.address.aggregate((args ?? {}) as T);
}

export async function countAddressesOrm(args?: Prisma.AddressCountArgs) {
  return prisma.address.count(args);
}

export async function groupByAddressesOrm(args: Prisma.AddressGroupByArgs) {
  return prisma.address.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
