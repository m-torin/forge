'use client';

import { Tabs } from '@mantine/core';
import { IconUsers, IconBuilding, IconKey, IconHome } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function TabNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Determine active tab based on pathname
    if (pathname === '/guests') {
      setActiveTab('dashboard');
    } else if (pathname.includes('/guests/people')) {
      setActiveTab('people');
    } else if (pathname.includes('/guests/organizations')) {
      setActiveTab('organizations');
    } else if (pathname.includes('/guests/api-keys')) {
      setActiveTab('api-keys');
    }
  }, [pathname]);

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    
    // Navigate to the appropriate route
    switch (value) {
      case 'dashboard':
        router.push('/guests');
        break;
      case 'people':
        router.push('/guests/people');
        break;
      case 'organizations':
        router.push('/guests/organizations');
        break;
      case 'api-keys':
        router.push('/guests/api-keys');
        break;
    }
  };

  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tabs.List mb="lg">
        <Tabs.Tab value="dashboard" leftSection={<IconHome size={16} />}>
          Dashboard
        </Tabs.Tab>
        <Tabs.Tab value="people" leftSection={<IconUsers size={16} />}>
          People
        </Tabs.Tab>
        <Tabs.Tab value="organizations" leftSection={<IconBuilding size={16} />}>
          Organizations
        </Tabs.Tab>
        <Tabs.Tab value="api-keys" leftSection={<IconKey size={16} />}>
          API Keys
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}