// Type-safe route builders for Next.js typed routes
export const routes = {
  products: {
    detail: (handle: string): string => `/products/${handle}`,
  },
  collections: {
    list: '/collections',
    all: '/collections/all',
    detail: (handle: string): string => `/collections/${handle}`,
  },
  blog: {
    list: '/blog',
    detail: (handle: string): string => `/blog/${handle}`,
  },
  orders: {
    list: '/orders',
    detail: (number: string): string => `/orders/${number}`,
  },
  cart: '/cart',
  checkout: '/checkout',
  about: '/about',
  contact: '/contact',
  search: '/search',
  subscription: '/subscription',
} as const;

// Helper function to safely create dynamic routes
export function createRoute<T extends string>(path: T): T {
  return path;
}
