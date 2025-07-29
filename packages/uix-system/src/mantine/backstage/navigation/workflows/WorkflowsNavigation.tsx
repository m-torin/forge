'use client';

import {
  IconBolt,
  IconHistory,
  IconPlaylist,
  IconRocket,
  IconSettings,
  IconTemplate,
} from '@tabler/icons-react';
import { SidebarNavigation } from '../SidebarNavigation';
import { NavigationGroup } from '../types';

export function WorkflowsNavigation() {
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'workflows',
      label: 'Workflows',
      items: [
        {
          id: 'customer-onboarding',
          label: 'Customer Onboarding',
          href: '/workflows?type=customer-onboarding',
          icon: <IconBolt size={16} />,
        },
        {
          id: 'jr-sitemaps',
          label: 'JR-Sitemaps ETL',
          href: '/workflows?type=jr-sitemaps',
          icon: <IconTemplate size={16} />,
        },
        {
          id: 'jr-images',
          label: 'JR-Images Migration',
          href: '/workflows?type=jr-images',
          icon: <IconPlaylist size={16} />,
        },
        {
          id: 'seo-generation',
          label: 'SEO Generation',
          href: '/workflows?type=seo-generation',
          icon: <IconRocket size={16} />,
        },
        {
          id: 'product-embedding',
          label: 'Product Embedding',
          href: '/workflows?type=product-embedding',
          icon: <IconHistory size={16} />,
        },
      ],
    },
    {
      id: 'tabs',
      label: 'Views',
      items: [
        {
          id: 'trigger',
          label: 'Trigger Workflows',
          href: '/workflows?tab=trigger',
          icon: <IconRocket size={16} />,
        },
        {
          id: 'status',
          label: 'Monitor Status',
          href: '/workflows?tab=status',
          icon: <IconSettings size={16} />,
        },
      ],
    },
  ];

  return <SidebarNavigation groups={navigationGroups} data-testid="workflows-navigation" />;
}
