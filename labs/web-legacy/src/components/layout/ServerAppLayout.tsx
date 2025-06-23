import { type ReactNode } from 'react';
import { type AppShellProps } from '@mantine/core';

import { logger } from '@/lib/logger';
import { AppLayout } from './AppLayout/AppLayout';
import { getNavigation } from '@/actions/navigation';
import { getCart } from '@/actions/cart';

import type { TCollection } from '@/types';

interface ServerAppLayoutProps
  extends Omit<AppShellProps, 'aside' | 'children' | 'footer' | 'header' | 'navbar'> {
  children: ReactNode;
  dict?: any;
  featuredCollection?: TCollection;
  locale?: string;
}

/**
 * Server component wrapper that fetches data and passes it to the client AppLayout
 * This ensures data is fetched on the server and passed as props instead of client-side fetching
 */
export async function ServerAppLayout({
  children,
  dict,
  featuredCollection,
  locale,
  ...appShellProps
}: ServerAppLayoutProps) {
  // Fetch data on the server with better error handling
  const [navigationData, cartData] = await Promise.all([
    getNavigation().catch((error) => {
      logger.error('Failed to fetch navigation', error);
      return []; // Return empty array instead of undefined
    }),
    getCart().catch((error) => {
      logger.error('Failed to fetch cart', error);
      return { items: [], subtotal: 0, itemCount: 0 };
    }),
  ]);

  return (
    <AppLayout
      {...appShellProps}
      dict={dict}
      featuredCollection={featuredCollection}
      locale={locale}
      navigationMenu={Array.isArray(navigationData) ? navigationData : []}
      cartData={cartData}
    >
      {children}
    </AppLayout>
  );
}
