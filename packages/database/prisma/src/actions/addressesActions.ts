/**
 * Address Actions
 * Business logic layer for address operations
 */

import {
  createAddressOrm,
  findUniqueAddressOrm,
  findManyAddressesOrm,
  updateAddressOrm,
  updateManyAddressesOrm,
} from '../orm/addressOrm';
import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';
import { AddressType } from '../../../prisma-generated/client';

export interface AddressData {
  id: string;
  userId: string | null;
  type: AddressType;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string | null;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isValidated: boolean;
  validatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressData {
  userId?: string;
  type?: AddressType;
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface UpdateAddressData {
  type?: AddressType;
  isDefault?: boolean;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Helper to format address response
function formatAddress(address: any): AddressData {
  return {
    id: address.id,
    userId: address.userId,
    type: address.type,
    isDefault: address.isDefault,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    phone: address.phone,
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isValidated: address.isValidated,
    validatedAt: address.validatedAt,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

// Internal function implementations (not exported)
async function createAddress(data: CreateAddressData): Promise<AddressData> {
  const address = await createAddressOrm({
    data: {
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      type: data.type || AddressType.SHIPPING,
      isDefault: data.isDefault || false,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      phone: data.phone,
      street1: data.street1,
      street2: data.street2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country || 'US',
    },
  });

  // If marked as default, update other addresses
  if (address.isDefault && address.userId) {
    await updateManyAddressesOrm({
      where: {
        userId: address.userId,
        id: { not: address.id },
        type: address.type,
      },
      data: { isDefault: false },
    });
  }

  return formatAddress(address);
}

async function getAddressById(addressId: string, userId?: string): Promise<AddressData | null> {
  const address = await findUniqueAddressOrm({
    where: { id: addressId },
  });

  if (!address || address.deletedAt) {
    return null;
  }

  // Check ownership if userId provided
  if (userId && address.userId !== userId) {
    return null;
  }

  return formatAddress(address);
}

async function getUserAddresses(userId: string, type?: AddressType): Promise<AddressData[]> {
  const addresses = await findManyAddressesOrm({
    where: {
      userId,
      ...(type && { type }),
      deletedAt: null,
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return addresses.map(formatAddress);
}

async function getDefaultAddress(userId: string, type?: AddressType): Promise<AddressData | null> {
  const address = await prisma.address.findFirst({
    where: {
      userId,
      isDefault: true,
      ...(type && { type }),
      deletedAt: null,
    },
  });
  return address ? formatAddress(address) : null;
}

async function updateAddress(
  addressId: string,
  userId: string,
  data: UpdateAddressData,
): Promise<AddressData> {
  // Verify ownership
  const existingAddress = await findUniqueAddressOrm({
    where: { id: addressId },
  });

  if (!existingAddress || existingAddress.userId !== userId || existingAddress.deletedAt) {
    throw new Error('Address not found');
  }

  // Update address
  const updateData: Prisma.AddressUpdateInput = {
    ...(data.type !== undefined && { type: data.type }),
    ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    ...(data.firstName !== undefined && { firstName: data.firstName }),
    ...(data.lastName !== undefined && { lastName: data.lastName }),
    ...(data.company !== undefined && { company: data.company }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.street1 !== undefined && { street1: data.street1 }),
    ...(data.street2 !== undefined && { street2: data.street2 }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
    ...(data.country !== undefined && { country: data.country }),
    // Reset validation if address is changed
    ...(data.street1 || data.city || data.state || data.postalCode
      ? { isValidated: false, validatedAt: null }
      : {}),
  };

  const address = await updateAddressOrm({
    where: { id: addressId },
    data: updateData,
  });

  // If marked as default, update other addresses
  if (data.isDefault && address.userId) {
    await updateManyAddressesOrm({
      where: {
        userId: address.userId,
        id: { not: address.id },
        type: address.type,
      },
      data: { isDefault: false },
    });
  }

  return formatAddress(address);
}

async function setDefaultAddress(addressId: string, userId: string): Promise<AddressData> {
  // Verify ownership
  const existingAddress = await findUniqueAddressOrm({
    where: { id: addressId },
  });

  if (!existingAddress || existingAddress.userId !== userId || existingAddress.deletedAt) {
    throw new Error('Address not found');
  }

  // Update other addresses of same type to not be default
  await updateManyAddressesOrm({
    where: {
      userId,
      id: { not: addressId },
      type: existingAddress.type,
    },
    data: { isDefault: false },
  });

  // Set this address as default
  const address = await updateAddressOrm({
    where: { id: addressId },
    data: { isDefault: true },
  });

  return formatAddress(address);
}

async function deleteAddress(addressId: string, userId: string): Promise<void> {
  // Verify ownership
  const existingAddress = await findUniqueAddressOrm({
    where: { id: addressId },
  });

  if (!existingAddress || existingAddress.userId !== userId || existingAddress.deletedAt) {
    throw new Error('Address not found');
  }

  // Soft delete by setting deletedAt
  await updateAddressOrm({
    where: { id: addressId },
    data: { deletedAt: new Date() },
  });
}

async function validateAddress(addressId: string, userId: string): Promise<AddressData> {
  // Verify ownership
  const existingAddress = await findUniqueAddressOrm({
    where: { id: addressId },
  });

  if (!existingAddress || existingAddress.userId !== userId || existingAddress.deletedAt) {
    throw new Error('Address not found');
  }

  // In a real implementation, this would call an address validation service
  // For now, we'll just mark it as validated
  const address = await updateAddressOrm({
    where: { id: addressId },
    data: {
      isValidated: true,
      validatedAt: new Date(),
    },
  });

  return formatAddress(address);
}

async function cloneAddress(
  addressId: string,
  userId: string,
  overrides?: Partial<CreateAddressData>,
): Promise<AddressData> {
  // Verify ownership and get source address
  const sourceAddress = await findUniqueAddressOrm({
    where: { id: addressId },
  });

  if (!sourceAddress || sourceAddress.userId !== userId || sourceAddress.deletedAt) {
    throw new Error('Address not found');
  }

  // Create a new address with cloned data and overrides
  const address = await createAddressOrm({
    data: {
      user: userId ? { connect: { id: userId } } : undefined,
      type: overrides?.type ?? sourceAddress.type,
      isDefault: overrides?.isDefault ?? false,
      firstName: overrides?.firstName ?? sourceAddress.firstName,
      lastName: overrides?.lastName ?? sourceAddress.lastName,
      company: overrides?.company ?? sourceAddress.company,
      phone: overrides?.phone ?? sourceAddress.phone,
      street1: overrides?.street1 ?? sourceAddress.street1,
      street2: overrides?.street2 ?? sourceAddress.street2,
      city: overrides?.city ?? sourceAddress.city,
      state: overrides?.state ?? sourceAddress.state,
      postalCode: overrides?.postalCode ?? sourceAddress.postalCode,
      country: overrides?.country ?? sourceAddress.country,
    },
  });

  return formatAddress(address);
}

async function formatAddressForCheckout(
  addressId: string,
  userId?: string,
): Promise<{
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
} | null> {
  const address = await getAddressById(addressId, userId);

  if (!address) {
    return null;
  }

  return {
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company || undefined,
    phone: address.phone || undefined,
    street1: address.street1,
    street2: address.street2 || undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

//==============================================================================
// BUSINESS LOGIC ADDRESS ACTIONS (Server Actions)
//==============================================================================

export async function createAddressAction(
  ...args: Parameters<typeof createAddress>
): Promise<ReturnType<typeof createAddress>> {
  'use server';
  return createAddress(...args);
}

export async function getAddressByIdAction(
  ...args: Parameters<typeof getAddressById>
): Promise<ReturnType<typeof getAddressById>> {
  'use server';
  return getAddressById(...args);
}

export async function getUserAddressesAction(
  ...args: Parameters<typeof getUserAddresses>
): Promise<ReturnType<typeof getUserAddresses>> {
  'use server';
  return getUserAddresses(...args);
}

export async function getDefaultAddressAction(
  ...args: Parameters<typeof getDefaultAddress>
): Promise<ReturnType<typeof getDefaultAddress>> {
  'use server';
  return getDefaultAddress(...args);
}

export async function updateAddressAction(
  ...args: Parameters<typeof updateAddress>
): Promise<ReturnType<typeof updateAddress>> {
  'use server';
  return updateAddress(...args);
}

export async function setDefaultAddressAction(
  ...args: Parameters<typeof setDefaultAddress>
): Promise<ReturnType<typeof setDefaultAddress>> {
  'use server';
  return setDefaultAddress(...args);
}

export async function deleteAddressAction(
  ...args: Parameters<typeof deleteAddress>
): Promise<ReturnType<typeof deleteAddress>> {
  'use server';
  return deleteAddress(...args);
}

export async function validateAddressAction(
  ...args: Parameters<typeof validateAddress>
): Promise<ReturnType<typeof validateAddress>> {
  'use server';
  return validateAddress(...args);
}

export async function cloneAddressAction(
  ...args: Parameters<typeof cloneAddress>
): Promise<ReturnType<typeof cloneAddress>> {
  'use server';
  return cloneAddress(...args);
}

export async function formatAddressForCheckoutAction(
  ...args: Parameters<typeof formatAddressForCheckout>
): Promise<ReturnType<typeof formatAddressForCheckout>> {
  'use server';
  return formatAddressForCheckout(...args);
}
