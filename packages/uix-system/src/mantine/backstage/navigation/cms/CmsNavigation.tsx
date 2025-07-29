'use client';

import {
  IconBox,
  IconBuilding,
  IconCategory,
  IconPalette,
  IconStar,
  IconTable,
  IconTag,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { SidebarNavigation } from '../SidebarNavigation';
import { NavigationGroup } from '../types';

export function CmsNavigation() {
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'content',
      label: 'Content Management',
      items: [
        {
          id: 'brands',
          label: 'Brands',
          href: '/brands',
          icon: <IconBuilding size={16} />,
        },
        {
          id: 'products',
          label: 'Products',
          href: '/products',
          icon: <IconBox size={16} />,
        },
        {
          id: 'categories',
          label: 'Categories',
          href: '/categories',
          icon: <IconCategory size={16} />,
        },
        {
          id: 'tags',
          label: 'Tags',
          href: '/tags',
          icon: <IconTag size={16} />,
        },
      ],
    },
    {
      id: 'media',
      label: 'Media & Content',
      items: [
        {
          id: 'fandoms',
          label: 'Fandoms',
          href: '/fandoms',
          icon: <IconStar size={16} />,
        },
        {
          id: 'fandoms-bulk',
          label: 'Fandoms (Bulk Edit)',
          href: '/fandoms/all',
          icon: <IconTable size={16} />,
        },
        {
          id: 'series',
          label: 'Series',
          href: '/series',
          icon: <IconPalette size={16} />,
        },
        {
          id: 'stories',
          label: 'Stories',
          href: '/stories',
          icon: <IconWorld size={16} />,
        },
        {
          id: 'characters',
          label: 'Characters',
          href: '/characters',
          icon: <IconUser size={16} />,
        },
      ],
    },
  ];

  return <SidebarNavigation groups={navigationGroups} data-testid="cms-navigation" />;
}
