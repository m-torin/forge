'use client';

import { useState, useEffect, useMemo } from 'react';
import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import {
  IconSearch,
  IconUsers,
  IconBuilding,
  IconKey,
  IconRocket,
  IconDashboard,
  IconSettings,
  IconFlag,
  IconShield,
  IconPackage,
  IconFileText,
  IconChevronRight,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

import { getUsersAction, getOrganizationsAction, getApiKeysAction } from '../guests/actions';
import type { User, Organization, ApiKey } from '../guests/types';

interface SearchData {
  users: User[];
  organizations: Organization[];
  apiKeys: ApiKey[];
  loading: boolean;
}

// Static navigation items for quick access
const QUICK_ACTIONS: SpotlightActionData[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Go to main dashboard',
    onClick: () => (window.location.href = '/'),
    leftSection: <IconDashboard size={18} />,
    keywords: ['home', 'main', 'overview'],
  },
  {
    id: 'create-user',
    label: 'Create User',
    description: 'Add a new user to the system',
    onClick: () => (window.location.href = '/guests/people/new'),
    leftSection: <IconUsers size={18} />,
    keywords: ['new', 'add', 'invite'],
  },
  {
    id: 'create-org',
    label: 'Create Organization',
    description: 'Set up a new organization',
    onClick: () => (window.location.href = '/guests/organizations/new'),
    leftSection: <IconBuilding size={18} />,
    keywords: ['new', 'company', 'team'],
  },
  {
    id: 'create-api-key',
    label: 'Create API Key',
    description: 'Generate a new API key',
    onClick: () => (window.location.href = '/guests/api-keys/new'),
    leftSection: <IconKey size={18} />,
    keywords: ['new', 'token', 'access'],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    description: 'Manage automated workflows',
    onClick: () => (window.location.href = '/workflows'),
    leftSection: <IconRocket size={18} />,
    keywords: ['automation', 'jobs', 'tasks'],
  },
  {
    id: 'pim3',
    label: 'Product Information',
    description: 'Manage products and catalog',
    onClick: () => (window.location.href = '/pim3'),
    leftSection: <IconPackage size={18} />,
    keywords: ['products', 'catalog', 'inventory'],
  },
  {
    id: 'cms',
    label: 'Content Management',
    description: 'Manage content and media',
    onClick: () => (window.location.href = '/cms'),
    leftSection: <IconFileText size={18} />,
    keywords: ['content', 'media', 'files'],
  },
  {
    id: 'settings',
    label: 'System Settings',
    description: 'Configure system preferences',
    onClick: () => (window.location.href = '/settings'),
    leftSection: <IconSettings size={18} />,
    keywords: ['config', 'preferences', 'admin'],
  },
  {
    id: 'feature-flags',
    label: 'Feature Flags',
    description: 'Manage feature toggles',
    onClick: () => (window.location.href = '/feature-flags'),
    leftSection: <IconFlag size={18} />,
    keywords: ['toggles', 'features', 'experiments'],
  },
  {
    id: 'security',
    label: 'Security Dashboard',
    description: 'View security and audit logs',
    onClick: () => (window.location.href = '/admin/security'),
    leftSection: <IconShield size={18} />,
    keywords: ['audit', 'logs', 'compliance'],
  },
];

export function GlobalSearch({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData>({
    users: [],
    organizations: [],
    apiKeys: [],
    loading: false,
  });

  // Load search data when spotlight opens
  useEffect(() => {
    if (opened && searchData.users.length === 0) {
      loadSearchData();
    }
  }, [opened]);

  const loadSearchData = async () => {
    setSearchData((prev) => ({ ...prev, loading: true }));

    try {
      const [usersRes, orgsRes, keysRes] = await Promise.all([
        getUsersAction(),
        getOrganizationsAction(),
        getApiKeysAction(),
      ]);

      setSearchData({
        users: usersRes.success ? usersRes.data || [] : [],
        organizations: orgsRes.success ? orgsRes.data || [] : [],
        apiKeys: keysRes.success ? keysRes.data || [] : [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load search data:', error);
      setSearchData((prev) => ({ ...prev, loading: false }));
    }
  };

  // Generate dynamic search actions from data
  const dynamicActions = useMemo((): SpotlightActionData[] => {
    const actions: SpotlightActionData[] = [];

    // Add users
    searchData.users.forEach((user) => {
      actions.push({
        id: `user-${user.id}`,
        label: user.name || user.email,
        description: `User • ${user.email} • ${user.role}`,
        onClick: () => {
          router.push(`/guests/people/${user.id}`);
          onClose();
        },
        leftSection: <IconUsers size={18} />,
        rightSection: <IconChevronRight size={14} />,
        keywords: [
          user.name?.toLowerCase() || '',
          user.email.toLowerCase(),
          user.role,
          'user',
          'person',
          'account',
        ].filter(Boolean),
      });
    });

    // Add organizations
    searchData.organizations.forEach((org) => {
      actions.push({
        id: `org-${org.id}`,
        label: org.name,
        description: `Organization • ${org.slug} • ${org._count?.members || 0} members`,
        onClick: () => {
          router.push(`/guests/organizations/${org.id}`);
          onClose();
        },
        leftSection: <IconBuilding size={18} />,
        rightSection: <IconChevronRight size={14} />,
        keywords: [
          org.name.toLowerCase(),
          org.slug.toLowerCase(),
          'organization',
          'company',
          'team',
        ],
      });
    });

    // Add API keys
    searchData.apiKeys.forEach((key) => {
      actions.push({
        id: `key-${key.id}`,
        label: key.name,
        description: `API Key • ${key.permissions?.join(', ') || 'read'} • ${key.enabled ? 'Active' : 'Inactive'}`,
        onClick: () => {
          router.push(`/guests/api-keys/${key.id}`);
          onClose();
        },
        leftSection: <IconKey size={18} />,
        rightSection: <IconChevronRight size={14} />,
        keywords: [
          key.name.toLowerCase(),
          'api',
          'key',
          'token',
          'access',
          ...(key.permissions || []),
        ],
      });
    });

    return actions;
  }, [searchData, router, onClose]);

  // Combine all actions
  const allActions = useMemo(() => [...QUICK_ACTIONS, ...dynamicActions], [dynamicActions]);

  const handleActionTrigger = (action: SpotlightActionData) => {
    try {
      action.onClick?.();
      notifications.show({
        title: 'Navigation',
        message: `Navigating to ${action.label}`,
        color: 'blue',
        icon: <IconSearch size={16} />,
      });
    } catch (error) {
      console.error('Failed to trigger action:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to navigate',
        color: 'red',
      });
    }
  };

  return (
    <Spotlight
      opened={opened}
      onClose={onClose}
      actions={allActions}
      onTrigger={handleActionTrigger}
      highlightQuery
      searchProps={{
        leftSection: <IconSearch size={20} />,
        placeholder: 'Search users, organizations, API keys, or navigate...',
      }}
      filter={(query, actions) => {
        if (!query) return actions;

        const lowerQuery = query.toLowerCase();
        return actions.filter((action) => {
          // Search in label
          if (action.label.toLowerCase().includes(lowerQuery)) return true;

          // Search in description
          if (action.description?.toLowerCase().includes(lowerQuery)) return true;

          // Search in keywords
          if (action.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery)))
            return true;

          return false;
        });
      }}
      limit={10}
      shortcut={['mod + K', '/']}
      tagsToIgnore={[]}
      clearQueryOnClose
      loading={searchData.loading}
      nothingFound={
        searchData.loading
          ? 'Loading search data...'
          : 'No results found. Try searching for users, organizations, or API keys.'
      }
    />
  );
}
