'use client';

import { IconBuilding, IconKey, IconSettings, IconShield, IconUsers } from '@tabler/icons-react';
import { SidebarNavigation } from '../SidebarNavigation';
import { NavigationGroup } from '../types';

export function AuthNavigation() {
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'users',
      label: 'User Management',
      items: [
        {
          id: 'all-users',
          label: 'All Users',
          href: '/users',
          icon: <IconUsers size={16} />,
        },
        {
          id: 'organizations',
          label: 'Organizations',
          href: '/organizations',
          icon: <IconBuilding size={16} />,
        },
        {
          id: 'roles',
          label: 'Roles & Permissions',
          href: '/roles',
          icon: <IconShield size={16} />,
        },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      items: [
        {
          id: 'api-keys',
          label: 'API Keys',
          href: '/api-keys',
          icon: <IconKey size={16} />,
        },
        {
          id: 'auth-settings',
          label: 'Auth Settings',
          href: '/auth-settings',
          icon: <IconSettings size={16} />,
        },
      ],
    },
  ];

  return <SidebarNavigation groups={navigationGroups} data-testid="auth-navigation" />;
}
