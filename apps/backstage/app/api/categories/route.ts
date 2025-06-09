import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database/prisma';
import { Prisma } from '@repo/database/prisma';

import type { ContentStatus } from '@repo/database/prisma';

interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterParams {
  includeDeleted?: boolean;
  parentId?: string | null;
  search?: string;
  status?: ContentStatus;
}

function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  const offset = (page - 1) * limit;

  return { limit, offset, page };
}

function getSortParams(searchParams: URLSearchParams): SortParams {
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  return { sortBy, sortOrder };
}

function getFilterParams(searchParams: URLSearchParams): FilterParams {
  return {
    includeDeleted: searchParams.get('includeDeleted') === 'true',
    parentId:
      searchParams.get('parentId') === 'null' ? null : searchParams.get('parentId') || undefined,
    search: searchParams.get('search') || undefined,
    status: (searchParams.get('status') as ContentStatus) || undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const { limit, offset, page } = getPaginationParams(searchParams);
    const { sortBy, sortOrder } = getSortParams(searchParams);
    const { includeDeleted, parentId, search, status } = getFilterParams(searchParams);

    // Build where clause
    const where: Prisma.ProductCategoryWhereInput = {};

    // Handle soft delete filter
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add parent filter
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    // Build orderBy clause
    const orderBy: Prisma.ProductCategoryOrderByWithRelationInput = {};
    if (
      sortBy === 'name' ||
      sortBy === 'slug' ||
      sortBy === 'displayOrder' ||
      sortBy === 'createdAt' ||
      sortBy === 'updatedAt'
    ) {
      orderBy[sortBy] = sortOrder;
    } else {
      // Default sort
      orderBy.createdAt = 'desc';
    }

    // Execute queries in parallel
    const [categories, totalCount] = await Promise.all([
      database.productCategory.findMany({
        include: {
          _count: {
            select: {
              collections: true,
              media: true,
              products: true,
            },
          },
          children: {
            orderBy: { displayOrder: 'asc' },
            select: {
              id: true,
              name: true,
              displayOrder: true,
              slug: true,
            },
            where: includeDeleted ? {} : { deletedAt: null },
          },
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
        where,
      }),
      database.productCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: categories,
      pagination: {
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
        page,
        total: totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      copy,
      description,
      displayOrder = 0,
      metaDescription,
      metaKeywords,
      metaTitle,
      parentId,
      slug,
      status = 'PUBLISHED',
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Check if slug already exists
    const existingCategory = await database.productCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 },
      );
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentCategory = await database.productCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
      }

      // Check for circular reference (parent cannot be a descendant)
      const hasCircularRef = await checkCircularReference(parentId, null);
      if (hasCircularRef) {
        return NextResponse.json(
          { error: 'Cannot create circular reference in category hierarchy' },
          { status: 400 },
        );
      }
    }

    // Create the category
    const category = await database.productCategory.create({
      data: {
        name,
        copy: copy || {},
        description,
        displayOrder,
        metaDescription,
        metaKeywords,
        metaTitle,
        parentId,
        slug,
        status,
      },
      include: {
        _count: {
          select: {
            collections: true,
            media: true,
            products: true,
          },
        },
        children: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            displayOrder: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 },
        );
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to check for circular references
async function checkCircularReference(parentId: string, childId: string | null): Promise<boolean> {
  if (!childId) return false;

  const parent = await database.productCategory.findUnique({
    select: { parentId: true },
    where: { id: parentId },
  });

  if (!parent) return false;
  if (parent.parentId === childId) return true;

  if (parent.parentId) {
    return checkCircularReference(parent.parentId, childId);
  }

  return false;
}
