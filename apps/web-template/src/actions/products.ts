'use server';

import {
  findManyProductsAction,
  findFirstProductAction,
  findManyBrandsAction,
  getCategoriesAdvancedAction,
} from '@repo/database/prisma';

// Wrapper functions that return expected format with data property
export async function getProducts(args?: any) {
  'use server';

  // Convert web-template params to Prisma params
  const prismaArgs = { ...args };
  if (args?.limit) {
    prismaArgs.take = args.limit;
    delete prismaArgs.limit;
  }
  if (args?.page) {
    prismaArgs.skip = (args.page - 1) * (args.limit || 50);
    delete prismaArgs.page;
  }

  const products = await findManyProductsAction(prismaArgs);
  return {
    data: products,
    pagination: {
      total: products.length,
      page: args?.page || 1,
      limit: args?.limit || args?.take || 50,
      totalPages: Math.ceil(products.length / (args?.limit || args?.take || 50)),
    },
  };
}

export async function getProductByHandle(handle: string) {
  'use server';
  const product = await findFirstProductAction({
    where: { slug: handle },
  });
  return product;
}

export async function getProductsByCollection(collectionId: string, args?: any) {
  'use server';
  const products = await findManyProductsAction({
    where: {
      collections: {
        some: { id: collectionId },
      },
    },
    ...args,
  });
  return {
    products: products as any,
    data: products,
    pagination: {
      total: products.length,
      page: args?.page || 1,
      limit: args?.limit || 50,
      totalPages: Math.ceil(products.length / (args?.limit || 50)),
    },
  };
}

export async function getProductsByBrand(brandSlug: string, args?: any) {
  'use server';
  const products = await findManyProductsAction({
    where: {
      brand: brandSlug,
    },
    ...args,
  });
  return {
    data: products,
    pagination: {
      total: products.length,
      page: args?.page || 1,
      limit: args?.limit || 50,
      totalPages: Math.ceil(products.length / (args?.limit || 50)),
    },
  };
}

export async function searchProducts(query: string, args?: any) {
  'use server';
  const products = await findManyProductsAction({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    ...args,
  });
  return {
    data: products,
    pagination: {
      total: products.length,
      page: args?.page || 1,
      limit: args?.limit || 50,
      totalPages: Math.ceil(products.length / (args?.limit || 50)),
    },
  };
}

export async function getProductBrands(args?: any) {
  'use server';
  const brands = await findManyBrandsAction(args);
  return { data: brands };
}

export async function getProductCategories(args?: any) {
  'use server';
  return getCategoriesAdvancedAction(args);
}
