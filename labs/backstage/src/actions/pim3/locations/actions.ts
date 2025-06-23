'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import { type Prisma, LocationType, LodgingType } from '@repo/database/prisma';
import {
  findManyLocationsOrm,
  countLocationsOrm,
  createLocationOrm,
  updateLocationOrm,
  deleteLocationOrm,
  findUniqueLocationOrm,
  groupByLocationsOrm,
  countProductsOrm,
  countFandomsOrm,
  countTaxonomiesOrm,
} from '@repo/database/prisma';

/**
 * Location management actions for PIM3
 *
 * These actions provide location management functionality:
 * - Location CRUD operations
 * - Location type management
 * - Location search and filtering
 */

// Location validation schema
const locationSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  locationType: z.nativeEnum(LocationType),
  lodgingType: z.nativeEnum(LodgingType).optional(),
  isFictional: z.boolean().default(true),
  copy: z.record(z.any()).default({}),
});

// Get locations with pagination and filtering
export async function getLocations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  locationType?: string;
  isFictional?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { limit = 50, page = 1, search, locationType, isFictional } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(locationType && { locationType: locationType as any }),
      ...(isFictional !== undefined && { isFictional }),
    };

    const [locations, total] = await Promise.all([
      findManyLocationsOrm({
        include: {
          _count: {
            select: {
              products: true,
              fandoms: true,
              taxonomies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      countLocationsOrm({ where }),
    ]);

    return {
      data: locations,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load locations', success: false as const };
  }
}

// Get a single location by ID
export async function getLocation(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const location = await findUniqueLocationOrm({
      include: {
        _count: {
          select: {
            products: true,
            fandoms: true,
            taxonomies: true,
          },
        },
      },
      where: { id },
    });

    if (!location) {
      return { error: 'Location not found', success: false as const };
    }

    return { data: location, success: true as const };
  } catch (error) {
    return { error: 'Failed to load location', success: false as const };
  }
}

// Create a new location
export async function createLocation(data: z.infer<typeof locationSchema>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = locationSchema.parse(data);

    const location = await createLocationOrm({
      data: validatedData,
    });

    revalidatePath('/locations');
    return { data: location, success: true as const };
  } catch (error) {
    return { error: 'Failed to create location', success: false as const };
  }
}

// Update a location
export async function updateLocation(id: string, data: Partial<z.infer<typeof locationSchema>>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = locationSchema.partial().parse(data);

    const location = await updateLocationOrm({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/locations');
    return { data: location, success: true as const };
  } catch (error) {
    return { error: 'Failed to update location', success: false as const };
  }
}

// Delete a location
export async function deleteLocation(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if location has associated data
    const [productsCount, fandomsCount, taxonomiesCount] = await Promise.all([
      countProductsOrm({ where: { locations: { some: { id } } } }),
      countFandomsOrm({ where: { locations: { some: { id } } } }),
      countTaxonomiesOrm({ where: { locations: { some: { id } } } }),
    ]);

    if (productsCount > 0 || fandomsCount > 0 || taxonomiesCount > 0) {
      return {
        error: 'Cannot delete location with associated data',
        success: false as const,
      };
    }

    const location = await deleteLocationOrm({
      where: { id },
    });

    revalidatePath('/locations');
    return { data: location, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete location', success: false as const };
  }
}

// Get location analytics
export async function getLocationAnalytics() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [
      totalLocations,
      fictionalLocations,
      locationsWithProducts,
      locationTypeStats,
      recentLocations,
      popularLocations,
    ] = await Promise.all([
      countLocationsOrm(),
      countLocationsOrm({ where: { isFictional: true } }),
      countLocationsOrm({ where: { products: { some: {} } } }),
      groupByLocationsOrm({
        by: ['locationType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      findManyLocationsOrm({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: {
            select: {
              products: true,
              fandoms: true,
              taxonomies: true,
            },
          },
        },
      }),
      findManyLocationsOrm({
        include: {
          _count: {
            select: {
              products: true,
              fandoms: true,
              taxonomies: true,
            },
          },
        },
        orderBy: {
          products: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

    return {
      data: {
        totalLocations,
        fictionalLocations,
        locationsWithProducts,
        locationTypeStats,
        recentLocations,
        popularLocations,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load location analytics', success: false as const };
  }
}
