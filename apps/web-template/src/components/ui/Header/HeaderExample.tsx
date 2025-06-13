'use client';

import { useState } from 'react';
import { Header, Header2, Navigation, SidebarNavigation } from './index';
import { TNavigationItem, TCollection } from './types';

// Example usage of the Header components
export const HeaderExample = () => {
  const [showSidebar, setShowSidebar] = useState(false);

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Header Component</h2>
        <Header
          currentLocale="en"
          hasBorderBottom={true}
          onMenuClick={() => setShowSidebar(true)}
          onCartClick={() => console.log('Cart clicked')}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Header2 Component with Navigation</h2>
        <Header2
          hasBorder={true}
          navigationMenu={sampleNavigationMenu}
          featuredCollection={sampleFeaturedCollection}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Standalone Navigation</h2>
        <Navigation menu={sampleNavigationMenu} featuredCollection={sampleFeaturedCollection} />
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setShowSidebar(false)}
        >
          <div className="fixed left-0 top-0 h-full w-80 bg-white p-6 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold mb-4">Mobile Navigation</h3>
            <SidebarNavigation data={sampleNavigationMenu} />
          </div>
        </div>
      )}
    </div>
  );
};
