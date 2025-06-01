export type StaticRoute =
  | '/'
  | '/home-2'
  | '/login'
  | '/signup'
  | '/forgot-password'
  | '/account'
  | '/account-billing'
  | '/account-password'
  | '/account-wishlists'
  | '/orders'
  | '/blog'
  | '/cart'
  | '/checkout'
  | '/order-successful'
  | '/about'
  | '/contact'
  | '/subscription'
  | '/search'
  | '/coming-soon';

export interface DynamicRoute {
  '/blog/[handle]': { handle: string };
  '/collections/[handle]': { handle: string };
  '/collections/page-style-2/[handle]': { handle: string };
  '/orders/[number]': { number: string };
  '/products/[handle]': { handle: string };
  '/products/page-style-2/[handle]': { handle: string };
  '/quickview/[handle]': { handle: string };
}

export type AppRoute = StaticRoute | keyof DynamicRoute;

// Helper function to create typed dynamic routes
export function route<T extends keyof DynamicRoute>(
  path: T,
  params: DynamicRoute[T]
): string {
  let result = path as string;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`[${key}]`, value as string);
  }
  return result;
}
