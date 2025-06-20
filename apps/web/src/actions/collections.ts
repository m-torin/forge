'use server';

import {
  findManyCollectionsAction,
  findUniqueCollectionAction,
  findFirstCollectionAction,
} from '@repo/database/prisma/server/next';

// Wrapper functions that return expected format with data property
export async function getCollections(args?: any) {
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

  const collections = await findManyCollectionsAction(prismaArgs);
  return { data: collections as any };
}

export async function getCollection(id: string) {
  'use server';
  const collection = await findUniqueCollectionAction({ where: { id } });
  return { data: collection };
}

export async function getCollectionByHandle(slug: string) {
  'use server';
  const collection = await findFirstCollectionAction({ where: { slug } });
  return collection;
}

export async function getFeaturedCollections(limit = 6) {
  'use server';
  const collections = await findManyCollectionsAction({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  return { data: collections };
}
