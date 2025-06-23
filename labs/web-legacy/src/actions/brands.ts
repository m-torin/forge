'use server';

import {
  findManyBrandsAction,
  findUniqueBrandAction,
  findFirstBrandAction,
} from '@repo/database/prisma/server/next';

// Wrapper functions that return expected format with data property
export async function getBrands(args?: any) {
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

  const brands = await findManyBrandsAction(prismaArgs);
  return { data: brands as any };
}

export async function getBrand(id: string) {
  'use server';
  const brand = await findUniqueBrandAction({ where: { id } });
  return { data: brand };
}

export async function getBrandBySlug(slug: string) {
  'use server';
  const brand = await findFirstBrandAction({ where: { slug } });
  return brand as any;
}
