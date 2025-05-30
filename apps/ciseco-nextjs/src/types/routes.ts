export type StaticRoute =
  | '/'
  | '/login'
  | '/signup'
  | '/forgot-password'
  | '/collections/all'
  | '/blog'
  | '/product-detail'
  | '/cart'
  | '/checkout'
  | '/order-successful'
  | '/coming-soon';

export interface DynamicRoute {
  '/blog/[handle]': { handle: string };
  '/collections/[handle]': { handle: string };
  '/orders/[number]': { number: string };
  '/products/[handle]': { handle: string };
}

export type AppRoute = StaticRoute | keyof DynamicRoute;

declare module 'next/navigation' {
  interface LinkProps {
    href: keyof AppRoute;
  }
}
