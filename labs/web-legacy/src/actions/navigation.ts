'use server';

import { logger } from '@/lib/logger';
import {
  findManyBrandsAction,
  findManyCollectionsAction,
  getCategoriesAdvancedAction,
} from '@repo/database/prisma/server/next';

import type { TNavigationItem } from '@/types';

export async function getNavigationBrands(...args: Parameters<typeof findManyBrandsAction>) {
  return findManyBrandsAction(...args);
}

export async function getNavigationCollections(
  ...args: Parameters<typeof findManyCollectionsAction>
) {
  return findManyCollectionsAction(...args);
}

export async function getNavigationCategories(
  ...args: Parameters<typeof getCategoriesAdvancedAction>
) {
  return getCategoriesAdvancedAction(...args);
}

export async function getNavigation(): Promise<TNavigationItem[]> {
  try {
    const [brands, collections, categories] = await Promise.all([
      findManyBrandsAction({ take: 10 }),
      findManyCollectionsAction({ take: 10 }),
      getCategoriesAdvancedAction({ limit: 10 }),
    ]);

    // Transform database results into navigation items
    const navigationItems: TNavigationItem[] = [
      {
        id: 'home',
        name: 'Home',
        href: '/',
      },
      {
        id: 'brands',
        name: 'Brands',
        href: '/brands',
        type: 'dropdown',
        children: brands.slice(0, 5).map((brand) => ({
          id: brand.id,
          name: brand.name,
          href: `/brands/${brand.slug || brand.id}`,
        })),
      },
      {
        id: 'collections',
        name: 'Collections',
        href: '/collections',
        type: 'dropdown',
        children: collections.slice(0, 5).map((collection) => ({
          id: collection.id,
          name: collection.name,
          href: `/collections/${collection.slug || collection.id}`,
        })),
      },
      {
        id: 'categories',
        name: 'Categories',
        href: '/categories',
        type: 'dropdown',
        children: (categories.data || []).slice(0, 5).map((category) => ({
          id: category.id,
          name: category.name,
          href: `/categories/${category.slug || category.id}`,
        })),
      },
    ];

    return navigationItems;
  } catch (_error) {
    logger.error('Failed to fetch navigation data', _error);
    // Return fallback navigation
    return [
      { id: 'home', name: 'Home', href: '/' },
      { id: 'shop', name: 'Shop', href: '/collections' },
      { id: 'about', name: 'About', href: '/about' },
    ];
  }
}
