'use client';

import { Button, Loader, Menu } from '@mantine/core';
import { IconBuilding, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { listOrganizations, setActiveOrganization, useSession } from '@repo/auth/client';

import type { Route } from 'next';

interface OrganizationSwitcherProps {
  afterSelectOrganizationUrl?: string;
  hidePersonal?: boolean;
}

interface Organization {
  createdAt: Date;
  id: string;
  logo?: string | null | undefined;
  metadata?: any;
  name: string;
  slug: string;
}

export const OrganizationSwitcher = ({
  hidePersonal = false,
  afterSelectOrganizationUrl = '/',
}: OrganizationSwitcherProps) => {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs?.data || []);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchOrganizations();
    }
  }, [session?.user]);

  if (!session?.user) {
    return null;
  }

  const activeOrgId = session.session?.activeOrganizationId;
  const activeOrg = organizations.find((org) => org.id === activeOrgId);

  const handleOrgChange = async (orgId: string) => {
    startTransition(async () => {
      try {
        await setActiveOrganization({
          organizationId: orgId,
        });
        // Use router navigation for client-side navigation
        router.push(afterSelectOrganizationUrl as Route);
        // Refresh the router to update the session state
        router.refresh();
      } catch (error) {
        console.error('Failed to switch organization:', error);
      }
    });
  };

  if (loading) {
    return (
      <Button fullWidth leftSection={<IconBuilding size={16} />} disabled variant="subtle">
        Loading...
      </Button>
    );
  }

  if (organizations.length === 0) {
    if (hidePersonal) {
      return null;
    }
    return (
      <Button fullWidth leftSection={<IconBuilding size={16} />} variant="subtle">
        Personal Account
      </Button>
    );
  }

  return (
    <Menu>
      <Menu.Target>
        <Button
          fullWidth
          leftSection={<IconBuilding size={16} />}
          rightSection={isPending ? <Loader size="xs" /> : null}
          disabled={isPending}
          variant="subtle"
        >
          {isPending ? 'Switching...' : activeOrg?.name || 'Select Organization'}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {organizations.map((org) => (
          <Menu.Item
            key={org.id}
            onClick={() => handleOrgChange(org.id)}
            rightSection={org.id === activeOrgId ? <IconCheck size={16} /> : null}
            disabled={isPending}
          >
            {org.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
