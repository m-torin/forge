'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server';
import { prisma } from '@repo/database/prisma';
import { ContentStatus, type Prisma, type TaxonomyType } from '@repo/database/prisma';

// Get all taxonomies with pagination and filtering
export async function getTaxonomies(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  type?: TaxonomyType;
  includeDeleted?: boolean;
}) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const { type, includeDeleted = false, limit = 50, page = 1, search, status } = params || {};

  const skip = (page - 1) * limit;

  const where: Prisma.TaxonomyWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
    ...(type && { type }),
  };

  const [taxonomies, total] = await Promise.all([
    prisma.taxonomy.findMany({
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }],
      skip,
      take: limit,
      where,
    }),
    prisma.taxonomy.count({ where }),
  ]);

  return {
    limit,
    page,
    taxonomies,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Get a single taxonomy by ID
export async function getTaxonomy(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const taxonomy = await prisma.taxonomy.findUnique({
    include: {
      _count: {
        select: {
          collections: true,
          products: true,
        },
      },
    },
    where: { id },
  });

  if (!taxonomy) {
    throw new Error('Taxonomy not found');
  }

  return taxonomy;
}

// Create a new taxonomy
export async function createTaxonomy(data: {
  name: string;
  slug: string;
  status: ContentStatus;
  type: TaxonomyType;
  copy?: any;
}) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Check if slug already exists
  const existing = await prisma.taxonomy.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error('A taxonomy with this slug already exists');
  }

  const taxonomy = await prisma.taxonomy.create({
    data: {
      name: data.name,
      type: data.type,
      copy: data.copy || {},
      slug: data.slug,
      status: data.status,
    },
    include: {
      _count: {
        select: {
          collections: true,
          products: true,
        },
      },
    },
  });

  revalidatePath('/pim3/taxonomy');
  return taxonomy;
}

// Update a taxonomy
export async function updateTaxonomy(
  id: string,
  data: {
    name?: string;
    slug?: string;
    status?: ContentStatus;
    type?: TaxonomyType;
    copy?: any;
  },
) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Check if taxonomy exists
  const existing = await prisma.taxonomy.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Taxonomy not found');
  }

  // Check if new slug already exists (if slug is being changed)
  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await prisma.taxonomy.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists) {
      throw new Error('A taxonomy with this slug already exists');
    }
  }

  const taxonomy = await prisma.taxonomy.update({
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.copy !== undefined && { copy: data.copy }),
    },
    include: {
      _count: {
        select: {
          collections: true,
          products: true,
        },
      },
    },
    where: { id },
  });

  revalidatePath('/pim3/taxonomy');
  return taxonomy;
}

// Delete a taxonomy (soft delete)
export async function deleteTaxonomy(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const taxonomy = await prisma.taxonomy.update({
    data: {
      deletedAt: new Date(),
      deletedById: session.user.id,
    },
    where: { id },
  });

  revalidatePath('/pim3/taxonomy');
  return taxonomy;
}

// Restore a deleted taxonomy
export async function restoreTaxonomy(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const taxonomy = await prisma.taxonomy.update({
    data: {
      deletedAt: null,
      deletedById: null,
    },
    where: { id },
  });

  revalidatePath('/pim3/taxonomy');
  return taxonomy;
}

// Get all taxonomies (simple list)
export async function getTaxonomyList(includeDeleted = false) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const taxonomies = await prisma.taxonomy.findMany({
    include: {
      _count: {
        select: {
          collections: true,
          products: true,
        },
      },
    },
    orderBy: [{ name: 'asc' }],
    where: includeDeleted ? {} : { deletedAt: null },
  });

  return taxonomies;
}

// Duplicate a taxonomy
export async function duplicateTaxonomy(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const original = await prisma.taxonomy.findUnique({
    where: { id },
  });

  if (!original) {
    throw new Error('Taxonomy not found');
  }

  // Generate unique slug
  let newSlug = `${original.slug}-copy`;
  let counter = 1;
  while (await prisma.taxonomy.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${original.slug}-copy-${counter}`;
    counter++;
  }

  const duplicate = await prisma.taxonomy.create({
    data: {
      name: `${original.name} (Copy)`,
      type: original.type,
      copy: original.copy,
      slug: newSlug,
      status: ContentStatus.DRAFT,
    },
  });

  revalidatePath('/pim3/taxonomy');
  return duplicate;
}
