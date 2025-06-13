import { TNavigationItem } from '@/types';

export async function getNavigationRoutes(): Promise<TNavigationItem[]> {
  return [
    {
      children: [
        {
          href: '/search',
          id: 'search-basic',
          name: 'Basic Search',
        },
        {
          href: '/product-search',
          id: 'product-search',
          name: 'Product Search',
        },
        {
          href: '/algolia-showcase',
          id: 'algolia-showcase',
          name: 'Algolia Features',
        },
      ],
      href: '/search',
      id: 'search',
      name: 'Search',
    },
    {
      children: [
        {
          href: '/products/featured',
          id: 'featured',
          name: 'Featured',
        },
        {
          href: '/products/new',
          id: 'new-arrivals',
          name: 'New Arrivals',
        },
        {
          href: '/categories',
          id: 'categories',
          name: 'Categories',
        },
      ],
      href: '/products',
      id: 'products',
      name: 'Products',
    },
    {
      children: [
        {
          href: '/brands',
          id: 'brands',
          name: 'Brands',
        },
        {
          href: '/collections',
          id: 'collections',
          name: 'Collections',
        },
        {
          href: '/tags',
          id: 'tags',
          name: 'Tags',
        },
        {
          href: '/attributes',
          id: 'attributes',
          name: 'Attributes',
        },
      ],
      href: '/catalog',
      id: 'catalog',
      name: 'Catalog',
    },
    {
      href: '/blog',
      id: 'blog',
      name: 'Blog',
    },
  ];
}

export default getNavigationRoutes;

// Additional navigation exports for data-service compatibility
export async function getNavigation(): Promise<TNavigationItem[]> {
  return getNavigationRoutes();
}

export async function getNavMegaMenu() {
  // For now, return empty - can be expanded later
  return [];
}

export async function getHeaderDropdownCategories() {
  // For now, return basic categories
  return [
    { id: '1', name: 'All Categories', href: '/categories' },
    { id: '2', name: 'New Arrivals', href: '/products/new' },
    { id: '3', name: 'Featured', href: '/products/featured' },
  ];
}

export async function getCurrencies() {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];
}

export async function getLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
  ];
}
