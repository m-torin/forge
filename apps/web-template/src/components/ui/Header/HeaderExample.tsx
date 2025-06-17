'use client';

import { useState } from 'react';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header, Header2, Navigation, SidebarNavigation } from './index';
import { TNavigationItem, TCollection } from './types';

interface HeaderExampleProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for HeaderExample
function HeaderExampleSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="space-y-8" data-testid={testId}>
      <div>
        <Skeleton height={24} width={200} mb="md" />
        <Skeleton height={64} />
      </div>
      <div>
        <Skeleton height={24} width={250} mb="md" />
        <Skeleton height={80} />
      </div>
      <div>
        <Skeleton height={24} width={180} mb="md" />
        <Skeleton height={48} />
      </div>
    </div>
  );
}

// Error state for HeaderExample
function HeaderExampleError({ error, testId }: { error: string; testId?: string }) {
  return (
    <div className="space-y-8" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Header examples failed to load: {error}</Text>
      </Alert>
    </div>
  );
}

// Example usage of the Header components
export const HeaderExample = ({
  loading = false,
  error,
  'data-testid': testId = 'header-example',
}: HeaderExampleProps = {}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <HeaderExampleSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <HeaderExampleError error={currentError} testId={testId} />;
  }

  // Sample navigation data
  const sampleNavigationMenu: TNavigationItem[] = [
    {
      id: '1',
      name: 'Home',
      href: '/',
    },
    {
      id: '2',
      name: 'Products',
      href: '/products',
      type: 'dropdown',
      children: [
        {
          id: '2-1',
          name: 'All Products',
          href: '/products',
        },
        {
          id: '2-2',
          name: 'Featured',
          href: '/products/featured',
        },
      ],
    },
    {
      id: '3',
      name: 'Collections',
      href: '/collections',
      type: 'mega-menu',
      children: [
        {
          id: '3-1',
          name: 'Popular',
          children: [
            {
              id: '3-1-1',
              name: 'Best Sellers',
              href: '/collections/best-sellers',
            },
            {
              id: '3-1-2',
              name: 'New Arrivals',
              href: '/collections/new-arrivals',
            },
          ],
        },
      ],
    },
    {
      id: '4',
      name: 'About',
      href: '/about',
    },
  ];

  const sampleFeaturedCollection: TCollection = {
    id: 'featured-1',
    handle: 'featured-collection',
    title: 'Featured Collection',
    description: 'Our most popular items',
    image: {
      src: '/images/placeholder.jpg',
      alt: 'Featured Collection',
      width: 400,
      height: 300,
    },
  };

  const handleMenuClick = () => {
    try {
      setShowSidebar(true);
    } catch (err) {
      console.error('Menu click error:', err);
      setInternalError('Failed to open menu');
    }
  };

  const handleCartClick = () => {
    try {
      console.log('Cart clicked');
    } catch (err) {
      console.error('Cart click error:', err);
      setInternalError('Failed to open cart');
    }
  };

  const handleSidebarClose = () => {
    try {
      setShowSidebar(false);
    } catch (err) {
      console.error('Sidebar close error:', err);
      setInternalError('Failed to close sidebar');
    }
  };

  return (
    <ErrorBoundary
      fallback={<HeaderExampleError error="Header example failed to render" testId={testId} />}
    >
      <div className="space-y-8" data-testid={testId}>
        <ErrorBoundary fallback={<Skeleton height={88} />}>
          <div>
            <h2 className="text-xl font-semibold mb-4">Header Component</h2>
            <Header
              currentLocale="en"
              hasBorderBottom={true}
              onMenuClick={handleMenuClick}
              onCartClick={handleCartClick}
            />
          </div>
        </ErrorBoundary>

        <ErrorBoundary fallback={<Skeleton height={104} />}>
          <div>
            <h2 className="text-xl font-semibold mb-4">Header2 Component with Navigation</h2>
            <Header2
              hasBorder={true}
              navigationMenu={sampleNavigationMenu}
              featuredCollection={sampleFeaturedCollection}
            />
          </div>
        </ErrorBoundary>

        <ErrorBoundary fallback={<Skeleton height={72} />}>
          <div>
            <h2 className="text-xl font-semibold mb-4">Standalone Navigation</h2>
            <Navigation menu={sampleNavigationMenu} featuredCollection={sampleFeaturedCollection} />
          </div>
        </ErrorBoundary>

        {showSidebar && (
          <ErrorBoundary fallback={<div className="fixed inset-0 z-50 bg-black bg-opacity-50" />}>
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={handleSidebarClose}>
              <div className="fixed left-0 top-0 h-full w-80 bg-white p-6 dark:bg-neutral-900">
                <ErrorBoundary fallback={<Skeleton height={28} width={200} />}>
                  <h3 className="text-lg font-semibold mb-4">Mobile Navigation</h3>
                  <SidebarNavigation data={sampleNavigationMenu} />
                </ErrorBoundary>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};
