import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server/next';
import {
  ContentStatus,
  findUniqueProductCategoryOrm,
  updateProductCategoryOrm,
  deleteProductCategoryOrm,
} from '@repo/database/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';

    const category = await findUniqueProductCategoryOrm({
      include: {
        _count: {
          select: {
            children: true,
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
            _count: {
              select: {
                products: true,
              },
            },
            displayOrder: true,
            slug: true,
            status: true,
          },
          where: includeDeleted ? {} : { deletedAt: null },
        },
        collections: {
          select: {
            id: true,
            name: true,
            type: true,
            slug: true,
          },
          take: 10,
          where: includeDeleted ? {} : { deletedAt: null },
        },
        deletedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        media: {
          select: {
            id: true,
            type: true,
            url: true,
            altText: true,
          },
          take: 10,
          where: includeDeleted ? {} : { deletedAt: null },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        products: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
          },
          take: 10,
          where: includeDeleted ? {} : { deletedAt: null },
        },
      },
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get breadcrumb trail
    const breadcrumbs = await getBreadcrumbs(category.id);

    return NextResponse.json({
      ...category,
      breadcrumbs,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await findUniqueProductCategoryOrm({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // If updating slug, check uniqueness
    if (body.slug && body.slug !== existingCategory.slug) {
      const slugExists = await findUniqueProductCategoryOrm({
        where: { slug: body.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 },
        );
      }
    }

    // If updating parent, validate and check for circular reference
    if (body.parentId !== undefined && body.parentId !== existingCategory.parentId) {
      if (body.parentId) {
        const parentCategory = await findUniqueProductCategoryOrm({
          where: { id: body.parentId },
        });

        if (!parentCategory) {
          return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
        }

        // Check for circular reference
        const hasCircularRef = await checkCircularReference(body.parentId, id);
        if (hasCircularRef) {
          return NextResponse.json(
            { error: 'Cannot create circular reference in category hierarchy' },
            { status: 400 },
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {};

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.status !== undefined) updateData.status = body.status as ContentStatus;
    if (body.copy !== undefined) updateData.copy = body.copy;
    if (body.parentId !== undefined) {
      updateData.parent = body.parentId ? { connect: { id: body.parentId } } : { disconnect: true };
    }
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    // Update the category using ORM function
    const updatedCategory = await updateProductCategoryOrm({
      data: updateData,
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
          where: { deletedAt: null },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      where: { id },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const permanent = request.nextUrl.searchParams.get('permanent') === 'true';

    // Check if category exists
    const category = await findUniqueProductCategoryOrm({
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has children
    if ((category as any)._count.children > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories' },
        { status: 400 },
      );
    }

    // Check if category has products
    if ((category as any)._count.products > 0 && permanent) {
      return NextResponse.json(
        { error: 'Cannot permanently delete category with associated products' },
        { status: 400 },
      );
    }

    if (permanent) {
      // Permanent delete using ORM function
      await deleteProductCategoryOrm({
        where: { id },
      });

      return NextResponse.json({ message: 'Category permanently deleted' });
    } else {
      // Soft delete using ORM function
      const deletedCategory = await updateProductCategoryOrm({
        data: {
          deletedAt: new Date(),
          deletedById: session.user.id,
        },
        where: { id },
      });

      return NextResponse.json({
        category: deletedCategory,
        message: 'Category soft deleted',
      });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to check for circular references using ORM function
async function checkCircularReference(parentId: string, childId: string): Promise<boolean> {
  if (parentId === childId) return true;

  const parent = await findUniqueProductCategoryOrm({
    select: { parentId: true },
    where: { id: parentId },
  });

  if (!parent || !parent.parentId) return false;

  return checkCircularReference(parent.parentId, childId);
}

// Helper function to get breadcrumb trail using ORM function
async function getBreadcrumbs(
  categoryId: string,
): Promise<{ id: string; name: string; slug: string }[]> {
  const breadcrumbs: { id: string; name: string; slug: string }[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const category: { id: string; name: string; parentId: string | null; slug: string } | null =
      await findUniqueProductCategoryOrm({
        select: {
          id: true,
          name: true,
          parentId: true,
          slug: true,
        },
        where: { id: currentId },
      });

    if (!category) break;

    breadcrumbs.unshift({
      id: category.id,
      name: category.name,
      slug: category.slug,
    });

    currentId = category.parentId;
  }

  return breadcrumbs;
}
