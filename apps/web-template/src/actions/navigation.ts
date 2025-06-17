'use server';

// Navigation actions for web-template
export {
  findManyBrandsAction as getNavigationBrands,
  findManyCollectionsAction as getNavigationCollections,
  getCategoriesAdvancedAction as getNavigationCategories,
} from '@repo/database/prisma';

// Create a combined navigation function
export async function getNavigation() {
  'use server';
  const { findManyBrandsAction, findManyCollectionsAction, getCategoriesAdvancedAction } =
    await import('@repo/database/prisma');

  const [brands, collections, categories] = await Promise.all([
    findManyBrandsAction({ take: 10 }),
    findManyCollectionsAction({ take: 10 }),
    getCategoriesAdvancedAction({ limit: 10 }),
  ]);

  return {
    brands,
    collections,
    categories: categories.data || [],
  };
}
